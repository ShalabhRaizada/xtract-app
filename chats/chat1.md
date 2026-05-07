# Document Field Extraction

_Started 2026-05-07 11:19 UTC_

---

## User

Design a functionality where the user uploads documents. The system runs an AI agent on the document to extract all the fields and then displays the fields adjacent to the image uploaded. The user has an opportunity to edit and correct the values of the extracted field and then save the document. The document and the extracted values are stored in a database and the next document is available for upload.

## Assistant

I'll start by exploring the design system, then ask some clarifying questions before building.

_[tool: list_files]_

_[tool: list_files]_

The referenced design system project appears empty. Let me ask some clarifying questions to make sure I build the right thing for you.

_[tool: questions_v2]_

## User

Questions answered:
- use_case: A Freight Auditor processing 300 documents in 8 hours 
- doc_type: Invoices, Lorry Receipts and Proof of Delivery. 
- design_context: No brand yet — pick a clean direction
- layout: 0
- aesthetic: Dense data tool (Retool / Airtable)
- highlight_behavior: Yes — bounding boxes on the doc, two-way hover
- ai_feedback: Progress bar with stages (uploading → reading → extracting)
- confidence: Yes — color-coded confidence (low fields flagged for review)
- queue: Queue view — show stack of pending docs, auto-advance to next
- screens: Empty state / first upload, Upload + drag-drop, AI processing/loading, Review & edit (the main screen), Save confirmation, Document history / database view, Bulk queue view
- variations: 2
- tweaks: Layout (split vs stacked), Density (compact / cozy), Field-to-doc highlighting style, Confidence indicators on/off, Color theme

## Assistant

Got it. A freight auditor processing ~38 docs/hour means speed and keyboard-driven flow matter more than polish. I'll build a dense data tool with strong field↔doc linking, two layout variations on a design canvas, and a comprehensive prototype covering all the screens.

_[tool: update_todos]_

Project is already named "xTract" — fitting. Let me grab the starter components I need and start building.

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

Now let me plan the architecture and start building. I'll structure this as:

- `xtract.html` — main entry, loads React + the prototype
- `app.jsx` — main app with all screen states + tweaks
- `data.jsx` — sample documents (invoices, lorry receipts, POD) with extracted fields + bounding boxes
- `screens.jsx` — individual screen components (empty, upload, processing, review, save, queue, history)
- `components.jsx` — shared UI primitives (Field, Pill, Button, Sidebar, etc.)
- `canvas.html` — the design_canvas with both layout variations

Let me start:

_[tool: write_file]_

Now the document mock images. I'll generate them as inline SVG strings so they render crisply and the bounding-box coords align perfectly with the visual content.

_[tool: write_file]_

_[tool: snip]_

Now the shared UI primitives.

_[tool: write_file]_

Now the document viewer with bbox overlays, then the main screens.

_[tool: write_file]_

Now the main screens (review, queue, history, etc.) and the app shell.

_[tool: write_file]_

_[tool: snip]_

Now the main review screen (the heart of the app), the queue, and history.

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now the app shell that orchestrates everything, plus the Tweaks panel.

_[tool: write_file]_

_[tool: snip]_

Let me check the tweaks-panel exports so I use the right APIs, then write the styles + main HTML.

_[tool: grep]_

I need to fix the tweaks API usage — `useTweaks` returns `[values, setTweak]`, sections use `label` not `title`, and `TweakRadio`/`TweakColor` take simple options. Let me also note the panel uses `TweakSection label="..."` and the prop ordering. I'll also need to handle that `t.set` doesn't exist — it's destructured.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

Now the stylesheet — this is the heart of the dense-data-tool aesthetic.

_[tool: write_file]_

_[tool: snip]_

Now the main HTML entry, then I'll verify it loads.

_[tool: write_file]_

_[tool: show_html]_

_[tool: snip]_

_[tool: show_html]_

_[tool: get_webview_logs]_

Page renders cleanly. Let me capture a screenshot to verify the review screen looks right, then build the design canvas variation.

_[tool: save_screenshot]_

