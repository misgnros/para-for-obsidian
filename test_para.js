const assert = require("assert");
const { parseBoard, serializeBoard } = require("./para-core.js");

const src = [
  "[Projects]",
  "- Ship v1",
  "  - Write changelog",
  "  - Tag release",
  "- Draft spec",
  "[Areas]",
  "- Weekly review",
  "[Resources]",
  "[Archives]",
].join("\n");

const b = parseBoard(src);
assert.strictEqual(b.Projects.length, 2);
assert.strictEqual(b.Projects[0].text, "Ship v1");
assert.deepStrictEqual(b.Projects[0].children, ["Write changelog", "Tag release"]);
assert.strictEqual(b.Projects[1].text, "Draft spec");
assert.deepStrictEqual(b.Projects[1].children, []);
assert.strictEqual(b.Areas[0].text, "Weekly review");
assert.strictEqual(b.Resources.length, 0);

// round-trip is stable
assert.strictEqual(serializeBoard(parseBoard(src)), src);

// legacy checkbox markers are stripped
const legacy = parseBoard("[Projects]\n- [ ] v1\n- [x] old\n[Areas]\n[Resources]\n[Archives]");
assert.strictEqual(legacy.Projects[0].text, "v1");
assert.strictEqual(legacy.Projects[1].text, "old");

// moving a task preserves children
b.Archives.push(b.Projects.shift());
assert.strictEqual(b.Projects.length, 1);
assert.ok(serializeBoard(b).includes("[Archives]\n- Ship v1\n  - Write changelog\n  - Tag release"));

console.log("ok");
