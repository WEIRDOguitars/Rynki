const STORAGE_KEY = "rynki-app-v3";
const OLD_KEYS = ["rynki-app-v2", "rynki-app-v1"];
const NBP_TABLE_A_URL = "https://api.nbp.pl/api/exchangerates/tables/a/?format=json";
const NBP_GOLD_URL = "https://api.nbp.pl/api/cenyzlota?format=json";
const CHART_COLORS = ["#2457a6", "#24785a", "#b97918", "#7c4d9e", "#b24a4a", "#2f6f83", "#5d6675", "#8d6b2d", "#466a9f", "#9a4f78"];

const initialData = {
  asOf: "2026-07-03",
  fx: { usdpln: 3.74, eurpln: 4.29, goldPlnGram: 502 },
  assets: [
    { id: uid(), name: "Santander PLN", category: "Gotowka i waluty", account: "Santander", valuePln: 200, currency: "PLN" },
    { id: uid(), name: "ING OKO", category: "Gotowka i waluty", account: "ING", valuePln: 2166, currency: "PLN" },
    { id: uid(), name: "ING Robot", category: "Fundusz", account: "ING", valuePln: 109308, currency: "PLN" },
    { id: uid(), name: "ING Euro", category: "Gotowka i waluty", account: "ING", valuePln: 40810, currency: "EUR" },
    { id: uid(), name: "ING PLN", category: "Gotowka i waluty", account: "ING", valuePln: 9410, currency: "PLN" },
    { id: uid(), name: "Revolut PLN", category: "Gotowka i waluty", account: "Revolut", valuePln: 184, currency: "PLN" },
    { id: uid(), name: "Zloto uncje", category: "Zloto", account: "Fizyczne", valuePln: 50200, currency: "PLN" },
    { id: uid(), name: "Bybit USD / BTC", category: "Krypto", account: "Bybit", valuePln: 145885, currency: "USD", ticker: "BTCUSD" },
    { id: uid(), name: "Inteligo PLN", category: "Gotowka i waluty", account: "Inteligo", valuePln: 200, currency: "PLN" },
    { id: uid(), name: "Gotowka PLN", category: "Gotowka i waluty", account: "Gotowka", valuePln: 50500, currency: "PLN" },
    { id: uid(), name: "Obligacje 10EDO", category: "Obligacje", account: "Detaliczne", valuePln: 193010, currency: "PLN" }
  ],
  xtbPositions: [
    { id: uid(), account: "XTB IKE", name: "IKE - akcje do rozpisania", ticker: "MANUAL-IKE-AKCJE", category: "Akcje", valuePln: 62000, currency: "PLN", sector: "Mixed" },
    { id: uid(), account: "XTB IKE", name: "IKE - ETF do rozpisania", ticker: "MANUAL-IKE-ETF", category: "ETF", valuePln: 41872, currency: "PLN", sector: "ETF" },
    { id: uid(), account: "XTB IKZE", name: "IKZE - akcje do rozpisania", ticker: "MANUAL-IKZE-AKCJE", category: "Akcje", valuePln: 10000, currency: "PLN", sector: "Mixed" },
    { id: uid(), account: "XTB IKZE", name: "IKZE - ETF do rozpisania", ticker: "MANUAL-IKZE-ETF", category: "ETF", valuePln: 10593, currency: "PLN", sector: "ETF" },
    { id: uid(), account: "XTB Portfel USD", name: "S&P 500 Energy Sector", ticker: "XLE.US", category: "ETF", valuePln: 13900.95, currency: "USD", sector: "Energy" },
    { id: uid(), account: "XTB Portfel USD", name: "MSCI World ex USA", ticker: "EXUS", category: "ETF", valuePln: 29838.22, currency: "USD", sector: "Global ex USA" },
    { id: uid(), account: "XTB Portfel USD", name: "Core MSCI EM IMI", ticker: "EIMI", category: "ETF", valuePln: 41048.49, currency: "USD", sector: "Emerging Markets" },
    { id: uid(), account: "XTB Portfel USD", name: "Core MSCI World", ticker: "IWDA", category: "ETF", valuePln: 67771.37, currency: "USD", sector: "Global" },
    { id: uid(), account: "XTB Portfel USD", name: "Core S&P 500", ticker: "CSPX", category: "ETF", valuePln: 71722.6, currency: "USD", sector: "USA" },
    { id: uid(), account: "XTB Portfel USD", name: "Wolne srodki USD", ticker: "CASH-USD", category: "Gotowka i waluty", valuePln: 768, currency: "USD", sector: "Cash" }
  ],
  etfTargets: [
    { name: "S&P 500 Energy Sector", ticker: "XLE.US", target: 7 },
    { name: "MSCI World ex USA", ticker: "EXUS", target: 10 },
    { name: "Core MSCI EM IMI", ticker: "EIMI", target: 15 },
    { name: "Core MSCI World", ticker: "IWDA", target: 30 },
    { name: "Core S&P 500", ticker: "CSPX", target: 30 }
  ],
  monitoredAssets: [
    { id: "sp500_etf", name: "S&P 500 ETF", symbol: "SPY.US", class: "equity_etf", currency: "USD", drivers: ["Fed", "US yields", "USD/PLN", "ETF flows"] },
    { id: "core_msci_world", name: "Core MSCI World", symbol: "IWDA", class: "equity_etf", currency: "USD", drivers: ["global equities", "USD/PLN", "Fed", "ECB"] },
    { id: "shy", name: "SHY", symbol: "SHY.US", class: "bond_etf", currency: "USD", drivers: ["Fed", "US 2Y", "real rates"] },
    { id: "gold", name: "Zloto", symbol: "XAU", class: "commodity", currency: "PLN", drivers: ["real rates", "USD", "inflation"] },
    { id: "xle", name: "XLE", symbol: "XLE.US", class: "sector_etf", currency: "USD", drivers: ["oil", "gas", "inflation"] },
    { id: "ura", name: "URA", symbol: "URA.US", class: "thematic_etf", currency: "USD", drivers: ["uranium", "nuclear", "energy security"] },
    { id: "ung", name: "UNG / gaz ziemny", symbol: "UNG.US", class: "commodity_etf", currency: "USD", drivers: ["natural gas", "weather", "EIA storage"] },
    { id: "btc", name: "Bitcoin", symbol: "BTC", class: "crypto", currency: "USD", drivers: ["liquidity", "ETF flows", "crypto sentiment"] },
    { id: "eth", name: "Ethereum", symbol: "ETH", class: "crypto", currency: "USD", drivers: ["on-chain", "gas", "staking"] },
    { id: "link", name: "Chainlink", symbol: "LINK", class: "crypto", currency: "USD", drivers: ["oracle adoption", "token flows"] },
    { id: "xrp", name: "XRP", symbol: "XRP", class: "crypto", currency: "USD", drivers: ["regulation", "Ripple news"] },
    { id: "sol", name: "Solana", symbol: "SOL", class: "crypto", currency: "USD", drivers: ["ecosystem", "on-chain activity"] },
    { id: "usdpln", name: "USD/PLN", symbol: "USDPLN", class: "fx", currency: "PLN", drivers: ["Fed", "NBP", "risk sentiment"] },
    { id: "eurpln", name: "EUR/PLN", symbol: "EURPLN", class: "fx", currency: "PLN", drivers: ["ECB", "NBP", "eurozone macro"] }
  ],
  indicators: [
    { id: "yieldCurve", name: "Krzywa rentownosci", value: "-0.4 pp", score: 65, note: "Odwracanie lub splaszczanie podnosi ryzyko poznego cyklu." },
    { id: "creditSpreads", name: "Spready kredytowe", value: "neutralne", score: 45, note: "Wzrost spreadow wspiera redukcje ryzyka akcyjnego." },
    { id: "ismPmi", name: "ISM/PMI", value: "mieszane", score: 50, note: "Powyzej 50 sprzyja cyklicznym aktywom, ponizej 50 premiuje defensywe." },
    { id: "breadth", name: "Szerokosc rynku", value: "do uzupelnienia", score: 50, note: "Waski rynek zwieksza ryzyko korekty indeksow wazonych kapitalizacja." },
    { id: "sahm", name: "Regula Sahm", value: "do uzupelnienia", score: 35, note: "Aktywacja reguly sugeruje recesyjny rezim i wieksza ostroznosc." },
    { id: "buffett", name: "Wskaznik Buffetta", value: "wysoki", score: 70, note: "Wysoka wycena obniza oczekiwana stope zwrotu dlugoterminowo." },
    { id: "cape", name: "Shiller CAPE", value: "wysoki", score: 70, note: "CAPE nie timinguje rynku, ale pomaga ustawic premie za ryzyko." },
    { id: "aaii", name: "AAII bull-bear", value: "do uzupelnienia", score: 50, note: "Skrajny optymizm bywa kontrarianski; skrajny pesymizm tworzy okazje." },
    { id: "vix", name: "VIX", value: "do uzupelnienia", score: 50, note: "Niski VIX przy wysokich wycenach to ryzyko samozadowolenia rynku." },
    { id: "fearGreed", name: "CNN Fear & Greed", value: "do uzupelnienia", score: 50, note: "Skrajna chciwosc zmniejsza margines bezpieczenstwa." },
    { id: "gsBullBear", name: "GS Bull/Bear", value: "do uzupelnienia", score: 50, note: "Syntetyczny obraz cyklu: momentum, wyceny, inflacja i wzrost." },
    { id: "flows", name: "Przeplywy do funduszy", value: "do uzupelnienia", score: 50, note: "Naplywy wzmacniaja trend, odplywy moga sygnalizowac delewarowanie." }
  ],
  news: [
    { id: uid(), title: "Dodaj tu news o inflacji, Fed, wynikach spolek albo BTC", source: "Manual", tags: "macro, portfolio", impact: "neutral", url: "", date: "2026-07-03" }
  ]
};

