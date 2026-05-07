// xTract main app — orchestrates screens & state
const { useState: aUseState, useEffect: aUseEffect, useRef: aUseRef, useMemo: aUseMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "split",
  "density": "compact",
  "showConfidence": true,
  "highlightStyle": "box",
  "theme": "indigo"
}/*EDITMODE-END*/;

function XtractApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // App-level state
  const [screen, setScreen] = aUseState("queue"); // empty | upload | processing | review | queue | history
  const [pendingDocs, setPendingDocs] = aUseState(window.DOCUMENTS);
  const [history, setHistory] = aUseState(() => loadStoredHistory() || window.HISTORY);
  const [activeIdx, setActiveIdx] = aUseState(0);
  const [savedToast, setSavedToast] = aUseState(null);
  const [showSaveOverlay, setShowSaveOverlay] = aUseState(null);
  const [processedToday, setProcessedToday] = aUseState(127);
  const [uploadedFileCount, setUploadedFileCount] = aUseState(0);
  const extractPromiseRef = aUseRef(null);

  // Apply theme to root
  aUseEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
  }, [t.theme]);

  const [showApiKeyModal, setShowApiKeyModal] = aUseState(false);
  const [apiKeyInput, setApiKeyInput] = aUseState("");
  const pendingFilesRef = aUseRef(null);

  function startUpload() { setScreen("upload"); }

  function onUploaded(files) {
    const realFiles = files.filter(f => f._file instanceof File).map(f => f._file);
    setUploadedFileCount(files.length);

    if (realFiles.length > 0) {
      extractPromiseRef.current = (async () => {
        // Try Node server first (fast timeout)
        const serverUp = await checkServerAvailable();
        if (serverUp) {
          const formData = new FormData();
          realFiles.forEach(f => formData.append("files", f));
          const res = await fetch("/api/extract-batch", { method: "POST", body: formData });
          if (res.ok) return (await res.json()).docs;
        }

        // Fall back to browser-side extraction
        const apiKey = getStoredApiKey();
        if (!apiKey) {
          // Pause and wait for the user to enter their key
          pendingFilesRef.current = realFiles;
          setShowApiKeyModal(true);
          return await new Promise((resolve, reject) => {
            window.__xtractApiKeyResolve = resolve;
            window.__xtractApiKeyReject  = reject;
          });
        }
        return await extractBatchBrowser(realFiles, apiKey);
      })();
    } else {
      extractPromiseRef.current = null;
    }

    setScreen("processing");
  }

  async function submitApiKey() {
    const key = apiKeyInput.trim();
    if (!key) return;
    saveApiKey(key);
    setShowApiKeyModal(false);
    setApiKeyInput("");
    const files = pendingFilesRef.current;
    pendingFilesRef.current = null;
    if (window.__xtractApiKeyResolve && files) {
      try {
        const docs = await extractBatchBrowser(files, key);
        window.__xtractApiKeyResolve(docs);
      } catch (err) {
        window.__xtractApiKeyReject(err);
      }
    }
  }

  function onProcessed(extractedDocs) {
    if (extractedDocs && extractedDocs.length > 0) {
      setPendingDocs(extractedDocs);
    }
    extractPromiseRef.current = null;
    setScreen("queue");
  }
  function onProcessSelected(ids) {
    const idx = pendingDocs.findIndex(d => d.id === ids[0]);
    setActiveIdx(idx >= 0 ? idx : 0);
    setScreen("review");
  }

  function onOpenDoc(id) {
    const idx = pendingDocs.findIndex(d => d.id === id);
    if (idx >= 0) { setActiveIdx(idx); setScreen("review"); }
  }

  function onSaveDoc(values, edited) {
    const doc = pendingDocs[activeIdx];
    const remaining = pendingDocs.length - 1;
    setShowSaveOverlay({ doc, remaining });
    setTimeout(() => {
      // remove from pending, add to history
      const newHist = [{
        id: doc.id, filename: doc.filename, typeLabel: doc.typeLabel,
        saved: new Date().toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", year: "numeric", month: "2-digit", day: "2-digit" }).replace(",", ""),
        auditor: "You",
        flagged: doc.fields.flatMap(g => g.fields).filter(f => f.confidence < 0.75 && !edited[f.key]).length,
        total: values.total || values.freight_amount || values.balance || "—",
        status: "Verified",
        fieldValues: { ...values },
      }, ...history];
      setHistory(newHist);
      saveStoredHistory(newHist);
      const newPending = pendingDocs.filter((_, i) => i !== activeIdx);
      setPendingDocs(newPending);
      setProcessedToday(p => p + 1);
    }, 100);
  }

  function dismissSaveOverlay(advance) {
    setShowSaveOverlay(null);
    if (advance) {
      if (pendingDocs.length === 0) setScreen("queue");
      else setActiveIdx(idx => Math.min(idx, pendingDocs.length - 1));
    }
  }

  function onSkip() {
    setActiveIdx(i => (i + 1) % Math.max(1, pendingDocs.length));
  }

  function onPrev() {
    setActiveIdx(i => Math.max(0, i - 1));
  }

  function onReject() {
    if (window.confirm("Reject this document? It will be flagged and removed from the queue.")) {
      const newPending = pendingDocs.filter((_, i) => i !== activeIdx);
      setPendingDocs(newPending);
      if (newPending.length === 0) setScreen("queue");
      else setActiveIdx(i => Math.min(i, newPending.length - 1));
    }
  }

  // Topbar content per screen
  let topbar = null;
  if (screen === "queue") {
    topbar = <Topbar
      title="Document Queue"
      subtitle={`${pendingDocs.length} documents ready for review`}
      right={<>
        <Btn variant="ghost" icon={I.upload} onClick={startUpload}>Upload</Btn>
        <Btn variant="primary" icon={I.spark} disabled={pendingDocs.length === 0} onClick={() => onProcessSelected(pendingDocs.map(d => d.id))}>
          Start review
        </Btn>
      </>}
    />;
  } else if (screen === "history") {
    topbar = <Topbar title="Saved Documents" subtitle={`${history.length} records · ${processedToday} today`} right={<>
      <Btn variant="ghost" icon={I.download} onClick={() => exportToExcel(history)}>Export to Excel</Btn>
    </>}/>;
  } else if (screen === "upload") {
    topbar = <Topbar title="Upload Documents" subtitle="Drag &amp; drop or browse"/>;
  } else if (screen === "processing") {
    topbar = <Topbar title="AI Extraction" subtitle="Reading your documents"/>;
  } else if (screen === "review") {
    topbar = null; // review screen has its own subbar
  } else if (screen === "empty") {
    topbar = <Topbar title="Welcome to xTract"/>;
  }

  // Show empty state when no docs and on queue
  const showEmpty = screen === "queue" && pendingDocs.length === 0 && history.length === 0;

  let body = null;
  if (showEmpty || screen === "empty") {
    body = <EmptyState onUpload={startUpload}/>;
  } else if (screen === "upload") {
    body = <UploadScreen onUploaded={onUploaded} onCancel={() => setScreen("queue")}/>;
  } else if (screen === "processing") {
    body = <ProcessingScreen
      count={uploadedFileCount || pendingDocs.length || 7}
      onDone={onProcessed}
      extractPromise={extractPromiseRef.current}
    />;
  } else if (screen === "review") {
    if (pendingDocs.length === 0) {
      body = <AllDoneState onBack={() => setScreen("queue")}/>;
    } else {
      const doc = pendingDocs[Math.min(activeIdx, pendingDocs.length - 1)];
      body = <ReviewScreen
        doc={doc}
        queueRemaining={pendingDocs.length}
        queueIndex={activeIdx}
        queueTotal={pendingDocs.length}
        onSave={onSaveDoc}
        onSkip={onSkip}
        onPrev={onPrev}
        onReject={onReject}
        layout={t.layout}
        density={t.density}
        showConfidence={t.showConfidence}
        highlightStyle={t.highlightStyle}
      />;
    }
  } else if (screen === "queue") {
    body = <QueueScreen
      docs={pendingDocs}
      onProcess={onProcessSelected}
      onUploadMore={startUpload}
      onOpenDoc={onOpenDoc}
      processedToday={processedToday}
    />;
  } else if (screen === "history") {
    body = <HistoryScreen rows={history}/>;
  }

  return (
    <div className="x-app">
      <Sidebar
        active={screen === "review" ? "review" : screen}
        onNavigate={s => {
          if (s === "review" && pendingDocs.length > 0) { setActiveIdx(0); setScreen("review"); }
          else setScreen(s);
        }}
        queueCount={pendingDocs.length}
        processedToday={processedToday}
      />
      <main className="x-main">
        {topbar}
        <div className="x-mainbody">
          {body}
        </div>
      </main>

      {showSaveOverlay && (
        <SaveConfirmation
          doc={showSaveOverlay.doc}
          remaining={showSaveOverlay.remaining}
          onNext={() => dismissSaveOverlay(true)}
          onView={() => { dismissSaveOverlay(true); setScreen("history"); }}
        />
      )}

      {showApiKeyModal && (
        <div className="x-saveoverlay">
          <div className="x-savecard" style={{ maxWidth: 440, textAlign: "left" }}>
            <h3 className="x-savecard__h" style={{ marginBottom: 4 }}>Enter your Anthropic API key</h3>
            <p className="x-savecard__p" style={{ marginBottom: 16 }}>
              The extraction server isn't available. You can extract directly from the browser by providing your API key — it's stored only in this browser's localStorage.
            </p>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitApiKey()}
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box", padding: "8px 12px",
                border: "1px solid var(--line)", borderRadius: 6, fontSize: 13,
                fontFamily: "var(--font-mono)", marginBottom: 12,
                background: "var(--surface)", color: "var(--text)",
              }}
            />
            <div className="x-savecard__row">
              <Btn variant="ghost" onClick={() => { setShowApiKeyModal(false); if (window.__xtractApiKeyReject) window.__xtractApiKeyReject(new Error("cancelled")); }}>Cancel</Btn>
              <Btn variant="primary" disabled={!apiKeyInput.trim()} onClick={submitApiKey}>Start extraction</Btn>
            </div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
              Get a key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>console.anthropic.com</a>
            </p>
          </div>
        </div>
      )}

      <XtractTweaks t={t} setTweak={setTweak}/>
    </div>
  );
}

