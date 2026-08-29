import os

src_dir = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\frontend\src"

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                for idx, line in enumerate(fp, 1):
                    if 'Confidencialidad' in line or '20s' in line or 'anónima y agregada' in line:
                        print(f"{path}:{idx} -> {line.strip()}")
