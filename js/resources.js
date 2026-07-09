const RESOURCE_LINKS = [
  { name: "会社四季報オンライン", url: "https://shikiho.toyokeizai.net/" },
  { name: "EDINET（有価証券報告書）", url: "https://disclosure2.edinet-fsa.go.jp/" },
  { name: "IR BANK", url: "https://irbank.net/" },
  { name: "TradingView", url: "https://jp.tradingview.com/" },
  { name: "Yahoo!ファイナンス", url: "https://finance.yahoo.co.jp/" },
  { name: "日経ヴェリタス（日本経済新聞）", url: "https://www.nikkei.com/veritas/" },
  { name: "適時開示情報閲覧サービス（TDnet）", url: "https://www.release.tdnet.info/inbs/I_main_00.html" },
  { name: "SEMI（半導体製造装置統計）", url: "https://www.semi.org/" },
  { name: "WSTS（世界半導体市場統計）", url: "https://www.wsts.org/" }
];

const GLOSSARY = [
  { term: "PER（株価収益率）", desc: "株価が1株当たり利益の何倍かを示す指標。低いほど割安とされるが業種平均との比較が重要。" },
  { term: "PBR（株価純資産倍率）", desc: "株価が1株当たり純資産の何倍かを示す指標。1倍割れは解散価値以下とされる。" },
  { term: "ROE（自己資本利益率）", desc: "自己資本に対してどれだけ利益を上げているかを示す指標。資本効率の目安。" },
  { term: "RSI", desc: "相対力指数。過去一定期間の値動きから買われすぎ・売られすぎを判断するオシレーター系指標。" },
  { term: "MACD", desc: "移動平均収束拡散法。短期・長期の移動平均の差からトレンド転換を判断する指標。" },
  { term: "ゴールデンクロス/デッドクロス", desc: "短期移動平均線が長期移動平均線を上抜く（ゴールデンクロス）/下抜く（デッドクロス）現象。買い/売りシグナルとされる。" },
  { term: "信用倍率", desc: "信用取引の買い残高を売り残高で割った値。将来の需給（買い戻し・売り圧力）を推測する材料。" },
  { term: "moat（経済的な堀）", desc: "競合他社に対する持続的な競争優位性。ブランド力、コスト優位性、ネットワーク効果などが該当。" }
];

function renderResources() {
  const panel = document.getElementById("panel-resources");
  panel.innerHTML = `
    <div class="card">
      <h2>学習・情報収集リソース</h2>
      <ul class="link-list">
        ${RESOURCE_LINKS.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a></li>`).join("")}
      </ul>
    </div>
    <div class="card">
      <h2>用語解説</h2>
      ${GLOSSARY.map((g) => `
        <div class="glossary-item">
          <span class="glossary-term">${g.term}</span>
          <span>${g.desc}</span>
        </div>
      `).join("")}
    </div>
  `;
}
