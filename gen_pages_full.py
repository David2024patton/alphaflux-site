import os, json

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
        f.write("\n".join(lines) + "\n")
    print(f"OK {fp}")

data = json.load(open("pages_data.json", "r", encoding="utf-8"))
for entry in data:
    write_page(entry["file"], entry["layout"], entry["fm"], entry["body"])
print(f"\nTotal: {len(data)} pages")
