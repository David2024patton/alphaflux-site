/**
 * Build src/_includes/bundle.css by reading src/css/main.css
 * and recursively resolving @import statements.
 *
 * All imports are resolved relative to src/css/.
 * The output is a single concatenated bundle written to
 * src/_includes/bundle.css, which seo.njk inlines at build time.
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.resolve(__dirname, '..', 'src', 'css');
const BUNDLE_PATH = path.resolve(__dirname, '..', 'src', '_includes', 'bundle.css');
const ENTRY = 'main.css';

const imported = new Set();

function resolveImport(importPath, fromFile) {
  // @import statements in our codebase use single-quoted relative paths
  // e.g. @import 'variables.css';
  const resolved = path.resolve(path.dirname(fromFile), importPath);
  if (!fs.existsSync(resolved)) {
    console.error(`ERROR: @import '${importPath}' not found at ${resolved} (from ${fromFile})`);
    process.exit(1);
  }
  return resolved;
}

function processFile(filePath, seen = new Set()) {
  if (seen.has(filePath)) {
    console.error(`ERROR: circular @import detected: ${filePath}`);
    process.exit(1);
  }
  seen.add(filePath);
  imported.add(filePath);

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = [];
  const importRe = /@import\s+['"]([^'"]+)['"]\s*;?\s*/g;

  let lastIndex = 0;
  let match;
  while ((match = importRe.exec(content)) !== null) {
    // include any text before the import
    const before = content.slice(lastIndex, match.index).trim();
    if (before) lines.push(before);

    const importPath = match[1];
    const resolved = resolveImport(importPath, filePath);
    lines.push(...processFile(resolved, new Set(seen)));
    lastIndex = match.index + match[0].length;
  }
  // remainder after last import
  const after = content.slice(lastIndex).trim();
  if (after) lines.push(after);

  return lines;
}

try {
  const entryPath = path.join(CSS_DIR, ENTRY);
  if (!fs.existsSync(entryPath)) {
    console.error(`ERROR: entry file not found: ${entryPath}`);
    process.exit(1);
  }

  const lines = processFile(entryPath);
  const bundle = lines.join('\n\n') + '\n';

  // Write bundle
  fs.writeFileSync(BUNDLE_PATH, bundle, 'utf-8');
  console.log(`Bundle written: ${BUNDLE_PATH} (${imported.size} files, ${bundle.length} bytes)`);
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}