let state = loadState();

const pln = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });
const plnPrecise = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const pct = new Intl.NumberFormat("pl-PL", { style: "percent", maximumFractionDigits: 1 });

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function loadState() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) return normalizeState(JSON.parse(current));
  for (const key of OLD_KEYS) {
    const old = localStorage.getItem(key);
    if (old) return normalizeState(JSON.parse(old));
  }
  return structuredClone(initialData);
}

function normalizeState(raw) {
  const next = { ...structuredClone(initialData), ...raw };
  next.assets = Array.isArray(raw.assets) ? raw.assets.filter((asset) => !String(asset.account || "").startsWith("XTB")) : initialData.assets;
  next.xtbPositions = Array.isArray(raw.xtbPositions) ? raw.xtbPositions : structuredClone(initialData.xtbPositions);
  next.news = Array.isArray(raw.news) ? raw.news : structuredClone(initialData.news);
  next.etfTargets = Array.isArray(raw.etfTargets) ? raw.etfTargets.map((item) => ({ ...item, target: Number(item.target || 0) })) : initialData.etfTargets;
  next.monitoredAssets = Array.isArray(raw.monitoredAssets) ? raw.monitoredAssets : structuredClone(initialData.monitoredAssets);
  return next;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sum(items, key = "valuePln") {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function allPositions() {
  return [...state.assets, ...state.xtbPositions];
}

function xtbTotal() {
  return sum(state.xtbPositions);
}

function byCategory() {
  return allPositions().reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + Number(asset.valuePln || 0);
    return acc;
  }, {});
}

