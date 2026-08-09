const fs = require("fs"), path = require("path"), ROOT = process.cwd();
function fm(obj, layout) {
  let out = ["---", "layout: " + layout];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) { out.push(k + ":"); v.forEach(i => out.push("  - " + JSON.stringify(i))); }
    else if (typeof v === "string") out.push(k + ": " + JSON.stringify(v));
    else out.push(k + ": " + v);
  }
  return out.join("\n") + "\n---";
}
function w(fp, f, lay, body) {
  const p = path.join(ROOT, fp);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, fm(f, lay) + "\n\n" + body.trim() + "\n");
  console.log("OK " + fp);
}

// SEO
w("content/services/seo.md", {
  title:"SEO Services | Technical, On-Page & Authority SEO | AlphaFlux",
  description:"Full-service SEO from AlphaFlux: technical audits, on-page optimization, and authority building that compound.",
  h1:"Rank Where Your Buyers Search, Including the AI Answers They Ask First.",
  price:"Local SEO from $750/mo. Full programs from $2,000/mo.",
  order:1, permalink:"/services/seo/",
  moduleChips:["FluxSEO","FluxGEO","FluxContent"],
  schemaType:"Service"
},"service",`## What SEO Includes at AlphaFlux

**The Full Organic Engine, Not Just Blog Posts.**

| Component | What We Do | Deliverable |
|-----------|-----------|-------------|
| Technical SEO | Crawl audits, Core Web Vitals, schema, indexation | Remediation plan + implemented fixes |
| On-Page SEO | Title tags, metas, H1/H2 hierarchy, internal linking | Optimized page set each month |
| Authority Building | Digital PR, link acquisition, brand mention reclamation | 5-20+ quality links per month |
| Content Engine | Topic clusters, pillar pages, editorial calendar | 2-8+ posts per month by tier |
| Local SEO | Google Business Profile, citations, NAP consistency | Local visibility growth |
| GEO / AI Search | Visibility in ChatGPT, Perplexity, Gemini, AI Overviews | AI citation monitoring |

## How It Works

1. **Audit (Days 0-14).** AI crawl plus human triage. Prioritized list of ranking-costing issues.
2. **Fix (Days 15-45).** Technical and on-page remediation ships first.
3. **Build (Days 30-90).** Topic clusters and authority campaigns launch.
4. **Compound.** Winners refreshed, losers killed. Dashboard shows the trend.

## FAQ

**Q: How is AlphaFlux SEO different?**
A: AI accelerates research and drafting. Humans own strategy. We publish pricing.

**Q: Do you guarantee rankings?**
A: No one honest can. We guarantee delivery, reporting, and a strategy with a revenue case.

**Q: How long until results?**
A: Technical fixes move in 30-90 days. Competitive rankings build over 3-6 months.

**Q: What does SEO cost?**
A: Local SEO from $750/mo. Full programs from $2,000/mo. See our pricing page.`);
console.log("seo done")
