# PARA Board (mockup)

An Obsidian plugin mockup that sorts a task list into the four PARA buckets
(Projects / Areas / Resources / Archives) as a Kanban-style board inside a note.
Plain JS, no build step required.

The categorization follows the PARA method by Tiago Forte (Forte Labs):
<https://fortelabs.com/blog/para/>.

## Usage

Click the layers icon in the left ribbon (or run the "Open PARA" command) to open
`PARA.md`. If the file doesn't exist yet, it's created with an empty board.
From then on you manage every task in that single file.

- Hover a card and use the P/A/R/A buttons to move it to another column, or × to delete it
- Add a task with the input at the bottom of each column (press Enter)
- Mark something done by moving it to Archives

Every action is written back into the code block, so the state lives in the note
itself. Close the board and it's still a plain Markdown task list.

### Embedding in any note

Outside of `PARA.md`, writing the following code block renders a board in place
(e.g. inside a project note). The "Insert PARA board" command inserts it too.

````markdown
```para
[Projects]
- Ship v1
[Areas]
- Weekly review
[Resources]
[Archives]
```
````

## Install (dev)

Copy `manifest.json`, `main.js`, and `styles.css` into
`.obsidian/plugins/para-board/` in your vault, then enable it under
Settings → Community plugins (`para-core.js` and `test_para.js` are for tests only).

## Test

```bash
node test_para.js
```
