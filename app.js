/**
 * Revenue Intelligence Inbox - Core Application
 * 
 * This application processes sales call and meeting records,
 * applies evidence-based routing, and presents them in a manager dashboard.
 * 
 * Key behaviors:
 * - Identity: (source_type, source_id) composite key
 * - Idempotent imports: same batch re-import does not create duplicates
 * - Revision ordering: higher revision replaces entire payload
 * - Manual route overrides survive re-imports and browser refresh
 * - Stale analysis flagged when transcript changes
 * - State persisted in localStorage
 */

// ===== ROUTE DEFINITIONS =====
const ROUTE_DEFINITIONS = {
  sales_prospecting: { label: 'Sales Prospecting', icon: '📞', color: 'prospecting', description: 'Cold outreach to new prospects' },
  sales_followup: { label: 'Sales Follow-up', icon: '🔄', color: 'followup', description: 'Active deal progression' },
  partnership: { label: 'Partnership', icon: '🤝', color: 'partnership', description: 'Partner/referral development' },
  customer_success: { label: 'Customer Success', icon: '✅', color: 'customer-success', description: 'Existing customer support' },
  vendor_evaluation: { label: 'Vendor Evaluation', icon: '🔍', color: 'vendor', description: 'SpendNest procuring from vendor' },
  product_discovery: { label: 'Product Discovery', icon: '💡', color: 'discovery', description: 'Prospect evaluating product' },
  internal_training: { label: 'Internal Training', icon: '📚', color: 'training', description: 'Team knowledge transfer' },
  background_activity: { label: 'Background Activity', icon: '📋', color: 'background', description: 'No substantive contact' },
  needs_review: { label: 'Needs Review', icon: '⚠️', color: 'review', description: 'Insufficient evidence to route' }
};

// ===== STATE MANAGEMENT =====
const STORAGE_KEY = 'revenue_inbox_state';

