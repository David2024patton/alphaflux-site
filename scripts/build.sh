#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[alphaflux] Building site..."
npx @11ty/eleventy --output=_site

echo "[alphaflux] Generating sitemap..."
cat > _site/sitemap.xml << 'XMLHEAD'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
XMLHEAD

find _site -name "*.html" | while read f; do
  rel="${f#_site/}"
  dir=$(dirname "$rel")
  base=$(basename "$rel")
  if [ "$base" = "index.html" ]; then
    urlpath="/${dir}/"
    [ "$urlpath" = "//" ] && urlpath="/"
  else
    nameonly="${base%.html}"
    urlpath="/${dir}/${nameonly}/"
  fi
  priority="0.6"
  [ "$urlpath" = "/" ] && priority="1.0"
  echo "$urlpath" | grep -q "^/services/" && priority="0.9"
  [ "$urlpath" = "/pricing/" ] && priority="0.9"
  echo "  <url><loc>https://alphaflux.net${urlpath}</loc><changefreq>monthly</changefreq><priority>${priority}</priority></url>"
done >> _site/sitemap.xml

echo '</urlset>' >> _site/sitemap.xml

# Placeholder check
COUNT=$(grep -r "REPLACE_WITH_" _site --include="*.html" -l | wc -l)
if [ "$COUNT" -gt 0 ]; then
  echo "[alphaflux] WARNING: $COUNT files contain REPLACE_WITH_ placeholders"
  grep -r "REPLACE_WITH_" _site --include="*.html" -l
else
  echo "[alphaflux] No placeholders detected"
fi

HTML_COUNT=$(find _site -name "*.html" | wc -l)
echo "[alphaflux] Build complete: $HTML_COUNT HTML files"
