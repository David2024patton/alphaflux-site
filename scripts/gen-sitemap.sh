#!/bin/bash
# Generate sitemap.xml from _site output
SITE_URL="https://alphaflux.net"
OUT="$1"
[ -z "$OUT" ] && OUT="_site"

cat > "$OUT/sitemap.xml" << 'XMLH'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
XMLH

find "$OUT" -name "*.html" ! -name "404.html" | sort | while read f; do
  rel="${f#$OUT/}"
  dir=$(dirname "$rel")
  base=$(basename "$rel")

  # Determine URL path
  if [ "$base" = "index.html" ]; then
    if [ "$dir" = "." ]; then
      urlpath="/"
    else
      urlpath="/${dir}/"
    fi
  else
    nameonly="${base%.html}"
    if [ "$dir" = "." ]; then
      urlpath="/${nameonly}/"
    else
      urlpath="/${dir}/${nameonly}/"
    fi
  fi

  # Clean double slashes
  urlpath=$(echo "$urlpath" | sed 's|//|/|g')

  # Priority
  priority="0.6"
  [ "$urlpath" = "/" ] && priority="1.0"
  echo "$urlpath" | grep -q "^/services/" && priority="0.9"
  [ "$urlpath" = "/pricing/" ] && priority="0.9"
  [ "$urlpath" = "/blog/" ] && priority="0.8"

  echo "  <url><loc>${SITE_URL}${urlpath}</loc><changefreq>monthly</changefreq><priority>${priority}</priority></url>" >> "$OUT/sitemap.xml"
done

echo '</urlset>' >> "$OUT/sitemap.xml"
COUNT=$(grep -c '<url>' "$OUT/sitemap.xml")
echo "[sitemap] $COUNT URLs generated"
