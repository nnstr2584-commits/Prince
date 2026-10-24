const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const LAB_CATALOG = [
  {
    id: 'linux-terminal',
    title: 'Simulated Linux Terminal',
    category: 'Linux Fundamentals',
    difficulty: 'Beginner',
    path: 'Beginner',
    description: 'Safe terminal training with a fictional filesystem and allowlisted commands.',
    status: 'available',
    objectives: ['Understand shell basics', 'Navigate a sample filesystem', 'Read files safely'],
    instructions: 'Use the supported commands listed in the terminal help menu. Practice reading files and moving through directories.'
  },
  {
    id: 'web-security-playground',
    title: 'Web Security Playground',
    category: 'Web Security',
    difficulty: 'Intermediate',
    path: 'Intermediate',
    description: 'Explore simulated SQL injection, XSS, auth, and validation vulnerabilities in a contained environment.',
    status: 'available',
    objectives: ['Recognize insecure patterns', 'Understand mitigations', 'Verify secure implementations'],
    instructions: 'Try the demo inputs and review each explanation before moving to the secure version.'
  },
  {
    id: 'blue-team-investigation',
    title: 'Blue Team Investigation',
    category: 'Log Analysis',
    difficulty: 'Advanced',
    path: 'Advanced',
    description: 'Investigate fictional login events, suspicious traffic, and classify incidents.',
    status: 'available',
    objectives: ['Filter logs', 'Identify suspicious behavior', 'Draft an incident report'],
    instructions: 'Use the event table, filters, and timeline to isolate the anomaly and define the response.'
  },
  {
    id: 'network-http',
    title: 'Network and HTTP Fundamentals',
    category: 'Networking',
    difficulty: 'Beginner',
    path: 'Beginner',
    description: 'Inspect mock HTTP traffic, headers, DNS, ports, TLS, and packet flows without scanning live hosts.',
    status: 'available',
    objectives: ['Read HTTP requests', 'Review status codes', 'Understand ports and TLS'],
    instructions: 'Study the sample traffic, answer the guided prompts, and confirm your understanding.'
  }
];

const CHALLENGES = [
  {
    id: 'linux-terminal-pwd',
    title: 'Locate the working directory',
    objective: 'Confirm the learner can identify the current directory.',
    difficulty: 'Beginner',
    instructions: 'Run pwd in the terminal simulator to display the current directory.',
    hint: 'The prompt usually starts in the user home directory.',
    points: 10,
    validation: { type: 'terminal', expected: ['/home/analyst', '/home/analyst/workspace'] }
  },
  {
    id: 'web-security-xss',
    title: 'Recognize unsafe reflection',
    objective: 'Explain why reflected XSS is dangerous and how to mitigate it.',
    difficulty: 'Intermediate',
    instructions: 'Describe why the sample reflected script is unsafe and identify the mitigation.',
    hint: 'The problem is caused by untrusted input being rendered without sanitization.',
    points: 25,
    validation: { type: 'answer', expected: ['sanitize', 'escape', 'encode', 'validate', 'context'] }
  },
  {
    id: 'blue-team-incident',
    title: 'Isolate the suspicious login pattern',
    objective: 'Identify the suspicious IP and classify the incident severity.',
    difficulty: 'Advanced',
    instructions: 'Use the investigation logs to identify repeated bad logins from a single IP.',
    hint: 'Look for rapid repeated failures from a single source using the log timestamps and IP filter.',
    points: 40,
    validation: { type: 'incident', expected: { ip: '198.51.100.18', severity: 'high' } }
  },
  {
    id: 'network-http',
    title: 'Inspect the HTTP exchange',
    objective: 'Identify the HTTP method, status, and protocol used in the sample response.',
    difficulty: 'Beginner',
    instructions: 'Review the prerecorded packet and determine the method and status code.',
    hint: 'The sample request is a GET to the root path and the response is a common success code.',
    points: 15,
    validation: { type: 'http', expected: { method: 'GET', status: 200, protocol: 'HTTP/1.1' } }
  }
];

