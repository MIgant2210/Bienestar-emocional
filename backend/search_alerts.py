import os
import re

root_dir = r"C:\Users\miguel.donis\Documents\MIguel\Universidad\Tareas 2026\PG2\frontend\src"

for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(('.js', '.jsx', '.css')):
            filepath = os.path.join(dirpath, filename)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                matches = re.finditer(r'alert\s*\(', content)
                for match in matches:
                    start = max(0, match.start() - 50)
                    end = min(len(content), match.end() + 50)
                    snippet = content[start:end].replace('\n', ' ')
                    print(f"File: {filename} | Snippet: {snippet}")
