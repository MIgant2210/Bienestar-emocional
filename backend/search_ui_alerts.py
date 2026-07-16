import re

with open(r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\frontend\src\pages\AdminDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Alert" in line or "Notice" in line or "warning" in line or "danger" in line:
        print(f"Line {i+1}: {line.strip()}")
