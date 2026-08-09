const fs = require("fs"), path = require("path");
const ROOT = process.cwd();

function buildFrontMatter(obj, layout) {
  let out = ["---", "layout: " + layout];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) { out.push(k + ":"); v.forEach(i => out.push("  - " + JSON.stringify(i))); }
    else if (typeof v === "string") out.push(k + ": " + JSON.stringify(v));
    else out.push(k + ": " + v);
  }
  return out.join("\n") + "\n---";
}

function writePage(filepath, fm, layout, body) {
  const p = path.join(ROOT, filepath);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buildFrontMatter(fm, layout) + "\n\n" + body.trim() + "\n");
}

const data = JSON.parse(fs.readFileSync(path.join(ROOT, "pages-data.json"), "utf-8"));
for (const entry of data) {
  writePage(entry.file, entry.fm, entry.layout, entry.body);
  console.log("Wrote: " + entry.file);
}
console.log("Total: " + data.length + " pages");
