const assert = require("assert");
const { parseBoard, serializeBoard } = require("./para-core.js");

const src = [
  "[Projects]",
  "- Ship v1",
  "- Draft spec",
  "[Areas]",
  "- Weekly review",
  "[Resources]",
  "[Archives]",
].join("\n");

const b = parseBoard(src);
assert.strictEqual(b.Projects.length, 2);
assert.strictEqual(b.Projects[1], "Draft spec");
assert.strictEqual(b.Areas[0], "Weekly review");
assert.strictEqual(b.Resources.length, 0);

// round-trip is stable
assert.strictEqual(serializeBoard(parseBoard(src)), src);

// legacy "- [ ] "/"- [x] " checkbox markers are stripped
const legacy = parseBoard("[Projects]\n- [ ] v1\n- [x] old\n[Areas]\n[Resources]\n[Archives]");
assert.deepStrictEqual(legacy.Projects, ["v1", "old"]);

// moving a task between categories (e.g. finished -> Archives)
b.Archives.push(b.Projects.shift());
assert.strictEqual(b.Projects.length, 1);
assert.ok(serializeBoard(b).includes("[Archives]\n- Ship v1"));

console.log("ok");
