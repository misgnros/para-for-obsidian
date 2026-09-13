// Pure board parse/serialize logic, dependency-free so it can be unit-tested.
// NOTE: these functions are inlined verbatim in main.js (Obsidian can't require
// sibling files without a bundler). Keep both copies in sync.
const CATEGORIES = ["Projects", "Areas", "Resources", "Archives"];

// Parse a ```para code-block body into { Projects: [task, ...], ... }.
// Lines like "[Projects]" open a category; "- task" lines are tasks.
function parseBoard(text) {
  const board = {};
  for (const c of CATEGORIES) board[c] = [];
  let cur = null;
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    const head = line.match(/^\[(.+?)\]$/);
    if (head && CATEGORIES.includes(head[1])) { cur = head[1]; continue; }
    const task = line.match(/^-\s+(.*)$/);
    if (task && cur) {
      // Drop a legacy "- [ ] " / "- [x] " checkbox marker if present.
      const t = task[1].replace(/^\[[ xX]?\]\s*/, "").trim();
      if (t) board[cur].push(t);
    }
  }
  return board;
}

// Serialize a board back to the code-block body text.
function serializeBoard(board) {
  const out = [];
  for (const c of CATEGORIES) {
    out.push(`[${c}]`);
    for (const t of board[c]) out.push(`- ${t}`);
  }
  return out.join("\n");
}

module.exports = { CATEGORIES, parseBoard, serializeBoard };
