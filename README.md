const appState = {
  terminalHistory: [
    '$ help',
    'Available commands: help, pwd, ls, cd, cat, whoami, clear'
  ],
  labs: [],
  progress: null,
  skillMap: null,
  terminalResult: null
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function renderLabs() {
  const list = document.getElementById('lab-list');
  const search = document.getElementById('lab-search').value.toLowerCase();
  const difficulty = document.getElementById('lab-filter').value;

  const filtered = appState.labs.filter((lab) => {
    const matchesText = [lab.title, lab.category, lab.description, lab.path].join(' ').toLowerCase().includes(search);
    const matchesDifficulty = difficulty === 'all' || lab.difficulty === difficulty;
    return matchesText && matchesDifficulty;
  });

  if (!filtered.length) {
    list.innerHTML = '<article class="lab-card"><h3>No labs match your filters</h3><p>Try a broader search or reset the difficulty filter.</p></article>';
    return;
  }

  list.innerHTML = filtered.map((lab) => {
    const statusClass = lab.status === 'available' ? 'success' : 'warning';
    const statusText = lab.status === 'available' ? 'Open' : 'Soon';
    return `
      <article class="lab-card">
        <header>
          <span class="badge ${statusClass}">${statusText}</span>
          <span class="badge">${lab.difficulty}</span>
        </header>
        <h3>${lab.title}</h3>
        <p>${lab.description}</p>
        <ul>
          ${lab.objectives.map((objective) => `<li>${objective}</li>`).join('')}
        </ul>
        <div class="meta">
          <span>${lab.category}</span>
          <span>${lab.path}</span>
        </div>
      </article>
    `;
  }).join('');
}

function renderProgress() {
  const cards = document.getElementById('progress-cards');
  if (!appState.progress) return;

  const labs = Object.entries(appState.progress.labs || {});
  const completedCount = labs.filter(([, value]) => value.completed).length;
  const challengeCount = appState.progress.challenges?.length || 0;
  const cardsMarkup = [
    { label: 'Completed labs', value: `${completedCount}/${labs.length}` },
    { label: 'Challenges', value: String(challengeCount) },
    { label: 'Mode', value: 'Demo' },
    { label: 'Profile', value: 'Local user' }
  ];

  cards.innerHTML = cardsMarkup.map((item) => `
    <article class="progress-card">
      <p class="eyebrow">${item.label}</p>
      <h3>${item.value}</h3>
    </article>
  `).join('');
}

function renderSkillMap() {
  const grid = document.getElementById('skill-map-grid');
  if (!appState.skillMap) return;

  const entries = Object.entries(appState.skillMap).map(([name, value]) => {
    const percent = (Number(value.mastered) * 100) + (Number(value.practiced) * 50) + (Number(value.introduced) * 25);
    const friendlyName = {
      networking: 'Networking',
      linux: 'Linux fundamentals',
      webSecurity: 'Web security',
      auth: 'Authentication & authorization',
      secureCoding: 'Secure coding',
      logAnalysis: 'Log analysis',
      incidentResponse: 'Incident response'
    }[name] || name;

    return `
      <article class="skill-card">
        <div class="skill-item">
          <span class="skill-label">${friendlyName}</span>
          <span class="progress-rank">${value.mastered ? 'Mastered' : value.practiced ? 'Practiced' : 'Introduced'}</span>
        </div>
        <div class="meter"><span class="meter-fill" style="width:${Math.min(percent, 100)}%"></span></div>
      </article>
    `;
  });

  grid.innerHTML = entries.join('');
}

function renderSecurityModules() {
  const modules = [
    {
      title: 'SQL injection concept',
      explanation: 'If user input is placed directly into a query string, malicious input can alter the logic behind the query.',
      example: 'SELECT * FROM users WHERE username = \' OR 1=1 --\';',
      placeholder: 'Enter a username or query fragment',
      expectation: 'validate'
    },
    {
      title: 'XSS reflection',
      explanation: 'A script can be reflected back into the page when untrusted text is rendered without escaping.',
      example: '<script>alert("demo")</script>',
      placeholder: 'Search term or comment',
      expectation: 'encode'
    },
    {
      title: 'Authentication and sessions',
      explanation: 'Session tokens must be unpredictable, stored safely, and rotated when credentials change.',
      example: 'Session ID = "abc123" (unsafe sample only)',
      placeholder: 'Token or session hint',
      expectation: 'secure'
    },
    {
      title: 'Input validation',
      explanation: 'Validation checks the type, pattern, and maximum length before the input is accepted.',
      example: 'User age must be a number between 18 and 99.',
      placeholder: 'Input pattern',
      expectation: 'validate'
    }
  ];

  const holder = document.getElementById('security-modules');
  holder.innerHTML = modules.map((module, index) => `
    <div class="security-module">
      <h4>${module.title}</h4>
      <p>${module.explanation}</p>
      <p><strong>Mock sample:</strong> ${module.example}</p>
      <div class="module-actions">
        <input id="module-${index}" type="text" placeholder="${module.placeholder}" />
        <button class="button secondary small" type="button" data-module-index="${index}">Verify</button>
      </div>
      <p class="feedback" data-feedback="${index}"></p>
    </div>
  `).join('');

  holder.querySelectorAll('[data-module-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.moduleIndex);
      const input = document.getElementById(`module-${index}`).value.trim().toLowerCase();
      const feedback = holder.querySelector(`[data-feedback="${index}"]`);
      const expectedValues = ['validate', 'encode', 'secure'];
      const valid = expectedValues.some((token) => input.includes(token)) || input.includes('sanitize');

      feedback.textContent = valid
        ? 'Correct: the unsafe behavior is mitigated by validation, encoding, or secure session handling.'
        : 'Review the explanation: the secure pattern is to validate, encode, and isolate untrusted input.';
      feedback.classList.toggle('success', valid);
      feedback.classList.toggle('error', !valid);
    });
  });
}

