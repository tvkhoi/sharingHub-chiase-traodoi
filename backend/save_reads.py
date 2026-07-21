import sys, os
sys.path.insert(0, r"C:\Users\Acer\AppData\Roaming\Python\Python313\site-packages")

base = r"d:\asset-sharing-system\backend"

docs = {
    "DDD": "DATABASE DESIGN DOCUMENT.txt",
    "DSD": "DATABASE SPECIFICATION DOCUMENT.txt",
    "STATIC": "STATIC MODEL.txt",
    "DYNAMIC": "DYNAMIC MODEL.txt",
    "BRD": "BRD - Business Requirements Document.txt",
    "SYRS": "SyRS - System requirements specification.txt",
    "ARCH": "ARCHITECTURE DESIGN DOCUMENT.txt",
}

for name, fname in docs.items():
    path = os.path.join(base, fname)
    with open(path, encoding="utf-8") as f:
        content = f.read()
    out_path = os.path.join(base, "reads", f"{name}.txt")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Saved {name}: {len(content)} chars, {content.count(chr(10))} lines")
