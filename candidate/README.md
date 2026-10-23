# Revenue Intelligence Inbox (SpendNest)

A specialized workspace designed for revenue leaders to ingest heterogeneous call and meeting records, apply evidence-backed routing, surface actionable insights, and preserve human judgment through data updates.

Built for the Volopay Revenue Intelligence Inbox engineering assessment.

---

## 1. Quick Start & Execution

The application is built purely with **Vanilla HTML5, CSS3, and modern JavaScript**. It requires no Node.js dependencies, package managers, or server frameworks.

### Running Locally

- **Option A (Direct File Launch):** Double-click [app.html](file:///c:/Users/praba/Downloads/candidate-v1.0%20(3)_layout_fixed%20(1)(2) (3) (1)/candidate/app.html) in your browser. (The included `data_bundle.js` ensures that local file loading works without CORS issues).
- **Option B (Local Web Server):** 
  ```bash
  # Using Python
  python -m http.server 8000
  # Then open http://localhost:8000/app.html
  ```
  or:
  ```bash
  # Using Node / npx
  npx serve .
  ```
- **Option C (Original Assignment Reader):** Open [index.html](file:///c:/Users/praba/Downloads/candidate-v1.0%20(3)_layout_fixed%20(1)(2) (3) (1)/candidate/index.html) to read the full de-identified conversation library and assignment documentation. A direct launcher button is pinned in the top navigation to switch to `app.html`.

---

## 2. Reproducing Replay Steps (Data Contract Compliance)

The application enforces the exact replay lifecycle specified in `DATA_CONTRACT.md`. Follow these steps in the **Import Data** screen:

1. **Clean Start / Reset:**
   - Navigate to **Import Data** in the left sidebar.
   - Click **Reset All Data**. Confirm the prompt. State is cleared in `localStorage`.
2. **Initial Import:**
   - Click **Import Initial Batch** (loads `data/01_initial.json`, revision 1).
   - Result: 44 unique logical source records created (30 calls, 14 meetings).
   - 17 usable transcripts available; 27 records correctly flagged with missing/unusable transcripts.
3. **Repeat Import (Idempotency Check):**
   - Click **Import Initial Batch** a second time.
   - Result: `0 new`, `0 updated`, `44 skipped`. Total record count remains exactly 44; no duplicate activity or inflated metrics.
4. **Correction (Preserve Manual Judgment):**
   - Go to **Inbox** or **Dashboard**.
   - Select record **M07** (Willowfield Trust) or **C01** (Harborlight Advisory).
   - In the slide-out detail panel under **Routing**, change the route (e.g., set M07 to **Customer Success** or C01 to **Needs Review**).
   - Notice the amber badge `✏️ Manual Override` is applied.
5. **Update Batch (Late Transcript Arrival):**
   - Return to **Import Data** and click **Import Update Batch** (loads `data/02_update.json`, revision 2).
   - Result: Record `M07` is updated with its substantive transcript payload (no duplicate record created; total remains 44).
   - Transcript coverage increments from 17 to 18 (40.9%).
   - The analysis state for M07 is flagged with `⚠️ Stale — transcript changed in revision 2`.
   - **Crucially: The manual route override you set in Step 4 is preserved exactly as chosen.**
6. **Persistence Check:**
   - Reload the browser page (`F5` or `Ctrl+R`).
   - All state, manual overrides, import history, and review markers persist seamlessly via `localStorage`.

---

## 3. Metric Definitions & Clear Denominators

Every dashboard headline number has an explicit, mathematically sound definition:

| Metric | Calculation | Denominator | Notes & Context |
| :--- | :--- | :--- | :--- |
| **Selected Records** | Count of distinct `(source_type, source_id)` | All imported records (44) | 30 calls + 14 meetings. Composite identity prevents duplicate counting. |
| **Usable Transcript Coverage** | Records with non-empty transcript text or turns | Total selected records (44) | **40.9%** (18/44) post-update. Calls: 10/30 (33.3%), Meetings: 8/14 (57.1%). |
| **Source Connection Rate** | Calls with `observed_outcome == 'connected'` | Calls with recorded outcome (30) | **36.7%** (11/30). Unknown or unrecorded outcomes excluded from numerator. |
| **Needs Review Queue** | Records routed to `needs_review` or flagged as stale | Total active records (44) | Captures conversations lacking transcript evidence or requiring human confirmation. |
| **Call Rep vs. Organizer** | Call `sales_rep` vs Meeting `organizer_email` | Distinct entities per type | Call reps (5 individuals: Arun, Leela, Meera, Kiran, Dev) are distinct from meeting organizers (team email addresses). An organizer is not automatically an attendee or closer. |

---

## 4. AI Usage & Runtime Architecture

- **Pre-generated Analysis:** In accordance with the assignment brief, in-depth analytical evaluations, evidence citations, coaching recommendations, and routing suggestions were prepared using AI models prior to runtime and packaged in `analysis.js`.
- **Runtime Determinism:** The client application executes **100% locally and deterministically**. There are no live third-party LLM API calls, credentials, or network dependencies.
- **Handling Late/Updated Transcripts:** When a transcript updates (such as M07 in `02_update.json`), the system does not silently display old analysis. Instead, it marks the record `analysis_stale = true` and places it in the **Stale Analysis** review queue so a manager can review the diff and confirm outputs.

---

## 5. Output Organization & Export Artifacts

Generated outputs are organised in the repository under [exports/](file:///c:/Users/praba/Downloads/candidate-v1.0%20(3)_layout_fixed%20(1)(2) (3) (1)/candidate/exports):

```
exports/
├── manifest.json              # Machine-readable inventory of all 44 records
├── manifest.csv               # CSV representation of the manifest
├── manager_brief_2026-08-21.md# Executive manager brief for 21 Aug 2026
└── analysis/                  # Per-conversation structured analysis files
    ├── C01_call.json
    ├── C02_call.json
    ├── ...
    ├── M04_meeting.json
    ├── M07_meeting.json
    └── ...
```

In addition, clicking **Download All as ZIP** in the application UI packages these exact files into a live `.zip` archive on demand.

---

## 6. Three Most Important Analytical Findings

### Finding 1: M07 (Willowfield Trust) — Critical Product Bugs Jeopardizing Operations
- **Source Passage:** Turn 2 ("changing this event-payment description... clicking Save changes [fails]"), Turn 8 ("cannot upload a document"), Turn 16 ("cannot select the first group of transactions"), Turn 22 ("The amount from the previous item appears in the next one").
- **Product Impact:** 
  1. Auto-routed to **Customer Success** rather than generic prospecting.
  2. Classified under **🔴 Urgent Product Bugs** in the Manager Brief with required escalation to product development.
  3. Staged update batch triggers `stale_pending_review` flag to guarantee managerial sign-off.

### Finding 2: M03 (Asterloom Systems) — Quote Inconsistency Creates Deal Friction
- **Source Passage:** Turn 14 (Sales quote: "twenty-six thousand rupees"), Turn 24 (Customer response: "The document says thirty-nine thousand. That is quite a difference.").
- **Product Impact:**
  1. Routed to **Product Discovery**.
  2. Generated a dedicated **Sales Coaching Note** on quote hygiene and commercial accuracy.
  3. Added follow-up task for team08 to clarify card pricing with a revised proposal.

### Finding 3: C10 (Meadowbrick) — Obsolete Contact Data & Outreach Hygiene
- **Source Passage:** Turn 1 ("Aniket has not been with the firm for six months.").
- **Product Impact:**
  1. Routed to **Sales Prospecting** with an immediate next-step: "Purge contact from active calling list and log organizational departure in CRM."
  2. Prevents rep Arun from wasting call capacity on dead leads.

---

## 7. One Deliberately Rejected Decision

- **Rejected Decision:** Automatically calculating total pipeline monetary value, closing forecasts, and aggregate win probabilities based on natural language keyword parsing.
- **Rationale:** The provided data contains no CRM deal amounts, stages, or pipeline contracts. Synthesizing artificial revenue numbers would mislead sales leaders with false precision.
- **Accepted Trade-off & Product Choice:** Instead of unverified dollar figures, the workspace provides verified behavioral indicators (e.g., pain points raised, competitor mentions, pricing pushback, and explicit next steps with stated owners).

---

## 8. Limitations & Hours Spent

- **Hours Spent:** ~7 hours (Discovery, Data contract verification, Dashboard & UI architecture, AI analysis synthesis, Replay engine, Manifest generation).
- **Known Limitations:**
  - Storage is backed by browser `localStorage` (single-user / client-side). A production version would sync state with a secure PostgreSQL/SQLite back-end.
  - Runtime re-analysis of late transcripts uses human-in-the-loop review rather than triggering automated background LLM inference.
