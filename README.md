# toushibunseki-app

株投資の分析・記録を支援する個人用アプリ。ダッシュボード、トレード日誌、銘柄分析（理論株価計算）、マクロシナリオ、学習リソースの5機能。

## 使い方（ローカルのみ、同期なし）

`index.html` をブラウザで直接開くだけで動作する。パスフレーズ入力は求められず、データはそのブラウザの中だけに保存される。トレード日誌・理論株価計算・メモ機能はこれだけで使える。

## ウェブに公開してPC・iPhoneでデータを同期する場合

以下の3つを設定すると、Vercelにデプロイした1つのURLをPCとiPhoneの両方（どのブラウザからでも）開いて同じデータを見られるようになる。

### 1. Vercelにデプロイする

1. [Vercel](https://vercel.com/)にGitHubアカウントでサインアップする
2. 「Add New Project」からこのリポジトリ（`TTTT-47582/toushibunseki-app`）をインポートしてデプロイする
3. デプロイが終わるとVercelが発行するURL（例: `https://toushibunseki-app.vercel.app`）でアクセスできるようになる

### 2. データ同期用のRedis（無料）を追加する

1. Vercelのプロジェクト画面で「Storage」タブ → 「Marketplace Database Integrations」から Upstash の Redis を選んで追加する（無料枠: 256MB・月50万コマンドで個人利用には十分）
2. 追加すると `KV_REST_API_URL` / `KV_REST_API_TOKEN`（または `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`）が自動でプロジェクトの環境変数に設定される

### 3. パスフレーズを設定する

1. プロジェクトの Settings → Environment Variables で `APP_SECRET` を追加し、好きな文字列（パスフレーズ）を設定する
2. これが無いと誰でもURLからデータにアクセスできてしまうので必須

設定後は再デプロイ（Redeploy）すること。環境変数はデプロイ時にしか読み込まれない。

### 4. PC・iPhoneからアクセスする

- PCのブラウザとiPhoneのSafariの両方で同じURLを開き、同じパスフレーズを入力する
- 一度入力すればその端末では次回から聞かれない（localStorageに保存される）
- どちらかの端末で記録を保存すると、もう片方の端末は次に開いたとき（またはタブ再読み込み時）に最新の内容に更新される。同時に編集した場合は後から保存した方が優先される
- iPhoneのSafariで「共有」→「ホーム画面に追加」をするとアプリのように起動できる

### 5. J-Quants連携（PER/PBR/ROE自動取得・信用倍率等）を使う場合

日本株のPER/PBR/ROE自動取得や信用倍率・空売り比率の自動取得には、JPX公式の[J-Quants API](https://jpx-jquants.com/)キーが追加で必要。

1. [J-Quants](https://jpx-jquants.com/)でFreeプラン（無料）に登録し、ダッシュボードでAPIキーを発行する
2. Vercelの環境変数に `JQUANTS_API_KEY` として設定する（PER/PBR/ROEはFreeプランで利用可能。信用倍率・空売り比率はStandardプラン以上が必要）

### ローカルで動作確認する場合

```bash
npm install -g vercel
vercel dev
```

初回は対話形式でプロジェクトのリンク設定が求められる。`.env.local`（gitignore対象）に以下を記載しておくとローカルでも環境変数を読み込む。

```
APP_SECRET=your-passphrase-here
JQUANTS_API_KEY=your-jquants-api-key-here
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

（`.env.local.example` をコピーして使うと早い。Redis関連の値はVercelダッシュボードの Storage タブから確認できる）

## 技術スタック

- フロントエンド: HTML/CSS/JavaScript（ビルド不要）
- バックエンド: Vercel サーバーレス関数（`/api`）。J-Quants APIキーの秘匿・プロキシと、PC/iPhone間のデータ同期を担当
- データ保存: ブラウザの localStorage（オフラインでも動作）＋ Upstash Redis（`/api/data` 経由でクラウド同期、保存のたびに自動でクラウドへも書き込む）
- 認証: 共有パスフレーズ方式（`APP_SECRET`）。全ての `/api/*` エンドポイントで検証される