_[tool: view_image]_

The queue screen looks good. The Filename column header is being clipped though ("Fi") — I need to fix the table grid widths. Also I want to verify the review screen.

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: save_screenshot]_

_[tool: view_image]_

The review screen renders. Issues to fix:
1. Top reviewbar is overflowing horizontally — too much packed in
2. Document is being clipped — needs scaling
3. Inputs in doc viewer (the empty fields visible) are leaking through — those are the bbox highlights but they look like inputs

Let me fix the reviewbar overflow and document scaling.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: view_image]_

The viewport screenshot shows preview at narrow width — the doc is being cropped because the viewport is only 920px wide. The reviewbar is still wrapping ("Save & next" stacked). I need to make the topbar more compact and fix the doc rendering. Let me also notice that the bbox highlights look like inputs because the doc is not loading the full SVG image (it's been clipped due to overflow).

The main issue is the doc image — at narrow widths the page width is constrained but the image inside isn't filling. Let me fix the doc viewer and make the reviewbar more compact.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: save_screenshot]_

_[tool: view_image]_

The screenshot looks identical to before — the iframe must be cached. Let me force a refresh and inspect what's happening with the doc viewer.

_[tool: eval_js]_

_[tool: snip]_

OK so the doc page is 640px wide but the doc-pane only has ~360px of horizontal space at this viewport. The `min(560px, 100%)` calc isn't constraining because `100%` resolves to the unconstrained doc-viewer container. The doc viewer is showing through the page width because the parent `.x-pane__body--scroll` has `overflow: auto` so the page is just bigger than the visible area.

That's actually OK behavior for a tight viewport, but the iframe is showing 920px wide which is much narrower than a real auditor's screen. The user should view at a larger size. Let me also constrain doc width to be responsive to its container:

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

Now let me build the design canvas variation. The first variation is the full prototype I just built (split layout). The second variation should explore a different approach — maybe a stacked/inline editing approach where fields appear as inline tooltips on the document itself, or a "table" layout where fields are presented in a denser spreadsheet-like grid.

Let me build the design canvas with both variations side by side.

_[tool: write_file]_

## User

Continue to completion

## Assistant

I still need to build the second variation on a design canvas. Let me create that now — a more compact "split view" alternative layout.

_[tool: snip]_

_[tool: read_file]_

I have enough info on the design canvas. Let me build the variation file directly — I'll create a compact "inspector" variation where fields appear in a right rail with the doc taking center stage at full size, vs the current split layout.

_[tool: write_file]_

Now I need to build the inspector variation and the standalone processing screen. Let me create the inspector layout — same data + components but a different chrome arrangement.

_[tool: write_file]_

I'll create the standalone processing screen and a small entry alias, then surface the variations canvas to the user.

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

I've built **xTract**, a freight document audit prototype with two layout variations on a design canvas:

**Main prototype** (`xtract.html`) — full app with:
- **Empty / Upload / Processing / Review / Save / Queue / History** screens
- Drag-drop upload, staged AI extraction (uploading → reading → extracting → cross-checking) with live log
- **Two-way bbox linking** — hover a field, the matching region on the doc lights up, and vice versa
- **Confidence color-coding** — green/amber/red dots, bars, percentages; low-confidence fields auto-flagged with red borders
- Auditor stats (Priya Nair · 127/300 today), keyboard shortcuts (⌘S, N to skip), filter to "Flagged" or "Edited"
- 7 realistic mock docs (Invoices, Lorry Receipts, PODs) with smudged/low-confidence fields the auditor must verify

**Variations canvas** (`xtract-variations.html`) — the file now showing:
- **A · Split** — two-pane review (current default)
- **B · Inspector rail** — focused single-field-at-a-time mode for high-throughput keyboard work; large doc center, focused field highlighted gold, alternate readings shown
- Plus side-by-side artboards of Queue, History, Upload, Processing screens

**Tweaks** — toggle layout (split/stack), density (compact/cozy), confidence indicators, highlight style (box/underline/fill), accent color (indigo/teal/amber/slate).

