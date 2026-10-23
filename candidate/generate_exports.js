/**
 * Export generator script
 * Generates the local output directory matching the assessment specifications:
 * - exports/manifest.json
 * - exports/manifest.csv
 * - exports/manager_brief_2026-08-21.md
 * - exports/analysis/<record_ref>_<source_type>.json
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment for loading analysis.js and app.js logic
global.window = {};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; },
  removeItem(k) { delete this.store[k]; }
};
global.document = {
  addEventListener() {},
  getElementById() { return null; },
  querySelectorAll() { return []; }
};

// Load data files
const initialBatch = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', '01_initial.json'), 'utf8'));
const updateBatch = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', '02_update.json'), 'utf8'));

const vm = require('vm');

// Load analysis and app logic
const analysisCode = fs.readFileSync(path.join(__dirname, 'analysis.js'), 'utf8');
vm.runInThisContext(analysisCode);

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
vm.runInThisContext(appCode);

// Perform initial and update imports
importBatch(initialBatch);
importBatch(updateBatch);

// Generate exports
const exportData = generateExport();

const exportDir = path.join(__dirname, 'exports');
const analysisDir = path.join(exportDir, 'analysis');

if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
if (!fs.existsSync(analysisDir)) fs.mkdirSync(analysisDir, { recursive: true });

// 1. Write manifest.json
fs.writeFileSync(
  path.join(exportDir, 'manifest.json'),
  JSON.stringify(exportData.manifest, null, 2),
  'utf8'
);

// 2. Write manifest.csv
const csvContent = generateManifestCSV(exportData.manifest);
fs.writeFileSync(
  path.join(exportDir, 'manifest.csv'),
  csvContent,
  'utf8'
);

// 3. Write manager_brief_2026-08-21.md
const briefContent = formatManagerBriefMarkdown(exportData);
fs.writeFileSync(
  path.join(exportDir, 'manager_brief_2026-08-21.md'),
  briefContent,
  'utf8'
);

// 4. Write per-record analysis files
let count = 0;
Object.entries(exportData.analysisOutputs).forEach(([filePath, content]) => {
  const fileName = path.basename(filePath);
  fs.writeFileSync(
    path.join(analysisDir, fileName),
    JSON.stringify(content, null, 2),
    'utf8'
  );
  count++;
});

console.log(`Successfully generated export files in ${exportDir}:`);
console.log(`- manifest.json (${exportData.manifest.length} records)`);
console.log(`- manifest.csv`);
console.log(`- manager_brief_2026-08-21.md`);
console.log(`- analysis/ (${count} JSON files)`);
