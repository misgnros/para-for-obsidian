// Pure board parse/serialize logic, dependency-free so it can be unit-tested.
// NOTE: these functions are inlined verbatim in main.js (Obsidian can't require
// sibling files without a bundler). Keep both copies in sync.
const CATEGORIES = ["Projects", "Areas", "Resources", "Archives"];

// Parse a ```para code-block body into { Projects: [{text, children}, ...], ... }.
// "[Projects]" opens a category; "- task" lines are top-level tasks;
// "  - detail" (2+ space indent) lines nest under the preceding task.
function parseBoard(text) {
  const board = {};
  for (const c of CATEGORIES) board[c] = [];
  let cur = null;
  let last = null;
  for (const raw of String(text).split("\n")) {
    const trimmed = raw.trim();
    const head = trimmed.match(/^\[(.+?)\]$/);
    if (head && CATEGORIES.includes(head[1])) { cur = head[1]; last = null; continue; }
    // Child: 2+ leading spaces then "- "
    const child = raw.match(/^[ ]{2,}-\s+(.*)$/);
    if (child && last) {
      const t = child[1].replace(/^\[[ xX]?\]\s*/, "").trim();
      if (t) last.children.push(t);
      continue;
    }
    const task = trimmed.match(/^-\s+(.*)$/);
    if (task && cur) {
      const t = task[1].replace(/^\[[ xX]?\]\s*/, "").trim();
      if (t) { last = { text: t, children: [] }; board[cur].push(last); }
    }
  }
  return board;
}

// Serialize a board back to the code-block body text.
function serializeBoard(board) {
  const out = [];
  for (const c of CATEGORIES) {
    out.push(`[${c}]`);
    for (const t of board[c]) {
      out.push(`- ${t.text}`);
      for (const ch of t.children) out.push(`  - ${ch}`);
    }
  }
  return out.join("\n");
}

module.exports = { CATEGORIES, parseBoard, serializeBoard };
