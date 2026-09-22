const { Plugin } = require("obsidian");

// Board parse/serialize logic. Kept identical to para-core.js (which the test
// exercises) but inlined here because Obsidian can't require sibling files
// without a bundler.
const CATEGORIES = ["Projects", "Areas", "Resources", "Archives"];

function parseBoard(text) {
  const board = {};
  for (const c of CATEGORIES) board[c] = [];
  let cur = null;
  let last = null;
  for (const raw of String(text).split("\n")) {
    const trimmed = raw.trim();
    const head = trimmed.match(/^\[(.+?)\]$/);
    if (head && CATEGORIES.includes(head[1])) { cur = head[1]; last = null; continue; }
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

const DESC = {
  Projects: "Short-term efforts with a goal and a deadline",
  Areas: "Ongoing responsibilities with no end date",
  Resources: "Topics of interest and reference material",
  Archives: "Completed or inactive items",
};

async function persist(app, ctx, el, board) {
  const info = ctx.getSectionInfo(el);
  const file = app.vault.getAbstractFileByPath(ctx.sourcePath);
  if (!info || !file) return;
  const body = serializeBoard(board).split("\n");
  await app.vault.process(file, (data) => {
    const lines = data.split("\n");
    const before = lines.slice(0, info.lineStart + 1);
    const after = lines.slice(info.lineEnd);
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
      const header = card.createDiv({ cls: "para-card-header" });

      const toggle = header.createSpan({ cls: "para-card-toggle", text: "▶" });
      header.createSpan({ cls: "para-card-text", text: task.text });

      const acts = header.createSpan({ cls: "para-card-acts" });
      for (const target of CATEGORIES) {
        if (target === cat) continue;
        const btn = acts.createEl("button", { text: target[0], title: `${target} へ移動` });
        btn.onclick = () => { board[cat].splice(i, 1); board[target].push(task); commit(); };
      }
      const del = acts.createEl("button", { text: "×", title: "削除", cls: "para-del" });
      del.onclick = () => { board[cat].splice(i, 1); commit(); };

      const detail = card.createDiv({ cls: "para-card-detail" });
      detail.style.display = "none";

      for (let ci = 0; ci < task.children.length; ci++) {
        const row = detail.createDiv({ cls: "para-child" });
        row.createSpan({ text: task.children[ci] });
        const cdel = row.createEl("button", { text: "×", cls: "para-child-del", title: "削除" });
        cdel.onclick = () => { task.children.splice(ci, 1); commit(); };
      }

      const addChild = detail.createEl("input", { type: "text", cls: "para-child-add", attr: { placeholder: "+ Add detail" } });
      addChild.onkeydown = (e) => {
        if (e.key !== "Enter" || !addChild.value.trim()) return;
        task.children.push(addChild.value.trim());
        commit();
      };

      toggle.onclick = () => {
        const open = detail.style.display !== "none";
        detail.style.display = open ? "none" : "block";
        toggle.textContent = open ? "▶" : "▼";
      };
    });

    const add = col.createEl("input", { type: "text", cls: "para-add", attr: { placeholder: "+ Add task" } });
    add.onkeydown = (e) => {
      if (e.key !== "Enter" || !add.value.trim()) return;
      board[cat].push({ text: add.value.trim(), children: [] });
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
    ribbon.empty();
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

  async openBoard() {
    let file = this.app.vault.getAbstractFileByPath(PARA_FILE);
    if (!file) file = await this.app.vault.create(PARA_FILE, TEMPLATE);
    await this.app.workspace.getLeaf(false).openFile(file, { state: { mode: "preview" } });
  }
};
