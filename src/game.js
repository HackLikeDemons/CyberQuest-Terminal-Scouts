import { LEVELS } from "./data/levels.js";
import { COMMAND_INFO } from "./data/command-info.js";
import { CONTENT_VERSION, LICENSED_TRACKS, SAVE_KEY, THEMES } from "./data/config.js";
import { buildUnlockRule, evaluateRule, evaluateRuleDetailed, hasAction, recordAction } from "./engine/actions-rules.js";
import { createPlaylistManager } from "./engine/playlist-manager.js";
import { SAVE_SCHEMA_VERSION, parseAndMigrateSave } from "./engine/save-state.js";

const state = {
  levelIndex: 0,
  cwd: "/",
  fs: null,
  score: 0,
  hintIndex: 0,
  pendingRemove: null,
  actionState: {},
  editor: null,
  onboardingVisible: false,
  playerName: "Analyst",
  theme: "ocean",
  musicEnabled: false
};

const out = document.getElementById("out");
const cmd = document.getElementById("cmd");
const story = document.getElementById("story");
const ethicsEl = document.getElementById("ethics");
const onboardingEl = document.getElementById("onboarding");
const onboardingToggleBtnEl = document.getElementById("onboardingToggleBtn");
const levelNameEl = document.getElementById("levelName");
const roleLabelEl = document.getElementById("roleLabel");
const progressTextEl = document.getElementById("progressText");
const progressFillEl = document.getElementById("progressFill");
const tipsLineEl = document.getElementById("tipsLine");
const agentNameEl = document.getElementById("agentName");
const themeSelectEl = document.getElementById("themeSelect");
const hintBtnEl = document.getElementById("hintBtn");
const musicBtnEl = document.getElementById("musicBtn");
const restartBtnEl = document.getElementById("restartBtn");

const music = {
  audioEl: null,
  mode: null,
  playlist: createPlaylistManager(LICENSED_TRACKS)
};

const MAN_PAGES = {
  help: {
    title: "HELP(1)",
    purpose: "zeigt die verfuegbaren Befehle im aktuellen Level",
    usage: "help",
    examples: ["help"]
  },
  story: {
    title: "STORY(1)",
    purpose: "zeigt die aktuelle Mission mit Ziel",
    usage: "story",
    examples: ["story"]
  },
  pwd: {
    title: "PWD(1)",
    purpose: "zeigt den aktuellen Ordner",
    usage: "pwd",
    examples: ["pwd"]
  },
  ls: {
    title: "LS(1)",
    purpose: "listet Dateien und Ordner",
    usage: "ls [-a] [-l] [PFAD]",
    examples: ["ls", "ls -a", "ls -la /serverraum"]
  },
  cd: {
    title: "CD(1)",
    purpose: "wechselt in einen Ordner",
    usage: "cd ORDNER | cd ..",
    examples: ["cd desktop", "cd /logs", "cd .."]
  },
  cat: {
    title: "CAT(1)",
    purpose: "zeigt den Inhalt einer Datei",
    usage: "cat DATEI",
    examples: ["cat hinweis.txt", "cat /logs/log.txt"]
  },
  grep: {
    title: "GREP(1)",
    purpose: "sucht Text in einer Datei",
    usage: "grep SUCHTEXT DATEI",
    examples: ["grep CODE: log.txt", "grep WARN /logs/server.log"]
  },
  head: {
    title: "HEAD(1)",
    purpose: "zeigt den Anfang einer Datei",
    usage: "head DATEI",
    examples: ["head server.log"]
  },
  tail: {
    title: "TAIL(1)",
    purpose: "zeigt das Ende einer Datei",
    usage: "tail DATEI",
    examples: ["tail server.log"]
  },
  mkdir: {
    title: "MKDIR(1)",
    purpose: "erstellt einen neuen Ordner",
    usage: "mkdir ORDNER",
    examples: ["mkdir mission"]
  },
  touch: {
    title: "TOUCH(1)",
    purpose: "erstellt eine leere Datei",
    usage: "touch DATEI",
    examples: ["touch notiz.txt"]
  },
  cp: {
    title: "CP(1)",
    purpose: "kopiert eine Datei",
    usage: "cp QUELLE ZIEL",
    examples: ["cp quelle.txt kopie.txt"]
  },
  mv: {
    title: "MV(1)",
    purpose: "verschiebt oder benennt eine Datei um",
    usage: "mv QUELLE ZIEL",
    examples: ["mv kopie.txt code.txt"]
  },
  rm: {
    title: "RM(1)",
    purpose: "loescht eine Datei (mit Sicherheitsabfrage)",
    usage: "rm DATEI | rm --ja DATEI",
    examples: ["rm muell.txt", "rm --ja muell.txt"]
  },
  echo: {
    title: "ECHO(1)",
    purpose: "schreibt Text in eine Datei",
    usage: "echo TEXT > DATEI",
    examples: ["echo CODE: BLAUWOLF > code.txt"]
  },
  chmod: {
    title: "CHMOD(1)",
    purpose: "setzt symbolisch Dateirechte",
    usage: "chmod MODUS DATEI",
    examples: ["chmod 644 code.txt"],
    note: "Merke: 644 bedeutet, dass die Datei gelesen werden kann."
  },
  ps: {
    title: "PS(1)",
    purpose: "zeigt laufende Programme",
    usage: "ps",
    examples: ["ps"]
  },
  clear: {
    title: "CLEAR(1)",
    purpose: "leert die Terminal-Ausgabe",
    usage: "clear",
    examples: ["clear"]
  },
  unlock: {
    title: "UNLOCK(1)",
    purpose: "prueft dein gefundenes Passwort",
    usage: "unlock PASSWORT",
    examples: ["unlock MONDSTEIN"]
  },
  hint: {
    title: "HINT(1)",
    purpose: "zeigt den naechsten Tipp",
    usage: "hint",
    examples: ["hint"]
  },
  ethik: {
    title: "ETHIK(1)",
    purpose: "zeigt die Sicherheits- und Ethikregeln",
    usage: "ethik",
    examples: ["ethik"]
  },
  setname: {
    title: "SETNAME(1)",
    purpose: "setzt deinen Analystennamen im Terminal",
    usage: "setname NAME",
    examples: ["setname Andi", "setname Mia"]
  },
  jump: {
    title: "JUMP(1)",
    purpose: "springt mit Passwort zu einem Level",
    usage: "jump LEVELNUMMER",
    examples: ["jump LEVEL3", "jump L7"]
  },
  nexttrack: {
    title: "NEXTTRACK(1)",
    purpose: "springt zum naechsten Musiktitel",
    usage: "nexttrack",
    examples: ["nexttrack"]
  },
  restart: {
    title: "RESTART(1)",
    purpose: "startet das Spiel von vorne",
    usage: "restart | restart --ja",
    examples: ["restart", "restart --ja"]
  }
};

