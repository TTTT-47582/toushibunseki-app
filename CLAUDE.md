# toushibunseki-app

株投資で本格的に分析をして、しっかり投資でお金をふやせる知識・技術を得て結果を出すためのアプリ。

## 技術スタック
- フロントエンド: HTML/CSS/JavaScript（ビルド不要、`index.html` を直接開くだけでローカル動作は可能）
- バックエンド: Vercelサーバーレス関数（`/api`）。J-Quants APIキーをサーバー側に秘匿し、日本株のPER/PBR/ROE自動取得・信用倍率/空売り比率取得をプロキシするほか、`/api/data` でPC/iPhone間のデータ同期を担当
- データ保存: ブラウザのlocalStorage（オフラインキャッシュ）＋ Upstash Redis（クラウド同期、保存のたび自動反映）
- 認証: 共有パスフレーズ方式（環境変数 `APP_SECRET`）。全`/api/*`エンドポイントで検証
- セットアップ手順（Vercelデプロイ・Redis追加・パスフレーズ設定・J-Quants連携）は `README.md` を参照

## GitHubリポジトリ
https://github.com/TTTT-47582/toushibunseki-app.git
