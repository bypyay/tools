import os
import re

base_dir = r'D:\Codding\Claude Cowork code\All Tools'

# Master CSS for the Frozen Topbar
topbar_css = '''<style id="d1s-frozen-bar-style">
/* ══════════════════════════════════════════════════════════════════
   Daily1Step FROZEN SUPER-NAVBAR (Sticky, Animated & Click-Magnetic)
   ══════════════════════════════════════════════════════════════════ */
.d1s-frozen-topbar-wrap {
  position: sticky !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 2147483647 !important;
  background: rgba(11, 17, 33, 0.96) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35) !important;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}
.d1s-frozen-inner {
  max-width: 1560px !important;
  margin: 0 auto !important;
  padding: 0 16px !important;
  height: 56px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
}
.d1s-brand-group {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-shrink: 0 !important;
  text-decoration: none !important;
}
.d1s-logo-badge {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 14px !important;
  border-radius: 30px !important;
  background: linear-gradient(135deg, #0284c7 0%, #7c3aed 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  font-size: 0.92rem !important;
  letter-spacing: -0.2px !important;
  box-shadow: 0 2px 10px rgba(2, 132, 199, 0.4) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  position: relative !important;
  overflow: hidden !important;
}
.d1s-logo-badge::after {
  content: '' !important;
  position: absolute !important;
  top: -50% !important;
  left: -60% !important;
  width: 40% !important;
  height: 200% !important;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent) !important;
  transform: rotate(25deg) !important;
  animation: d1s-shimmer-sweep 3.5s infinite !important;
}
.d1s-logo-badge:hover {
  transform: scale(1.04) !important;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.6) !important;
}
@keyframes d1s-shimmer-sweep {
  0% { left: -70%; }
  30% { left: 140%; }
  100% { left: 140%; }
}

.d1s-pulse-tag {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  background: rgba(239, 68, 68, 0.15) !important;
  border: 1px solid rgba(239, 68, 68, 0.4) !important;
  color: #fca5a5 !important;
  padding: 3px 8px !important;
  border-radius: 12px !important;
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
}
.d1s-live-dot {
  width: 7px !important;
  height: 7px !important;
  border-radius: 50% !important;
  background: #ef4444 !important;
  box-shadow: 0 0 8px #ef4444 !important;
  animation: d1s-dot-blink 1.2s infinite ease-in-out !important;
}
@keyframes d1s-dot-blink {
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.3); opacity: 1; }
}

/* Nav Links / App Buttons */
.d1s-nav-scroll {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;
  padding: 4px 0 !important;
}
.d1s-nav-scroll::-webkit-scrollbar { display: none !important; }

.d1s-nav-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 7px 12px !important;
  border-radius: 10px !important;
  font-size: 0.83rem !important;
  font-weight: 700 !important;
  color: #cbd5e1 !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.d1s-nav-btn:hover {
  transform: translateY(-2px) scale(1.04) !important;
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.14) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

/* Custom Suite Hover & Active Glows */
.d1s-nav-btn.btn-home:hover { box-shadow: 0 4px 14px rgba(2, 132, 199, 0.5) !important; border-color: #38bdf8 !important; }
.d1s-nav-btn.btn-pdf:hover, .d1s-nav-btn.btn-pdf.active { background: rgba(239, 68, 68, 0.22) !important; border-color: #ef4444 !important; color: #fff !important; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45) !important; }
.d1s-nav-btn.btn-calc:hover, .d1s-nav-btn.btn-calc.active { background: rgba(59, 130, 246, 0.22) !important; border-color: #3b82f6 !important; color: #fff !important; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.45) !important; }
.d1s-nav-btn.btn-bg:hover, .d1s-nav-btn.btn-bg.active { background: rgba(168, 85, 247, 0.25) !important; border-color: #a855f7 !important; color: #fff !important; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.5) !important; }
.d1s-nav-btn.btn-audio:hover, .d1s-nav-btn.btn-audio.active { background: rgba(6, 182, 212, 0.22) !important; border-color: #06b6d4 !important; color: #fff !important; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.45) !important; }
.d1s-nav-btn.btn-image:hover, .d1s-nav-btn.btn-image.active { background: rgba(16, 185, 129, 0.22) !important; border-color: #10b981 !important; color: #fff !important; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45) !important; }
.d1s-nav-btn.btn-collage:hover, .d1s-nav-btn.btn-collage.active { background: rgba(236, 72, 153, 0.22) !important; border-color: #ec4899 !important; color: #fff !important; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.45) !important; }
.d1s-nav-btn.btn-gif:hover, .d1s-nav-btn.btn-gif.active { background: rgba(245, 158, 11, 0.22) !important; border-color: #f59e0b !important; color: #fff !important; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.45) !important; }

/* Micro-Pill Counter inside Nav Button */
.d1s-count {
  font-size: 0.68rem !important;
  font-weight: 800 !important;
  padding: 1px 5px !important;
  border-radius: 6px !important;
  background: rgba(255, 255, 255, 0.16) !important;
  color: #fff !important;
}

@media (max-width: 900px) {
  .d1s-pulse-tag { display: none !important; }
  .d1s-frozen-inner { height: 50px !important; padding: 0 10px !important; }
  .d1s-nav-btn { padding: 5px 9px !important; font-size: 0.76rem !important; }
  .d1s-logo-badge { font-size: 0.82rem !important; padding: 5px 10px !important; }
}
</style>'''

