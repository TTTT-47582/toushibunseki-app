# toushibunseki-app

株投資の分析・記録を支援する個人用アプリ。ダッシュボード、トレード日誌、銘柄分析（理論株価計算・チャート）、マクロシナリオ、学習リソースの5機能。

## 使い方（データ自動取得なし）

`index.html` をブラウザで直接開くだけで動作する。トレード日誌・理論株価計算・メモ機能はこれだけで使える。

## PER/PBR/ROE・日本株チャートの自動取得を使う場合

日本株のPER/PBR/ROE自動取得、自前のローソク足チャート、信用倍率・空売り比率の自動取得には、JPX公式の[J-Quants API](https://jpx-jquants.com/)とVercelへのデプロイが必要。

### 1. J-Quants APIキーを取得する

1. [J-Quants](https://jpx-jquants.com/)でFreeプラン（無料）に登録する
2. ダッシュボードでAPIキーを発行する
3. PER/PBR/ROE・チャートはFreeプランで利用可能。信用倍率・空売り比率はStandardプラン（¥3,300/月）以上が必要

### 2. Vercelにデプロイする

1. [Vercel](https://vercel.com/)にGitHubアカウントでサインアップする
2. 「Add New Project」からこのリポジトリ（`TTTT-47582/toushibunseki-app`）をインポートする
3. プロジェクトの Settings → Environment Variables に `JQUANTS_API_KEY` として発行したAPIキーを設定する
4. デプロイすると、Vercelが発行するURL（例: `https://toushibunseki-app.vercel.app`）でアプリにアクセスでき、`/api/*` のバックエンド関数も自動的に動く

### 3. ローカルで動作確認する場合

```bash
npm install -g vercel
vercel dev
```

初回は対話形式でプロジェクトのリンク設定が求められる。`.env.local`（gitignore対象）に以下を記載しておくとローカルでもAPIキーを読み込む。

```
JQUANTS_API_KEY=your-jquants-api-key-here
```

（`.env.local.example` をコピーして使うと早い）

## 技術スタック

- フロントエンド: HTML/CSS/JavaScript（ビルド不要）
- バックエンド: Vercel サーバーレス関数（`/api`）、J-Quants APIキーの秘匿とプロキシ用
- データ保存: ブラウザの localStorage（トレード日誌・銘柄メモ・マクロシナリオなど）