function byAccount() {
  return state.xtbPositions.reduce((acc, item) => {
    acc[item.account] = acc[item.account] || { total: 0, stocks: 0, etfs: 0, cash: 0, count: 0 };
    acc[item.account].total += Number(item.valuePln || 0);
    acc[item.account].count += 1;
    if (item.category === "Akcje") acc[item.account].stocks += Number(item.valuePln || 0);
    if (item.category === "ETF") acc[item.account].etfs += Number(item.valuePln || 0);
    if (item.category === "Gotowka i waluty") acc[item.account].cash += Number(item.valuePln || 0);
    return acc;
  }, {});
}

function riskAverage() {
  return Math.round(state.indicators.reduce((acc, item) => acc + Number(item.score), 0) / state.indicators.length);
}

function riskClass(score) {
  if (score >= 62) return ["wysokie", "bad"];
  if (score >= 45) return ["neutralne", "warn"];
  return ["sprzyjajace", "good"];
}

function render() {
  const total = sum(allPositions());
  const risk = riskAverage();
  const [riskText] = riskClass(risk);
  const drift = maxEtfDrift();

  setText("#totalValue", pln.format(total));
  setText("#totalMeta", `Stan: ${state.asOf}`);
  setText("#xtbValue", pln.format(xtbTotal()));
  setText("#xtbShare", `${pct.format(xtbTotal() / total)} majatku`);
  setText("#riskScore", `${risk}/100`);
  setText("#riskLabel", riskText);
  setText("#rebalanceNeed", `${drift.toFixed(1)} pp`);
  setText("#assetCount", `${allPositions().length} pozycji`);
  setText("#assetsTotal", pln.format(sum(state.assets)));

  renderAllocationChart();
  renderTopAssets(total);
  renderDecisionNotes(risk, total);
  renderAssets();
  renderXtb();
  renderMonitoringScope();
  renderEtf();
  renderIndicators();
  renderWatchlist();
  renderNews();
  renderOpportunities();
  renderMarketData(state.marketData);
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function renderMarketData(data) {
  const fallback = data || {
    source: "NBP",
    fetchedAt: null,
    rates: {
      USD: { value: state.fx.usdpln, date: state.asOf },
      EUR: { value: state.fx.eurpln, date: state.asOf },
      JPY: { value: null, date: state.asOf },
      GOLD: { value: state.fx.goldPlnGram, date: state.asOf }
    }
  };
  setText("#rateUsd", formatRate(fallback.rates.USD?.value));
  setText("#rateEur", formatRate(fallback.rates.EUR?.value));
  setText("#rateJpy", formatRate(fallback.rates.JPY?.value));
  setText("#rateGold", formatRate(fallback.rates.GOLD?.value));
  setText("#rateUsdDate", `NBP tabela A: ${fallback.rates.USD?.date || "-"}`);
  setText("#rateEurDate", `NBP tabela A: ${fallback.rates.EUR?.date || "-"}`);
  setText("#rateJpyDate", `NBP tabela A: ${fallback.rates.JPY?.date || "-"}`);
  setText("#rateGoldDate", `NBP cena zlota: ${fallback.rates.GOLD?.date || "-"}`);
  setText("#marketDataStatus", fallback.fetchedAt ? `Zrodlo: NBP | pobrano ${formatDateTime(fallback.fetchedAt)}` : "Zrodlo: NBP | dane startowe");
}

function formatRate(value) {
  return Number.isFinite(Number(value)) ? plnPrecise.format(Number(value)) : "-";
}

function formatDateTime(isoDate) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

async function refreshMarketData() {
  setText("#marketDataStatus", "pobieram z NBP...");
  try {
    const [tableResponse, goldResponse] = await Promise.all([
      fetch(NBP_TABLE_A_URL, { cache: "no-store" }),
      fetch(NBP_GOLD_URL, { cache: "no-store" })
    ]);
    if (!tableResponse.ok || !goldResponse.ok) {
      throw new Error("NBP API error");
    }
    const tablePayload = await tableResponse.json();
    const goldPayload = await goldResponse.json();
    const table = tablePayload[0];
    const byCode = Object.fromEntries(table.rates.map((rate) => [rate.code, rate.mid]));
    const gold = goldPayload[0];
    state.marketData = {
      source: "Narodowy Bank Polski",
      fetchedAt: new Date().toISOString(),
      rates: {
        USD: { value: byCode.USD, date: table.effectiveDate },
        EUR: { value: byCode.EUR, date: table.effectiveDate },
        JPY: { value: byCode.JPY, date: table.effectiveDate },
        GOLD: { value: gold.cena, date: gold.data }
      }
    };
    state.fx = {
      ...state.fx,
      usdpln: byCode.USD,
      eurpln: byCode.EUR,
      goldPlnGram: gold.cena
    };
    saveState();
    renderMarketData(state.marketData);
  } catch (error) {
    renderMarketData(state.marketData);
    setText("#marketDataStatus", "Nie udalo sie pobrac NBP; pokazuje ostatnie zapisane dane");
  }
}

function renderAllocationChart() {
  const canvas = document.querySelector("#allocationChart");
  const ctx = canvas.getContext("2d");
  const data = Object.entries(byCategory()).sort((a, b) => b[1] - a[1]);
  drawPieChart(ctx, canvas, data, CHART_COLORS, { donut: true, centerLabel: "Majatek" });
  renderLegend("#allocationLegend", data, CHART_COLORS, sum(allPositions()));
}

function drawPieChart(ctx, canvas, data, colors, options = {}) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const total = data.reduce((acc, [, value]) => acc + Number(value || 0), 0);
  if (!total) return;
  const radius = Math.min(canvas.width, canvas.height) * 0.36;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  let start = -Math.PI / 2;
  data.forEach(([, value], index) => {
    const angle = (Number(value) / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    start += angle;
  });
  if (options.donut) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.56, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#18202a";
    ctx.font = "700 18px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(options.centerLabel || "Portfel", cx, cy - 4);
    ctx.font = "13px Segoe UI";
    ctx.fillStyle = "#667085";
    ctx.fillText(pln.format(total), cx, cy + 18);
    ctx.textAlign = "left";
  }
}

