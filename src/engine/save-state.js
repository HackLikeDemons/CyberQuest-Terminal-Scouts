export const SAVE_SCHEMA_VERSION = 2;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNonNegativeInt(value, fallback = 0) {
  if (!Number.isInteger(value) || value < 0) return fallback;
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultSave(ctx) {
  return {
    saveVersion: SAVE_SCHEMA_VERSION,
    contentVersion: ctx.contentVersion,
    levelIndex: 0,
    score: 0,
    cwd: ctx.getStartCwd(0),
    hintIndex: 0,
    actionState: {},
    fs: null,
    onboardingVisible: false,
    playerName: "Analyst",
    theme: "ocean",
    musicEnabled: false
  };
}

function migrateV1ToV2(raw) {
  const next = clone(raw);
  if (!isPlainObject(next.actionState) && isPlainObject(next.levelFlags)) {
    next.actionState = next.levelFlags;
  }
  delete next.levelFlags;
  next.saveVersion = 2;
  return next;
}

const MIGRATIONS = {
  1: migrateV1ToV2
};

function applyMigrations(raw) {
  const source = clone(raw);
  let version = Number.isInteger(source.saveVersion) ? source.saveVersion : 1;
  if (version > SAVE_SCHEMA_VERSION) return null;

  let current = source;
  while (version < SAVE_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) return null;
    current = migrate(current);
    version += 1;
  }
  current.saveVersion = SAVE_SCHEMA_VERSION;
  return current;
}

function normalizeSave(raw, ctx) {
  const base = createDefaultSave(ctx);
  const normalized = { ...base };

  normalized.contentVersion = Number.isInteger(raw.contentVersion) ? raw.contentVersion : ctx.contentVersion;
  normalized.levelIndex = Math.min(
    toNonNegativeInt(raw.levelIndex, base.levelIndex),
    Math.max(0, ctx.levelsLength - 1)
  );
  normalized.score = toNonNegativeInt(raw.score, base.score);
  normalized.cwd = typeof raw.cwd === "string" ? raw.cwd : ctx.getStartCwd(normalized.levelIndex);
  normalized.hintIndex = toNonNegativeInt(raw.hintIndex, base.hintIndex);
  normalized.actionState = isPlainObject(raw.actionState) ? raw.actionState : {};
  normalized.fs = isPlainObject(raw.fs) ? raw.fs : null;
  normalized.onboardingVisible = typeof raw.onboardingVisible === "boolean" ? raw.onboardingVisible : base.onboardingVisible;
  normalized.playerName = typeof raw.playerName === "string" ? raw.playerName : base.playerName;
  normalized.theme = ctx.themes.has(raw.theme) ? raw.theme : base.theme;
  normalized.musicEnabled = typeof raw.musicEnabled === "boolean" ? raw.musicEnabled : base.musicEnabled;

  return normalized;
}

export function parseAndMigrateSave(rawJson, ctx) {
  try {
    const parsed = JSON.parse(rawJson);
    if (!isPlainObject(parsed)) return null;

    const migrated = applyMigrations(parsed);
    if (!migrated) return null;

    const normalized = normalizeSave(migrated, ctx);
    const contentChanged = normalized.contentVersion !== ctx.contentVersion;

    if (contentChanged) {
      return {
        ...createDefaultSave(ctx),
        playerName: normalized.playerName,
        theme: normalized.theme,
        musicEnabled: false,
        migratedFromOldContent: true
      };
    }

    return normalized;
  } catch (_) {
    return null;
  }
}
