import os

root_dir = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\frontend"

for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(('.js', '.jsx', '.html', '.css')):
            filepath = os.path.join(dirpath, filename)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                for line_idx, line in enumerate(f):
                    if 'alert' in line.lower():
                        print(f"File: {filename} (Line {line_idx+1}): {line.strip()}")
