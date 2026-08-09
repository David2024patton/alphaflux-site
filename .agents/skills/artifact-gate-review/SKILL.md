---
name: artifact-gate-review
description: >
  Independent, artifact-only verification of a static site build at a pinned
  commit before release gates. Forces a clean rebuild at committed HEAD,
  proves every claim against the built artifact (never against source or
  author claims), and runs a locked regression + token + instruction-bracket
  + crawl suite. Built and hardened across six executive review cycles on the
  AlphaFlux rebuild; the methodology is client-agnostic.
version: 1
---

# Artifact-Gate Review Skill

## Purpose

Verify a website rebuild at a release gate with evidence, not claims. The
reviewer rebuilds from a clean worktree at the exact committed SHA, then
checks every acceptance criterion against the generated `_site/` artifact.
If a claim is not reproducible in the artifact, the gate fails. This kills
the recurring failure class where a fix exists in source but not in the
built output (source/artifact divergence).

## When To Use

- Any staging or deploy gate for an 11ty (or similar) static site rebuild
- After any commit that claims to fix CSS, layout, SEO, or copy defects
- Before trusting a teammate's "verified" SITREP: re-run it yourself
- Freeze HEAD check before a scheduled production deploy

## Prerequisites

- Working checkout of the project repo with `node_modules` installed
- The build is reproducible: `npm run build` from a clean worktree
- Shared `_site/` is mutable (other verifiers may rebuild it mid-capture):
  capture screenshots from a PRIVATE COPY of the artifact, never the shared
  one (learned in ER6: an seo shot hit FILE_NOT_FOUND because another
  verifier rebuilt mid-capture).

## Steps

### 1. Pin the commit and verify the tree

```bash
git rev-parse HEAD          # must equal the SHA under review
git status --short          # must be clean
git log -1                  # confirm the claimed commit is actually HEAD
```

If HEAD is not the SHA under review, STOP. The review is void.

### 2. Clean rebuild

```bash
rm -rf _site && npm run build
echo $?                     # must be 0
find _site -name "*.html" | wc -l     # expected page count (e.g. 46)
```

Record the exit code and page count. A non-zero exit or wrong page count
fails the gate immediately.

### 3. Artifact-only claim checks

For every claimed fix, grep the BUILT artifact, not the source:

```bash
# CSS rule present in the built inline style block
grep -o ".two-col" _site/services/seo/index.html
# specific value present (e.g. clamp() from a regenerated CSS bundle)
grep -c "clamp(var(--text-5xl), 6vw, var(--text-7xl))" _site/index.html
# specific selector with specificity fix
grep -c ".nav-links a.btn { color: #fff }" _site/index.html
```

Rules of thumb:

- A CSS fix only counts if it is in the BUILT page's style block.
- A copy fix only counts if the corrected string renders in the built HTML.
- Structural counts (H1s, badges, cards) are checked by tag extraction or
  exact-string grep on built pages, with `0` being a valid, strong result.
- Scope negative claims ("0 em dashes", "no broken links") to the exact
  search performed: file set, pattern, and binary-vs-text mode.

### 4. Locked regression suite

Run the same suite every gate so results are comparable across commits:

```bash
# page/title/sitemap counts
find _site -name "*.html" | wc -l
grep -o "<title>[^<]*</title>" _site/**/*.html | sort -u | wc -l
grep -c "<url>" _site/sitemap.xml

# forbidden content
grep -rIn "—\|–" _site --include="*.html" | wc -l      # em/en dashes
grep -rIn "tel:(555)" _site --include="*.html" | wc -l  # fake phone
grep -rIn "555" _site --include="*.html" | wc -l        # raw 555 (note: SVG path data like "H3.555V9" is a false positive; inspect hits)

# schema sanity
grep -o '"brand"' _site/**/*.html | wc -l               # expect 1 per page, not 2

# link crawl: parse all href/src, resolve against local files
# (use a small script or `buzz messages search`-adjacent tooling)
```

### 5. Token sweep (data placeholders)

Track unresolved production-data tokens. They are a normal pre-launch state,
but the COUNT must be exact and the surface must not grow unexpectedly:

```bash
grep -rIn "REAL DATA REQUIRED" _site --include="*.html" | wc -l
grep -rIn "REPLACE_WITH" _site --include="*.html" | wc -l
```

Known-safe false-positive classes: `[aria-hidden]` CSS selectors,
`["English"]` JSON-LD availableLanguage, dataLayer script content. Anything
else bracket-shaped in VISIBLE copy is a freeze-class defect.

### 6. Instruction-bracket scan

Strip `<script>`/`<style>` blocks and tags, then scan rendered copy for any
`[...]` that is not a tracked token:

```bash
# crude: any bracket not in the known-safe set
grep -rIn "\[" _site --include="*.html" | grep -v "REAL DATA REQUIRED" | grep -v "REPLACE_WITH" | grep -v aria-hidden | grep -v availableLanguage
```

Any visible instruction bracket (`[product or service]`, `[your industry]`,
`[delivery mechanism TBD]`, `[Year]`) is freeze-class: hard block.

### 7. Report

Post a verdict that states: the pinned SHA, the rebuild result, each claim
with its artifact evidence, the regression numbers, the exact token count
and file list, and the gate status (PASS / CONDITIONAL / FAIL) with the
reason. Separate "verified in artifact" from "expected by design" (e.g. an
empty content column that is scheduled for a later wiring pass is a
CONDITIONAL, not a FAIL).

## What This Prevents

- Source/artifact divergence: fixes present in `src/css` but missing from
  the shipped bundle (recurred twice, killed by the CSS bundle pipeline +
  this artifact-first rule).
- Claim-absorption: passing a teammate's "it's fixed" without your own
  artifact evidence (explicit policy since ER1).
- Scope drift: catching a "29 pages at 600 words" gate item that contradicts
  the design spec's "service-only" rule BEFORE the wiring pass runs.
- Silent token growth: an unplanned +N REAL DATA REQUIRED surfacing at
  staging instead of being tracked commit-over-commit.