const ETHICS_RULES = [
  "Nur auf Systemen arbeiten, fuer die du ausdruecklich die Erlaubnis hast.",
  "Logs helfen beim Aufklaeren von Vorfaellen und beim Schutz von Systemen.",
  "Keine Daten loeschen oder veraendern, wenn es nicht Teil der Aufgabe ist.",
  "Gefundene Sicherheitsprobleme verantwortungsvoll melden statt ausnutzen.",
  "Starke Passwoerter und klare Regeln schuetzen dich und andere."
];

const TITLE_STEPS = [
  { minProgress: 0, title: "Anwärter" },
  { minProgress: 0.2, title: "Junior Analyst" },
  { minProgress: 0.4, title: "Junior Analyst, 2. Grades" },
  { minProgress: 0.6, title: "Analyst" },
  { minProgress: 0.8, title: "Erfahrener Analyst" },
  { minProgress: 1, title: "Leitender Analyst" }
];

function currentTrackTitle() {
  return music.playlist.getCurrentTitle();
}

function cloneFs(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function markAction(action, detail = "") {
  const changed = recordAction(state.actionState, action, detail);
  if (changed) {
    persistState();
    renderOnboarding();
  }
}

function currentLevel() {
  return LEVELS[state.levelIndex];
}

function playerAddress() {
  return state.playerName || "Analyst";
}

function print(text, cls = "") {
  const div = document.createElement("div");
  div.className = "line " + cls;
  div.textContent = text;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

function promptLine(input) {
  print(`analyst@cyberquest:${state.cwd}$ ${input}`, "prompt");
}

function setStory() {
  const lvl = currentLevel();
  levelNameEl.textContent = `${state.levelIndex + 1}/` + LEVELS.length + " - " + lvl.title;
  updateRoleTitle();
  updateProgressUI();
  story.innerHTML = `<b>${lvl.title}</b><br><span class="accent">${playerAddress()},</span> ${lvl.briefing}<br><span class="accent">Ziel:</span> ${lvl.objective}`;
  const cmds = lvl.learningCommands && lvl.learningCommands.length ? lvl.learningCommands : lvl.allowed.filter((c) => !["help", "story", "pwd", "clear", "unlock", "hint"].includes(c));
  const rendered = cmds.map((c) => `<code>${c}</code>`).join(" ");
  tipsLineEl.innerHTML = `Start mit <code>help</code>. Lernbefehle in diesem Level: ${rendered}.`;
  const rule = ETHICS_RULES[state.levelIndex % ETHICS_RULES.length];
  ethicsEl.innerHTML = `<b>Ethik-Kompass:</b> ${rule}`;
  renderOnboarding();
}

function currentProgressRatio() {
  if (LEVELS.length <= 1) return 1;
  return state.levelIndex / (LEVELS.length - 1);
}

function titleByProgress(progress) {
  let current = TITLE_STEPS[0].title;
  for (const step of TITLE_STEPS) {
    if (progress >= step.minProgress) current = step.title;
  }
  return current;
}

function currentRoleTitle() {
  return titleByProgress(currentProgressRatio());
}

function updateRoleTitle() {
  if (!roleLabelEl) return;
  roleLabelEl.textContent = `${currentRoleTitle()}:`;
}

function updateProgressUI() {
  if (!progressTextEl || !progressFillEl) return;
  const current = Math.max(1, state.levelIndex + 1);
  const total = Math.max(1, LEVELS.length);
  const percent = Math.round((current / total) * 100);
  progressTextEl.textContent = `${percent}% (${current}/${total})`;
  progressFillEl.style.width = `${percent}%`;
}

function hasAnyAction(action) {
  const prefix = `${action}:`;
  return Object.keys(state.actionState).some((k) => k === action || k.startsWith(prefix));
}

function isLearningStepDone(step) {
  const label = String(step || "").trim().toLowerCase();
  if (!label) return false;
  if (label === "help") return hasAction(state.actionState, "help");
  if (label === "cd .." || label === "cd") return hasAnyAction("cd");
  if (label === "ls -a") return hasAnyAction("ls-a");
  if (label.startsWith("man ")) {
    const topic = label.split(/\s+/)[1];
    return hasAction(state.actionState, "man", topic);
  }
  if (label.startsWith("echo")) return hasAnyAction("echo");
  const command = label.split(/\s+/)[0];
  return hasAnyAction(command);
}

function buildOnboardingSteps(level) {
  if (level.id === 0) {
    return [
      { label: "Tippe help", done: hasAction(state.actionState, "help") },
      { label: "Setze deinen Namen: setname DEINNAME", done: hasAction(state.actionState, "setname") },
      { label: "Bestaetige mit unlock BEREIT", done: false }
    ];
  }

  if (level.id === 1) {
    return [
      { label: "Schau dich um: ls", done: hasAnyAction("ls") },
      { label: "Wechsle in den Ordner desktop: cd desktop", done: hasAction(state.actionState, "cd", "/desktop") },
      { label: "Lies die Datei: cat hinweis.txt", done: hasAction(state.actionState, "cat", "/desktop/hinweis.txt") },
      { label: "Dann entsperren: unlock MONDSTEIN", done: false }
    ];
  }

  const learning = Array.isArray(level.learningCommands) ? level.learningCommands : [];
  const steps = learning.slice(0, 2).map((item) => ({
    label: `Lernbefehl: ${item}`,
    done: isLearningStepDone(item)
  }));
  steps.push({ label: "Mission abschliessen mit unlock CODE", done: false });
  return steps;
}

function renderOnboarding() {
  if (!onboardingEl) return;
  const level = currentLevel();
  const steps = buildOnboardingSteps(level);
  const nextStep = steps.find((s) => !s.done);
  const unlockHint = buildUnlockFailureMessage(level);
  const nextLine = nextStep ? nextStep.label : "Super, jetzt fehlt nur noch unlock mit dem richtigen Code.";

  const listHtml = steps
    .map((s) => `<li class="onboarding-item${s.done ? " done" : ""}">${s.done ? "[x]" : "[ ]"} ${s.label}</li>`)
    .join("");

  onboardingEl.innerHTML =
    `<div class="onboarding-title">Start-Hilfe</div>` +
    `<ul class="onboarding-list">${listHtml}</ul>` +
    `<div class="onboarding-next"><b>Naechster Schritt:</b> ${nextLine}</div>` +
    (unlockHint ? `<div class="muted">Unlock-Hinweis: ${unlockHint}</div>` : "");
}

function updateOnboardingVisibility() {
  if (!onboardingEl || !onboardingToggleBtnEl) return;
  onboardingEl.classList.toggle("is-hidden", !state.onboardingVisible);
  onboardingToggleBtnEl.textContent = state.onboardingVisible ? "Lernhilfe: An" : "Lernhilfe: Aus";
}

function toggleOnboarding() {
  state.onboardingVisible = !state.onboardingVisible;
  updateOnboardingVisibility();
  persistState();
}

function sanitizePlayerName(raw) {
  const cleaned = (raw || "").replace(/[^\p{L}\p{N}\s_-]/gu, "").trim();
  return cleaned.slice(0, 18);
}

function setPlayerName(name, announce = false) {
  const finalName = sanitizePlayerName(name) || "Analyst";
  state.playerName = finalName;
  agentNameEl.textContent = finalName;
  setStory();
  persistState();
  if (announce) {
    print(`Super, ${finalName}! Dein Analystenname ist gespeichert.`, "ok");
  }
}

function applyTheme(theme, announce = false) {
  const nextTheme = THEMES.has(theme) ? theme : "ocean";
  state.theme = nextTheme;
  document.body.dataset.theme = nextTheme;
  themeSelectEl.value = nextTheme;
  persistState();
  if (announce) {
    print(`Design gewechselt: ${themeSelectEl.options[themeSelectEl.selectedIndex].text}`, "ok");
  }
}

function updateMusicButton() {
  if (!state.musicEnabled) {
    musicBtnEl.textContent = "♪ Aus";
    return;
  }
  if (music.mode === "audio") {
    musicBtnEl.textContent = "♪ An";
    return;
  }
  musicBtnEl.textContent = "♪ An";
}

function ensureAudioPlayer() {
  if (music.audioEl) return;
  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = 0.35;
  audio.addEventListener("ended", async () => {
    if (!state.musicEnabled || music.mode !== "audio" || !music.playlist.hasTracks()) return;
    const idx = music.playlist.moveNext();
    const ok = await playLicensedTrack(idx);
    if (ok) {
      print(`Jetzt laeuft: ${currentTrackTitle()}`, "muted");
      return;
    }
    const recovered = await tryStartLicensedPlaylist();
    if (recovered) print(`Jetzt laeuft: ${currentTrackTitle()}`, "muted");
  });
  music.audioEl = audio;
}

async function playLicensedTrack(index) {
  if (!music.playlist.hasTracks()) return false;
  if (!Number.isInteger(index) || index < 0) return false;
  ensureAudioPlayer();
  const track = LICENSED_TRACKS[index];
  if (!track) return false;
  music.playlist.setCurrentByAbsoluteIndex(index);
  music.audioEl.src = track.src;
  music.audioEl.currentTime = 0;
  try {
    await music.audioEl.play();
    return true;
  } catch (_) {
    return false;
  }
}

async function tryStartLicensedPlaylist() {
  if (!music.playlist.hasTracks()) return false;
  const candidates = music.playlist.getStartCandidates();
  for (const idx of candidates) {
    const ok = await playLicensedTrack(idx);
    if (ok) {
      music.mode = "audio";
      return true;
    }
  }
  return false;
}

async function toggleMusic() {
  if (!state.musicEnabled) {
    const startedLicensed = await tryStartLicensedPlaylist();
    if (!startedLicensed) {
      print("Keine freie Musikdatei gefunden. Lege Tracks in assets/music ab.", "warn");
      return;
    }
    print(`Hintergrundmusik aktiviert: ${currentTrackTitle()}`, "ok");
    state.musicEnabled = true;
    persistState();
    updateMusicButton();
    return;
  }

  if (music.mode === "audio" && music.audioEl) {
    music.audioEl.pause();
    music.audioEl.currentTime = 0;
  }
  music.mode = null;
  state.musicEnabled = false;
  persistState();
  print("Musik pausiert.", "muted");
  updateMusicButton();
}

function persistState() {
  try {
    const snapshot = {
      saveVersion: SAVE_SCHEMA_VERSION,
      contentVersion: CONTENT_VERSION,
      levelIndex: state.levelIndex,
      score: state.score,
      cwd: state.cwd,
      hintIndex: state.hintIndex,
      actionState: state.actionState,
      fs: state.fs,
      onboardingVisible: state.onboardingVisible,
      playerName: state.playerName,
      theme: state.theme,
      musicEnabled: state.musicEnabled
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  } catch (_) {
    // localStorage kann im privaten Modus blockiert sein.
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const migrated = parseAndMigrateSave(raw, {
      contentVersion: CONTENT_VERSION,
      levelsLength: LEVELS.length,
      getStartCwd: (idx) => LEVELS[idx]?.startCwd || "/",
      themes: THEMES
    });
    return migrated;
  } catch (_) {
    return null;
  }
}

function startLevel(index, options = {}) {
  const announce = options.announce !== false;
  const previousLevel = LEVELS[state.levelIndex];
  state.levelIndex = index;
  state.hintIndex = 0;
  state.pendingRemove = null;
  state.actionState = {};
  state.fs = cloneFs(LEVELS[index].fs);
  state.cwd = LEVELS[index].startCwd;
  setStory();
  if (announce) {
    const lvl = currentLevel();
    const previousChapter = previousLevel && previousLevel.chapterId ? previousLevel.chapterId : null;
    const nextChapter = lvl.chapterId || null;
    if (index === 0 || previousChapter !== nextChapter) {
      print(`=== ${lvl.chapterTitle || "Neues Kapitel"} ===`, "accent");
      if (lvl.chapterIntro) print(lvl.chapterIntro, "muted");
    }
    print(`Neue Mission fuer ${playerAddress()}: ${lvl.title}`, "ok");
    if (lvl.introText) print(lvl.introText, "muted");
    print(`${playerAddress()}, tippe help fuer alle Befehle.`, "muted");
    if (index === 0) printOnboardingWelcome();
  }
  persistState();
}

function restoreProgress(saved) {
  startLevel(saved.levelIndex, { announce: false });
  state.score = saved.score;
  state.hintIndex = saved.hintIndex;
  state.actionState = saved.actionState && typeof saved.actionState === "object" ? { ...saved.actionState } : {};
  state.onboardingVisible = typeof saved.onboardingVisible === "boolean" ? saved.onboardingVisible : false;
  // Nach Reload darf Musik erst nach einer echten Nutzeraktion als "An" gelten.
  state.musicEnabled = false;
  applyTheme(saved.theme || "ocean");
  if (saved.playerName) {
    setPlayerName(saved.playerName);
  } else {
    setPlayerName("Analyst");
  }
  if (saved.fs) {
    state.fs = cloneFs(saved.fs);
  }
  const node = getNode(saved.cwd);
  if (node && node.type === "dir") {
    state.cwd = saved.cwd;
  }
  setStory();
  updateOnboardingVisibility();
  persistState();
  updateMusicButton();
  if (saved.migratedFromOldContent) {
    print("Spielstand wurde an die neue Level-Version angepasst.", "muted");
  }
  print(`Willkommen zurueck, ${playerAddress()}! Spielstand geladen.`, "ok");
  if (state.levelIndex === 0 && !hasAction(state.actionState, "setname")) {
    printOnboardingWelcome();
  }
}

function getNode(path) {
  const parts = path.split("/").filter(Boolean);
  let node = state.fs["/"];
  if (!node) return null;
  for (const p of parts) {
    if (!node.children || !node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

function normalizePath(path) {
  const stack = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return "/" + stack.join("/");
}

function resolvePath(arg) {
  if (!arg || arg.trim() === "") return state.cwd;
  if (arg.startsWith("/")) return normalizePath(arg);
  return normalizePath((state.cwd === "/" ? "" : state.cwd) + "/" + arg);
}

function splitFilePath(path) {
  const parts = normalizePath(path).split("/").filter(Boolean);
  const name = parts.pop();
  if (!name) return null;
  const parentPath = "/" + parts.join("/");
  return { parentPath: parentPath === "/" ? "/" : normalizePath(parentPath), name };
}

function hasReadAccess(node) {
  if (!node.mode) return true;
  const first = Number(node.mode[0]);
  return Number.isInteger(first) && (first & 4) === 4;
}

function hasWriteAccess(node) {
  if (!node.mode) return true;
  const first = Number(node.mode[0]);
  return Number.isInteger(first) && (first & 2) === 2;
}

function evaluateUnlockRequirements(level) {
  const rule = buildUnlockRule(level);
  return evaluateRule(rule, {
    normalizePath,
    getNode,
    hasAction: (action, detail) => hasAction(state.actionState, action, detail)
  });
}

function explainMissingFlag(rule) {
  const key = rule.key || "";
  const value = String(rule.value || "");
  if (key === "setname") return "Setze zuerst deinen Namen mit setname DEINNAME.";
  if (key === "cat") return `Lies zuerst die Datei ${value}.`;
  if (key === "ls-a") return `Nutze erst ls -a in ${value || "dem richtigen Ordner"}.`;
  if (key === "grep-term") {
    const [path, term] = value.split("|");
    if (path && term) return `Suche zuerst mit grep ${term} in ${path}.`;
    return "Nutze zuerst grep mit dem richtigen Suchwort.";
  }
  if (key === "head" || key === "tail") return `Schau zuerst mit ${key} in ${value}.`;
  if (key === "chmod") return "Setze zuerst die geforderten Rechte mit chmod.";
  if (key === "ps") return "Fuehre zuerst ps aus.";
  return "Fuehre zuerst den geforderten Befehl aus.";
}

function explainRuleFailure(rule) {
  if (!rule || !rule.type) return null;
  switch (rule.type) {
    case "flag":
      return explainMissingFlag(rule);
    case "dirExists":
      return `Erstelle zuerst den Ordner ${rule.path}.`;
    case "fileExists":
      return `Erstelle zuerst die Datei ${rule.path}.`;
    case "fileMissing":
      return `Raeume auf: ${rule.path} sollte nicht mehr vorhanden sein.`;
    case "fileContains":
      return `In ${rule.path} fehlt noch der richtige Inhalt.`;
    case "modeEquals":
      return `Setze zuerst die Rechte ${rule.mode} auf ${rule.path}.`;
    case "anyOf": {
      if (!Array.isArray(rule.failures) || !rule.failures.length) {
        return "Es fehlt noch mindestens einer von mehreren moeglichen Schritten.";
      }
      const options = rule.failures
        .map((f) => explainRuleFailure(f))
        .filter(Boolean)
        .slice(0, 2);
      if (!options.length) return "Es fehlt noch mindestens einer von mehreren moeglichen Schritten.";
      return `Noch nicht ganz: ${options.join(" ODER ")}`;
    }
    case "not":
      return "Dieser Schritt darf fuer das Entsperren nicht erfuellt sein.";
    default:
      return null;
  }
}

function buildUnlockFailureMessage(level) {
  const rule = buildUnlockRule(level);
  const detail = evaluateRuleDetailed(rule, {
    normalizePath,
    getNode,
    hasAction: (action, info) => hasAction(state.actionState, action, info)
  });
  if (detail.ok) return null;
  return explainRuleFailure(detail.failedRule) || level.unlockHint || "Vor dem Entsperren fehlen noch Missionsschritte.";
}

function isAllowed(command) {
  if (command === "man" || command === "ethik" || command === "setname" || command === "jump" || command === "nexttrack" || command === "next" || command === "restart") return true;
  return currentLevel().allowed.includes(command);
}

function suggestUsefulCommand() {
  const learn = currentLevel().learningCommands || [];
  if (learn.length) return learn[0].replace(" ", " ");
  return "help";
}

function cmdHelp() {
  markAction("help");
  const allowed = [...currentLevel().allowed];
  if (!allowed.includes("man")) allowed.push("man");
  if (!allowed.includes("ethik")) allowed.push("ethik");
  if (!allowed.includes("setname")) allowed.push("setname");
  if (!allowed.includes("jump")) allowed.push("jump");
  if (!allowed.includes("nexttrack")) allowed.push("nexttrack");
  if (!allowed.includes("restart")) allowed.push("restart");
  print("Erlaubte Befehle: " + allowed.join(", "));
  print("Kurz-Erklärung:");
  for (const cmdName of allowed) {
    const info = COMMAND_INFO[cmdName];
    if (!info) continue;
    print(`  ${cmdName} -> ${info.desc}`);
  }
}

function cmdSetName(arg) {
  if (!arg || !arg.trim()) return print("Nutzung: setname DEINNAME", "warn");
  setPlayerName(arg, true);
  markAction("setname");
}

function cmdEthik() {
  print("Ethik-Regeln fuer CyberQuest:", "accent");
  ETHICS_RULES.forEach((rule, idx) => print(`${idx + 1}. ${rule}`));
}

function parseJumpPassword(input) {
  const token = (input || "").trim().toUpperCase();
  if (!token) return -1;

  const levelByPattern = token.match(/^(?:LEVEL|L|SPRUNG)\s*([0-9]{1,2})$/);
  if (levelByPattern) {
    const levelNumber = Number(levelByPattern[1]);
    const idx = levelNumber - 1;
    if (idx >= 0 && idx < LEVELS.length) return idx;
    return -1;
  }

  const idxByCustom = LEVELS.findIndex((lvl) =>
    typeof lvl.jumpPassword === "string" && lvl.jumpPassword.toUpperCase() === token
  );
  return idxByCustom;
}

function scoreForLevelStart(levelIndex) {
  return LEVELS
    .slice(0, levelIndex)
    .reduce((sum, lvl) => sum + (Number(lvl.points) || 0), 0);
}

function cmdJump(arg) {
  const idx = parseJumpPassword(arg);
  if (idx < 0) return print("Ungueltiges Sprungpasswort. Beispiel: jump LEVEL3", "warn");
  if (idx === state.levelIndex) return print("Du bist bereits in diesem Level.", "muted");

  state.score = scoreForLevelStart(idx);
  startLevel(idx);
  setStory();
  persistState();
  print(`${playerAddress()}, Sprung erfolgreich: ${currentLevel().title}`, "ok");
}

async function cmdNextTrack() {
  if (!music.playlist.hasTracks()) {
    print("Keine freien Musikdateien konfiguriert. Lege Tracks in assets/music ab.", "warn");
    return;
  }
  if (!state.musicEnabled) {
    print("Musik ist aus. Starte sie zuerst ueber den Musik-Button.", "warn");
    return;
  }

  const idx = music.playlist.moveNext();
  const ok = await playLicensedTrack(idx);
  if (!ok) {
    const recovered = await tryStartLicensedPlaylist();
    if (!recovered) {
      print("Der naechste Track konnte nicht geladen werden.", "err");
      return;
    }
    print(`Naechster Track: ${currentTrackTitle()}`, "ok");
    return;
  }

  music.mode = "audio";
  updateMusicButton();
  print(`Naechster Track: ${currentTrackTitle()}`, "ok");
}

function resetProgress() {
  state.score = 0;
  state.hintIndex = 0;
  state.pendingRemove = null;
  state.fs = null;
  state.cwd = "/";
}

function stopMusicPlayback() {
  if (music.audioEl) {
    music.audioEl.pause();
    music.audioEl.currentTime = 0;
  }
  music.mode = null;
  state.musicEnabled = false;
  updateMusicButton();
}

function restartGame(force = false) {
  if (!force) {
    const ok = window.confirm("Wirklich neu starten? Dein Fortschritt wird zurueckgesetzt.");
    if (!ok) return;
  }

  resetProgress();
  stopMusicPlayback();
  out.innerHTML = "";
  localStorage.removeItem(SAVE_KEY);
  startLevel(0);
  persistState();
  print(`${playerAddress()}, dein Spiel wurde komplett neu gestartet. Viel Erfolg!`, "ok");
}

function cmdRestart(arg) {
  const force = (arg || "").trim() === "--ja";
  restartGame(force);
}

function cmdStory() {
  print(currentLevel().title, "accent");
  print(`${playerAddress()}, ${currentLevel().briefing}`);
  print("Ziel: " + currentLevel().objective.replace(/<[^>]+>/g, ""), "muted");
}

function printOnboardingWelcome() {
  if (state.levelIndex !== 0) return;
  print("So startest du schnell:", "accent");
  print("1) help");
  print("2) setname DEINNAME");
  print("3) unlock BEREIT", "muted");
}

function cmdPwd() {
  print(state.cwd);
}

function isHiddenName(name) {
  return name.startsWith(".");
}

function cmdLs(argString) {
  const args = argString.split(" ").filter(Boolean);
  let showAll = false;
  let longView = false;
  let targetPath = null;

  for (const token of args) {
    if (token.startsWith("-")) {
      for (const flag of token.slice(1)) {
        if (flag === "a") showAll = true;
        else if (flag === "l") longView = true;
        else return print(`ls: unbekannte Option -${flag}`, "err");
      }
    } else if (!targetPath) {
      targetPath = token;
    } else {
      return print("Nutzung: ls [-a] [-l] [PFAD]", "warn");
    }
  }

  const path = resolvePath(targetPath || "");
  const node = getNode(path);
  if (!node || node.type !== "dir") return print("Ordner nicht gefunden.", "err");
  markAction("ls", path);
  if (showAll) markAction("ls-a", path);

  const items = Object.entries(node.children || {})
    .filter(([name]) => showAll || !isHiddenName(name))
    .map(([name, child]) => ({ name, child }));

  if (!items.length) return print("(leer)");

  if (!longView) {
    const names = items.map(({ name, child }) => child.type === "dir" ? name + "/" : name);
    return print(names.join("  "));
  }

  items.forEach(({ name, child }) => {
    const mode = child.mode || (child.type === "dir" ? "755" : "644");
    const typeMarker = child.type === "dir" ? "d" : "-";
    const renderedName = child.type === "dir" ? name + "/" : name;
    print(`${typeMarker}${mode} ${renderedName}`);
  });
}

function cmdMan(arg) {
  const topic = (arg || "").trim().toLowerCase();
  if (!topic) {
    const topics = Object.keys(MAN_PAGES).sort().join(", ");
    print("Nutzung: man THEMA", "warn");
    print("Verfuegbare Themen: " + topics);
    return;
  }
  const page = MAN_PAGES[topic];
  if (!page) return print(`Keine Mini-Manpage fuer '${topic}' gefunden.`, "err");
  markAction("man", topic);
  print(page.title, "accent");
  print("ZWECK");
  print("  " + page.purpose);
  print("NUTZUNG");
  print("  " + page.usage);
  if (page.examples && page.examples.length) {
    print("BEISPIELE");
    for (const ex of page.examples) print("  " + ex);
  }
  if (page.note) {
    print("HINWEIS");
    print("  " + page.note);
  }
}

function cmdCd(arg) {
  if (!arg) return print("Nutzung: cd ORDNER", "warn");
  const path = resolvePath(arg);
  const node = getNode(path);
  if (!node || node.type !== "dir") return print("Diesen Ordner gibt es nicht.", "err");
  state.cwd = path;
  markAction("cd", path);
  persistState();
}

function cmdCat(arg) {
  if (!arg) return print("Nutzung: cat DATEI", "warn");
  const path = resolvePath(arg);
  const node = getNode(path);
  if (!node) return print("Datei nicht gefunden.", "err");
  if (node.type !== "file") return print("Das ist keine Datei.", "err");
  if (!hasReadAccess(node)) return print("Keine Leserechte. Tipp: chmod nutzen.", "err");
  markAction("cat", path);
  print(node.content);
}

function cmdGrep(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (args.length < 2) return print("Nutzung: grep SUCHTEXT DATEI", "warn");
  const [term, ...rest] = args;
  const fileArg = rest.join(" ");
  const path = resolvePath(fileArg);
  const node = getNode(path);
  if (!node || node.type !== "file") return print("Datei nicht gefunden.", "err");
  const lines = node.content.split("\n");
  const hits = lines.filter((line) => line.includes(term));
  markAction("grep", path);
  markAction("grep-term", `${path}|${term}`);
  if (!hits.length) return print("Keine Treffer.");
  hits.forEach((line) => print(line));
}

function findInTree(node, currentPath, targetName, results) {
  if (node.type !== "dir") return;
  const children = node.children || {};
  for (const [name, child] of Object.entries(children)) {
    const childPath = normalizePath(currentPath + "/" + name);
    if (name === targetName) results.push(childPath);
    if (child.type === "dir") findInTree(child, childPath, targetName, results);
  }
}

function cmdFind(arg) {
  if (!arg) return print("Nutzung: find DATEINAME", "warn");
  const root = getNode("/");
  const results = [];
  findInTree(root, "", arg.trim(), results);
  if (!results.length) return print("Nichts gefunden.");
  results.forEach((r) => print(r));
}

function cmdHead(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (!args.length) return print("Nutzung: head DATEI", "warn");
  const path = resolvePath(args.join(" "));
  const node = getNode(path);
  if (!node || node.type !== "file") return print("Datei nicht gefunden.", "err");
  markAction("head", path);
  print(node.content.split("\n").slice(0, 3).join("\n"));
}

function cmdTail(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (!args.length) return print("Nutzung: tail DATEI", "warn");
  const path = resolvePath(args.join(" "));
  const node = getNode(path);
  if (!node || node.type !== "file") return print("Datei nicht gefunden.", "err");
  markAction("tail", path);
  const lines = node.content.split("\n").filter((x) => x !== "");
  print(lines.slice(Math.max(0, lines.length - 3)).join("\n"));
}

function ensureParentDir(path) {
  const meta = splitFilePath(path);
  if (!meta) return null;
  const parent = getNode(meta.parentPath);
  if (!parent || parent.type !== "dir") return null;
  return { parent, name: meta.name };
}

function cmdMkdir(arg) {
  if (!arg) return print("Nutzung: mkdir ORDNER", "warn");
  const path = resolvePath(arg);
  const meta = ensureParentDir(path);
  if (!meta) return print("Ordnerpfad ungueltig.", "err");
  if (meta.parent.children[meta.name]) return print("Ordner oder Datei existiert bereits.", "err");
  meta.parent.children[meta.name] = { type: "dir", children: {} };
  markAction("mkdir", path);
  persistState();
  print("Ordner erstellt: " + path, "ok");
}

function cmdTouch(arg) {
  if (!arg) return print("Nutzung: touch DATEI", "warn");
  const path = resolvePath(arg);
  const meta = ensureParentDir(path);
  if (!meta) return print("Dateipfad ungueltig.", "err");
  const existing = meta.parent.children[meta.name];
  if (existing && existing.type === "dir") return print("Ein Ordner hat bereits diesen Namen.", "err");
  if (!existing) {
    meta.parent.children[meta.name] = { type: "file", content: "", mode: "644" };
    print("Datei erstellt: " + path, "ok");
  } else {
    print("Datei existiert schon: " + path, "muted");
  }
  markAction("touch", path);
  persistState();
}

function cmdCp(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (args.length !== 2) return print("Nutzung: cp QUELLE ZIEL", "warn");
  const source = getNode(resolvePath(args[0]));
  if (!source || source.type !== "file") return print("Quelle nicht gefunden oder kein Datei-Typ.", "err");
  const targetPath = resolvePath(args[1]);
  const meta = ensureParentDir(targetPath);
  if (!meta) return print("Zielpfad ungueltig.", "err");
  meta.parent.children[meta.name] = { type: "file", content: source.content, mode: source.mode || "644" };
  markAction("cp", targetPath);
  persistState();
  print("Datei kopiert.", "ok");
}

function cmdMv(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (args.length !== 2) return print("Nutzung: mv QUELLE ZIEL", "warn");
  const sourcePath = resolvePath(args[0]);
  const sourceMeta = ensureParentDir(sourcePath);
  if (!sourceMeta) return print("Quellpfad ungueltig.", "err");
  const sourceNode = sourceMeta.parent.children[sourceMeta.name];
  if (!sourceNode || sourceNode.type !== "file") return print("Quelle nicht gefunden oder kein Datei-Typ.", "err");
  const targetPath = resolvePath(args[1]);
  const targetMeta = ensureParentDir(targetPath);
  if (!targetMeta) return print("Zielpfad ungueltig.", "err");
  targetMeta.parent.children[targetMeta.name] = sourceNode;
  delete sourceMeta.parent.children[sourceMeta.name];
  markAction("mv", targetPath);
  persistState();
  print("Datei verschoben.", "ok");
}

function cmdRm(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (!args.length) return print("Nutzung: rm DATEI oder rm --ja DATEI", "warn");
  let force = false;
  let targetArg = args[0];
  if (args[0] === "--ja") {
    force = true;
    targetArg = args[1];
  }
  if (!targetArg) return print("Nutzung: rm --ja DATEI", "warn");
  const targetPath = resolvePath(targetArg);
  const meta = ensureParentDir(targetPath);
  if (!meta) return print("Dateipfad ungueltig.", "err");
  const node = meta.parent.children[meta.name];
  if (!node || node.type !== "file") return print("Datei nicht gefunden.", "err");
  if (!force) {
    state.pendingRemove = targetPath;
    return print(`Sicher? Tippe: rm --ja ${targetArg}`, "warn");
  }
  if (state.pendingRemove && state.pendingRemove !== targetPath) {
    return print("Bitte bestaetige zuerst die zuletzt angefragte Loeschung.", "warn");
  }
  delete meta.parent.children[meta.name];
  state.pendingRemove = null;
  markAction("rm", targetPath);
  persistState();
  print("Datei geloescht.", "ok");
}

function cmdEcho(rawInput) {
  const marker = ">";
  const idx = rawInput.indexOf(marker);
  if (idx === -1) return print("Nutzung: echo TEXT > DATEI", "warn");
  const textPart = rawInput.slice(0, idx).trim();
  const filePart = rawInput.slice(idx + 1).trim();
  if (!textPart || !filePart) return print("Nutzung: echo TEXT > DATEI", "warn");
  const path = resolvePath(filePart);
  const meta = ensureParentDir(path);
  if (!meta) return print("Dateipfad ungueltig.", "err");
  meta.parent.children[meta.name] = { type: "file", content: textPart, mode: "644" };
  markAction("echo", path);
  persistState();
  print("Text gespeichert in " + path, "ok");
}

function cmdChmod(argString) {
  const args = argString.split(" ").filter(Boolean);
  if (args.length < 2) return print("Nutzung: chmod MODUS DATEI", "warn");
  const [mode, ...rest] = args;
  if (!/^[0-7]{3}$/.test(mode)) return print("Modus muss aus drei Ziffern 0-7 bestehen, z. B. 644.", "err");
  const path = resolvePath(rest.join(" "));
  const node = getNode(path);
  if (!node || node.type !== "file") return print("Datei nicht gefunden.", "err");
  node.mode = mode;
  markAction("chmod", `${path}|${mode}`);
  persistState();
  print(`Rechte gesetzt: ${mode} ${path}`, "ok");
}

function cmdNano(arg) {
  if (!arg) return print("Nutzung: nano DATEI", "warn");
  const path = resolvePath(arg);
  const node = getNode(path);

  if (node && node.type !== "file") return print("nano kann nur Dateien bearbeiten.", "err");
  if (node && !hasWriteAccess(node)) return print("Keine Schreibrechte fuer diese Datei.", "err");

  state.editor = {
    path,
    buffer: node ? node.content.split("\n") : []
  };
  print(`nano ${path} gestartet. Schreibe Zeilen und speichere mit :wq`, "accent");
  print("Mit :q! kannst du abbrechen.", "muted");
}

function finishEditor(saveChanges) {
  if (!state.editor) return;
  if (!saveChanges) {
    state.editor = null;
    print("nano beendet ohne Speichern.", "warn");
    return;
  }

  const meta = splitFilePath(state.editor.path);
  if (!meta) {
    state.editor = null;
    return print("Ungueltiger Dateipfad.", "err");
  }
  const parent = getNode(meta.parentPath);
  if (!parent || parent.type !== "dir") {
    state.editor = null;
    return print("Zielordner existiert nicht.", "err");
  }

  if (!parent.children[meta.name]) {
    parent.children[meta.name] = { type: "file", content: "", mode: "644" };
  }
  const target = parent.children[meta.name];
  if (target.type !== "file") {
    state.editor = null;
    return print("Ziel ist keine Datei.", "err");
  }
  if (!hasWriteAccess(target)) {
    state.editor = null;
    return print("Keine Schreibrechte fuer diese Datei.", "err");
  }

  target.content = state.editor.buffer.join("\n");
  state.editor = null;
  persistState();
  print("Datei gespeichert.", "ok");
}

function handleEditorInput(input) {
  if (!state.editor) return;
  if (input === ":wq") return finishEditor(true);
  if (input === ":q!") return finishEditor(false);
  state.editor.buffer.push(input);
  print("[nano] " + input, "muted");
}

function cmdPing(arg) {
  const host = (arg || "").trim();
  if (!host) return print("Nutzung: ping HOST", "warn");
  const net = currentLevel().network || {};
  const pingMap = net.ping || {};
  if (!pingMap[host]) return print(`Host ${host} nicht erreichbar.`, "err");
  pingMap[host].forEach((line) => print(line));
}

function cmdIp() {
  const net = currentLevel().network || {};
  const lines = net.ip || [
    "1: lo: <LOOPBACK,UP> mtu 65536",
    "2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500",
    "    inet 192.168.0.20/24 brd 192.168.0.255 scope global eth0"
  ];
  lines.forEach((line) => print(line));
}

function cmdNetstat() {
  const net = currentLevel().network || {};
  const lines = net.netstat || [
    "Proto Local Address   Foreign Address  State",
    "tcp   127.0.0.1:8080  127.0.0.1:53780 ESTABLISHED"
  ];
  lines.forEach((line) => print(line));
}

function cmdPs() {
  const lines = currentLevel().processes || [
    "PID  NAME           STATUS",
    "101  game-engine    running",
    "130  helper         idle"
  ];
  markAction("ps");
  lines.forEach((line) => print(line));
}

function cmdHint() {
  const hints = currentLevel().hints || [];
  if (!hints.length) return print("Für dieses Level gibt es keinen Tipp.");
  const i = Math.min(state.hintIndex, hints.length - 1);
  print(`${playerAddress()}, Tipp: ${hints[i]}`, "accent");
  state.hintIndex += 1;
  persistState();
}

function printKnowledgeCard(level) {
  const card = level.knowledgeCard;
  if (!card) return;
  print("=== Wissenskarte ===", "accent");
  if (card.title) print(card.title, "accent");
  if (card.text) print(card.text);
  if (card.example) print("Beispiel: " + card.example, "muted");
}

function printFinalAsciiArt() {
  print(" ");
  print("   _____      _               ____                  _   ");
  print("  / ____|    | |             / __ \\                | |  ");
  print(" | |    _   _| |__   ___ _ _| |  | |_   _  ___  ___| |_ ");
  print(" | |   | | | | '_ \\ / _ \\ '__| |  | | | | |/ _ \\/ __| __|");
  print(" | |___| |_| | |_) |  __/ |  | |__| | |_| |  __/\\__ \\ |_ ");
  print("  \\_____\\__, |_.__/ \\___|_|   \\___\\_\\\\__,_|\\___||___/\\__|");
  print("         __/ |                                             ");
  print("        |___/         MISSION COMPLETE                     ");
  print(" ");
  print("      [##########] CYBERQUEST ERFOLGREICH ABGESCHLOSSEN");
  print(" ");
}

function printPromotionIfNeeded(previousTitle, nextTitle) {
  if (!previousTitle || !nextTitle) return;
  if (previousTitle === nextTitle) return;
  print(`Beförderung freigeschaltet! Du bist jetzt: ${nextTitle}`, "accent");
}

function cmdUnlock(arg) {
  const word = (arg || "").trim().toUpperCase();
  if (!word) return print("Nutzung: unlock PASSWORT", "warn");
  const level = currentLevel();

  if (!evaluateUnlockRequirements(level)) {
    const hint = buildUnlockFailureMessage(level) || level.unlockHint || "Vor dem Entsperren fehlen noch Missionsschritte.";
    print(`${playerAddress()}, fast! ${hint}`, "warn");
    return;
  }

  if (word !== level.successWord) {
    print(`Fast, ${playerAddress()}! Noch nicht richtig. Pruefe die Spuren erneut.`, "err");
    return;
  }

  const titleBeforeCompletion = currentRoleTitle();
  state.score += level.points;
  setStory();
  print(`Stark, ${playerAddress()}! Mission geschafft! +${level.points} Punkte`, "ok");
  if (level.successText) print(level.successText, "ok");
  printKnowledgeCard(level);

  const next = state.levelIndex + 1;
  if (next < LEVELS.length) {
    print("Nächstes Level wird geladen...", "muted");
    startLevel(next);
    const titleAfterProgress = currentRoleTitle();
    printPromotionIfNeeded(titleBeforeCompletion, titleAfterProgress);
  } else {
    print(`${playerAddress()}, alle Missionen abgeschlossen. Du bist jetzt CyberQuest ${titleByProgress(1)}!`, "ok");
    printPromotionIfNeeded(titleBeforeCompletion, titleByProgress(1));
    print("Ben: 'Der Digitalschatten hat uns nicht angegriffen - er hat uns geprueft.'", "accent");
    print("Frau Weber: 'Sicherheit heisst Verantwortung, nicht Chaos.'", "accent");
    printFinalAsciiArt();
    print("Herzlichen Glückwunsch!", "muted");
    persistState();
  }
}

function runCommand(input) {
  if (state.editor) return handleEditorInput(input);
  const trimmed = input.trim();
  if (!trimmed) return;

  if (trimmed.toLowerCase().startsWith("echo ")) {
    if (!isAllowed("echo")) {
      return print(`Fast! In diesem Level brauchst du eher ${suggestUsefulCommand()}.`, "warn");
    }
    return cmdEcho(trimmed.slice(5));
  }

  const [raw, ...rest] = trimmed.split(/\s+/);
  const command = raw.toLowerCase();
  const arg = rest.join(" ");

  if (!isAllowed(command)) {
    print(`Fast! Dieser Befehl passt hier noch nicht. Versuch mal ${suggestUsefulCommand()}.`, "warn");
    return;
  }

  switch (command) {
    case "help": return cmdHelp();
    case "story": return cmdStory();
    case "ethik": return cmdEthik();
    case "setname": return cmdSetName(arg);
    case "pwd": return cmdPwd();
    case "ls": return cmdLs(arg);
    case "man": return cmdMan(arg);
    case "cd": return cmdCd(arg);
    case "cat": return cmdCat(arg);
    case "grep": return cmdGrep(arg);
    case "find": return cmdFind(arg);
    case "head": return cmdHead(arg);
    case "tail": return cmdTail(arg);
    case "mkdir": return cmdMkdir(arg);
    case "touch": return cmdTouch(arg);
    case "cp": return cmdCp(arg);
    case "mv": return cmdMv(arg);
    case "rm": return cmdRm(arg);
    case "echo": return cmdEcho(arg);
    case "chmod": return cmdChmod(arg);
    case "nano": return cmdNano(arg);
    case "ping": return cmdPing(arg);
    case "ip": return cmdIp();
    case "netstat": return cmdNetstat();
    case "ps": return cmdPs();
    case "hint": return cmdHint();
    case "clear": out.innerHTML = ""; return;
    case "jump": return cmdJump(arg);
    case "nexttrack":
    case "next":
      void cmdNextTrack();
      return;
    case "restart":
      return cmdRestart(arg);
    case "unlock": return cmdUnlock(arg);
    default: return print("Unbekannter Befehl.", "err");
  }
}

cmd.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const input = cmd.value;
  cmd.value = "";
  if (state.editor) {
    print(`nano:${state.editor.path}$ ${input}`, "prompt");
  } else {
    promptLine(input);
  }
  runCommand(input);
});

themeSelectEl.addEventListener("change", () => applyTheme(themeSelectEl.value, true));
hintBtnEl.addEventListener("click", () => {
  cmdHint();
  cmd.focus();
});
onboardingToggleBtnEl.addEventListener("click", () => {
  toggleOnboarding();
  cmd.focus();
});
musicBtnEl.addEventListener("click", async () => {
  await toggleMusic();
  cmd.focus();
});
restartBtnEl.addEventListener("click", () => {
  restartGame(false);
  cmd.focus();
});

const saved = loadSavedState();
if (saved) {
  restoreProgress(saved);
} else {
  applyTheme("ocean");
  setPlayerName("Analyst");
  startLevel(0);
  updateOnboardingVisibility();
  updateMusicButton();
  print(`Willkommen im Cyber-Labor der Schule, ${playerAddress()}! Frau Weber und Ben zaehlen auf dich. Tippe help, um zu starten.`, "ok");
}
cmd.focus();