function AllDoneState({ onBack }) {
  return (
    <div className="x-empty">
      <div className="x-empty__inner">
        <div className="x-empty__visual">
          <svg viewBox="0 0 200 140" width="200" height="140">
            <circle cx="100" cy="70" r="44" fill="none" stroke="var(--accent)" strokeWidth="2"/>
            <path d="M82 72 L96 86 L120 58" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="x-empty__h">Queue cleared</h2>
        <p className="x-empty__p">All documents have been reviewed and saved. Upload more to keep going.</p>
        <div className="x-empty__cta"><Btn variant="primary" onClick={onBack}>Back to queue</Btn></div>
      </div>
    </div>
  );
}

// ---------------- Tweaks panel ----------------
const THEME_COLORS = { "#4f46e5": "indigo", "#0d9488": "teal", "#b45309": "amber", "#334155": "slate" };
const THEME_TO_COLOR = { indigo: "#4f46e5", teal: "#0d9488", amber: "#b45309", slate: "#334155" };

function XtractTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Layout">
        <TweakRadio label="Document + fields" value={t.layout}
          options={["split", "stack"]}
          onChange={v => setTweak("layout", v)}/>
        <TweakRadio label="Density" value={t.density}
          options={["compact", "cozy"]}
          onChange={v => setTweak("density", v)}/>
      </TweakSection>
      <TweakSection label="AI feedback">
        <TweakToggle label="Confidence indicators" value={t.showConfidence}
          onChange={v => setTweak("showConfidence", v)}/>
        <TweakRadio label="Highlight" value={t.highlightStyle}
          options={["box", "underline", "fill"]}
          onChange={v => setTweak("highlightStyle", v)}/>
      </TweakSection>
      <TweakSection label="Theme">
        <TweakColor label="Accent" value={THEME_TO_COLOR[t.theme]}
          options={["#4f46e5", "#0d9488", "#b45309", "#334155"]}
          onChange={v => setTweak("theme", THEME_COLORS[v] || "indigo")}/>
      </TweakSection>
    </TweaksPanel>
  );
}

// ---------- Boot ----------
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<XtractApp/>);
