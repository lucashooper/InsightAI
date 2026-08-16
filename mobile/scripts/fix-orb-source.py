import re
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
js_path = root / "utils" / "orbCreateOrb.js"
ts_path = root / "utils" / "orbCreateOrbSource.ts"

src = js_path.read_text(encoding="utf-8")

# Fix corrupted uniform name regex (newline split broke the regex literal)
src = re.sub(
    r"gl\.getActiveUniform\(p, i\)\.name\.replace\(/\s*\n\s*\$/, ''\)",
    "gl.getActiveUniform(p, i).name.replace(/\\[0\\]$/, '')",
    src,
)

src = src.replace("gl.gl.getActiveUniform", "gl.getActiveUniform")

old_resize = (
    "      w = Math.round((container.clientWidth || 1) * dpr);\n"
    "      h = Math.round((container.clientHeight || 1) * dpr);"
)
new_resize = (
    "      var fallback = window.__ORB_PIXEL_SIZE__ || 1;\n"
    "      w = Math.round((container.clientWidth || fallback) * dpr);\n"
    "      h = Math.round((container.clientHeight || fallback) * dpr);"
)
if old_resize in src:
    src = src.replace(old_resize, new_resize)
else:
    print("WARN: resize patch target not found")

io_old = "    io.observe(container);\n\n  }"
io_new = (
    "    io.observe(container);\n\n  }\n\n"
    "  if (window.__ORB_EMBED__ === 'rn') {\n"
    "    onScreen = true;\n"
    "    start();\n"
    "  }"
)
if io_old in src and "__ORB_EMBED__" not in src:
    src = src.replace(io_old, io_new, 1)
elif "__ORB_EMBED__" in src:
    print("SKIP: RN embed patch already present")
else:
    print("WARN: IO patch target not found")

js_path.write_text(src, encoding="utf-8", newline="\n")

escaped = json.dumps(src)[1:-1]
ts_path.write_text(
    f'export const ORB_CREATE_ORB_SOURCE = "{escaped}" as string;\n',
    encoding="utf-8",
    newline="\n",
)

print(f"Fixed {js_path.name}, {len(src)} bytes")
print(f"Generated {ts_path.name}")

for i, line in enumerate(src.splitlines(), 1):
    if "getActiveUniform" in line:
        print(f"L{i}: {line.strip()[:120]}")