const DEFAULT_PROGRESS = {
  demoUser: {
    profile: 'local-demo-user',
    mode: 'demo',
    labs: {
      'linux-terminal': { completed: false, attempts: 0, lastUpdated: null },
      'web-security-playground': { completed: false, attempts: 0, lastUpdated: null },
      'blue-team-investigation': { completed: false, attempts: 0, lastUpdated: null },
      'network-http': { completed: false, attempts: 0, lastUpdated: null }
    },
    challenges: [],
    skills: {
      networking: { introduced: true, practiced: false, mastered: false },
      linux: { introduced: true, practiced: false, mastered: false },
      webSecurity: { introduced: true, practiced: false, mastered: false },
      auth: { introduced: true, practiced: false, mastered: false },
      secureCoding: { introduced: true, practiced: false, mastered: false },
      logAnalysis: { introduced: true, practiced: false, mastered: false },
      incidentResponse: { introduced: true, practiced: false, mastered: false }
    }
  }
};

const FILESYSTEM = {
  '/': { type: 'dir', entries: ['home'] },
  '/home': { type: 'dir', entries: ['analyst'] },
  '/home/analyst': { type: 'dir', entries: ['workspace', 'notes.txt', 'logs'] },
  '/home/analyst/workspace': { type: 'dir', entries: ['notes.txt', 'report.md'] },
  '/home/analyst/logs': { type: 'dir', entries: ['access.log', 'auth.log'] },
  '/home/analyst/notes.txt': {
    type: 'file',
    content: 'Security practice note: use safe files and verify commands before execution.'
  },
  '/home/analyst/workspace/report.md': {
    type: 'file',
    content: '# Lab Report\n- Confirm commands are safe\n- Validate findings before acting'
  },
  '/home/analyst/logs/access.log': {
    type: 'file',
    content: '2026-10-24 08:02 GET /index 200\n2026-10-24 08:10 GET /login 200\n2026-10-24 08:15 POST /login 302\n'
  },
  '/home/analyst/logs/auth.log': {
    type: 'file',
    content: '2026-10-24 07:58 SUCCESS alice from 203.0.113.14\n2026-10-24 08:05 FAILED bob from 198.51.100.18\n2026-10-24 08:06 FAILED bob from 198.51.100.18\n2026-10-24 08:07 FAILED bob from 198.51.100.18\n'
  }
};

const ALLOWED_COMMANDS = new Set(['help', 'pwd', 'ls', 'cd', 'cat', 'whoami', 'clear']);
const terminalSessions = new Map();

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(DEFAULT_PROGRESS, null, 2));
  }
}

function normalizeProgressData(input) {
  const base = JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  if (!input || typeof input !== 'object') {
    return base;
  }

  const user = input.demoUser && typeof input.demoUser === 'object' ? input.demoUser : base.demoUser;
  const labs = user.labs && typeof user.labs === 'object' ? user.labs : base.demoUser.labs;
  const skills = user.skills && typeof user.skills === 'object' ? user.skills : base.demoUser.skills;

  return {
    demoUser: {
      profile: typeof user.profile === 'string' ? user.profile : base.demoUser.profile,
      mode: typeof user.mode === 'string' ? user.mode : base.demoUser.mode,
      labs: {
        'linux-terminal': { ...base.demoUser.labs['linux-terminal'], ...(labs['linux-terminal'] || {}) },
        'web-security-playground': { ...base.demoUser.labs['web-security-playground'], ...(labs['web-security-playground'] || {}) },
        'blue-team-investigation': { ...base.demoUser.labs['blue-team-investigation'], ...(labs['blue-team-investigation'] || {}) },
        'network-http': { ...base.demoUser.labs['network-http'], ...(labs['network-http'] || {}) }
      },
      challenges: Array.isArray(user.challenges) ? user.challenges : [],
      skills: {
        networking: { ...base.demoUser.skills.networking, ...(skills.networking || {}) },
        linux: { ...base.demoUser.skills.linux, ...(skills.linux || {}) },
        webSecurity: { ...base.demoUser.skills.webSecurity, ...(skills.webSecurity || {}) },
        auth: { ...base.demoUser.skills.auth, ...(skills.auth || {}) },
        secureCoding: { ...base.demoUser.skills.secureCoding, ...(skills.secureCoding || {}) },
        logAnalysis: { ...base.demoUser.skills.logAnalysis, ...(skills.logAnalysis || {}) },
        incidentResponse: { ...base.demoUser.skills.incidentResponse, ...(skills.incidentResponse || {}) }
      }
    }
  };
}

function loadProgressFromFile(filePath = PROGRESS_FILE) {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw || !raw.trim()) {
      return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
    }
    const parsed = JSON.parse(raw);
    return normalizeProgressData(parsed);
  } catch (error) {
    const backupPath = `${filePath}.corrupt-${Date.now()}`;
    try {
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
      }
    } catch (backupError) {
      // Intentionally fail closed and keep the original file untouched.
    }
    return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  }
}

