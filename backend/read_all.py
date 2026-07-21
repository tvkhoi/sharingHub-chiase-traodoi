import sys, os
sys.path.insert(0, r"C:\Users\Acer\AppData\Roaming\Python\Python313\site-packages")

files = [
    "STATIC MODEL",
    "DYNAMIC MODEL",
    "DATABASE SPECIFICATION DOCUMENT",
    "DATABASE DESIGN DOCUMENT",
    "BRD - Business Requirements Document",
    "SyRS - System requirements specification",
    "ARCHITECTURE DESIGN DOCUMENT",
]

base = r"d:\asset-sharing-system\backend"

for fname in files:
    path = os.path.join(base, fname + ".txt")
    out  = os.path.join(base, "reads", fname + ".txt")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(path, encoding="utf-8") as f:
        data = f.read()
    # write as ascii-safe for console
    with open(out, "w", encoding="utf-8") as f:
        f.write(data)
    print(f"=== {fname} ({len(data)} chars) ===")
    print(data[:6000])
    print("...[truncated if long]...")
    print()
