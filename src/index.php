<?php
// AlphaFlux: entry redirect. index.html is the real entry point.
// This file exists to override the broken index.php from the old site.
header("HTTP/1.1 301 Moved Permanently");
header("Location: /index.html");
exit;
