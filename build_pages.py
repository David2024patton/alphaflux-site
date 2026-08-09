import os, json

ROOT = os.getcwd()

def w(fp, layout, fm, body):
    full = os.path.join(ROOT, fp)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    lines = ["---", f"layout: {layout}"]
    for k, v in fm.items():
        if isinstance(v, list):
            lines.append(f"{k}:")
            for item in v:
                lines.append(f'  - "{item}"')
        elif isinstance(v, str):
            esc = v.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'{k}: "{esc}"')
        else:
            lines.append(f"{k}: {v}")
    lines.append("---")
    lines.append("")
    lines.append(body.strip())
    with open(full, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

# Load data
data = json.load(open("pd.json", "r", encoding="utf-8"))
for d in data:
    w(d["f"], d["l"], d["m"], d["b"])
    print(f"OK {d['f']}")
print(f"Total: {len(data)} pages")