function loadProgress() {
  return loadProgressFromFile(PROGRESS_FILE);
}

function saveProgress(progress) {
  ensureDataFiles();
  const normalized = normalizeProgressData(progress);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(normalized, null, 2));
}

function buildSkillMap(progress) {
  const skills = normalizeProgressData(progress).demoUser.skills;
  return {
    networking: {
      introduced: Boolean(skills.networking?.introduced ?? true),
      practiced: Boolean(skills.networking?.practiced ?? false),
      mastered: Boolean(skills.networking?.mastered ?? false)
    },
    linux: {
      introduced: Boolean(skills.linux?.introduced ?? true),
      practiced: Boolean(skills.linux?.practiced ?? false),
      mastered: Boolean(skills.linux?.mastered ?? false)
    },
    webSecurity: {
      introduced: Boolean(skills.webSecurity?.introduced ?? true),
      practiced: Boolean(skills.webSecurity?.practiced ?? false),
      mastered: Boolean(skills.webSecurity?.mastered ?? false)
    },
    auth: {
      introduced: Boolean(skills.auth?.introduced ?? true),
      practiced: Boolean(skills.auth?.practiced ?? false),
      mastered: Boolean(skills.auth?.mastered ?? false)
    },
    secureCoding: {
      introduced: Boolean(skills.secureCoding?.introduced ?? true),
      practiced: Boolean(skills.secureCoding?.practiced ?? false),
      mastered: Boolean(skills.secureCoding?.mastered ?? false)
    },
    logAnalysis: {
      introduced: Boolean(skills.logAnalysis?.introduced ?? true),
      practiced: Boolean(skills.logAnalysis?.practiced ?? false),
      mastered: Boolean(skills.logAnalysis?.mastered ?? false)
    },
    incidentResponse: {
      introduced: Boolean(skills.incidentResponse?.introduced ?? true),
      practiced: Boolean(skills.incidentResponse?.practiced ?? false),
      mastered: Boolean(skills.incidentResponse?.mastered ?? false)
    }
  };
}

function createTerminalSessionState() {
  return {
    currentDir: '/home/analyst',
    user: 'analyst',
    history: ['$ help']
  };
}

function getTerminalSession(sessionId) {
  const id = String(sessionId || 'demo-session').trim() || 'demo-session';
  if (!terminalSessions.has(id)) {
    terminalSessions.set(id, createTerminalSessionState());
  }
  return terminalSessions.get(id);
}

function resolvePath(currentDir, target) {
  if (!target || target === '.') return currentDir;
  if (target === '/') return '/';

  const base = currentDir || '/';
  let nextPath = '';
  if (target.startsWith('/')) {
    nextPath = target;
  } else {
    nextPath = `${base.replace(/\/$/, '')}/${target}`;
  }

  const parts = nextPath.split('/').filter(Boolean);
  const stack = [];
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      stack.pop();
      continue;
    }
    stack.push(part);
  }

  const resolved = '/' + stack.join('/');
  return resolved === '' ? '/' : resolved;
}

