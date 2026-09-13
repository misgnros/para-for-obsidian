const { Plugin } = require("obsidian");

// Board parse/serialize logic. Kept identical to para-core.js (which the test
// exercises) but inlined here because Obsidian can't require sibling files
// without a bundler.
const CATEGORIES = ["Projects", "Areas", "Resources", "Archives"];

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

function serializeBoard(board) {
  const out = [];
  for (const c of CATEGORIES) {
    out.push(`[${c}]`);
    for (const t of board[c]) out.push(`- ${t}`);
  }
  return out.join("\n");
}

const DESC = {
  Projects: "Short-term efforts with a goal and a deadline",
  Areas: "Ongoing responsibilities with no end date",
  Resources: "Topics of interest and reference material",
  Archives: "Completed or inactive items",
};

// Rewrite the ```para block body inside the source file with the new board state.
async function persist(app, ctx, el, board) {
  const info = ctx.getSectionInfo(el);
  const file = app.vault.getAbstractFileByPath(ctx.sourcePath);
  if (!info || !file) return;
  const body = serializeBoard(board).split("\n");
  await app.vault.process(file, (data) => {
    const lines = data.split("\n");
    const before = lines.slice(0, info.lineStart + 1); // keep the ```para fence
    const after = lines.slice(info.lineEnd); // keep the closing fence onward
    return [...before, ...body, ...after].join("\n");
  });
}

function renderBoard(app, ctx, el, board) {
  el.empty();
  el.addClass("para-board");

  const commit = async () => { await persist(app, ctx, el, board); renderBoard(app, ctx, el, board); };

  for (const cat of CATEGORIES) {
    const col = el.createDiv({ cls: "para-col" });
    const head = col.createDiv({ cls: "para-col-head" });
    head.createDiv({ cls: "para-col-title", text: `${cat}(${board[cat].length})` });
    head.createDiv({ cls: "para-col-desc", text: DESC[cat] });

    const cards = col.createDiv({ cls: "para-cards" });
    board[cat].forEach((task, i) => {
      const card = cards.createDiv({ cls: "para-card" });

      card.createSpan({ cls: "para-card-text", text: task });

      const acts = card.createSpan({ cls: "para-card-acts" });
      for (const target of CATEGORIES) {
        if (target === cat) continue;
        const btn = acts.createEl("button", { text: target[0], title: `${target} へ移動` });
        btn.onclick = () => { board[cat].splice(i, 1); board[target].push(task); commit(); };
      }
      const del = acts.createEl("button", { text: "×", title: "削除", cls: "para-del" });
      del.onclick = () => { board[cat].splice(i, 1); commit(); };
    });

    const add = col.createEl("input", { type: "text", cls: "para-add", attr: { placeholder: "+ Add task" } });
    add.onkeydown = (e) => {
      if (e.key !== "Enter" || !add.value.trim()) return;
      board[cat].push(add.value.trim());
      commit();
    };
  }
}

const TEMPLATE = "```para\n" + CATEGORIES.map((c) => `[${c}]`).join("\n") + "\n```\n";
const PARA_FILE = "PARA.md";

module.exports = class ParaPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("para", (source, el, ctx) => {
      renderBoard(this.app, ctx, el, parseBoard(source));
    });

    const ribbon = this.addRibbonIcon("layers", "PARAを開く", () => this.openBoard());
    ribbon.empty(); // replace the default icon with a 2x2 "PA / RA" label
    const label = ribbon.createDiv({ cls: "para-ribbon" });
    label.createDiv({ text: "PA" });
    label.createDiv({ text: "RA" });

    this.addCommand({
      id: "open-para-board",
      name: "PARAを開く",
      callback: () => this.openBoard(),
    });

    this.addCommand({
      id: "insert-para-board",
      name: "PARA ボードを挿入",
      editorCallback: (editor) => editor.replaceSelection(TEMPLATE),
    });
  }

  // Ensure PARA.md exists (creating it with an empty board), then open it.
  async openBoard() {
    let file = this.app.vault.getAbstractFileByPath(PARA_FILE);
    if (!file) file = await this.app.vault.create(PARA_FILE, TEMPLATE);
    // Open in reading mode so the code block always renders as the board
    // instead of showing raw source when the cursor lands inside it.
    await this.app.workspace.getLeaf(false).openFile(file, { state: { mode: "preview" } });
  }
};
