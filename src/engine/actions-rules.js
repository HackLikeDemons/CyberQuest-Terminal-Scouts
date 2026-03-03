function normalizeFlagPart(value) {
  return String(value || "").trim().toLowerCase();
}

export function makeActionKey(action, detail = "") {
  return detail ? `${action}:${normalizeFlagPart(detail)}` : action;
}

export function hasAction(actionsState, action, detail = "") {
  const key = makeActionKey(action, detail);
  return !!(actionsState && actionsState[key]);
}

export function recordAction(actionsState, action, detail = "") {
  const key = makeActionKey(action, detail);
  if (!actionsState[key]) {
    actionsState[key] = true;
    return true;
  }
  return false;
}

function evalAtomicRule(rule, ctx) {
  const path = rule.path ? ctx.normalizePath(rule.path) : "";
  const node = path ? ctx.getNode(path) : null;

  switch (rule.type) {
    case "dirExists":
      return !!node && node.type === "dir";
    case "fileExists":
      return !!node && node.type === "file";
    case "fileMissing":
      return !node;
    case "fileContains":
      return !!node && node.type === "file" && typeof rule.text === "string" && node.content.includes(rule.text);
    case "modeEquals":
      return !!node && node.type === "file" && String(node.mode || "644") === String(rule.mode);
    case "flag":
      return ctx.hasAction(rule.key || "", rule.value || "");
    default:
      return true;
  }
}

export function evaluateRule(rule, ctx) {
  if (!rule || typeof rule !== "object" || !rule.type) return true;

  if (rule.type === "allOf") {
    if (!Array.isArray(rule.requirements)) return true;
    return rule.requirements.every((inner) => evaluateRule(inner, ctx));
  }

  if (rule.type === "anyOf") {
    if (!Array.isArray(rule.requirements)) return false;
    return rule.requirements.some((inner) => evaluateRule(inner, ctx));
  }

  if (rule.type === "not") {
    return !evaluateRule(rule.requirement, ctx);
  }

  return evalAtomicRule(rule, ctx);
}

export function evaluateRuleDetailed(rule, ctx) {
  if (!rule || typeof rule !== "object" || !rule.type) return { ok: true, failedRule: null };

  if (rule.type === "allOf") {
    if (!Array.isArray(rule.requirements)) return { ok: true, failedRule: null };
    for (const inner of rule.requirements) {
      const result = evaluateRuleDetailed(inner, ctx);
      if (!result.ok) return result;
    }
    return { ok: true, failedRule: null };
  }

  if (rule.type === "anyOf") {
    if (!Array.isArray(rule.requirements) || !rule.requirements.length) {
      return { ok: false, failedRule: rule };
    }
    const failures = [];
    for (const inner of rule.requirements) {
      const result = evaluateRuleDetailed(inner, ctx);
      if (result.ok) return { ok: true, failedRule: null };
      failures.push(result.failedRule || inner);
    }
    return { ok: false, failedRule: { ...rule, failures } };
  }

  if (rule.type === "not") {
    const result = evaluateRuleDetailed(rule.requirement, ctx);
    if (result.ok) return { ok: false, failedRule: rule };
    return { ok: true, failedRule: null };
  }

  const ok = evalAtomicRule(rule, ctx);
  return { ok, failedRule: ok ? null : rule };
}

export function buildUnlockRule(level) {
  if (level.unlockRule && typeof level.unlockRule === "object") {
    return level.unlockRule;
  }

  const list = Array.isArray(level.unlockRequirements) ? level.unlockRequirements : [];
  return { type: "allOf", requirements: list };
}
