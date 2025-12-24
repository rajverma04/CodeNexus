function sanitizeBase(input) {
  const base = String(input || "user")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-.]/g, "");
  return base.length ? base : "user";
}

async function generateUniqueUsername(UserModel, baseInput) {
  const base = sanitizeBase(baseInput);
  // Try base
  let candidate = base;
  let exists = await UserModel.findOne({ username: candidate }).select("_id");
  if (!exists) return candidate;
  // Try base with numeric suffixes
  for (let i = 1; i <= 9999; i++) {
    candidate = `${base}${i}`;
    // Respect length limit 20; if exceeds, trim base
    if (candidate.length > 20) {
      const trimLen = Math.max(1, 20 - String(i).length);
      candidate = `${base.slice(0, trimLen)}${i}`;
    }
    exists = await UserModel.findOne({ username: candidate }).select("_id");
    if (!exists) return candidate;
  }
  // Fallback random
  candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`.slice(0, 20);
  return candidate;
}

module.exports = { sanitizeBase, generateUniqueUsername };