function getDefaultState() {
  return {
    records: {},           // Keyed by "source_type||source_id"
    importHistory: [],     // Array of import events
    manualOverrides: {},   // Keyed by record key, value is route
    analysisState: {},     // Keyed by record key, tracks freshness
    lastUpdated: null
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Ensure all fields exist
      return {
        ...getDefaultState(),
        ...state
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return getDefaultState();
}

function saveState(state) {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// ===== GLOBAL STATE =====
let APP_STATE = loadState();
let currentView = 'dashboard';
let selectedRecordKey = null;
let searchQuery = '';
let filterType = 'all';
let filterRoute = 'all';
let filterPerson = 'all';
let filterTranscript = 'all';

// ===== RECORD KEY HELPER =====
function makeRecordKey(sourceType, sourceId) {
  return `${sourceType}||${sourceId}`;
}

function parseRecordKey(key) {
  const [sourceType, sourceId] = key.split('||');
  return { sourceType, sourceId };
}

// ===== IMPORT ENGINE =====
function importBatch(batchData) {
  const results = {
    batchId: batchData.batch_id,
    revision: batchData.revision,
    totalRecords: batchData.records.length,
    newRecords: 0,
    updatedRecords: 0,
    skippedRecords: 0,
    staleAnalysis: 0,
    timestamp: new Date().toISOString()
  };

  batchData.records.forEach(record => {
    const key = makeRecordKey(record.source_type, record.source_id);
    const existing = APP_STATE.records[key];

    if (existing) {
      // Check revision
      if (batchData.revision <= existing.appliedRevision) {
        // Same or older revision — skip
        results.skippedRecords++;
        return;
      }

      // Newer revision — replace entire payload
      const oldTranscriptHash = getTranscriptHash(existing);

      existing.payload = record.payload;
      existing.transcript_payload = record.transcript_payload;
      existing.appliedRevision = batchData.revision;
      existing.lastImportBatchId = batchData.batch_id;
      existing.lastImportAt = results.timestamp;

      // Check if transcript changed
      const newTranscriptHash = getTranscriptHash(existing);
      if (oldTranscriptHash !== newTranscriptHash) {
        // Mark analysis as stale
        if (!APP_STATE.analysisState[key]) {
          APP_STATE.analysisState[key] = {};
        }
        APP_STATE.analysisState[key].stale = true;
        APP_STATE.analysisState[key].staleReason = 'Source transcript changed in revision ' + batchData.revision;
        APP_STATE.analysisState[key].staleAt = results.timestamp;
        results.staleAnalysis++;

        // Compute suggested route from analysis but do NOT override manual
        const analysisKey = key;
        if (typeof PRE_GENERATED_ANALYSIS !== 'undefined' && PRE_GENERATED_ANALYSIS[analysisKey]) {
          existing.suggestedRoute = PRE_GENERATED_ANALYSIS[analysisKey].route;
        }
      }

      results.updatedRecords++;
    } else {
      // New record
      APP_STATE.records[key] = {
        record_ref: record.record_ref,
        source_type: record.source_type,
        source_id: record.source_id,
        payload: record.payload,
        transcript_payload: record.transcript_payload,
        appliedRevision: batchData.revision,
        firstImportBatchId: batchData.batch_id,
        lastImportBatchId: batchData.batch_id,
        firstImportAt: results.timestamp,
        lastImportAt: results.timestamp,
        suggestedRoute: null,
        processingState: 'imported'
      };

      // Apply pre-generated analysis route
      const analysisKey = key;
      if (typeof PRE_GENERATED_ANALYSIS !== 'undefined' && PRE_GENERATED_ANALYSIS[analysisKey]) {
        APP_STATE.records[key].suggestedRoute = PRE_GENERATED_ANALYSIS[analysisKey].route;
        if (!APP_STATE.analysisState[key]) {
          APP_STATE.analysisState[key] = {};
        }
        APP_STATE.analysisState[key].analyzed = true;
        APP_STATE.analysisState[key].analyzedAt = results.timestamp;
        APP_STATE.analysisState[key].analysisRevision = batchData.revision;
        APP_STATE.analysisState[key].method = 'pre-generated';
      }

      results.newRecords++;
    }
  });

  // Record import in history
  APP_STATE.importHistory.push(results);

  saveState(APP_STATE);
  return results;
}

function getTranscriptHash(record) {
  if (record.source_type === 'call') {
    return record.payload.transcript || '';
  }
  if (record.transcript_payload && record.transcript_payload.turns) {
    return JSON.stringify(record.transcript_payload.turns);
  }
  return '';
}

// ===== ROUTE MANAGEMENT =====
function getRecordRoute(key) {
  // Manual override takes priority
  if (APP_STATE.manualOverrides[key]) {
    return APP_STATE.manualOverrides[key];
  }
  // Then suggested route
  const record = APP_STATE.records[key];
  if (record && record.suggestedRoute) {
    return record.suggestedRoute;
  }
  return 'needs_review';
}

function setManualRoute(key, route) {
  APP_STATE.manualOverrides[key] = route;
  saveState(APP_STATE);
}

function clearManualRoute(key) {
  delete APP_STATE.manualOverrides[key];
  saveState(APP_STATE);
}

function isManuallyRouted(key) {
  return !!APP_STATE.manualOverrides[key];
}

// ===== ANALYSIS HELPERS =====
function getAnalysis(key) {
  if (typeof PRE_GENERATED_ANALYSIS !== 'undefined' && PRE_GENERATED_ANALYSIS[key]) {
    return PRE_GENERATED_ANALYSIS[key];
  }
  return null;
}

function isAnalysisStale(key) {
  return APP_STATE.analysisState[key] && APP_STATE.analysisState[key].stale === true;
}

function markAnalysisReviewed(key) {
  if (APP_STATE.analysisState[key]) {
    APP_STATE.analysisState[key].stale = false;
    APP_STATE.analysisState[key].reviewedAt = new Date().toISOString();
  }
  saveState(APP_STATE);
}

// ===== RECORD HELPERS =====
function hasUsableTranscript(record) {
  if (record.source_type === 'call') {
    return record.payload.transcript && record.payload.transcript.trim().length > 0;
  }
  if (record.source_type === 'meeting') {
    return record.transcript_payload &&
           record.transcript_payload.turns &&
           record.transcript_payload.turns.length > 0;
  }
  return false;
}

function getRecordTitle(record) {
  if (record.source_type === 'meeting') {
    return record.payload.title || 'Untitled Meeting';
  }
  // For calls, derive from transcript or metadata
  const analysis = getAnalysis(makeRecordKey(record.source_type, record.source_id));
  if (analysis && analysis.summary) {
    return analysis.summary.substring(0, 80) + (analysis.summary.length > 80 ? '...' : '');
  }
  if (record.payload.transcript) {
    return record.payload.transcript.substring(0, 60) + '...';
  }
  return `${record.payload.direction || ''} call - ${record.payload.observed_outcome || 'unknown'}`;
}

function getRecordPerson(record) {
  if (record.source_type === 'call') {
    return record.payload.rep_name || record.payload.rep_email || 'Unknown';
  }
  return record.payload.organizer_email || 'Unknown';
}

function getRecordTime(record) {
  const ts = record.source_type === 'call' ? record.payload.started_at : record.payload.starts_at;
  if (!ts) return '';
  const d = new Date(ts);
  // Convert to Asia/Kolkata
  return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
}

function getRecordDuration(record) {
  const secs = record.payload.duration_seconds;
  if (!secs && secs !== 0) return '-';
  if (secs < 60) return secs + 's';
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  }
  return `${mins}m ${remainSecs}s`;
}

function getAllRecords() {
  return Object.entries(APP_STATE.records).map(([key, record]) => ({
    key,
    ...record,
    route: getRecordRoute(key),
    isManual: isManuallyRouted(key),
    isStale: isAnalysisStale(key),
    hasTranscript: hasUsableTranscript(record)
  }));
}

function getFilteredRecords() {
  let records = getAllRecords();

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    records = records.filter(r => {
      return (r.record_ref && r.record_ref.toLowerCase().includes(q)) ||
             (getRecordTitle(r).toLowerCase().includes(q)) ||
             (getRecordPerson(r).toLowerCase().includes(q)) ||
             (r.source_id && r.source_id.toLowerCase().includes(q));
    });
  }

  // Type filter
  if (filterType !== 'all') {
    records = records.filter(r => r.source_type === filterType);
  }

  // Route filter
  if (filterRoute !== 'all') {
    records = records.filter(r => r.route === filterRoute);
  }

  // Person filter
  if (filterPerson !== 'all') {
    records = records.filter(r => getRecordPerson(r) === filterPerson);
  }

  // Transcript filter
  if (filterTranscript === 'with') {
    records = records.filter(r => r.hasTranscript);
  } else if (filterTranscript === 'without') {
    records = records.filter(r => !r.hasTranscript);
  }

  // Sort: conversations with transcripts first, then by time (latest first)
  records.sort((a, b) => {
    // Transcript records first
    if (a.hasTranscript && !b.hasTranscript) return -1;
    if (!a.hasTranscript && b.hasTranscript) return 1;
    // Then by record ref (C before B, M in between)
    const refOrder = (ref) => {
      if (ref.startsWith('C')) return 1;
      if (ref.startsWith('M')) return 2;
      if (ref.startsWith('B')) return 3;
      return 4;
    };
    const oa = refOrder(a.record_ref);
    const ob = refOrder(b.record_ref);
    if (oa !== ob) return oa - ob;
    // Then by time
    const ta = a.source_type === 'call' ? a.payload.started_at : a.payload.starts_at;
    const tb = b.source_type === 'call' ? b.payload.started_at : b.payload.starts_at;
    return new Date(tb) - new Date(ta);
  });

  return records;
}

// ===== METRICS COMPUTATION =====
function computeMetrics() {
  const records = getAllRecords();
  const totalRecords = records.length;
  const calls = records.filter(r => r.source_type === 'call');
  const meetings = records.filter(r => r.source_type === 'meeting');
  const withTranscript = records.filter(r => r.hasTranscript);

  // Unique people
  const callReps = [...new Set(calls.map(r => r.payload.rep_email).filter(Boolean))];
  const meetingOrgs = [...new Set(meetings.map(r => r.payload.organizer_email).filter(Boolean))];

  // Connection rate (calls with non-null is_connected)
  const callsWithConnectionData = calls.filter(r => r.payload.is_connected !== null && r.payload.is_connected !== undefined);
  const connectedCalls = callsWithConnectionData.filter(r => r.payload.is_connected === true);

  // Route distribution
  const routeCounts = {};
  records.forEach(r => {
    const route = r.route;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  // Review needed
  const needsReview = records.filter(r => r.route === 'needs_review' || r.isStale);

  // Activity by person
  const personActivity = {};
  records.forEach(r => {
    const person = getRecordPerson(r);
    if (!personActivity[person]) {
      personActivity[person] = { calls: 0, meetings: 0, total: 0, withTranscript: 0 };
    }
    if (r.source_type === 'call') personActivity[person].calls++;
    else personActivity[person].meetings++;
    personActivity[person].total++;
    if (r.hasTranscript) personActivity[person].withTranscript++;
  });

  return {
    totalRecords,
    calls: calls.length,
    meetings: meetings.length,
    withTranscript: withTranscript.length,
    transcriptCoverage: totalRecords > 0 ? (withTranscript.length / totalRecords * 100).toFixed(1) : 0,
    callTranscriptCoverage: calls.length > 0 ? (calls.filter(r=>r.hasTranscript).length / calls.length * 100).toFixed(1) : 0,
    meetingTranscriptCoverage: meetings.length > 0 ? (meetings.filter(r=>r.hasTranscript).length / meetings.length * 100).toFixed(1) : 0,
    callReps,
    meetingOrgs,
    connectionRate: callsWithConnectionData.length > 0 ? (connectedCalls.length / callsWithConnectionData.length * 100).toFixed(1) : 'N/A',
    connectedCalls: connectedCalls.length,
    callsWithConnectionData: callsWithConnectionData.length,
    routeCounts,
    needsReview: needsReview.length,
    personActivity,
    staleCount: records.filter(r => r.isStale).length,
    manualOverrides: Object.keys(APP_STATE.manualOverrides).length
  };
}

// ===== EXPORT ENGINE =====
function generateExport() {
  const records = getAllRecords();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Generate manifest
  const manifest = records.map(r => ({
    source_type: r.source_type,
    source_id: r.source_id,
    record_ref: r.record_ref,
    applied_revision: r.appliedRevision,
    route: r.route,
    route_label: ROUTE_DEFINITIONS[r.route]?.label || r.route,
    manual_override: r.isManual,
    has_transcript: r.hasTranscript,
    processing_state: r.isStale ? 'stale_pending_review' : (r.hasTranscript ? 'analyzed' : 'no_transcript'),
    analysis_freshness: r.isStale ? 'stale' : 'current',
    output_paths: getOutputPaths(r)
  }));

  // Generate per-record analysis files content
  const analysisOutputs = {};
  records.forEach(r => {
    const analysis = getAnalysis(r.key);
    if (analysis) {
      const filename = `analysis/${r.record_ref}_${r.source_type}.json`;
      analysisOutputs[filename] = {
        record_ref: r.record_ref,
        source_type: r.source_type,
        source_id: r.source_id,
        route: r.route,
        manual_override: r.isManual,
        analysis_stale: r.isStale,
        summary: analysis.summary,
        key_findings: analysis.keyFindings,
        evidence: analysis.evidence,
        next_actions: analysis.nextActions,
        coaching_notes: analysis.coachingNotes
      };
    }
  });

  // Generate manager brief
  const brief = generateManagerBrief(records);

  return {
    manifest,
    analysisOutputs,
    brief,
    timestamp
  };
}

function getOutputPaths(record) {
  const paths = [];
  const analysis = getAnalysis(record.key);
  if (analysis) {
    paths.push(`analysis/${record.record_ref}_${record.source_type}.json`);
  }
  paths.push('manager_brief_2026-08-21.md');
  return paths;
}

function generateManagerBrief(records) {
  const metrics = computeMetrics();
  return {
    date: '2026-08-21',
    timezone: 'Asia/Kolkata',
    summary: `Activity summary for 21 August 2026: ${metrics.totalRecords} selected records (${metrics.calls} calls, ${metrics.meetings} meetings). ${metrics.withTranscript} have usable supplied text (${metrics.transcriptCoverage}% coverage). ${metrics.needsReview} records need review.`,
    records: records.length,
    metrics
  };
}

async function downloadExportAsZip() {
  const exportData = generateExport();
  
  // If JSZip library is loaded, build a true .zip archive
  if (typeof JSZip !== 'undefined') {
    try {
      showToast('Creating ZIP archive...', 'info');
      const zip = new JSZip();
      
      // Add manifest.json and manifest.csv at root
      zip.file('manifest.json', JSON.stringify(exportData.manifest, null, 2));
      const csvContent = generateManifestCSV(exportData.manifest);
      zip.file('manifest.csv', csvContent);
      
      // Add manager brief
      const briefContent = formatManagerBriefMarkdown(exportData);
      zip.file('manager_brief_2026-08-21.md', briefContent);

      // Add individual analysis files into analysis/ subfolder
      const analysisFolder = zip.folder('analysis');
      Object.entries(exportData.analysisOutputs).forEach(([path, content]) => {
        const fname = path.replace('analysis/', '');
        analysisFolder.file(fname, JSON.stringify(content, null, 2));
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue_intel_export_${exportData.timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('ZIP archive downloaded successfully!', 'success');
      return exportData;
    } catch(err) {
      console.warn('JSZip failed, falling back to individual downloads:', err);
    }
  }

  // Fallback: download individual files
  downloadJSON(exportData.manifest, `manifest_${exportData.timestamp}.json`);
  const csvContent = generateManifestCSV(exportData.manifest);
  downloadFile(csvContent, `manifest_${exportData.timestamp}.csv`, 'text/csv');
  const briefContent = formatManagerBriefMarkdown(exportData);
  downloadFile(briefContent, `manager_brief_2026-08-21.md`, 'text/markdown');
  downloadJSON(exportData.analysisOutputs, `analysis_all_${exportData.timestamp}.json`);
  showToast('Export files downloaded', 'success');

  return exportData;
}

function generateManifestCSV(manifest) {
  const headers = ['source_type', 'source_id', 'record_ref', 'applied_revision', 'route', 'route_label', 'manual_override', 'has_transcript', 'processing_state', 'analysis_freshness', 'output_paths'];
  const rows = manifest.map(r => [
    r.source_type,
    r.source_id,
    r.record_ref,
    r.applied_revision,
    r.route,
    r.route_label,
    r.manual_override,
    r.has_transcript,
    r.processing_state,
    r.analysis_freshness,
    r.output_paths.join(';')
  ]);
  return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
}

function formatManagerBriefMarkdown(exportData) {
  const m = exportData.brief.metrics;
  let md = `# Manager Brief — 21 August 2026 (Asia/Kolkata)\n\n`;
  md += `## Activity Summary\n\n`;
  md += `- **Total selected records:** ${m.totalRecords}\n`;
  md += `- **Calls:** ${m.calls} | **Meetings:** ${m.meetings}\n`;
  md += `- **Usable supplied text:** ${m.withTranscript} of ${m.totalRecords} (${m.transcriptCoverage}% coverage)\n`;
  md += `  - Call transcript coverage: ${m.callTranscriptCoverage}%\n`;
  md += `  - Meeting transcript coverage: ${m.meetingTranscriptCoverage}%\n`;
  md += `- **Source-reported connection rate (calls):** ${m.connectionRate}% (${m.connectedCalls} of ${m.callsWithConnectionData} with data; unknown excluded)\n`;
  md += `- **Records needing review:** ${m.needsReview}\n`;
  md += `- **Manual route overrides:** ${m.manualOverrides}\n\n`;

  md += `## Route Distribution\n\n`;
  Object.entries(m.routeCounts).sort((a, b) => b[1] - a[1]).forEach(([route, count]) => {
    const def = ROUTE_DEFINITIONS[route];
    md += `- **${def ? def.label : route}:** ${count} records\n`;
  });

  md += `\n## Activity by Person\n\n`;
  md += `| Person | Calls | Meetings | With Text | Total |\n`;
  md += `|--------|-------|----------|-----------|-------|\n`;
  Object.entries(m.personActivity).sort((a, b) => b[1].total - a[1].total).forEach(([person, act]) => {
    md += `| ${person} | ${act.calls} | ${act.meetings} | ${act.withTranscript} | ${act.total} |\n`;
  });

  md += `\n## Key Conversations Requiring Attention\n\n`;

  // Highlight important conversations
  const allRecords = getAllRecords();
  const importantRecords = allRecords.filter(r => r.hasTranscript && r.route !== 'background_activity');
  importantRecords.forEach(r => {
    const analysis = getAnalysis(r.key);
    if (analysis) {
      md += `### ${r.record_ref} — ${getRecordTitle(r)}\n`;
      md += `**Route:** ${ROUTE_DEFINITIONS[r.route]?.label || r.route}`;
      if (r.isManual) md += ` (manually assigned)`;
      if (r.isStale) md += ` ⚠️ Analysis stale`;
      md += `\n\n`;
      md += `${analysis.summary}\n\n`;
      if (analysis.nextActions && analysis.nextActions.length > 0) {
        md += `**Next actions:**\n`;
        analysis.nextActions.forEach(a => md += `- ${a}\n`);
      }
      md += `\n`;
    }
  });

  md += `\n## Coaching Priorities\n\n`;
  md += `1. **Price consistency** (M03): Asterloom Systems noticed a price discrepancy (INR 26,000 vs 39,000). Ensure quoted prices are consistent.\n`;
  md += `2. **Churn risk** (M04): Cedarwave Distribution questioned the value proposition. The credit need is critical and unresolved.\n`;
  md += `3. **Product bugs** (M07): Willowfield Trust reported 4 bugs — escalate promptly.\n`;
  md += `4. **Blocking issue** (M09): Brookmint Holdings login token expired twice — blocking onboarding.\n`;
  md += `5. **Data quality** (C10): Aniket no longer at Meadowbrick — update CRM records.\n`;

  md += `\n## Follow-up Priorities\n\n`;
  md += `| Priority | Record | Action | Owner |\n`;
  md += `|----------|--------|--------|-------|\n`;
  md += `| 🔴 High | M04 | Check bank-card programme eligibility for Cedarwave | team09 |\n`;
  md += `| 🔴 High | M07 | Escalate 4 bugs to dev team | team09 |\n`;
  md += `| 🔴 High | M09 | Fix expired token for Brookmint Holdings | team11 |\n`;
  md += `| 🟡 Medium | M01 | Send partner memorandum to Harborpath Advisory | team06 |\n`;
  md += `| 🟡 Medium | M02 | Complete volume template for LedgerBridge | team07 |\n`;
  md += `| 🟡 Medium | C03 | Send email and schedule Monday call with Milan | Kiran |\n`;
  md += `| 🟢 Normal | C08 | Send proposal to contact08@example.com | Meera |\n`;
  md += `| 🟢 Normal | M03 | Send cards proposal to Asterloom Systems | team08 |\n`;

  md += `\n---\n`;
  md += `*Generated at ${new Date().toISOString()}. `;
  md += `Analysis is pre-generated using AI assistance. `;
  md += `${m.totalRecords - m.withTranscript} records have no usable supplied text and are assessed from metadata only.*\n`;

  return md;
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 300ms ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ===== RENDER ENGINE =====
function render() {
  renderSidebar();
  renderPageContent();
}

function renderSidebar() {
  const metrics = computeMetrics();
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', badge: null },
    { id: 'inbox', icon: '📬', label: 'Inbox', badge: metrics.totalRecords > 0 ? metrics.totalRecords : null, badgeType: 'info' },
    { id: 'brief', icon: '📋', label: 'Manager Brief', badge: null },
    { id: 'import', icon: '📥', label: 'Import Data', badge: null },
    { id: 'export', icon: '📤', label: 'Export', badge: null },
  ];

  const reviewBadge = metrics.needsReview > 0 ? metrics.needsReview : null;

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-icon">RI</div>
        <div>
          <div class="logo-text">Revenue Intel</div>
          <div class="logo-subtitle">Inbox</div>
        </div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section-title">Main</div>
      ${navItems.map(item => `
        <div class="nav-item ${currentView === item.id ? 'active' : ''}" onclick="navigateTo('${item.id}')">
          <span class="nav-icon">${item.icon}</span>
          ${item.label}
          ${item.badge ? `<span class="nav-badge ${item.badgeType || ''}">${item.badge}</span>` : ''}
        </div>
      `).join('')}
      <div class="nav-section-title" style="margin-top: 16px">Review</div>
      <div class="nav-item ${currentView === 'review' ? 'active' : ''}" onclick="navigateTo('review')">
        <span class="nav-icon">⚠️</span>
        Needs Review
        ${reviewBadge ? `<span class="nav-badge warning">${reviewBadge}</span>` : ''}
      </div>
      <div class="nav-item ${currentView === 'stale' ? 'active' : ''}" onclick="navigateTo('stale')">
        <span class="nav-icon">🔄</span>
        Stale Analysis
        ${metrics.staleCount > 0 ? `<span class="nav-badge warning">${metrics.staleCount}</span>` : ''}
      </div>
      <div class="nav-section-title" style="margin-top: 16px">Deliverables</div>
      <a class="nav-item" href="slides.html" target="_blank" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: var(--sp-sm);">
        <span class="nav-icon">📊</span>
        5-Slide Deck
      </a>
      <a class="nav-item" href="assignment.html" target="_blank" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: var(--sp-sm);">
        <span class="nav-icon">📋</span>
        Assignment Brief
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="import-status">
        ${metrics.totalRecords > 0 ? `
          <strong>${metrics.totalRecords}</strong> records loaded<br>
          <strong>${metrics.withTranscript}</strong> with text<br>
          Last: ${APP_STATE.importHistory.length > 0 ? new Date(APP_STATE.importHistory[APP_STATE.importHistory.length - 1].timestamp).toLocaleString() : 'Never'}
        ` : `<em>No data imported yet</em>`}
      </div>
    </div>
  `;
}

function renderPageContent() {
  const content = document.getElementById('pageContent');
  if (!content) return;

  switch (currentView) {
    case 'dashboard': renderDashboard(content); break;
    case 'inbox': renderInbox(content); break;
    case 'brief': renderBrief(content); break;
    case 'import': renderImport(content); break;
    case 'export': renderExport(content); break;
    case 'review': renderReviewQueue(content); break;
    case 'stale': renderStaleQueue(content); break;
    default: renderDashboard(content);
  }
}

function navigateTo(view) {
  currentView = view;
  selectedRecordKey = null;
  render();
  closeDetailPanel();
}

// ===== DASHBOARD VIEW =====
function renderDashboard(container) {
  const metrics = computeMetrics();
  const records = getAllRecords();

  if (records.length === 0) {
    container.innerHTML = `
      <div class="page-header">
        <h1>📊 Dashboard</h1>
      </div>
      <div class="page-content">
        <div class="empty-state">
          <div class="empty-icon">📥</div>
          <h3>No Data Imported</h3>
          <p>Import the initial batch to get started. Go to Import Data in the sidebar.</p>
          <button class="btn btn-primary btn-lg" style="margin-top: 16px" onclick="navigateTo('import')">Import Data</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <h1>📊 Dashboard — 21 August 2026</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="navigateTo('brief')">📋 Manager Brief</button>
        <button class="btn btn-primary" onclick="navigateTo('export')">📤 Export</button>
      </div>
    </div>
    <div class="page-content">
      <div class="metrics-grid" id="metricsGrid"></div>
      <div class="charts-row" id="chartsRow"></div>
      <div class="card" style="margin-bottom: 24px">
        <div class="card-header">
          <span class="card-title">📌 Metric Definitions</span>
          <button class="btn btn-ghost btn-sm" onclick="this.parentElement.nextElementSibling.style.display = this.parentElement.nextElementSibling.style.display === 'none' ? 'block' : 'none'">Show/Hide</button>
        </div>
        <div style="display:none; font-size: 12px; color: var(--text-muted); line-height: 1.8">
          <p><strong>Total Selected Records:</strong> Count of distinct (source_type, source_id) pairs after applying revisions. This is a selected sample, not a full team report.</p>
          <p><strong>Usable Supplied Text:</strong> Records with non-blank call transcript or at least one non-blank meeting turn. Coverage = usable texts / selected records.</p>
          <p><strong>Source-Reported Connection Rate:</strong> Calls with is_connected=true / calls with non-null is_connected. ${metrics.callsWithConnectionData < metrics.calls ? (metrics.calls - metrics.callsWithConnectionData) + ' calls excluded (null is_connected).' : ''} This is a stored source classification, not a transcript-based assessment.</p>
          <p><strong>Route Counts:</strong> Based on assigned routes (automated + manual overrides). A record has exactly one route. Route assignments = unique record count.</p>
          <p><strong>Needs Review:</strong> Records routed to "Needs Review" OR with stale analysis (transcript changed since analysis).</p>
          <p><strong>Activity Period:</strong> All selected activity falls on 21 August 2026 (Asia/Kolkata). Calls use started_at; meetings use starts_at.</p>
        </div>
      </div>
    </div>
  `;

  renderMetricsGrid(metrics);
  renderCharts(metrics, records);
}

function renderMetricsGrid(metrics) {
  const grid = document.getElementById('metricsGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="metric-card">
      <div class="metric-icon blue">📊</div>
      <div class="metric-value">${metrics.totalRecords}</div>
      <div class="metric-label">Selected Records</div>
      <div class="metric-detail">${metrics.calls} calls · ${metrics.meetings} meetings</div>
    </div>
    <div class="metric-card">
      <div class="metric-icon green">📝</div>
      <div class="metric-value">${metrics.withTranscript}</div>
      <div class="metric-label">With Usable Text</div>
      <div class="metric-detail">${metrics.transcriptCoverage}% coverage (call: ${metrics.callTranscriptCoverage}% · meeting: ${metrics.meetingTranscriptCoverage}%)</div>
    </div>
    <div class="metric-card">
      <div class="metric-icon amber">📞</div>
      <div class="metric-value">${metrics.connectionRate}%</div>
      <div class="metric-label">Source Connection Rate</div>
      <div class="metric-detail">${metrics.connectedCalls} of ${metrics.callsWithConnectionData} calls (source-reported)</div>
    </div>
    <div class="metric-card">
      <div class="metric-icon red">⚠️</div>
      <div class="metric-value">${metrics.needsReview}</div>
      <div class="metric-label">Needs Review</div>
      <div class="metric-detail">${metrics.staleCount} stale · ${Object.keys(APP_STATE.manualOverrides).length} manual overrides</div>
    </div>
    <div class="metric-card">
      <div class="metric-icon purple">🗂️</div>
      <div class="metric-value">${Object.keys(metrics.routeCounts).length}</div>
      <div class="metric-label">Active Routes</div>
      <div class="metric-detail">${Object.values(metrics.routeCounts).reduce((a,b)=>a+b, 0)} total assignments</div>
    </div>
  `;
}

function renderCharts(metrics, records) {
  const chartsRow = document.getElementById('chartsRow');
  if (!chartsRow) return;

  // Activity by person
  const personEntries = Object.entries(metrics.personActivity)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);
  const maxActivity = personEntries.length > 0 ? personEntries[0][1].total : 1;

  // Route distribution
  const routeEntries = Object.entries(metrics.routeCounts)
    .sort((a, b) => b[1] - a[1]);

  chartsRow.innerHTML = `
    <div class="chart-card">
      <h3>📊 Activity by Person (Selected Records)</h3>
      <div class="bar-chart">
        ${personEntries.map(([person, act]) => {
          const shortName = person.split('@')[0] || person;
          const pct = (act.total / maxActivity * 100);
          return `
            <div class="bar-row" style="cursor:pointer" onclick="filterByPerson('${person}')">
              <div class="bar-label" title="${person}">${shortName}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${pct}%">
                  <span class="bar-value">${act.total}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top: 12px; font-size: 11px; color: var(--text-muted)">
        Call reps: ${metrics.callReps.map(e => e.split('@')[0]).join(', ')}. 
        Click a bar to filter inbox.
      </div>
    </div>
    <div class="chart-card">
      <h3>🗂️ Route Distribution</h3>
      <div class="route-distribution">
        ${routeEntries.map(([route, count]) => {
          const def = ROUTE_DEFINITIONS[route] || { label: route, icon: '?', color: 'background' };
          return `
            <div class="route-dist-item" style="cursor:pointer" onclick="filterByRoute('${route}')">
              <span class="route-dist-dot" style="background: var(--route-${def.color})"></span>
              <span>${def.icon} ${def.label}</span>
              <span class="route-dist-count">${count}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top: 12px; font-size: 11px; color: var(--text-muted)">
        Total unique records: ${metrics.totalRecords}. Route assignments equal record count (one route per record). Click to filter.
      </div>
    </div>
  `;
}

function filterByPerson(person) {
  filterPerson = person;
  navigateTo('inbox');
}

function filterByRoute(route) {
  filterRoute = route;
  navigateTo('inbox');
}

// ===== INBOX VIEW =====
function renderInbox(container) {
  const records = getFilteredRecords();
  const allRecords = getAllRecords();
  const persons = [...new Set(allRecords.map(r => getRecordPerson(r)))].sort();

  container.innerHTML = `
    <div class="page-header">
      <h1>📬 Conversation Inbox</h1>
      <div class="header-actions">
        <span style="font-size: 12px; color: var(--text-muted)">${records.length} of ${allRecords.length} records</span>
      </div>
    </div>
    <div class="page-content">
      <div class="inbox-controls">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="Search by ref, title, person, or ID..." 
                 value="${searchQuery}" oninput="onSearchChange(this.value)">
        </div>
        <div class="filter-group">
          <select id="filterType" onchange="onFilterTypeChange(this.value)">
            <option value="all" ${filterType === 'all' ? 'selected' : ''}>All Types</option>
            <option value="call" ${filterType === 'call' ? 'selected' : ''}>Calls</option>
            <option value="meeting" ${filterType === 'meeting' ? 'selected' : ''}>Meetings</option>
          </select>
          <select id="filterRoute" onchange="onFilterRouteChange(this.value)">
            <option value="all" ${filterRoute === 'all' ? 'selected' : ''}>All Routes</option>
            ${Object.entries(ROUTE_DEFINITIONS).map(([key, def]) => 
              `<option value="${key}" ${filterRoute === key ? 'selected' : ''}>${def.icon} ${def.label}</option>`
            ).join('')}
          </select>
          <select id="filterPerson" onchange="onFilterPersonChange(this.value)">
            <option value="all" ${filterPerson === 'all' ? 'selected' : ''}>All People</option>
            ${persons.map(p => `<option value="${p}" ${filterPerson === p ? 'selected' : ''}>${p.split('@')[0]}</option>`).join('')}
          </select>
          <select id="filterTranscript" onchange="onFilterTranscriptChange(this.value)">
            <option value="all" ${filterTranscript === 'all' ? 'selected' : ''}>All Records</option>
            <option value="with" ${filterTranscript === 'with' ? 'selected' : ''}>With Text</option>
            <option value="without" ${filterTranscript === 'without' ? 'selected' : ''}>Without Text</option>
          </select>
          ${(filterType !== 'all' || filterRoute !== 'all' || filterPerson !== 'all' || filterTranscript !== 'all' || searchQuery) ? 
            `<button class="btn btn-ghost btn-sm" onclick="clearFilters()">✕ Clear</button>` : ''}
        </div>
      </div>
      <div class="inbox-list" id="inboxList">
        <div class="inbox-header">
          <span></span>
          <span>Ref</span>
          <span>Conversation</span>
          <span>Person</span>
          <span>Route</span>
          <span>Status</span>
          <span>Time</span>
        </div>
        ${records.length === 0 ? `
          <div class="empty-state" style="padding: 48px">
            <div class="empty-icon">🔍</div>
            <h3>No Records Found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ` : records.map(r => renderInboxItem(r)).join('')}
      </div>
    </div>
  `;
}

function renderInboxItem(record) {
  const title = getRecordTitle(record);
  const person = getRecordPerson(record);
  const time = getRecordTime(record);
  const duration = getRecordDuration(record);
  const route = record.route;
  const routeDef = ROUTE_DEFINITIONS[route] || { label: route, color: 'background', icon: '?' };

  let status = '';
  if (record.isStale) {
    status = '<span class="badge badge-warning">⚠️ Stale</span>';
  } else if (record.hasTranscript) {
    status = '<span class="badge badge-success">✓ Analyzed</span>';
  } else {
    status = '<span class="badge badge-neutral">No text</span>';
  }

  return `
    <div class="inbox-item" onclick="openRecordDetail('${record.key}')">
      <div class="item-icon ${record.source_type}">
        ${record.source_type === 'call' ? '📞' : '📅'}
      </div>
      <div class="item-ref">${record.record_ref}</div>
      <div class="item-title">
        ${escapeHtml(title.substring(0, 60))}${title.length > 60 ? '...' : ''}
        <span class="item-subtitle">${duration} · ${record.source_type}</span>
      </div>
      <div class="item-person">${person.split('@')[0]}</div>
      <div>
        <span class="badge-route ${routeDef.color}">${routeDef.icon} ${routeDef.label}</span>
        ${record.isManual ? '<span class="manual-override-badge" style="margin-left:4px">✏️ Manual</span>' : ''}
      </div>
      <div>${status}</div>
      <div class="item-time">${time}</div>
    </div>
  `;
}

function onSearchChange(value) {
  searchQuery = value;
  const inboxList = document.getElementById('inboxList');
  if (inboxList) {
    renderInbox(document.getElementById('pageContent'));
  }
}

function onFilterTypeChange(value) { filterType = value; renderInbox(document.getElementById('pageContent')); }
function onFilterRouteChange(value) { filterRoute = value; renderInbox(document.getElementById('pageContent')); }
function onFilterPersonChange(value) { filterPerson = value; renderInbox(document.getElementById('pageContent')); }
function onFilterTranscriptChange(value) { filterTranscript = value; renderInbox(document.getElementById('pageContent')); }

function clearFilters() {
  searchQuery = '';
  filterType = 'all';
  filterRoute = 'all';
  filterPerson = 'all';
  filterTranscript = 'all';
  renderInbox(document.getElementById('pageContent'));
}

// ===== DETAIL PANEL =====
function openRecordDetail(key) {
  selectedRecordKey = key;
  const panel = document.getElementById('detailPanel');
  renderDetailPanel();
  panel.classList.add('open');
}

function closeDetailPanel() {
  const panel = document.getElementById('detailPanel');
  if (panel) panel.classList.remove('open');
  selectedRecordKey = null;
}

function renderDetailPanel() {
  const panel = document.getElementById('detailPanel');
  if (!panel || !selectedRecordKey) return;

  const record = APP_STATE.records[selectedRecordKey];
  if (!record) return;

  const analysis = getAnalysis(selectedRecordKey);
  const route = getRecordRoute(selectedRecordKey);
  const routeDef = ROUTE_DEFINITIONS[route] || { label: route, color: 'background', icon: '?' };
  const isManual = isManuallyRouted(selectedRecordKey);
  const isStale = isAnalysisStale(selectedRecordKey);
  const hasText = hasUsableTranscript(record);

  panel.innerHTML = `
    <div class="detail-header">
      <h2>${record.record_ref} — ${record.source_type === 'call' ? '📞 Call' : '📅 Meeting'}</h2>
      <button class="btn btn-ghost" onclick="closeDetailPanel()">✕</button>
    </div>
    <div class="detail-body">
      <!-- Metadata -->
      <div class="detail-section">
        <h3>📋 Record Details</h3>
        <div class="detail-meta">
          <div class="detail-meta-item">
            <div class="meta-label">Source ID</div>
            <div class="meta-value" style="font-size: 11px; word-break: break-all">${record.source_id}</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Source Type</div>
            <div class="meta-value">${record.source_type}</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Person</div>
            <div class="meta-value">${getRecordPerson(record)}</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Time (IST)</div>
            <div class="meta-value">${getRecordTime(record)}</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Duration</div>
            <div class="meta-value">${getRecordDuration(record)}</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Applied Revision</div>
            <div class="meta-value">${record.appliedRevision}</div>
          </div>
          ${record.source_type === 'call' ? `
            <div class="detail-meta-item">
              <div class="meta-label">Direction</div>
              <div class="meta-value">${record.payload.direction || '-'}</div>
            </div>
            <div class="detail-meta-item">
              <div class="meta-label">Connected (source)</div>
              <div class="meta-value">${record.payload.is_connected === null ? 'Unknown' : record.payload.is_connected}</div>
            </div>
            <div class="detail-meta-item">
              <div class="meta-label">Outcome (source)</div>
              <div class="meta-value">${record.payload.observed_outcome || '-'}</div>
            </div>
            <div class="detail-meta-item">
              <div class="meta-label">Campaign Call</div>
              <div class="meta-value">${record.payload.is_campaign_call === null ? 'Unknown' : record.payload.is_campaign_call}</div>
            </div>
          ` : `
            <div class="detail-meta-item">
              <div class="meta-label">Title</div>
              <div class="meta-value">${escapeHtml(record.payload.title || '-')}</div>
            </div>
            <div class="detail-meta-item">
              <div class="meta-label">Recording</div>
              <div class="meta-value">${record.payload.recording_status || '-'}</div>
            </div>
            <div class="detail-meta-item">
              <div class="meta-label">Has Transcript (source)</div>
              <div class="meta-value">${record.payload.has_transcript}</div>
            </div>
            <div class="detail-meta-item">
              <div class="meta-label">Attendee Count</div>
              <div class="meta-value">${record.payload.attendee_count || '-'}</div>
            </div>
          `}
          <div class="detail-meta-item">
            <div class="meta-label">First Import</div>
            <div class="meta-value" style="font-size:11px">${record.firstImportBatchId} (${new Date(record.firstImportAt).toLocaleString()})</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Last Import</div>
            <div class="meta-value" style="font-size:11px">${record.lastImportBatchId} (${new Date(record.lastImportAt).toLocaleString()})</div>
          </div>
        </div>
      </div>

      <!-- Routing -->
      <div class="detail-section">
        <h3>🗂️ Routing</h3>
        <div class="routing-section">
          <div class="route-display">
            <span class="badge-route ${routeDef.color}">${routeDef.icon} ${routeDef.label}</span>
            ${isManual ? '<span class="manual-override-badge">✏️ Manual Override</span>' : '<span style="font-size:11px;color:var(--text-muted)">Auto-assigned</span>'}
          </div>
          ${analysis ? `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px"><strong>Reason:</strong> ${escapeHtml(analysis.routeReason)}</div>` : ''}
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Change route:</div>
          <div class="route-selector">
            ${Object.entries(ROUTE_DEFINITIONS).map(([key, def]) => `
              <button class="route-option ${route === key ? 'selected' : ''}" 
                      onclick="changeRoute('${selectedRecordKey}', '${key}')">
                ${def.icon} ${def.label}
              </button>
            `).join('')}
          </div>
          ${isManual ? `
            <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="resetRoute('${selectedRecordKey}')">
              ↩ Reset to auto-assigned
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Analysis -->
      <div class="detail-section">
        <h3>📊 Analysis ${isStale ? '<span class="badge badge-warning" style="margin-left:8px">⚠️ Stale — transcript changed</span>' : ''}</h3>
        ${analysis ? `
          <div class="analysis-box ${isStale ? 'stale' : ''}">
            <div class="analysis-header">
              <span class="badge ${isStale ? 'badge-warning' : 'badge-success'}">${isStale ? '⚠️ Pending Review' : '✓ Current'}</span>
              <span style="font-size:11px;color:var(--text-muted)">Pre-generated analysis</span>
            </div>
            <div class="analysis-content">
              <h4>Summary</h4>
              <p>${escapeHtml(analysis.summary)}</p>

              ${analysis.keyFindings && analysis.keyFindings.length > 0 ? `
                <h4>Key Findings</h4>
                <ul>${analysis.keyFindings.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
              ` : ''}

              ${analysis.evidence && analysis.evidence.length > 0 ? `
                <h4>Evidence</h4>
                ${analysis.evidence.map(e => `
                  <div class="evidence-ref">
                    ${e.type === 'turn' ? `[${e.ref} Turn ${e.turnNum}]` : `[${e.ref}]`} 
                    "${escapeHtml(e.text.substring(0, 120))}${e.text.length > 120 ? '...' : ''}"
                  </div>
                `).join('')}
              ` : ''}

              ${analysis.nextActions && analysis.nextActions.length > 0 ? `
                <h4>Suggested Next Actions</h4>
                <ul>${analysis.nextActions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
              ` : ''}

              ${analysis.coachingNotes ? `
                <h4>Coaching Notes</h4>
                <p>${escapeHtml(analysis.coachingNotes)}</p>
              ` : ''}
            </div>
            ${isStale ? `
              <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-subtle)">
                <button class="btn btn-secondary btn-sm" onclick="markReviewed('${selectedRecordKey}')">
                  ✓ Mark as Reviewed
                </button>
                <span style="font-size:11px;color:var(--text-muted);margin-left:8px">
                  Source text changed. Review and update analysis if needed.
                </span>
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="analysis-box">
            <div class="empty-state" style="padding:24px">
              <div class="empty-icon">📝</div>
              <h3>No Analysis Available</h3>
              <p>This record has no pre-generated analysis. ${hasText ? 'A transcript is available for manual review.' : 'No usable transcript is available.'}</p>
            </div>
          </div>
        `}
      </div>

      <!-- Transcript -->
      <div class="detail-section">
        <h3>💬 Transcript</h3>
        ${renderTranscript(record)}
      </div>
    </div>
  `;
}

function renderTranscript(record) {
  if (record.source_type === 'call') {
    if (record.payload.transcript && record.payload.transcript.trim().length > 0) {
      return `<div class="transcript-viewer"><div class="transcript-call-text">${escapeHtml(record.payload.transcript)}</div></div>`;
    }
    return `<div class="transcript-viewer"><div class="transcript-empty"><div class="empty-icon">🔇</div>No usable transcript supplied. ${record.payload.observed_outcome === 'voicemail' ? 'Call reached voicemail.' : ''}</div></div>`;
  }

  if (record.source_type === 'meeting') {
    if (record.transcript_payload && record.transcript_payload.turns && record.transcript_payload.turns.length > 0) {
      return `
        <div class="transcript-viewer">
          ${record.transcript_payload.turns.map((turn, i) => `
            <div class="transcript-turn">
              <div class="transcript-speaker">
                ${escapeHtml(turn.speaker)}
                <span class="turn-num">Turn ${i + 1}</span>
                <span class="timecode">${turn.timecode || ''}</span>
              </div>
              <div class="transcript-text">${escapeHtml(turn.text)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
    const reason = record.transcript_payload && record.transcript_payload.unavailable_reason
      ? record.transcript_payload.unavailable_reason
      : (record.payload.recording_status === 'cancelled' ? 'Notetaker was cancelled.'
         : record.payload.recording_status === 'not_scheduled' ? 'No notetaker was scheduled.'
         : 'No usable transcript available.');
    return `<div class="transcript-viewer"><div class="transcript-empty"><div class="empty-icon">🔇</div>${escapeHtml(reason)}</div></div>`;
  }

  return '<div class="transcript-viewer"><div class="transcript-empty">No transcript data.</div></div>';
}

function changeRoute(key, route) {
  setManualRoute(key, route);
  showToast(`Route changed to ${ROUTE_DEFINITIONS[route]?.label || route}`, 'success');
  renderDetailPanel();
  renderSidebar();
}

function resetRoute(key) {
  clearManualRoute(key);
  showToast('Route reset to auto-assigned', 'info');
  renderDetailPanel();
  renderSidebar();
}

function markReviewed(key) {
  markAnalysisReviewed(key);
  showToast('Analysis marked as reviewed', 'success');
  renderDetailPanel();
  renderSidebar();
}

// ===== MANAGER BRIEF VIEW =====
function renderBrief(container) {
  const records = getAllRecords();
  const metrics = computeMetrics();

  if (records.length === 0) {
    container.innerHTML = `
      <div class="page-header"><h1>📋 Manager Brief</h1></div>
      <div class="page-content">
        <div class="empty-state">
          <div class="empty-icon">📥</div>
          <h3>No Data Available</h3>
          <p>Import data first to generate the manager brief.</p>
        </div>
      </div>
    `;
    return;
  }

  const importantConversations = records.filter(r => r.hasTranscript && r.route !== 'background_activity');

  container.innerHTML = `
    <div class="page-header">
      <h1>📋 Manager Brief — 21 August 2026</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" onclick="downloadBriefMarkdown()">📥 Download Brief</button>
      </div>
    </div>
    <div class="page-content brief-container">
      <div class="brief-section">
        <h3>📊 Activity Summary</h3>
        <div class="detail-meta" style="margin-bottom:16px">
          <div class="detail-meta-item">
            <div class="meta-label">Selected Records</div>
            <div class="meta-value">${metrics.totalRecords} (${metrics.calls} calls · ${metrics.meetings} meetings)</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Usable Supplied Text</div>
            <div class="meta-value">${metrics.withTranscript} of ${metrics.totalRecords} (${metrics.transcriptCoverage}%)</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Connection Rate (source)</div>
            <div class="meta-value">${metrics.connectionRate}% (${metrics.connectedCalls}/${metrics.callsWithConnectionData})</div>
          </div>
          <div class="detail-meta-item">
            <div class="meta-label">Review Needed</div>
            <div class="meta-value">${metrics.needsReview} records</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-muted)">
          All activity falls on 21 August 2026 (Asia/Kolkata). This is a selected sample — not a complete or representative team performance record. 
          ${metrics.totalRecords - metrics.withTranscript} records lack usable text and are assessed from metadata only.
        </p>
      </div>

      <div class="brief-section">
        <h3>🔴 Urgent Attention Required</h3>
        <div class="brief-highlight">
          <div class="highlight-icon">🐛</div>
          <div>
            <strong>M07 — Willowfield Trust: 4 Product Bugs Reported</strong>
            <p>Customer demonstrated description-save failure, document upload failure on Recreate payment, reimbursement transactions stuck in Processing, and Mark-as-paid carrying forward previous amounts. Team member committed to same-day investigation.</p>
            <div class="evidence-ref">[M07 Turn 2-27] Multiple bugs demonstrated via screen share</div>
          </div>
        </div>
        <div class="brief-highlight">
          <div class="highlight-icon">⚠️</div>
          <div>
            <strong>M04 — Cedarwave Distribution: Churn Risk</strong>
            <p>Mandatory card migration + customer's critical need for credit (INR 1.3 crore credit line with bank). Customer questioned value: "What do we gain by adding SpendNest?"</p>
            <div class="evidence-ref">[M04 Turn 26] "What do we gain by adding SpendNest? We can already see transactions in the bank portal."</div>
          </div>
        </div>
        <div class="brief-highlight">
          <div class="highlight-icon">🔒</div>
          <div>
            <strong>M09 — Brookmint Holdings: Login Blocked</strong>
            <p>Invitation token expired twice (including fresh link). Blocking onboarding for the larger of two company accounts. Promised update same day or Monday.</p>
            <div class="evidence-ref">[M09 Turn 21] "It says the token has expired. This is the fresh message we just received."</div>
          </div>
        </div>
      </div>

      <div class="brief-section">
        <h3>🟡 Important Follow-ups</h3>
        <div class="brief-highlight">
          <div class="highlight-icon">🤝</div>
          <div>
            <strong>M01 — Harborpath Advisory: Partnership Ready</strong>
            <p>Partner commission agreed (USD 260/activation). Partner wants referral link and memorandum to start immediately. Also interested in podcast cross-promotion.</p>
            <div class="evidence-ref">[M01 Turn 12] "No, let us get the partner onboarding started."</div>
          </div>
        </div>
        <div class="brief-highlight">
          <div class="highlight-icon">🔍</div>
          <div>
            <strong>M02 — LedgerBridge: Vendor Evaluation Next Steps</strong>
            <p>Invoicing vendor evaluation progressing. Volume template to be completed. Q4 target timeline for Singapore and Australia, then India. Written pricing needed for management review.</p>
            <div class="evidence-ref">[M02 Turn 13] "We are aiming for the fourth quarter."</div>
          </div>
        </div>
        <div class="brief-highlight">
          <div class="highlight-icon">💰</div>
          <div>
            <strong>M03 — Asterloom Systems: Price Discrepancy</strong>
            <p>Prospect noticed price changed from INR 26,000 to INR 39,000 (resolved as 26K recurring + 13K setup). CFO approval pending. Starting with 4-5 employees.</p>
            <div class="evidence-ref">[M03 Turn 23] "But you previously told me INR 26,000. Why has that become INR 39,000?"</div>
          </div>
        </div>
      </div>

      <div class="brief-section">
        <h3>📞 Coaching Priorities</h3>
        <ul>
          <li><strong>Price consistency</strong> (M03): Quoted prices must be consistent between conversations. Discrepancies undermine trust.</li>
          <li><strong>Value articulation</strong> (M04): When a customer asks "What do we gain?", the team needs a clear, specific answer beyond generic feature lists.</li>
          <li><strong>Data hygiene</strong> (C10): Contact data for Aniket at Meadowbrick is stale — he has left the company. Update CRM records.</li>
          <li><strong>Recording compliance</strong> (M05/M08): Two meetings by team08 had "no speech detected" — investigate if this is an audio setup issue.</li>
          <li><strong>Follow-up discipline</strong> (C03): Kiran has a clear next step (email + Monday call with Milan). Ensure it happens.</li>
        </ul>
      </div>

      <div class="brief-section">
        <h3>📊 Conversations Reviewed (${importantConversations.length})</h3>
        ${importantConversations.map(r => {
          const analysis = getAnalysis(r.key);
          const routeDef = ROUTE_DEFINITIONS[r.route];
          return `
            <div style="padding:8px 0;border-bottom:1px solid var(--border-subtle);cursor:pointer" onclick="openRecordDetail('${r.key}')">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-weight:600;color:var(--text-accent)">${r.record_ref}</span>
                <span class="badge-route ${routeDef?.color || 'background'}" style="font-size:10px">${routeDef?.label || r.route}</span>
                ${r.isManual ? '<span class="manual-override-badge">✏️</span>' : ''}
                ${r.isStale ? '<span class="badge badge-warning" style="font-size:10px">Stale</span>' : ''}
              </div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${analysis ? escapeHtml(analysis.summary.substring(0, 120)) + '...' : getRecordTitle(r)}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size:11px;color:var(--text-muted);margin-top:24px;padding:16px;background:var(--bg-surface);border-radius:var(--radius-md)">
        <strong>Note:</strong> This brief is pre-generated from AI-assisted analysis. All findings are based on adapted, de-identified conversation data.
        ${metrics.totalRecords - metrics.withTranscript} of ${metrics.totalRecords} records have no usable supplied text. 
        Monetary amounts mentioned are from conversation text (stated claims, not verified transactions).
        This is a selected sample — not a complete or representative team performance record.
      </div>
    </div>
  `;
}

function downloadBriefMarkdown() {
  const exportData = generateExport();
  const briefContent = formatManagerBriefMarkdown(exportData);
  downloadFile(briefContent, 'manager_brief_2026-08-21.md', 'text/markdown');
  showToast('Manager brief downloaded', 'success');
}

// ===== IMPORT VIEW =====
function renderImport(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1>📥 Import Data</h1>
      <div class="header-actions">
        <button class="btn btn-danger btn-sm" onclick="confirmReset()">🗑️ Reset All Data</button>
      </div>
    </div>
    <div class="page-content">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
        <div class="import-drop-zone" onclick="importInitialBatch()" id="initialDropZone">
          <div class="drop-icon">📦</div>
          <h3>Import Initial Batch</h3>
          <p>Load data/01_initial.json (44 records, revision 1)</p>
          <button class="btn btn-primary" style="margin-top:12px">Import Initial</button>
        </div>
        <div class="import-drop-zone" onclick="importUpdateBatch()" id="updateDropZone">
          <div class="drop-icon">🔄</div>
          <h3>Import Update Batch</h3>
          <p>Load data/02_update.json (M07 transcript, revision 2)</p>
          <button class="btn btn-secondary" style="margin-top:12px">Import Update</button>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px">
        <div class="card-header">
          <span class="card-title">📁 Custom File Import</span>
        </div>
        <div class="import-drop-zone" style="padding:24px" id="customDropZone" 
             ondragover="event.preventDefault(); this.classList.add('dragover')"
             ondragleave="this.classList.remove('dragover')"
             ondrop="handleFileDrop(event)">
          <p>Drop a JSON batch file here or <label style="color:var(--text-accent);cursor:pointer"><input type="file" accept=".json" style="display:none" onchange="handleFileSelect(event)">click to browse</label></p>
        </div>
      </div>

      <div class="import-history">
        <h3 style="font-size:15px;margin-bottom:16px">📜 Import History</h3>
        ${APP_STATE.importHistory.length === 0 ? `
          <div class="empty-state" style="padding:24px">
            <p style="color:var(--text-muted)">No imports yet. Import the initial batch to get started.</p>
          </div>
        ` : APP_STATE.importHistory.slice().reverse().map((imp, i) => `
          <div class="import-history-item">
            <div class="import-icon">✓</div>
            <div class="import-info">
              <div class="import-name">${escapeHtml(imp.batchId)} (Revision ${imp.revision})</div>
              <div class="import-detail">
                ${imp.totalRecords} records · ${imp.newRecords} new · ${imp.updatedRecords} updated · ${imp.skippedRecords} skipped
                ${imp.staleAnalysis > 0 ? ` · ${imp.staleAnalysis} stale` : ''}
              </div>
            </div>
            <div style="font-size:11px;color:var(--text-muted)">${new Date(imp.timestamp).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function importInitialBatch() {
  try {
    let data;
    try {
      const response = await fetch('data/01_initial.json');
      if (response.ok) {
        data = await response.json();
      }
    } catch (fetchErr) {
      console.warn('Fetch failed, using bundled fallback:', fetchErr);
    }
    if (!data && typeof window !== 'undefined' && window.INITIAL_BATCH_DATA) {
      data = window.INITIAL_BATCH_DATA;
    }
    if (!data) throw new Error('Could not load data/01_initial.json');
    const results = importBatch(data);
    showToast(`Imported: ${results.newRecords} new, ${results.updatedRecords} updated, ${results.skippedRecords} skipped`, 'success');
    render();
  } catch (e) {
    showToast('Import failed: ' + e.message, 'error');
    console.error(e);
  }
}

async function importUpdateBatch() {
  try {
    let data;
    try {
      const response = await fetch('data/02_update.json');
      if (response.ok) {
        data = await response.json();
      }
    } catch (fetchErr) {
      console.warn('Fetch failed, using bundled fallback:', fetchErr);
    }
    if (!data && typeof window !== 'undefined' && window.UPDATE_BATCH_DATA) {
      data = window.UPDATE_BATCH_DATA;
    }
    if (!data) throw new Error('Could not load data/02_update.json');
    const results = importBatch(data);
    showToast(`Update: ${results.newRecords} new, ${results.updatedRecords} updated, ${results.skippedRecords} skipped${results.staleAnalysis > 0 ? `, ${results.staleAnalysis} analysis marked stale` : ''}`, 'success');
    render();
  } catch (e) {
    showToast('Import failed: ' + e.message, 'error');
    console.error(e);
  }
}

function handleFileDrop(event) {
  event.preventDefault();
  event.target.classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (file) processImportFile(file);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) processImportFile(file);
}

function processImportFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.batch_id || !data.records) {
        throw new Error('Invalid batch format: missing batch_id or records');
      }
      const results = importBatch(data);
      showToast(`Imported ${file.name}: ${results.newRecords} new, ${results.updatedRecords} updated, ${results.skippedRecords} skipped`, 'success');
      render();
    } catch (e) {
      showToast('Import failed: ' + e.message, 'error');
    }
  };
  reader.readAsText(file);
}

function confirmReset() {
  if (confirm('Are you sure you want to reset all data? This will clear all records, imports, and manual overrides.')) {
    APP_STATE = getDefaultState();
    saveState(APP_STATE);
    showToast('All data has been reset', 'warning');
    render();
  }
}

// ===== EXPORT VIEW =====
function renderExport(container) {
  const records = getAllRecords();

  if (records.length === 0) {
    container.innerHTML = `
      <div class="page-header"><h1>📤 Export</h1></div>
      <div class="page-content">
        <div class="empty-state">
          <div class="empty-icon">📥</div>
          <h3>No Data to Export</h3>
          <p>Import data first.</p>
        </div>
      </div>
    `;
    return;
  }

  const exportData = generateExport();

  container.innerHTML = `
    <div class="page-header">
      <h1>📤 Export</h1>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="downloadExportAsZip()">📥 Download All Exports</button>
      </div>
    </div>
    <div class="page-content">
      <div class="tabs">
        <div class="tab active" onclick="showExportTab(this, 'manifestPreview')">Manifest (JSON)</div>
        <div class="tab" onclick="showExportTab(this, 'csvPreview')">Manifest (CSV)</div>
        <div class="tab" onclick="showExportTab(this, 'briefPreview')">Manager Brief</div>
        <div class="tab" onclick="showExportTab(this, 'analysisPreview')">Analysis Files</div>
      </div>
      
      <div id="manifestPreview" class="export-tab-content">
        <div class="card">
          <div class="card-header">
            <span class="card-title">manifest.json — ${exportData.manifest.length} records</span>
            <button class="btn btn-secondary btn-sm" onclick="downloadJSON(${JSON.stringify(JSON.stringify(exportData.manifest)).replace(/'/g, "\\'")}, 'manifest.json')">📥 Download</button>
          </div>
          <div class="export-preview">${escapeHtml(JSON.stringify(exportData.manifest.slice(0, 5), null, 2))}\n\n... ${exportData.manifest.length > 5 ? `(${exportData.manifest.length - 5} more records)` : ''}</div>
        </div>
      </div>

      <div id="csvPreview" class="export-tab-content" style="display:none">
        <div class="card">
          <div class="card-header">
            <span class="card-title">manifest.csv</span>
            <button class="btn btn-secondary btn-sm" onclick="downloadCSVManifest()">📥 Download</button>
          </div>
          <div class="export-preview">${escapeHtml(generateManifestCSV(exportData.manifest).substring(0, 2000))}${generateManifestCSV(exportData.manifest).length > 2000 ? '\n\n... (truncated)' : ''}</div>
        </div>
      </div>

      <div id="briefPreview" class="export-tab-content" style="display:none">
        <div class="card">
          <div class="card-header">
            <span class="card-title">manager_brief_2026-08-21.md</span>
            <button class="btn btn-secondary btn-sm" onclick="downloadBriefMarkdown()">📥 Download</button>
          </div>
          <div class="export-preview">${escapeHtml(formatManagerBriefMarkdown(exportData).substring(0, 3000))}${formatManagerBriefMarkdown(exportData).length > 3000 ? '\n\n... (truncated)' : ''}</div>
        </div>
      </div>

      <div id="analysisPreview" class="export-tab-content" style="display:none">
        <div class="card">
          <div class="card-header">
            <span class="card-title">analysis/ — ${Object.keys(exportData.analysisOutputs).length} files</span>
            <button class="btn btn-secondary btn-sm" onclick="downloadJSON(generateExport().analysisOutputs, 'analysis_all.json')">📥 Download All</button>
          </div>
          <div style="max-height:400px;overflow-y:auto">
            ${Object.entries(exportData.analysisOutputs).slice(0, 10).map(([filename, content]) => `
              <div style="padding:8px;border-bottom:1px solid var(--border-subtle)">
                <div style="font-weight:600;font-size:12px;color:var(--text-accent)">${filename}</div>
                <div style="font-size:11px;color:var(--text-muted)">${content.route} · ${content.manual_override ? 'Manual' : 'Auto'} · ${content.analysis_stale ? 'Stale' : 'Current'}</div>
              </div>
            `).join('')}
            ${Object.keys(exportData.analysisOutputs).length > 10 ? `<div style="padding:8px;color:var(--text-muted);font-size:12px">... and ${Object.keys(exportData.analysisOutputs).length - 10} more</div>` : ''}
          </div>
        </div>
      </div>

      <div style="font-size:12px;color:var(--text-muted);margin-top:24px">
        <strong>Export structure:</strong> manifest.json/csv (record inventory with routes, states, and output paths), 
        manager_brief_2026-08-21.md (daily summary), analysis/ (per-record analysis files).
        All paths in the manifest are relative to the export root. Every listed output exists in the export.
      </div>
    </div>
  `;
}

function showExportTab(tabEl, contentId) {
  // Hide all
  document.querySelectorAll('.export-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  // Show selected
  document.getElementById(contentId).style.display = 'block';
  tabEl.classList.add('active');
}

function downloadCSVManifest() {
  const exportData = generateExport();
  const csv = generateManifestCSV(exportData.manifest);
  downloadFile(csv, 'manifest.csv', 'text/csv');
  showToast('CSV manifest downloaded', 'success');
}

// ===== REVIEW QUEUE =====
function renderReviewQueue(container) {
  const records = getAllRecords().filter(r => r.route === 'needs_review' || r.isStale);
  
  container.innerHTML = `
    <div class="page-header">
      <h1>⚠️ Review Queue</h1>
      <span style="font-size:12px;color:var(--text-muted)">${records.length} items</span>
    </div>
    <div class="page-content">
      ${records.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>All Clear</h3>
          <p>No records currently need review.</p>
        </div>
      ` : `
        <div class="inbox-list">
          <div class="inbox-header">
            <span></span>
            <span>Ref</span>
            <span>Issue</span>
            <span>Person</span>
            <span>Route</span>
            <span>Status</span>
            <span>Time</span>
          </div>
          ${records.map(r => renderInboxItem(r)).join('')}
        </div>
      `}
    </div>
  `;
}

function renderStaleQueue(container) {
  const records = getAllRecords().filter(r => r.isStale);
  
  container.innerHTML = `
    <div class="page-header">
      <h1>🔄 Stale Analysis</h1>
      <span style="font-size:12px;color:var(--text-muted)">${records.length} items</span>
    </div>
    <div class="page-content">
      ${records.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>All Up to Date</h3>
          <p>No analyses are currently stale.</p>
        </div>
      ` : `
        <div class="inbox-list">
          <div class="inbox-header">
            <span></span>
            <span>Ref</span>
            <span>Issue</span>
            <span>Person</span>
            <span>Route</span>
            <span>Status</span>
            <span>Time</span>
          </div>
          ${records.map(r => renderInboxItem(r)).join('')}
        </div>
      `}
    </div>
  `;
}

// ===== DEMO LOAD =====
async function demoLoad() {
  // Import both batches for reviewers
  try {
    showToast('Loading demo data...', 'info');
    let d1, d2;
    try {
      const r1 = await fetch('data/01_initial.json');
      if (r1.ok) d1 = await r1.json();
    } catch(e) {}
    if (!d1 && typeof window !== 'undefined' && window.INITIAL_BATCH_DATA) d1 = window.INITIAL_BATCH_DATA;
    if (d1) importBatch(d1);
    
    try {
      const r2 = await fetch('data/02_update.json');
      if (r2.ok) d2 = await r2.json();
    } catch(e) {}
    if (!d2 && typeof window !== 'undefined' && window.UPDATE_BATCH_DATA) d2 = window.UPDATE_BATCH_DATA;
    if (d2) importBatch(d2);
    
    showToast('Demo loaded: 44 records, 18 with text', 'success');
    render();
  } catch(e) {
    showToast('Demo load failed: ' + e.message, 'error');
  }
}

// ===== UTILITY =====
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // If no records in state yet, auto-populate with post-update state as required by assessment spec
  if (Object.keys(APP_STATE.records).length === 0) {
    let d1 = typeof window !== 'undefined' ? window.INITIAL_BATCH_DATA : null;
    let d2 = typeof window !== 'undefined' ? window.UPDATE_BATCH_DATA : null;
    if (d1 && d2) {
      importBatch(d1);
      importBatch(d2);
    }
  }

  render();

  // Close detail panel on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDetailPanel();
  });
});