def generate_frozen_topbar(current_suite, rel_portal):
    def is_act(s):
        return ' active' if current_suite == s else ''

    return f'''<!-- Daily1Step FROZEN SUPER-NAVBAR START -->
{topbar_css}
<div class="d1s-frozen-topbar-wrap">
  <div class="d1s-frozen-inner">
    <div style="display:flex; align-items:center; gap:8px;">
      <a href="{rel_portal}index.html" class="d1s-brand-group" title="Daily1Step All Tools Platform">
        <div class="d1s-logo-badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span>Daily1Step</span>
        </div>
      </a>
      <span class="d1s-pulse-tag"><span class="d1s-live-dot"></span> 320+ Free Apps</span>
    </div>

    <nav class="d1s-nav-scroll">
      <a href="{rel_portal}index.html" class="d1s-nav-btn btn-home{is_act('home')}" title="All Tools Hub">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>All Tools</span>
      </a>
      <a href="{rel_portal}pdf/" class="d1s-nav-btn btn-pdf{is_act('pdf')}" title="PDF Tools Suite">
        <span style="color:#ef4444;">📄</span>
        <span>PDF</span>
        <span class="d1s-count">22</span>
      </a>
      <a href="{rel_portal}calculator/" class="d1s-nav-btn btn-calc{is_act('calculator')}" title="207+ Calculators">
        <span style="color:#3b82f6;">🧮</span>
        <span>Calculators</span>
        <span class="d1s-count">207+</span>
      </a>
      <a href="{rel_portal}removebg/" class="d1s-nav-btn btn-bg{is_act('removebg')}" title="AI Background Remover">
        <span style="color:#a855f7;">🪄</span>
        <span>Remove BG</span>
        <span class="d1s-count" style="background:#a855f7; color:#fff;">AI</span>
      </a>
      <a href="{rel_portal}audio/" class="d1s-nav-btn btn-audio{is_act('audio')}" title="Audio Editor & Whisper Speech to Text">
        <span style="color:#06b6d4;">🎙️</span>
        <span>Audio</span>
        <span class="d1s-count">25</span>
      </a>
      <a href="{rel_portal}image/" class="d1s-nav-btn btn-image{is_act('image')}" title="Image Resizer, Compressor & Passport Photo">
        <span style="color:#10b981;">🖼️</span>
        <span>Images</span>
        <span class="d1s-count">27</span>
      </a>
      <a href="{rel_portal}collage/" class="d1s-nav-btn btn-collage{is_act('collage')}" title="Collage Maker Studio PRO">
        <span style="color:#ec4899;">🎨</span>
        <span>Collage</span>
        <span class="d1s-count" style="background:#ec4899; color:#fff;">PRO</span>
      </a>
      <a href="{rel_portal}gif/" class="d1s-nav-btn btn-gif{is_act('gif')}" title="Animated GIF Maker & Compressor">
        <span style="color:#f59e0b;">🎞️</span>
        <span>GIF</span>
        <span class="d1s-count">18</span>
      </a>
    </nav>
  </div>
</div>
<!-- Daily1Step FROZEN SUPER-NAVBAR END -->
'''

def remove_existing_topbar(content):
    # 1. Check for modern markers
    start_tag = '<!-- Daily1Step FROZEN SUPER-NAVBAR START -->'
    end_tag = '<!-- Daily1Step FROZEN SUPER-NAVBAR END -->'
    if start_tag in content and end_tag in content:
        s = content.find(start_tag)
        e = content.find(end_tag) + len(end_tag)
        content = content[:s] + content[e:]

    # 2. Check for old style
    if '<style id="d1s-frozen-bar-style">' in content:
        s = content.find('<style id="d1s-frozen-bar-style">')
        e = content.find('</style>', s) + 8
        content = content[:s] + content[e:]

    # 3. Check for previous global topbar
    old_marker = '<!-- Universal Daily1Step All Tools Top Bar -->'
    if old_marker in content:
        s = content.find(old_marker)
        # Find closing div of that topbar
        wrap_start = content.find('<div class="daily1step-global-topbar"', s)
        if wrap_start != -1:
            div_close = content.find('</div>\n</div>', wrap_start)
            if div_close != -1:
                e = div_close + len('</div>\n</div>')
                content = content[:s] + content[e:]
            else:
                div_close2 = content.find('</div>', wrap_start)
                if div_close2 != -1:
                    e = content.find('</div>', div_close2 + 6) + 6
                    content = content[:s] + content[e:]

    return content

updated_count = 0

for root, dirs, files in os.walk(base_dir):
    dirs[:] = [d for d in dirs if d not in ('.git', '__pycache__', 'node_modules')]
    for f in files:
        if f.endswith('.html'):
            file_path = os.path.join(root, f)
            rel = os.path.relpath(file_path, base_dir).replace('\\', '/')
            parts = rel.split('/')

            if len(parts) == 1:
                current_suite = 'home'
                depth = 0
            else:
                current_suite = parts[0]
                depth = len(parts) - 1

            rel_portal = '../' * depth
            topbar_html = generate_frozen_topbar(current_suite, rel_portal)

            with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()

            content = remove_existing_topbar(content)

            body_idx = content.find('<body')
            if body_idx != -1:
                tag_close = content.find('>', body_idx)
                if tag_close != -1:
                    content = content[:tag_close+1] + '\n' + topbar_html + content[tag_close+1:]
                    with open(file_path, 'w', encoding='utf-8') as fp:
                        fp.write(content)
                    updated_count += 1

print(f"Instantly upgraded {updated_count} HTML pages with the Frozen Animated Super-Navbar!")