function terminalExecute(command, state = createTerminalSessionState()) {
  const trimmed = String(command || '').trim();
  if (!trimmed) {
    return { ok: false, output: ['No command entered. Type "help" for a list of supported commands.'], clear: false };
  }

  const parts = trimmed.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (!ALLOWED_COMMANDS.has(commandName)) {
    return {
      ok: false,
      output: [
        `Unknown command: ${commandName}`,
        'This lab uses a controlled allowlist. Try: help, pwd, ls, cd, cat, whoami, clear.'
      ],
      clear: false
    };
  }

  switch (commandName) {
    case 'help':
      return {
        ok: true,
        output: [
          'Available commands:',
          '  help      Show this help menu',
          '  pwd       Print the current working directory',
          '  ls        List files and directories',
          '  cd        Change directory',
          '  cat       View file contents',
          '  whoami   Show the active user',
          '  clear     Clear the terminal screen'
        ],
        clear: false
      };
    case 'pwd':
      return { ok: true, output: [state.currentDir || '/home/analyst'], clear: false };
    case 'whoami':
      return { ok: true, output: [state.user || 'analyst'], clear: false };
    case 'ls': {
      const target = args[0] ? resolvePath(state.currentDir || '/home/analyst', args[0]) : state.currentDir || '/home/analyst';
      const node = FILESYSTEM[target];
      if (!node || node.type !== 'dir') {
        return { ok: false, output: [`ls: cannot access '${target}': No such file or directory`], clear: false };
      }
      return { ok: true, output: node.entries.map((name) => name), clear: false };
    }
    case 'cd': {
      if (!args[0]) {
        return { ok: true, output: [state.currentDir || '/home/analyst'], clear: false };
      }
      const target = resolvePath(state.currentDir || '/home/analyst', args[0]);
      const node = FILESYSTEM[target];
      if (!node || node.type !== 'dir') {
        return { ok: false, output: [`cd: ${args[0]}: No such file or directory`], clear: false };
      }
      state.currentDir = target;
      return { ok: true, output: [], clear: false };
    }
    case 'cat': {
      if (!args[0]) {
        return { ok: false, output: ['cat: missing file operand'], clear: false };
      }
      const target = resolvePath(state.currentDir || '/home/analyst', args[0]);
      const node = FILESYSTEM[target];
      if (!node || node.type !== 'file') {
        return { ok: false, output: [`cat: ${args[0]}: No such file or directory`], clear: false };
      }
      return { ok: true, output: [node.content], clear: false };
    }
    case 'clear':
      return { ok: true, output: [], clear: true };
    default:
      return { ok: false, output: ['Unsupported command in the lab. Use the allowlist shown by "help".'], clear: false };
  }
}

function getChallengeSkill(challengeId) {
  const mapping = {
    'linux-terminal-pwd': { lab: 'linux-terminal', skill: 'linux' },
    'web-security-xss': { lab: 'web-security-playground', skill: 'webSecurity' },
    'blue-team-incident': { lab: 'blue-team-investigation', skill: 'logAnalysis' },
    'network-http': { lab: 'network-http', skill: 'networking' }
  };
  return mapping[challengeId] || null;
}

function updateProgressForChallenge(progress, challengeId) {
  const normalized = normalizeProgressData(progress);
  const userProgress = normalized.demoUser;
  const challengeMeta = getChallengeSkill(challengeId);

  if (!Array.isArray(userProgress.challenges)) {
    userProgress.challenges = [];
  }

  if (!userProgress.challenges.includes(challengeId)) {
    userProgress.challenges.push(challengeId);
  }

  if (challengeMeta && userProgress.labs && userProgress.labs[challengeMeta.lab]) {
    userProgress.labs[challengeMeta.lab] = {
      ...userProgress.labs[challengeMeta.lab],
      completed: true,
      attempts: Number(userProgress.labs[challengeMeta.lab].attempts || 0) + 1,
      lastUpdated: new Date().toISOString()
    };
  }

  if (challengeMeta && userProgress.skills && userProgress.skills[challengeMeta.skill]) {
    userProgress.skills[challengeMeta.skill] = {
      ...userProgress.skills[challengeMeta.skill],
      practiced: true,
      introduced: Boolean(userProgress.skills[challengeMeta.skill].introduced ?? true)
    };
  }

  const requiredSkillChallenges = {
    linux: ['linux-terminal-pwd'],
    webSecurity: ['web-security-xss'],
    logAnalysis: ['blue-team-incident'],
    networking: ['network-http']
  };

  Object.entries(requiredSkillChallenges).forEach(([skillKey, challengeIds]) => {
    if (challengeIds.every((id) => userProgress.challenges.includes(id))) {
      if (userProgress.skills[skillKey]) {
        userProgress.skills[skillKey].mastered = true;
      }
    }
  });

  return normalized;
}

