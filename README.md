# PARA Board（モックアップ）

1つのノートの中でタスクリストをPARA（Projects / Areas / Resources / Archives）の4カラムに振り分ける、Kanban風ボードのモックアップである。ビルド不要のプレーンJSで動く。

## 使い方

左端リボンの layers アイコン（またはコマンド「PARAを開く」）をクリックすると `PARA.md` が開く。ファイルが無ければ空のボード入りで自動作成される。以降はこの1ファイルで全タスクを管理する。

- カードホバーで出るボタン（P/A/R/A）で別カラムへ移動、× で削除
- カラム下の入力欄でタスク追加（Enter）
- 完了したタスクは Archives に移せばよい

操作するとコードブロックのテキストが自動で書き戻されるので、状態はノート自身に残る。ボードを閉じてもMarkdownのタスクリストとして読める。

### 任意のノートに埋め込む

`PARA.md` 以外でも、次のコードブロックを書けばその場にボードが描画される（プロジェクト個別ノートなどに）。コマンド「PARA ボードを挿入」でも入る。

````markdown
```para
[Projects]
- v1をリリース
[Areas]
- 週次レビュー
[Resources]
[Archives]
```
````

## インストール（開発版）

Vaultの `.obsidian/plugins/para-board/` に `manifest.json` `main.js` `styles.css` の3つをコピーし、設定 → コミュニティプラグインで有効化する（`para-core.js` `test_para.js` はテスト用なので不要）。

## テスト

```bash
node test_para.js
```