function renderLegend(selector, data, colors, total) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = data
    .map(([label, value], index) => `<div class="legend-item">
      <span class="legend-dot" style="background:${colors[index % colors.length]}"></span>
      <strong>${label}</strong>
      <small>${pct.format(value / (total || 1))} | ${pln.format(value)}</small>
    </div>`)
    .join("");
}

function renderTopAssets(total) {
  const list = document.querySelector("#topAssets");
  list.innerHTML = "";
  allPositions()
    .slice()
    .sort((a, b) => b.valuePln - a.valuePln)
    .slice(0, 8)
    .forEach((asset) => {
      const item = document.createElement("div");
      item.className = "asset-item";
      item.innerHTML = `<strong>${asset.name}</strong><strong>${pln.format(asset.valuePln)}</strong><small>${asset.category} - ${asset.account || "-"}</small><small>${pct.format(asset.valuePln / total)}</small>`;
      list.appendChild(item);
    });
}

function renderDecisionNotes(risk, total) {
  const cash = allPositions().filter((asset) => asset.category === "Gotowka i waluty").reduce((acc, item) => acc + item.valuePln, 0);
  const crypto = allPositions().filter((asset) => asset.category === "Krypto").reduce((acc, item) => acc + item.valuePln, 0);
  const stocksEtfs = allPositions().filter((asset) => ["Akcje", "ETF"].includes(asset.category)).reduce((acc, item) => acc + item.valuePln, 0);
  const notes = [
    { title: "XTB", text: `${pct.format(xtbTotal() / total)} majatku jest w XTB. Podzial IKE/IKZE/Portfel USD pozwoli oddzielic ryzyko podatkowe i walutowe.` },
    { title: "Ryzyko akcyjne", text: `${pct.format(stocksEtfs / total)} majatku jest w akcjach i ETF-ach. Przy wysokich wycenach warto pilnowac transz i rebalance.` },
    { title: "Bufor", text: `${pct.format(cash / total)} majatku jest w gotowce i walutach. To daje paliwo do zakupow po korektach.` },
    { title: "Krypto", text: `${pct.format(crypto / total)} majatku jest w krypto. Dobrze miec limit pozycji i poziomy redukcji po silnych wzrostach.` },
    { title: "Rezim", text: risk >= 62 ? "Model wskazuje ostroznosc: nowe zakupy akcji lepiej rozkladac na transze." : "Model nie pokazuje skrajnego stresu: rebalancing moze isc blizej wag docelowych." }
  ];
  document.querySelector("#decisionNotes").innerHTML = notes.map(noteCard).join("");
}

