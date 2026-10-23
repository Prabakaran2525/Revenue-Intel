# 3-Minute Screen Recording & Spoken Narration Script

Use this step-by-step guide to record your **continuous 3-minute screen capture with spoken voiceover** required for the Volopay assignment submission.

---

## Quick Setup
1. Open [app.html](file:///c:/Users/praba/Downloads/candidate-v1.0%20(3)_layout_fixed%20(1)(2) (3) (1)/candidate/app.html) in your browser (Chrome/Edge/Firefox).
2. Set your browser zoom to 100% or full screen (`F11`).
3. Prepare your screen recorder (OBS, Loom, Windows Snipping Tool, or QuickTime). Ensure your microphone is active.

---

## Minute-by-Minute Narration Script

### [0:00 – 0:55] Segment 1: The Manager Workflow & Metric Clarity
**Action on screen:**
- Start on the **Dashboard** view (`app.html`).
- Hover over the headline metrics cards: **44 Selected Records**, **40.9% Usable Supplied Text**, **36.7% Connection Rate**, and **25 Needs Review**.
- Click the **Metric Definitions** accordion to reveal definitions.
- Click on the **Needs Review** metric card or sidebar link to jump directly to the filtered Inbox.
- Click on record **M07** (Willowfield Trust) to open the slide-out detail inspector.

**What to say (Word-for-word spoken narration):**
> *"Hello! This is our Revenue Intelligence Inbox built for SpendNest sales managers. When a manager starts their day, the dashboard immediately answers what happened, what text is actually usable, and where attention is required.*
> 
> *Notice our headline metrics: we have 44 total interactions on August 21st across 30 calls and 14 meetings. We define our denominators strictly: usable transcript coverage is 18 of 44, or 40.9%, meaning 26 records lack usable text and are evaluated solely on metadata. Our source connection rate is 36.7% on calls, counting only records with verified connection outcomes.*
> 
> *When we open record M07, the slide-out drawer preserves our inbox position while showing the speaker-attributed transcript. Here, Willowfield Trust reported four severe functional software bugs in reimbursement and payment editing. Rather than treating this as a sales call, our system automatically routes this to Customer Success and flags it as a top escalation in the Manager Brief."*

---

### [0:55 – 1:50] Segment 2: One Difficult Routing Decision (M02)
**Action on screen:**
- In the Inbox search bar, type `M02` or filter by **Vendor Evaluation**.
- Click on record **M02** (LedgerBridge meeting).
- Scroll down the transcript showing speaker turns between SpendNest team and LedgerBridge.
- Highlight the assigned route: **Vendor Evaluation**, and show the next action: *"Complete transaction volume template for LedgerBridge."*

**What to say (Word-for-word spoken narration):**
> *"Now let's examine one of our most difficult routing decisions: record M02 with LedgerBridge.*
> 
> *At first glance in the calendar system, this meeting looks like a prospective sales demo organized by team07. However, when we inspect the actual transcript evidence, we find that SpendNest is not selling—our team is actually procuring card issuing rails and negotiating volume pricing from LedgerBridge.*
> 
> *If a system naively classified this as a sales opportunity, it would pollute the sales pipeline and corrupt quota forecasting. We routed M02 into a distinct 'Vendor Evaluation' category with procurement next actions, ensuring our sales team only focuses on true revenue opportunities."*

---

### [1:50 – 3:00] Segment 3: The Replay Contract (Idempotency, Correction & Update)
**Action on screen:**
- Click **Import Data** in the left sidebar.
- Click **Reset All Data** and confirm. Show the empty state.
- Click **Import Initial Batch** -> Toast confirms: *"Imported: 44 new, 0 updated, 0 skipped."* Show records count = 44.
- Click **Import Initial Batch** AGAIN -> Toast confirms: *"Imported: 0 new, 0 updated, 44 skipped."* Show records count is still 44 (no duplicates!).
- Switch to **Inbox**, click record **M07**, scroll to the Routing section, and click **Needs Review** or **Customer Success** to manually change the route. Note the amber **"✏️ Manual Override"** badge.
- Return to **Import Data** and click **Import Update Batch** (loads `02_update.json`).
- Open **M07** again: Show that the new transcript is attached, analysis is flagged with `⚠️ Stale — transcript changed`, but **the manual route override survived!**
- Press `F5` / Refresh browser to prove persistence in localStorage.
- Navigate to **Export** and click **Download All as ZIP** to show the downloadable archive.

**What to say (Word-for-word spoken narration):**
> *"Finally, let's demonstrate the data contract and replay integrity.*
> 
> *First, I reset our state. When I import the initial batch, 44 logical records are created. If I immediately repeat the exact same import, our composite key of (source_type, source_id) prevents duplication: exactly zero new records are created, and 44 are skipped, leaving our metrics completely un-inflated.*
> 
> *Next, let's test manual judgment preservation. I'll open M07 and manually correct its route to 'Customer Success'. You can see the yellow manual override badge.*
> 
> *Now, I import the update batch where revision 2 brings in the late-arriving transcript. When we inspect M07, the higher revision replaces the payload, the late transcript is now available, and the analysis is flagged as stale pending review. Most importantly: our manual route correction has survived untouched.*
> 
> *Even after a full browser refresh, our state persists via localStorage. Lastly, in the Export tab, managers can download a complete ZIP bundle containing our manifest, manager brief, and per-record analysis files. Thank you!"*
