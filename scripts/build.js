#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://alphaflux.net";

console.log("[alphaflux] Building site...");
execSync("npx @11ty/eleventy --output=_site", { stdio: "inherit", cwd: ROOT });

const siteDir = path.join(ROOT, "_site");
const urls = [];

function walk(dir, rel) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, rel ? rel + "/" + entry.name : entry.name);
    } else if (entry.name.endsWith(".html")) {
      let urlPath;
      if (entry.name === "index.html") {
        urlPath = rel ? "/" + rel + "/" : "/";
      } else {
        const clean = entry.name.slice(0, -5);
        urlPath = "/" + (rel ? rel + "/" : "") + clean + "/";
      }
      let priority = "0.6";
      if (urlPath === "/") priority = "1.0";
      else if (urlPath.startsWith("/services/") || urlPath === "/pricing/") priority = "0.9";
      else if (urlPath === "/blog/") priority = "0.8";
      urls.push({ loc: urlPath, priority });
    }
  }
}
walk(siteDir, "");

const lines = [
  "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>",
  "<urlset xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">",
];
for (const u of urls) {
  lines.push("  <url><loc>" + SITE_URL + u.loc + "</loc><changefreq>monthly</changefreq><priority>" + u.priority + "</priority></url>");
}
lines.push("</urlset>");
lines.push("");
fs.writeFileSync(path.join(siteDir, "sitemap.xml"), lines.join("
"));
console.log("[alphaflux] Sitemap: " + urls.length + " URLs");

let placeholderCount = 0;
function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, f.name);
    if (f.isDirectory() && !f.name.startsWith(".")) scan(abs);
    else if (f.name.endsWith(".html") || f.name.endsWith(".xml")) {
      const content = fs.readFileSync(abs, "utf-8");
      const m = content.match(/REPLACE_WITH_/g);
      if (m) {
        console.warn("[alphaflux] PLACEHOLDER in " + path.relative(siteDir, abs) + ": " + m.length);
        placeholderCount += m.length;
      }
    }
  }
}
scan(siteDir);
if (placeholderCount > 0) console.warn("[alphaflux] WARNING: " + placeholderCount + " placeholder(s)");
else console.log("[alphaflux] No placeholders detected");

const htmlFiles = [];
function count(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory() && !f.name.startsWith(".")) count(path.join(dir, f.name));
    else if (f.name.endsWith(".html")) htmlFiles.push(f.name);
  }
}
count(siteDir);
console.log("[alphaflux] Build complete: " + htmlFiles.length + " HTML files, " + urls.length + " sitemap URLs");
