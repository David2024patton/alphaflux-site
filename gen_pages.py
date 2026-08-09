import os

ROOT = os.getcwd()

def write_page(fp, layout, fm, body):
    full = os.path.join(ROOT, fp)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    lines = ["---", f"layout: {layout}"]
    for k, v in fm.items():
        if isinstance(v, list):
            lines.append(f"{k}:")
            for item in v:
                lines.append(f'  - "{item}"')
        elif isinstance(v, str):
            escaped = v.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'{k}: "{escaped}"')
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    lines.append("")
    lines.append(body.strip())
    with open(full, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"OK {fp}")

write_page(
    "content/services/seo.md", "service",
    {
        "title": "SEO Services | Technical, On-Page & Authority SEO | AlphaFlux",
        "description": "Full-service SEO from AlphaFlux: technical audits, on-page optimization, and authority building that compound.",
        "h1": "Rank Where Your Buyers Search, Including the AI Answers They Ask First.",
        "price": "Local SEO from $750/mo. Full programs from $2,000/mo.",
        "order": 1, "permalink": "/services/seo/",
        "moduleChips": ["FluxSEO", "FluxGEO", "FluxContent"],
        "schemaType": "Service"
    },
    "Rankings are not the goal. Revenue from organic search is. AlphaFlux runs technical, on-page, and authority programs on FluxOS, with AI handling the grunt work and humans owning the strategy."
)
print("Test done")
