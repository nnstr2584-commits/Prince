* { box-sizing: border-box; }
:root {
  --bg: #08111d;
  --bg-soft: #101d2e;
  --panel: #0c1828;
  --panel-alt: #12253d;
  --card: rgba(17, 31, 47, 0.9);
  --line: rgba(121, 146, 177, 0.26);
  --text: #edf6ff;
  --muted: #a4bcce;
  --primary: #74d4ff;
  --primary-strong: #3aa6ff;
  --success: #6fe3a4;
  --warning: #ffcd6b;
  --danger: #ff7d7d;
  --shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
}

html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Inter, "Segoe UI", sans-serif;
  background: linear-gradient(180deg, #07101d 0%, #0d1c2d 100%);
  color: var(--text);
  line-height: 1.55;
}

a { color: inherit; text-decoration: none; }
button, input, select { font: inherit; }
.container { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; }
.section { padding: 4rem 0; }
.dark { background: rgba(8, 16, 26, 0.54); }

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  background: rgba(8, 17, 29, 0.84);
}
.nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  gap: 1rem;
}
.brand-block {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.brand-mark {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), #a0dbff);
  color: #04141f;
  font-weight: 800;
}
.brand-block strong { display: block; }
.brand-block small { color: var(--muted); }
.top-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--muted);
}
.top-nav a:hover { color: var(--text); }

.hero {
  padding: 5rem 0 3rem;
  border-bottom: 1px solid var(--line);
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 2rem;
  align-items: center;
}
.eyebrow {
  margin: 0 0 0.8rem;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 700;
}
h1, h2, h3, h4 { margin-top: 0; }
h1 {
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 1.1;
  margin-bottom: 1rem;
}
.lead {
  color: var(--muted);
  font-size: 1.06rem;
  max-width: 60ch;
}
.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 0.9rem 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}
.button:hover { transform: translateY(-1px); }
.button.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: #041f31;
}
.button.secondary {
  background: rgba(148, 170, 193, 0.08);
  border-color: var(--line);
  color: var(--text);
}
.button.small { padding: 0.7rem 1rem; }

.hero-panel, .lab-panel, .mini-card, .progress-card, .skill-card, .lab-card {
  background: rgba(14, 25, 38, 0.92);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: var(--shadow);
}
.hero-panel {
  padding: 1.25rem;
}
.mini-card {
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(116,212,255,0.12), rgba(58,166,255,0.08));
}
.mini-card span { color: var(--muted); display: block; }
.mini-card strong { font-size: 1.2rem; }
.status-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.status-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0;
  border-top: 1px solid var(--line);
}
.status-list li:first-child { border-top: none; }
.status-list span { font-weight: 600; }
.status-list em { color: var(--muted); font-style: normal; }

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.section-header.narrow { justify-content: flex-start; }
.filter-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
input, select {
  background: rgba(17, 31, 47, 0.9);
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 10px;
  min-height: 44px;
  padding: 0.7rem 0.9rem;
}
input::placeholder { color: var(--muted); }

.card-grid, .stat-grid, .skill-grid {
  display: grid;
  gap: 1rem;
}
.card-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.stat-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.skill-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

.lab-card, .progress-card, .skill-card {
  padding: 1.25rem;
}
.lab-card header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.36rem 0.62rem;
  border-radius: 999px;
  background: rgba(116, 212, 255, 0.11);
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 700;
}
.badge.success { background: rgba(111, 227, 164, 0.12); color: var(--success); }
.badge.warning { background: rgba(255, 205, 107, 0.12); color: var(--warning); }
.lab-card h3 { margin-bottom: 0.6rem; }
.lab-card p { color: var(--muted); margin: 0 0 1rem; }
.lab-card ul { margin: 0; padding-left: 1.1rem; color: var(--muted); }
.lab-card .meta {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.lab-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
}
.lab-nav, .lab-main { min-width: 0; }
.path-list { display: grid; gap: 0.75rem; }
.path-item {
  background: rgba(17,31,47,0.9);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 1rem;
}
.path-item span { display: block; font-weight: 700; }
.path-item small { color: var(--muted); }
.path-item.active { border-color: rgba(116,212,255,0.7); }

.lab-main {
  display: grid;
  gap: 1.5rem;
}
.lab-panel {
  padding: 1.4rem;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.terminal-window {
  border: 1px solid var(--line);
  background: #040d16;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.terminal-header {
  display: flex;
  gap: 0.45rem;
  padding: 0.8rem 0.9rem;
  background: rgba(16, 29, 46, 0.85);
  border-bottom: 1px solid var(--line);
}
.terminal-header span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff5f57;
}
.terminal-header span:nth-child(2) { background: #ffbd2e; }
.terminal-header span:nth-child(3) { background: #28c840; }
.terminal-output {
  min-height: 220px;
  padding: 1rem;
  color: #dff8ff;
  font-family: "SFMono-Regular", Consolas, monospace;
  white-space: pre-wrap;
}
.terminal-controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.terminal-controls input {
  flex: 1;
}
.lab-meta {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
  color: var(--muted);
}
.security-stack {
  display: grid;
  gap: 1rem;
}
.security-module {
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(12, 24, 40, 0.8);
  padding: 1rem;
}
.security-module h4 { margin-bottom: 0.35rem; }
.security-module p { color: var(--muted); }
.security-module .module-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}
.module-actions input {
  flex: 1;
}
.feedback {
  min-height: 1.5rem;
  margin-top: 0.75rem;
  color: var(--muted);
}
.feedback.success { color: var(--success); }
.feedback.error { color: var(--danger); }

.filter-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(8, 18, 28, 0.7);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 0.8rem 0.85rem;
  border-bottom: 1px solid var(--line);
}
th { color: var(--muted); font-weight: 700; }
.check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 0.9rem;
  margin: 1rem 0;
}
.check-grid label {
  display: grid;
  gap: 0.4rem;
  color: var(--muted);
}
.check-grid .wide { grid-column: span 2; }
.compact { grid-template-columns: repeat(3, minmax(120px, 1fr)); }
.network-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 1rem;
}
.sample-block {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(7, 18, 28, 0.75);
  padding: 1rem;
}
.sample-block pre {
  color: var(--text);
  white-space: pre-wrap;
  font-family: "SFMono-Regular", Consolas, monospace;
  margin: 0;
}

.skill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}
.skill-label { font-weight: 600; }
.meter {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(148,170,193,0.18);
  overflow: hidden;
  min-width: 80px;
}
.meter-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--success));
  border-radius: inherit;
}
.progress-rank {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  background: rgba(111,227,164,0.12);
  color: var(--success);
  font-size: 0.7rem;
  font-weight: 700;
}
.demo-banner {
  margin-top: 1rem;
  border: 1px solid var(--line);
  background: rgba(116,212,255,0.08);
  color: var(--muted);
  border-radius: 12px;
  padding: 1rem 1.2rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 820px) {
  .hero-grid, .lab-layout, .network-grid { grid-template-columns: 1fr; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .terminal-controls { flex-direction: column; align-items: stretch; }
  .check-grid, .compact { grid-template-columns: 1fr; }
  .wide { grid-column: auto; }
  .nav-wrap { flex-direction: column; align-items: flex-start; padding: 0.8rem 0; }
}

@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto; }
  .button { transition: none; }
}