function validateChallengeSubmission(challengeId, payload = {}) {
  const challenge = CHALLENGES.find((item) => item.id === challengeId);
  if (!challenge) {
    return { valid: false, points: 0, message: 'Challenge not found.' };
  }

  switch (challenge.id) {
    case 'linux-terminal-pwd': {
      const raw = String(payload.answer || payload.value || payload.currentDir || '').trim();
      const currentDir = String(payload.currentDir || '').trim();
      const validValue = ['/home/analyst', '/home/analyst/workspace'].includes(currentDir) || ['/home/analyst', '/home/analyst/workspace'].includes(raw);
      return validValue
        ? { valid: true, points: challenge.points, message: 'Correct. The current directory is within the analyst home area.' }
        : { valid: false, points: 0, message: 'Try the pwd command in the terminal simulator. The valid directory is /home/analyst or /home/analyst/workspace.' };
    }
    case 'web-security-xss': {
      const text = String(payload.answer || payload.value || '').toLowerCase();
      const mentionsUnsafeBehavior = /(script|xss|reflect|render|unsafe|html)/.test(text);
      const mentionsMitigation = /(escape|encode|sanitize|validate|context|session)/.test(text);
      return mentionsUnsafeBehavior && mentionsMitigation
        ? { valid: true, points: challenge.points, message: 'Correct. Unsafe data must be escaped, sanitized, or validated before it is rendered.' }
        : { valid: false, points: 0, message: 'Explain the risk and name a mitigation such as escaping, encoding, or validating input before rendering.' };
    }
    case 'blue-team-incident': {
      const ip = String(payload.ip || '').trim();
      const severity = String(payload.severity || '').trim().toLowerCase();
      const finding = String(payload.finding || '').trim().toLowerCase();
      const ipOk = ip === '198.51.100.18';
      const severityOk = severity === 'high';
      const findingOk = /(repeated|failed|login|bruteforce|brute-force)/.test(finding);
      return ipOk && severityOk && findingOk
        ? { valid: true, points: challenge.points, message: 'Confirmed. Repeated failed logins from 198.51.100.18 indicate a high-severity brute-force pattern.' }
        : { valid: false, points: 0, message: 'Review the auth.log entries and classify the activity as repeated failed logins from the suspicious IP as a high-severity attack.' };
    }
    case 'network-http': {
      const method = String(payload.method || '').trim().toUpperCase();
      const status = Number(payload.status ?? payload.statusCode ?? 0);
      const protocol = String(payload.protocol || '').trim().toUpperCase();
      const valid = method === 'GET' && status === 200 && protocol === 'HTTP/1.1';
      return valid
        ? { valid: true, points: challenge.points, message: 'Correct. The request was a GET to / and the server responded with HTTP/1.1 200 OK.' }
        : { valid: false, points: 0, message: 'Check the sample HTTP exchange: method GET, status 200, protocol HTTP/1.1.' };
    }
    default:
      return { valid: false, points: 0, message: 'Validation not configured for this challenge.' };
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: 'demo', timestamp: new Date().toISOString() });
});

app.get('/api/labs', (_req, res) => {
  res.json({ labs: LAB_CATALOG, mode: 'demo' });
});

app.get('/api/challenges', (_req, res) => {
  res.json({ challenges: CHALLENGES, mode: 'demo' });
});

app.get('/api/progress', (_req, res) => {
  const progress = loadProgress();
  res.json({ user: progress.demoUser, skillMap: buildSkillMap(progress), mode: 'demo' });
});

app.get('/api/skill-map', (_req, res) => {
  const progress = loadProgress();
  res.json({ skillMap: buildSkillMap(progress), mode: 'demo' });
});

app.post('/api/terminal', (req, res) => {
  try {
    const { command, sessionId } = req.body || {};
    const session = getTerminalSession(sessionId);
    const result = terminalExecute(command, session);
    res.json({ ...result, currentDir: session.currentDir || '/home/analyst' });
  } catch (error) {
    res.status(500).json({ ok: false, output: ['The terminal simulator encountered an error. Try again.'], message: 'Terminal simulator failure' });
  }
});

app.post('/api/challenges/validate', (req, res) => {
  try {
    const { challengeId, ...payload } = req.body || {};
    const result = validateChallengeSubmission(challengeId, payload);

    if (result.valid) {
      const current = loadProgress();
      const next = updateProgressForChallenge(current, challengeId);
      saveProgress(next);
    }

    res.json({ ...result, mode: 'demo' });
  } catch (error) {
    res.status(500).json({ valid: false, points: 0, message: 'Challenge validation failed. Please try again.' });
  }
});

app.post('/api/blue-team/investigate', (req, res) => {
  try {
    const { ip, severity, finding } = req.body || {};
    const response = validateChallengeSubmission('blue-team-incident', { ip, severity, finding });
    res.json({ ...response, mode: 'demo' });
  } catch (error) {
    res.status(500).json({ valid: false, points: 0, message: 'Investigation validation failed. Please try again.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Question & Hacking Cyber Lab is running on http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  LAB_CATALOG,
  CHALLENGES,
  DEFAULT_PROGRESS,
  buildSkillMap,
  terminalExecute,
  resolvePath,
  validateChallengeSubmission,
  loadProgress,
  saveProgress,
  normalizeProgressData,
  terminalSessions,
  getTerminalSession,
  updateProgressForChallenge
};
