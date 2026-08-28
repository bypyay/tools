import os
import re

base_dir = r'D:\Codding\Claude Cowork code\All Tools\pdf'
tools_dir = os.path.join(base_dir, 'tools')
js_dir = os.path.join(base_dir, 'assets', 'js', 'tools')

pdf_tools = [
    'compare-pdf',
    'compress-pdf',
    'crop-pdf',
    'delete-pages',
    'extract-images',
    'extract-pages',
    'grayscale-pdf',
    'html-to-pdf',
    'jpg-to-pdf',
    'merge-pdf',
    'organize-pdf',
    'page-numbers',
    'pdf-to-jpg',
    'pdf-to-txt',
    'pdf-to-word',
    'protect-pdf',
    'repair-pdf',
    'rotate-pdf',
    'sign-pdf',
    'split-pdf',
    'unlock-pdf',
    'watermark-pdf'
]

print("=" * 60)
print(f"AUDITING ALL {len(pdf_tools)} PDF TOOLS")
print("=" * 60)

for slug in pdf_tools:
    html_path = os.path.join(tools_dir, slug, 'index.html')
    js_path = os.path.join(js_dir, f"{slug}.js")
    
    print(f"\n--- Tool: {slug} ---")
    if not os.path.exists(html_path):
        print(f"  [ERROR] Missing HTML: {html_path}")
        continue
    if not os.path.exists(js_path):
        print(f"  [ERROR] Missing JS: {js_path}")
        continue

    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        html_code = f.read()
    with open(js_path, 'r', encoding='utf-8', errors='ignore') as f:
        js_code = f.read()

    # Check script inclusion
    has_script = (f"{slug}.js" in html_code)
    print(f"  Includes {slug}.js: {has_script}")

    # Check vendor scripts
    has_pdf_js = ('pdf.min.js' in html_code or 'pdf-lib' in html_code)
    print(f"  Includes PDF Engine Library: {has_pdf_js}")

    # Check frozen topbar
    has_topbar = ('d1s-frozen-topbar-wrap' in html_code)
    print(f"  Includes Frozen Topbar: {has_topbar}")

    # Check DOM IDs expected by JS
    js_ids = set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", js_code))
    missing_ids = []
    for id_name in js_ids:
        if f'id="{id_name}"' not in html_code and f"id='{id_name}'" not in html_code:
            missing_ids.append(id_name)

    if missing_ids:
        print(f"  [WARNING] Missing DOM IDs ({len(missing_ids)}): {missing_ids}")
    else:
        print(f"  [OK] All {len(js_ids)} DOM IDs matched!")
