# toushibunseki-app

株投資で本格的に分析をして、しっかり投資でお金をふやせる知識・技術を得て結果を出すためのアプリ。

## 技術スタック
- フロントエンド: HTML/CSS/JavaScript（ビルド不要、`index.html` を直接開くだけで基本機能は動作）
- バックエンド: Vercelサーバーレス関数（`/api`）。J-Quants APIキーをサーバー側に秘匿し、日本株のPER/PBR/ROE自動取得・自前ローソク足チャート・信用倍率/空売り比率取得をプロキシする
- データ保存: ブラウザのlocalStorage（トレード日誌・銘柄メモ・マクロシナリオなど）
- セットアップ手順は `README.md` を参照

## GitHubリポジトリ
https://github.com/TTTT-47582/toushibunseki-app.git