function noteCard(note) {
  return `<article class="note"><strong>${note.title}</strong><p>${note.text}</p></article>`;
}

function renderAssets() {
  const rows = document.querySelector("#assetRows");
  rows.innerHTML = "";
  state.assets
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category) || b.valuePln - a.valuePln)
    .forEach((asset) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${asset.name}</td><td>${asset.category}</td><td>${asset.account || "-"}</td><td class="num">${pln.format(asset.valuePln)}</td><td class="num"><button class="delete" data-kind="asset" data-id="${asset.id}">Usun</button></td>`;
      rows.appendChild(tr);
    });
}

function renderXtb() {
  const accounts = byAccount();
  document.querySelector("#xtbAccountCards").innerHTML = Object.entries(accounts)
    .map(([account, data]) => `<article class="account-card">
      <header><strong>${account}</strong><span>${data.count} poz.</span></header>
      <div class="account-total">${pln.format(data.total)}</div>
      <small>Akcje: ${pln.format(data.stocks)} | ETF: ${pln.format(data.etfs)} | Gotowka: ${pln.format(data.cash)}</small>
    </article>`)
    .join("");
  const accountData = Object.entries(accounts).map(([account, data]) => [account.replace("XTB ", ""), data.total]);
  const accountCanvas = document.querySelector("#xtbAccountChart");
  if (accountCanvas) {
    drawPieChart(accountCanvas.getContext("2d"), accountCanvas, accountData, CHART_COLORS, { donut: true, centerLabel: "XTB" });
    renderLegend("#xtbAccountLegend", accountData, CHART_COLORS, xtbTotal());
  }

  const rows = document.querySelector("#xtbRows");
  rows.innerHTML = "";
  state.xtbPositions
    .slice()
    .sort((a, b) => a.account.localeCompare(b.account) || b.valuePln - a.valuePln)
    .forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${item.account}</td><td>${item.name}</td><td>${item.category}</td><td>${item.ticker || "-"}</td><td class="num">${pln.format(item.valuePln)}</td><td class="num">${fmt(item.pe)}</td><td class="num">${fmt(item.evEbitda)}</td><td class="num"><button class="delete" data-kind="xtb" data-id="${item.id}">Usun</button></td>`;
      rows.appendChild(tr);
    });
  setText("#xtbPositionsMeta", `${state.xtbPositions.length} pozycji | ${pln.format(xtbTotal())}`);
}

function renderMonitoringScope() {
  const target = document.querySelector("#monitoringScope");
  if (!target) return;
  target.innerHTML = state.monitoredAssets
    .map((asset) => {
      const held = allPositions().some((item) => item.ticker === asset.symbol || item.name.toLowerCase().includes(asset.name.toLowerCase()));
      return `<article class="monitoring-card">
        <header>
          <strong>${asset.name}</strong>
          <span class="pill ${held ? "good" : "warn"}">${held ? "w portfelu" : "watch"}</span>
        </header>
        <small>${asset.symbol} | ${asset.class} | ${asset.currency}</small>
        <p>${asset.drivers.join(", ")}</p>
      </article>`;
    })
    .join("");
}

function fmt(value) {
  return value === undefined || value === null || value === "" ? "-" : Number(value).toFixed(1);
}

function etfPortfolioPositions() {
  return state.xtbPositions.filter((item) => item.account === "XTB Portfel USD" && item.category === "ETF");
}

