// Queue + History screens
function QueueScreen({ docs, onProcess, onUploadMore, onOpenDoc, processedToday }) {
  const [selected, setSelected] = useState(new Set(docs.map(d => d.id)));

  function toggle(id) {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  const allSelected = selected.size === docs.length;

  const byType = docs.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1; return acc;
  }, {});

  return (
    <div className="x-queue">
      <div className="x-queue__summary">
        <div className="x-summarycard">
          <div className="x-summarycard__num">{docs.length}</div>
          <div className="x-summarycard__lbl">Pending</div>
        </div>
        <div className="x-summarycard">
          <div className="x-summarycard__num">{byType.invoice || 0}</div>
          <div className="x-summarycard__lbl"><DocTypeBadge type="invoice" label="Invoices"/></div>
        </div>
        <div className="x-summarycard">
          <div className="x-summarycard__num">{byType.lorry || 0}</div>
          <div className="x-summarycard__lbl"><DocTypeBadge type="lorry" label="Lorry Receipts"/></div>
        </div>
        <div className="x-summarycard">
          <div className="x-summarycard__num">{byType.pod || 0}</div>
          <div className="x-summarycard__lbl"><DocTypeBadge type="pod" label="PODs"/></div>
        </div>
        <div className="x-summarycard x-summarycard--accent">
          <div className="x-summarycard__num">{processedToday}<span className="x-summarycard__den">/300</span></div>
          <div className="x-summarycard__lbl">Today's target</div>
        </div>
      </div>

      <div className="x-tabletoolbar">
        <div className="x-tabletoolbar__left">
          <Btn variant="primary" icon={I.spark} disabled={selected.size === 0} onClick={() => onProcess([...selected])}>
            Review {selected.size} document{selected.size !== 1 ? "s" : ""}
          </Btn>
          <Btn variant="ghost" icon={I.upload} onClick={onUploadMore}>Upload more</Btn>
          <div className="x-divider"/>
          <Btn variant="ghost" size="sm" icon={I.filter}>Filter</Btn>
        </div>
        <div className="x-tabletoolbar__right">
          <div className="x-search">
            <span className="x-search__ico">{I.search}</span>
            <input placeholder="Search filename, ID..."/>
          </div>
        </div>
      </div>

      <div className="x-table">
        <div className="x-table__head">
          <div className="x-tcol x-tcol--check">
            <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(docs.map(d => d.id)))}/>
          </div>
          <div className="x-tcol x-tcol--type">Type</div>
          <div className="x-tcol x-tcol--name">Filename</div>
          <div className="x-tcol x-tcol--id">Doc ID</div>
          <div className="x-tcol x-tcol--num">Pages</div>
          <div className="x-tcol x-tcol--num">Size</div>
          <div className="x-tcol x-tcol--time">Uploaded</div>
          <div className="x-tcol x-tcol--status">Status</div>
          <div className="x-tcol x-tcol--actions"></div>
        </div>
        {docs.map(d => (
          <div key={d.id} className={cx("x-table__row", selected.has(d.id) && "x-table__row--sel")} onClick={() => onOpenDoc(d.id)}>
            <div className="x-tcol x-tcol--check" onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggle(d.id)}/>
            </div>
            <div className="x-tcol x-tcol--type"><DocTypeBadge type={d.type} label={d.typeLabel}/></div>
            <div className="x-tcol x-tcol--name x-mono">{d.filename}</div>
            <div className="x-tcol x-tcol--id x-mono x-muted">{d.id}</div>
            <div className="x-tcol x-tcol--num">{d.pages}</div>
            <div className="x-tcol x-tcol--num">{d.sizeKb} KB</div>
            <div className="x-tcol x-tcol--time x-muted">{d.uploaded}</div>
            <div className="x-tcol x-tcol--status"><StatusPill status={d.status}/></div>
            <div className="x-tcol x-tcol--actions">
              <button className="x-iconbtn">{I.more}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryScreen({ rows }) {
  return (
    <div className="x-queue">
      <div className="x-queue__summary">
        <div className="x-summarycard"><div className="x-summarycard__num">{rows.length}</div><div className="x-summarycard__lbl">Saved today</div></div>
        <div className="x-summarycard"><div className="x-summarycard__num">{rows.filter(r => r.status === "Verified").length}</div><div className="x-summarycard__lbl">Verified</div></div>
        <div className="x-summarycard"><div className="x-summarycard__num">{rows.filter(r => r.flagged > 0).length}</div><div className="x-summarycard__lbl">With flags</div></div>
        <div className="x-summarycard"><div className="x-summarycard__num">12.4s</div><div className="x-summarycard__lbl">Avg time / doc</div></div>
        <div className="x-summarycard x-summarycard--accent"><div className="x-summarycard__num">98.2%</div><div className="x-summarycard__lbl">Field accuracy</div></div>
      </div>

      <div className="x-tabletoolbar">
        <div className="x-tabletoolbar__left">
          <Btn variant="ghost" size="sm" icon={I.filter}>Filter</Btn>
          <Btn variant="ghost" size="sm" icon={I.download}>Export CSV</Btn>
        </div>
        <div className="x-tabletoolbar__right">
          <div className="x-search">
            <span className="x-search__ico">{I.search}</span>
            <input placeholder="Search history..."/>
          </div>
        </div>
      </div>

      <div className="x-table">
        <div className="x-table__head">
          <div className="x-tcol x-tcol--type">Type</div>
          <div className="x-tcol x-tcol--name">Filename</div>
          <div className="x-tcol x-tcol--id">Doc ID</div>
          <div className="x-tcol x-tcol--time">Saved</div>
          <div className="x-tcol x-tcol--name">Auditor</div>
          <div className="x-tcol x-tcol--num">Flags</div>
          <div className="x-tcol x-tcol--num">Total</div>
          <div className="x-tcol x-tcol--status">Status</div>
        </div>
        {rows.map(r => (
          <div key={r.id} className="x-table__row">
            <div className="x-tcol x-tcol--type"><DocTypeBadge type={r.typeLabel === "Invoice" ? "invoice" : r.typeLabel === "Lorry Receipt" ? "lorry" : "pod"} label={r.typeLabel}/></div>
            <div className="x-tcol x-tcol--name x-mono">{r.filename}</div>
            <div className="x-tcol x-tcol--id x-mono x-muted">{r.id}</div>
            <div className="x-tcol x-tcol--time x-muted">{r.saved}</div>
            <div className="x-tcol x-tcol--name">{r.auditor}</div>
            <div className="x-tcol x-tcol--num">{r.flagged > 0 ? <span className="x-flagcount">{r.flagged}</span> : <span className="x-muted">0</span>}</div>
            <div className="x-tcol x-tcol--num x-mono">{r.total}</div>
            <div className="x-tcol x-tcol--status"><StatusPill status={r.status}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { QueueScreen, HistoryScreen });