function renderIncidentTable() {
  const logs = [
    { timestamp: '2026-10-24 08:02:11', user: 'alice', event: 'SUCCESS login', ip: '203.0.113.14', result: 'OK' },
    { timestamp: '2026-10-24 08:05:03', user: 'bob', event: 'FAILED login', ip: '198.51.100.18', result: 'Warning' },
    { timestamp: '2026-10-24 08:06:12', user: 'bob', event: 'FAILED login', ip: '198.51.100.18', result: 'Warning' },
    { timestamp: '2026-10-24 08:07:24', user: 'bob', event: 'FAILED login', ip: '198.51.100.18', result: 'Warning' },
    { timestamp: '2026-10-24 08:10:14', user: 'charlie', event: 'SUCCESS login', ip: '203.0.113.49', result: 'OK' }
  ];

  const query = document.getElementById('incident-search').value.toLowerCase();
  const ipFilter = document.getElementById('incident-ip').value.trim();

  const filtered = logs.filter((row) => {
    const text = `${row.timestamp} ${row.user} ${row.event} ${row.ip} ${row.result}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesIp = !ipFilter || row.ip.includes(ipFilter);
    return matchesQuery && matchesIp;
  });

  const tbody = document.getElementById('incident-table-body');
  tbody.innerHTML = filtered.map((row) => `
    <tr>
      <td>${row.timestamp}</td>
      <td>${row.user}</td>
      <td>${row.event}</td>
      <td>${row.ip}</td>
      <td>${row.result}</td>
    </tr>
  `).join('');
}

async function handleTerminalCommand() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const command = input.value.trim();

  if (!command) {
    output.innerHTML += '<p>Please enter a command.</p>';
    return;
  }

  const response = await fetchJson('/api/terminal', {
    method: 'POST',
    body: JSON.stringify({ command })
  });

  if (response.ok) {
    output.innerHTML += `<p>$ ${command}</p>`;
    if (Array.isArray(response.output) && response.output.length) {
      response.output.forEach((line) => {
        output.innerHTML += `<p>${line}</p>`;
      });
    }
  } else {
    output.innerHTML += `<p>$ ${command}</p><p>Command failed.</p>`;
  }

  input.value = '';
  output.scrollTop = output.scrollHeight;

  const challengeResult = await fetchJson('/api/challenges/validate', {
    method: 'POST',
    body: JSON.stringify({ challengeId: 'linux-terminal-pwd', answer: command === 'pwd' ? '/home/analyst' : 'pwd' })
  });

  if (challengeResult.valid) {
    const progress = await fetchJson('/api/progress');
    appState.progress = progress.user;
    appState.skillMap = progress.skillMap;
    renderProgress();
    renderSkillMap();
  }
}

async function validateIncident() {
  const ip = document.getElementById('suspicious-ip').value.trim();
  const severity = document.getElementById('severity-select').value;
  const finding = document.getElementById('finding-summary').value.trim();
  const feedback = document.getElementById('incident-feedback');

  const result = await fetchJson('/api/blue-team/investigate', {
    method: 'POST',
    body: JSON.stringify({ ip, severity, finding })
  });

  feedback.textContent = result.message;
  feedback.classList.toggle('success', result.valid);
  feedback.classList.toggle('error', !result.valid);
}

async function validateHttp() {
  const method = document.getElementById('http-method').value.trim();
  const status = document.getElementById('http-status').value.trim();
  const protocol = document.getElementById('http-protocol').value.trim();
  const feedback = document.getElementById('http-feedback');

  const result = await fetchJson('/api/challenges/validate', {
    method: 'POST',
    body: JSON.stringify({ challengeId: 'network-http', method, status, protocol })
  });

  feedback.textContent = result.message;
  feedback.classList.toggle('success', result.valid);
  feedback.classList.toggle('error', !result.valid);
}

async function init() {
  const [labs, progress] = await Promise.all([
    fetchJson('/api/labs'),
    fetchJson('/api/progress')
  ]);

  appState.labs = labs.labs;
  appState.progress = progress.user;
  appState.skillMap = progress.skillMap;

  renderLabs();
  renderProgress();
  renderSkillMap();
  renderSecurityModules();
  renderIncidentTable();

  document.getElementById('lab-search').addEventListener('input', renderLabs);
  document.getElementById('lab-filter').addEventListener('change', renderLabs);
  document.getElementById('terminal-run').addEventListener('click', handleTerminalCommand);
  document.getElementById('terminal-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleTerminalCommand();
  });
  document.getElementById('terminal-reset').addEventListener('click', () => {
    const output = document.getElementById('terminal-output');
    output.innerHTML = '<p>$ help</p><p>Available commands: help, pwd, ls, cd, cat, whoami, clear</p>';
    document.getElementById('terminal-input').value = '';
  });
  document.getElementById('incident-search').addEventListener('input', renderIncidentTable);
  document.getElementById('incident-ip').addEventListener('input', renderIncidentTable);
  document.getElementById('incident-validate').addEventListener('click', validateIncident);
  document.getElementById('http-validate').addEventListener('click', validateHttp);
}

init().catch((error) => {
  document.body.insertAdjacentHTML('beforeend', `<div style="padding: 2rem; color: red;">Could not load the Cyber Lab data: ${error.message}</div>`);
});