function maxEtfDrift() {
  const total = sum(etfPortfolioPositions()) || 1;
  return Math.max(...state.etfTargets.map((target) => {
    const pos = findByTicker(target.ticker);
    const current = pos ? (pos.valuePln / total) * 100 : 0;
    return Math.abs(current - Number(target.target || 0));
  }), 0);
}

function findByTicker(ticker) {
  return state.xtbPositions.find((item) => item.ticker === ticker || item.name === ticker);
}

function renderEtf() {
  const positions = etfPortfolioPositions();
  const total = sum(positions) || 1;
  const risk = riskAverage();
  const defensiveTilt = risk >= 62 ? 3 : risk <= 42 ? -2 : 0;
  const proposed = state.etfTargets.map((item) => {
    let target = Number(item.target || 0);
    if (item.name.includes("Energy")) target += defensiveTilt > 0 ? 1 : 0;
    if (item.name.includes("S&P 500") && !item.name.includes("Energy")) target -= defensiveTilt;
    if (item.name.includes("World ex USA")) target += defensiveTilt > 0 ? 1 : 0;
    return { ...item, proposed: Math.max(0, target) };
  });
  const norm = proposed.reduce((acc, item) => acc + item.proposed, 0) || 1;
  proposed.forEach((item) => (item.proposed = (item.proposed / norm) * 100));

  document.querySelector("#etfRecommendations").innerHTML = proposed
    .map((item) => {
      const pos = findByTicker(item.ticker);
      const value = pos ? pos.valuePln : 0;
      const current = (value / total) * 100;
      const desired = (item.proposed / 100) * total;
      const diff = desired - value;
      return `<article class="recommendation">
        <header><strong>${item.name}</strong><span>${item.proposed.toFixed(1)}%</span></header>
        <small>Obecnie ${current.toFixed(1)}%, poprzedni cel ${Number(item.target).toFixed(1)}%, ruch: ${pln.format(diff)}</small>
        <div class="bar"><span style="width:${Math.min(100, item.proposed)}%"></span></div>
      </article>`;
    })
    .join("");

  const [label, klass] = riskClass(risk);
  document.querySelector("#regimeName").innerHTML = `<span class="pill ${klass}">${label}</span>`;
  document.querySelector("#prosCons").innerHTML = [
    { title: "Za zmiana", text: "Jesli USA ma wysoka koncentracje i wyceny, dywersyfikacja przez World ex USA i EM obniza zaleznosc od kilku mega-capow." },
    { title: "Przeciw zmianie", text: "Czesty rebalancing moze zwiekszac koszty, podatki poza IKE/IKZE i ryzyko decyzji pod wplywem szumu." },
    { title: "Warunek dzialania", text: "Zmiane proporcji warto robic dopiero, gdy wyceny, cykl, sentyment i szerokosc rynku mowia podobnym jezykiem." }
  ].map(noteCard).join("");
}

function renderIndicators() {
  document.querySelector("#indicatorGrid").innerHTML = state.indicators
    .map((indicator) => {
      const [, klass] = riskClass(indicator.score);
      return `<article class="indicator">
        <header>
          <strong>${indicator.name}</strong>
          <span class="pill ${klass}">${indicator.score}/100</span>
        </header>
        <input data-indicator="${indicator.id}" data-field="value" value="${indicator.value}" />
        <input data-indicator="${indicator.id}" data-field="score" type="number" min="0" max="100" value="${indicator.score}" />
        <small>${indicator.note}</small>
      </article>`;
    })
    .join("");
}

function renderWatchlist() {
  const select = document.querySelector("#symbolSelect");
  const current = allPositions().filter((item) => item.ticker).map((item) => [item.ticker, item.name]);
  const monitored = state.monitoredAssets.map((item) => [item.symbol, item.name]);
  const symbols = Array.from(new Map([...current, ...monitored]).entries());
  select.innerHTML = symbols.map(([symbol, name]) => `<option value="${symbol}">${symbol} - ${name}</option>`).join("");
  drawCandles(makeDemoCandles());
}

function makeDemoCandles() {
  const candles = [];
  let close = 100;
  for (let i = 0; i < 90; i++) {
    const open = close + Math.sin(i / 4) * 0.8;
    close = open + Math.sin(i / 7) * 1.6 + 0.18;
    const high = Math.max(open, close) + 1.5 + Math.random() * 0.8;
    const low = Math.min(open, close) - 1.5 - Math.random() * 0.8;
    candles.push({ date: `D${i + 1}`, open, high, low, close });
  }
  return candles;
}

function drawCandles(candles) {
  const canvas = document.querySelector("#marketChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!candles.length) return;
  const pad = 34;
  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const range = max - min || 1;
  const candleW = Math.max(3, (canvas.width - pad * 2) / candles.length * 0.62);
  const step = (canvas.width - pad * 2) / candles.length;

  ctx.strokeStyle = "#d9dee7";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad + i * ((canvas.height - pad * 2) / 5);
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(canvas.width - pad, y);
    ctx.stroke();
  }

  candles.forEach((c, i) => {
    const x = pad + i * step + step / 2;
    const yHigh = canvas.height - pad - ((c.high - min) / range) * (canvas.height - pad * 2);
    const yLow = canvas.height - pad - ((c.low - min) / range) * (canvas.height - pad * 2);
    const yOpen = canvas.height - pad - ((c.open - min) / range) * (canvas.height - pad * 2);
    const yClose = canvas.height - pad - ((c.close - min) / range) * (canvas.height - pad * 2);
    const up = c.close >= c.open;
    ctx.strokeStyle = up ? "#24785a" : "#b24a4a";
    ctx.fillStyle = up ? "#24785a" : "#b24a4a";
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();
    ctx.fillRect(x - candleW / 2, Math.min(yOpen, yClose), candleW, Math.max(2, Math.abs(yClose - yOpen)));
  });
}

async function loadStooqCandles(symbol) {
  const stooqSymbol = symbol.toLowerCase().replace(".us", ".us").replace("btcusd", "btcusd");
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  const candles = parseOhlcCsv(text);
  if (!candles.length) throw new Error("Brak danych OHLC");
  return candles.slice(-160);
}

function parseOhlcCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines.slice(1).map((line) => {
    const [date, open, high, low, close] = line.split(",");
    return { date, open: Number(open), high: Number(high), low: Number(low), close: Number(close) };
  }).filter((c) => Number.isFinite(c.open) && Number.isFinite(c.high) && Number.isFinite(c.low) && Number.isFinite(c.close));
}

function renderNews() {
  const positionTickers = allPositions().filter((item) => item.ticker && !item.ticker.startsWith("MANUAL")).map((item) => ({ ticker: item.ticker, name: item.name }));
  const monitoredTickers = state.monitoredAssets.map((item) => ({ ticker: item.symbol, name: item.name }));
  const tickers = Array.from(new Map([...positionTickers, ...monitoredTickers].map((item) => [item.ticker, item])).values()).slice(0, 18);
  document.querySelector("#newsLinks").innerHTML = tickers
    .map((item) => `<a target="_blank" href="https://news.google.com/search?q=${encodeURIComponent(item.ticker + ' ' + item.name)}">${item.ticker}</a>`)
    .join("");
  document.querySelector("#newsList").innerHTML = state.news
    .slice()
    .reverse()
    .map((item) => `<article class="news-item ${item.impact}">
      <header><strong>${item.title}</strong><span>${item.impact}</span></header>
      <small>${item.date || ""} | ${item.source || "Manual"} | ${item.tags || ""}</small>
      ${item.url ? `<a target="_blank" href="${item.url}">Otworz zrodlo</a>` : ""}
    </article>`)
    .join("");
}

function renderOpportunities() {
  const ideas = buildOpportunities();
  setText("#opportunityMeta", `${ideas.length} pomyslow | nie jest rekomendacja inwestycyjna`);
  document.querySelector("#opportunityList").innerHTML = ideas.map((idea) => `<article class="recommendation">
    <header><strong>${idea.title}</strong><span class="pill ${idea.klass}">${idea.score}/100</span></header>
    <p>${idea.why}</p>
    <small>Za: ${idea.pros}</small>
    <small>Przeciw: ${idea.cons}</small>
  </article>`).join("");
}

function buildOpportunities() {
  const risk = riskAverage();
  const ideas = [];
  state.xtbPositions.filter((item) => item.category === "Akcje").forEach((item) => {
    let score = 45;
    if (Number(item.pe) > 0 && Number(item.pe) < 18) score += 12;
    if (Number(item.evEbitda) > 0 && Number(item.evEbitda) < 12) score += 10;
    if (Number(item.debtEbitda) >= 0 && Number(item.debtEbitda) < 2.5) score += 8;
    if (Number(item.revenueGrowth) > 5) score += 8;
    if (risk > 62) score -= 8;
    if (score >= 58) {
      ideas.push({
        title: `${item.name} (${item.ticker})`,
        score: Math.min(90, score),
        klass: score >= 70 ? "good" : "warn",
        why: "Model widzi potencjalna okazje, bo wycena i/lub jakosc finansowa wyglada lepiej niz przecietnie na tle wprowadzonych danych.",
        pros: "nizsze mnozniki, wzrost lub rozsadne zadluzenie, jesli pola sa uzupelnione.",
        cons: "brak automatycznej weryfikacji danych, ryzyko sektorowe i mozliwy blad w danych wpisanych recznie."
      });
    }
  });

  const total = sum(etfPortfolioPositions()) || 1;
  state.etfTargets.forEach((target) => {
    const pos = findByTicker(target.ticker);
    const current = pos ? (pos.valuePln / total) * 100 : 0;
    const gap = Number(target.target) - current;
    if (gap > 2) {
      ideas.push({
        title: `Dowazenie: ${target.name}`,
        score: Math.min(80, 55 + Math.round(gap * 3)),
        klass: "warn",
        why: `Pozycja jest ${gap.toFixed(1)} pp ponizej modelowej wagi. To moze byc kandydat do zakupow transzami.`,
        pros: "porzadkuje portfel i realizuje zalozona dywersyfikacje.",
        cons: "model wag nie uwzglednia jeszcze biezacych wycen ani momentum z API."
      });
    }
  });

  if (!ideas.length) {
    ideas.push({
      title: "Brak mocnego sygnalu",
      score: 50,
      klass: "warn",
      why: "Na podstawie obecnych danych model nie widzi wyraznej okazji. To tez jest informacja: lepiej dopelnic fundamenty i dane makro.",
      pros: "mniej impulsywnych transakcji.",
      cons: "brak swiezych danych moze ukrywac realne okazje."
    });
  }
  return ideas.sort((a, b) => b.score - a.score).slice(0, 8);
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab, .view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("active");
  });
});

document.querySelector("#assetForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.assets.push({
    id: uid(),
    name: form.get("name"),
    category: form.get("category"),
    valuePln: Number(form.get("valuePln")),
    currency: form.get("currency"),
    ticker: form.get("ticker"),
    account: form.get("account")
  });
  event.currentTarget.reset();
  saveState();
  render();
});

document.querySelector("#xtbForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.xtbPositions.push({
    id: uid(),
    name: form.get("name"),
    ticker: form.get("ticker"),
    account: form.get("account"),
    category: form.get("category"),
    quantity: Number(form.get("quantity") || 0),
    price: Number(form.get("price") || 0),
    avgPrice: Number(form.get("avgPrice") || 0),
    currency: form.get("currency"),
    valuePln: Number(form.get("valuePln")),
    pe: nullableNumber(form.get("pe")),
    evEbitda: nullableNumber(form.get("evEbitda")),
    debtEbitda: nullableNumber(form.get("debtEbitda")),
    margin: nullableNumber(form.get("margin")),
    revenueGrowth: nullableNumber(form.get("revenueGrowth")),
    sector: form.get("sector")
  });
  event.currentTarget.reset();
  saveState();
  render();
});

function nullableNumber(value) {
  return value === "" || value === null ? null : Number(value);
}

document.body.addEventListener("click", (event) => {
  if (!event.target.matches(".delete")) return;
  const kind = event.target.dataset.kind;
  const id = event.target.dataset.id;
  if (kind === "asset") state.assets = state.assets.filter((asset) => asset.id !== id);
  if (kind === "xtb") state.xtbPositions = state.xtbPositions.filter((asset) => asset.id !== id);
  saveState();
  render();
});

document.querySelector("#indicatorGrid").addEventListener("change", (event) => {
  const id = event.target.dataset.indicator;
  const field = event.target.dataset.field;
  const indicator = state.indicators.find((item) => item.id === id);
  indicator[field] = field === "score" ? Number(event.target.value) : event.target.value;
  saveState();
  render();
});

document.querySelector("#newsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.news.push({
    id: uid(),
    title: form.get("title"),
    source: form.get("source"),
    tags: form.get("tags"),
    impact: form.get("impact"),
    url: form.get("url"),
    date: new Date().toISOString().slice(0, 10)
  });
  event.currentTarget.reset();
  saveState();
  render();
});

document.querySelector("#exportData").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rynki-${state.asOf}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#importData").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  state = normalizeState(JSON.parse(await file.text()));
  saveState();
  render();
});

document.querySelector("#resetData").addEventListener("click", () => {
  state = structuredClone(initialData);
  saveState();
  render();
});

document.querySelector("#csvImport").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const candles = parseOhlcCsv(await file.text());
  drawCandles(candles);
  setText("#chartStatus", `CSV: ${file.name}`);
});

document.querySelector("#loadChart").addEventListener("click", async () => {
  const symbol = document.querySelector("#symbolSelect").value;
  setText("#chartStatus", `pobieram ${symbol}...`);
  try {
    const candles = await loadStooqCandles(symbol);
    drawCandles(candles);
    setText("#chartStatus", `${symbol}: ${candles.length} swiec`);
  } catch (error) {
    drawCandles(makeDemoCandles());
    setText("#chartStatus", `brak danych online dla ${symbol}; pokaz demo/import CSV`);
  }
});

render();
refreshMarketData();

document.querySelector("#refreshMarketData").addEventListener("click", refreshMarketData);
