const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  cycleFilter: "mature",
  selectedCycle: "2025",
  selectedPattern: "pivotAlta",
  glossaryCat: "Todos",
  score: {}
};

const COLORS = {
  orange: "#f7931a",
  yellow: "#ffd166",
  cyan: "#49d6ff",
  green: "#58f0a7",
  red: "#ff6f91",
  purple: "#a78bfa",
  muted: "#9aa8bf",
  grid: "rgba(148,163,184,.16)",
  text: "#eaf1ff"
};

const plotConfig = {
  displayModeBar: false,
  responsive: true,
  scrollZoom: false,
  doubleClick: false,
  staticPlot: false
};

function baseLayout(extra = {}) {
  const mobile = window.innerWidth < 640;
  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(4,8,18,.35)",
    font: { family: "Inter, sans-serif", color: COLORS.text, size: mobile ? 10 : 12 },
    margin: { l: mobile ? 46 : 62, r: mobile ? 14 : 24, t: mobile ? 28 : 42, b: mobile ? 52 : 62 },
    hovermode: "closest",
    dragmode: false,
    showlegend: true,
    legend: { orientation: "h", y: -0.18, x: 0, font: { size: mobile ? 10 : 11, color: COLORS.muted } },
    xaxis: {
      fixedrange: true,
      gridcolor: COLORS.grid,
      zerolinecolor: COLORS.grid,
      tickfont: { color: COLORS.muted, size: mobile ? 9 : 11 },
      titlefont: { color: COLORS.muted }
    },
    yaxis: {
      fixedrange: true,
      gridcolor: COLORS.grid,
      zerolinecolor: COLORS.grid,
      tickfont: { color: COLORS.muted, size: mobile ? 9 : 11 },
      titlefont: { color: COLORS.muted }
    }
  };
  return deepMerge(layout, extra);
}

function deepMerge(target, source) {
  const out = (typeof structuredClone !== "undefined") ? structuredClone(target) : JSON.parse(JSON.stringify(target));
  for (const key of Object.keys(source || {})) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) out[key] = deepMerge(out[key] || {}, source[key]);
    else out[key] = source[key];
  }
  return out;
}

function fmtUSD(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "em aberto";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: digits }).format(value);
}
function fmtNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "em aberto";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);
}
function fmtDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date + "T00:00:00Z"));
}
function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 86400000);
}
function getCycles() {
  if (state.cycleFilter === "all") return BTC_DATA.cycles;
  if (state.cycleFilter === "current") return BTC_DATA.cycles.filter(c => ["2017", "2021", "2025"].includes(c.id));
  return BTC_DATA.cycles.filter(c => ["2017", "2021", "2025"].includes(c.id));
}
function scrollToId(id) { $("#" + id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
window.scrollToId = scrollToId;

function init() {
  setupNav();
  renderSourceStrip();
  renderCycleChips();
  renderAllCharts();
  renderInspector(state.selectedCycle);
  renderQuickDates();
  renderTimeline();
  analyzeDate();
  renderMarketCap();
  renderIndicators();
  renderPatterns();
  renderOnchain();
  renderDerivatives();
  renderScore();
  renderChecklist();
  renderCodeBlocks();
  renderGlossary();
  renderSources();
  setupSearch();
  fetchLivePrice();
  animateIn();
  window.addEventListener("resize", debounce(renderAllCharts, 250));
}

document.addEventListener("DOMContentLoaded", init);

function setupNav() {
  const toggle = $("#navToggle");
  const overlay = $("#overlay");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", document.body.classList.contains("nav-open") ? "true" : "false");
  });
  overlay?.addEventListener("click", () => document.body.classList.remove("nav-open"));
  $$(".nav-link").forEach(link => link.addEventListener("click", () => document.body.classList.remove("nav-open")));
  const sections = $$(".observe[id]");
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        $$(".nav-link").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      }
    });
  }, { rootMargin: "-22% 0px -68% 0px", threshold: 0 });
  sections.forEach(s => io.observe(s));
  $("#backTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => $("#backTop")?.classList.toggle("show", window.scrollY > 900));
  $("#themePulse")?.addEventListener("click", () => {
    document.body.animate([{ filter: "saturate(1.4) brightness(1.12)" }, { filter: "none" }], { duration: 900, easing: "ease-out" });
  });
}

function animateIn() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  $$(".observe").forEach(el => io.observe(el));
}

function renderSourceStrip() {
  const el = $("#athStrip");
  if (!el) return;
  el.innerHTML = BTC_DATA.athSources.map(s => `
    <div class="source-mini">
      <small>${s.source}</small>
      <strong>${fmtUSD(s.ath, s.ath > 1000 ? 0 : 2)}</strong>
      <span>${fmtDate(s.date)} · ${s.use}</span>
    </div>
  `).join("");
}

function renderCycleChips() {
  const el = $("#macroChips");
  if (!el) return;
  el.innerHTML = BTC_DATA.cycles.map(c => `<button class="chip ${c.id === state.selectedCycle ? "active" : ""}" data-cycle-chip="${c.id}">${c.id}</button>`).join("");
  $$('[data-cycle-chip]').forEach(btn => btn.addEventListener("click", () => {
    state.selectedCycle = btn.dataset.cycleChip;
    renderCycleChips();
    renderInspector(state.selectedCycle);
  }));
}

function renderAllCharts() {
  renderMacroCurveChart();
  renderBullDurationChart();
  renderBearDurationChart();
  renderDrawdownChart();
  renderHalvingTopChart();
  renderLogForceChart();
  renderCurrentWindowChart();
  renderMADemoChart();
  renderRSIDemoChart();
  renderStochDemoChart();
  renderOnchainRegimeChart();
  renderDerivativeRiskChart();
  const filter = $("#cycleFilter");
  if (filter && !filter.dataset.bound) {
    filter.dataset.bound = "1";
    filter.addEventListener("change", () => {
      state.cycleFilter = filter.value;
      renderAllCharts();
    });
  }
}

function plot(id, data, layout) {
  const el = $("#" + id);
  if (!el || !window.Plotly) return;
  Plotly.react(el, data, layout, plotConfig);
  el.on?.("plotly_click", ev => {
    const point = ev.points?.[0];
    const cycleId = point?.customdata;
    if (cycleId) {
      state.selectedCycle = cycleId;
      renderCycleChips();
      renderInspector(cycleId);
    }
  });
}

function renderMacroCurveChart() {
  const xs = [];
  const ys = [];
  const text = [];
  const custom = [];
  BTC_DATA.cycles.forEach(c => {
    xs.push(c.lowDate, c.topDate);
    ys.push(c.low, c.top);
    text.push(`${c.label}<br>Fundo ${fmtDate(c.lowDate)}<br>${fmtUSD(c.low, 2)}`, `${c.label}<br>Topo ${fmtDate(c.topDate)}<br>${fmtUSD(c.top, 0)}`);
    custom.push(c.id, c.id);
    if (c.nextLowDate && c.nextLow) {
      xs.push(c.nextLowDate); ys.push(c.nextLow); text.push(`${c.label}<br>Fundo posterior ${fmtDate(c.nextLowDate)}<br>${fmtUSD(c.nextLow, 2)}`); custom.push(c.id);
    }
  });
  plot("macroCurveChart", [{
    x: xs, y: ys, type: "scatter", mode: "lines+markers", text, customdata: custom,
    hovertemplate: "%{text}<extra></extra>",
    line: { color: COLORS.orange, width: 3, shape: "spline" },
    marker: { size: 9, color: ys.map((_, i) => i % 2 ? COLORS.orange : COLORS.cyan), line: { width: 1, color: "#fff" } },
    name: "Pontos macro"
  }], baseLayout({
    yaxis: { type: "log", title: "Preço em escala log", fixedrange: true },
    xaxis: { title: "Tempo", fixedrange: true },
    annotations: [{ x: "2026-11-01", y: 35000, text: "janela<br>out/nov 2026", showarrow: true, arrowcolor: COLORS.cyan, font: { color: COLORS.cyan }, ax: -40, ay: -45 }],
    shapes: [{ type: "rect", xref: "x", yref: "paper", x0: "2026-10-06", x1: "2026-11-30", y0: 0, y1: 1, fillcolor: "rgba(73,214,255,.08)", line: { width: 0 } }]
  }));
}

function renderBullDurationChart() {
  const cycles = getCycles();
  plot("bullDurationChart", [{
    x: cycles.map(c => c.id), y: cycles.map(c => c.bullDays), customdata: cycles.map(c => c.id), type: "bar",
    marker: { color: cycles.map(c => c.current ? COLORS.orange : COLORS.cyan) },
    hovertemplate: "%{x}<br>%{y} dias<extra></extra>", name: "Alta"
  }], baseLayout({ yaxis: { title: "Dias", fixedrange: true }, xaxis: { title: "Ciclo", fixedrange: true }, showlegend: false }));
}

function renderBearDurationChart() {
  const cycles = getCycles().filter(c => c.bearDays);
  plot("bearDurationChart", [{
    x: cycles.map(c => c.id), y: cycles.map(c => c.bearDays), customdata: cycles.map(c => c.id), type: "bar",
    marker: { color: COLORS.purple }, hovertemplate: "%{x}<br>%{y} dias<extra></extra>", name: "Baixa"
  }, {
    x: BTC_DATA.currentWindow.map(w => w.label), y: BTC_DATA.currentWindow.map(w => w.daysFromTop), type: "scatter", mode: "markers",
    marker: { color: COLORS.orange, size: 11, symbol: "diamond" }, hovertemplate: "%{x}<br>%{y} dias<extra></extra>", name: "Janelas 2026"
  }], baseLayout({ yaxis: { title: "Dias", fixedrange: true }, xaxis: { title: "Ciclo ou janela", fixedrange: true } }));
}

function renderDrawdownChart() {
  const cycles = getCycles().filter(c => c.drawdown !== null);
  plot("drawdownChart", [{
    x: cycles.map(c => c.id), y: cycles.map(c => c.drawdown), customdata: cycles.map(c => c.id), type: "bar",
    marker: { color: COLORS.red }, hovertemplate: "%{x}<br>%{y:.1f}%<extra></extra>", name: "Drawdown"
  }], baseLayout({ yaxis: { title: "Queda percentual", ticksuffix: "%", fixedrange: true }, xaxis: { title: "Ciclo", fixedrange: true }, showlegend: false }));
}

function renderHalvingTopChart() {
  const cycles = getCycles().filter(c => c.halvingToTop);
  plot("halvingTopChart", [{
    x: cycles.map(c => c.id), y: cycles.map(c => c.halvingToTop), customdata: cycles.map(c => c.id), type: "bar",
    marker: { color: cycles.map(c => c.current ? COLORS.orange : COLORS.green) }, hovertemplate: "%{x}<br>%{y} dias<extra></extra>", name: "Halving até topo"
  }], baseLayout({ yaxis: { title: "Dias", fixedrange: true }, xaxis: { title: "Ciclo", fixedrange: true }, showlegend: false }));
}

function renderLogForceChart() {
  const cycles = getCycles();
  plot("logForceChart", [{
    x: cycles.map(c => c.id), y: cycles.map(c => Math.log10(c.returnX)), customdata: cycles.map(c => c.id), type: "bar",
    text: cycles.map(c => `${fmtNumber(c.returnX, 1)}x`), textposition: "outside",
    marker: { color: cycles.map(c => c.current ? COLORS.orange : COLORS.yellow) }, hovertemplate: "%{x}<br>Log10: %{y:.2f}<br>Alta: %{text}<extra></extra>", name: "Força log"
  }], baseLayout({ yaxis: { title: "Log10 do múltiplo", fixedrange: true }, xaxis: { title: "Ciclo", fixedrange: true }, showlegend: false }));
}

function renderCurrentWindowChart() {
  plot("currentWindowChart", [{
    x: BTC_DATA.currentWindow.map(w => w.label), y: BTC_DATA.currentWindow.map(w => w.daysFromTop), type: "bar",
    marker: { color: BTC_DATA.currentWindow.map(w => w.id.includes("central") ? COLORS.orange : COLORS.cyan) },
    customdata: BTC_DATA.currentWindow.map(w => `${fmtDate(w.date)}<br>${w.desc}`),
    hovertemplate: "%{x}<br>%{y} dias<br>%{customdata}<extra></extra>", name: "Dias desde topo"
  }], baseLayout({ yaxis: { title: "Dias desde 06/10/2025", fixedrange: true }, xaxis: { title: "Hipótese", fixedrange: true }, showlegend: false }));
}

function renderInspector(cycleId) {
  const c = BTC_DATA.cycles.find(x => x.id === cycleId) || BTC_DATA.cycles.at(-1);
  const el = $("#cycleInspector");
  if (!el) return;
  el.innerHTML = `
    <strong>${c.label}</strong>
    <p>${c.note}</p>
    <div class="inspector-grid">
      <div class="metric-box"><small>Fundo inicial</small><strong>${fmtDate(c.lowDate)}</strong><small>${fmtUSD(c.low, c.low < 10 ? 2 : 0)}</small></div>
      <div class="metric-box"><small>Topo</small><strong>${fmtDate(c.topDate)}</strong><small>${fmtUSD(c.top, 0)}</small></div>
      <div class="metric-box"><small>Duração da alta</small><strong>${fmtNumber(c.bullDays)} dias</strong><small>${fmtNumber(c.returnX, 1)}x</small></div>
      <div class="metric-box"><small>Baixa posterior</small><strong>${c.bearDays ? fmtNumber(c.bearDays) + " dias" : "em aberto"}</strong><small>${c.drawdown ? c.drawdown.toFixed(1) + "%" : "sem fundo confirmado"}</small></div>
    </div>
  `;
}

function renderQuickDates() {
  const el = $("#quickDates");
  if (!el) return;
  el.innerHTML = BTC_DATA.quickDates.map(d => `<button data-date="${d.date}">${d.label}</button>`).join("");
  $$("#quickDates button").forEach(btn => btn.addEventListener("click", () => {
    $("#dateSearch").value = btn.dataset.date;
    analyzeDate();
  }));
  $("#dateSearchBtn")?.addEventListener("click", analyzeDate);
  $("#dateSearch")?.addEventListener("change", analyzeDate);
}

function analyzeDate() {
  const input = $("#dateSearch")?.value;
  const el = $("#dateResult");
  if (!input || !el) return;
  const target = new Date(input + "T00:00:00Z");
  const nearest = BTC_DATA.macroEvents.map(e => ({...e, distance: Math.abs((new Date(e.date + "T00:00:00Z") - target) / 86400000)})).sort((a,b) => a.distance - b.distance)[0];
  const phase = getCyclePhase(input);
  el.innerHTML = `
    <span class="badge">${phase.badge}</span>
    <h3>${phase.title}</h3>
    <p>${phase.text}</p>
    <div class="metric-box" style="margin-top:14px"><small>Evento macro mais próximo</small><strong>${nearest.title}</strong><small>${fmtDate(nearest.date)} · distância de ${Math.round(nearest.distance)} dias</small><p style="margin:8px 0 0">${nearest.desc}</p></div>
  `;
}

function getCyclePhase(date) {
  for (const c of BTC_DATA.cycles) {
    if (date >= c.lowDate && date <= c.topDate) {
      const done = daysBetween(c.lowDate, date);
      const pct = Math.max(0, Math.min(100, done / c.bullDays * 100));
      return { badge: "fase de alta", title: `${c.label}: alta em andamento`, text: `A data fica aproximadamente em ${pct.toFixed(1)}% da alta entre fundo e topo. Isso mede tempo, não garante preço.` };
    }
    if (c.nextLowDate && date > c.topDate && date <= c.nextLowDate) {
      const done = daysBetween(c.topDate, date);
      const pct = Math.max(0, Math.min(100, done / c.bearDays * 100));
      return { badge: "fase de baixa", title: `${c.label}: baixa pós-topo`, text: `A data fica aproximadamente em ${pct.toFixed(1)}% da queda temporal entre topo e fundo posterior.` };
    }
  }
  if (date >= "2025-10-06" && date <= "2026-12-31") return { badge: "ciclo atual", title: "Janela pós-topo 2025", text: "Data dentro da fase em observação. A tese mais limpa é procurar sinais de fundo entre outubro e novembro de 2026, mas exigir confirmação por estrutura, on-chain e derivativos." };
  return { badge: "fora das janelas", title: "Data fora dos ciclos mapeados", text: "Use como referência aproximada. O site prioriza pontos macro e janelas didáticas." };
}

function renderTimeline() {
  const el = $("#macroTimeline");
  if (!el) return;
  el.innerHTML = BTC_DATA.macroEvents.map(e => `
    <div class="timeline-item">
      <time>${fmtDate(e.date)}</time>
      <div><strong>${e.title}</strong><p>${e.desc}</p></div>
    </div>
  `).join("");
}

function renderMarketCap() {
  const price = $("#priceInput");
  const supply = $("#supplyInput");
  const update = () => {
    const p = Number(price?.value || 0);
    const s = Number(supply?.value || 0);
    const cap = p * s;
    $("#marketCapResult").innerHTML = `<span>Market cap estimado</span><strong>${fmtUSD(cap, 0)}</strong><p>Com ${fmtNumber(s)} BTC em circulação e preço de ${fmtUSD(p, 0)}.</p>`;
  };
  price?.addEventListener("input", update);
  supply?.addEventListener("input", update);
  update();
  const scenarios = [50000, 69000, 100000, 126198, 150000, 200000, 250000];
  const supplyNow = 19900000;
  plot("marketCapChart", [{
    x: scenarios.map(v => fmtUSD(v, 0)), y: scenarios.map(v => v * supplyNow / 1e12), type: "bar",
    marker: { color: scenarios.map(v => v === 126198 ? COLORS.orange : COLORS.cyan) },
    hovertemplate: "%{x}<br>%{y:.2f} tri USD<extra></extra>", name: "Market cap"
  }], baseLayout({ yaxis: { title: "Trilhões de USD", fixedrange: true }, xaxis: { title: "Preço BTC", fixedrange: true }, showlegend: false }));
}

function renderMADemoChart() {
  const x = Array.from({length: 80}, (_, i) => i + 1);
  const price = x.map(i => 100 + i * .9 + Math.sin(i/4)*8 + Math.sin(i/13)*14);
  const sma20 = price.map((_, i) => i < 19 ? null : avg(price.slice(i-19, i+1)));
  const sma50 = price.map((_, i) => i < 49 ? null : avg(price.slice(i-49, i+1)));
  plot("maDemoChart", [
    {x, y: price, type:"scatter", mode:"lines", line:{color:COLORS.orange,width:3}, name:"Preço"},
    {x, y: sma20, type:"scatter", mode:"lines", line:{color:COLORS.cyan,width:2}, name:"SMA 20"},
    {x, y: sma50, type:"scatter", mode:"lines", line:{color:COLORS.purple,width:2}, name:"SMA 50"}
  ], baseLayout({ yaxis: { title:"Preço didático", fixedrange:true }, xaxis: { title:"Tempo", fixedrange:true } }));
}

function renderRSIDemoChart() {
  const x = Array.from({length: 70}, (_, i) => i + 1);
  const y = x.map(i => 50 + Math.sin(i/5)*24 + Math.sin(i/13)*12);
  plot("rsiDemoChart", [{x, y, type:"scatter", mode:"lines", line:{color:COLORS.cyan,width:3}, name:"RSI"}], baseLayout({
    shapes:[
      {type:"line",xref:"paper",x0:0,x1:1,y0:70,y1:70,line:{color:COLORS.red,width:1,dash:"dot"}},
      {type:"line",xref:"paper",x0:0,x1:1,y0:30,y1:30,line:{color:COLORS.green,width:1,dash:"dot"}}
    ],
    annotations:[{x:1,y:70,xref:"paper",text:"70",showarrow:false,font:{color:COLORS.red}},{x:1,y:30,xref:"paper",text:"30",showarrow:false,font:{color:COLORS.green}}],
    yaxis:{range:[0,100],title:"RSI",fixedrange:true},xaxis:{title:"Tempo",fixedrange:true},showlegend:false
  }));
}

function renderStochDemoChart() {
  const x = Array.from({length: 70}, (_, i) => i + 1);
  const k = x.map(i => 50 + Math.sin(i/4)*36 + Math.sin(i/11)*10);
  const d = k.map((_, i) => i < 2 ? null : avg(k.slice(i-2, i+1)));
  plot("stochDemoChart", [
    {x,y:k,type:"scatter",mode:"lines",line:{color:COLORS.orange,width:3},name:"%K"},
    {x,y:d,type:"scatter",mode:"lines",line:{color:COLORS.cyan,width:2},name:"%D"}
  ], baseLayout({
    shapes:[{type:"line",xref:"paper",x0:0,x1:1,y0:80,y1:80,line:{color:COLORS.red,width:1,dash:"dot"}},{type:"line",xref:"paper",x0:0,x1:1,y0:20,y1:20,line:{color:COLORS.green,width:1,dash:"dot"}}],
    yaxis:{range:[0,100],title:"Estocástico",fixedrange:true},xaxis:{title:"Tempo",fixedrange:true}
  }));
}
function avg(arr){return arr.reduce((a,b)=>a+b,0)/arr.length}

function renderIndicators() {
  const el = $("#indicatorCards");
  if (!el) return;
  el.innerHTML = BTC_DATA.indicators.map(i => `
    <article class="indicator-card">
      <span class="tag">${i.group}</span>
      <h3>${i.title}</h3>
      <p>${i.read}</p>
      <code>${i.formula}</code>
      <p><strong>Armadilha:</strong> ${i.trap}</p>
    </article>
  `).join("");
}

function renderPatterns() {
  const buttons = $("#patternButtons");
  if (!buttons) return;
  buttons.innerHTML = BTC_DATA.patterns.map(p => `<button class="${p.id === state.selectedPattern ? "active" : ""}" data-pattern="${p.id}">${p.label}</button>`).join("");
  $$("[data-pattern]").forEach(btn => btn.addEventListener("click", () => {
    state.selectedPattern = btn.dataset.pattern;
    renderPatterns();
  }));
  const p = BTC_DATA.patterns.find(x => x.id === state.selectedPattern) || BTC_DATA.patterns[0];
  drawPattern(p);
  $("#patternExplain").innerHTML = `<h3>${p.label}</h3><p><strong>Viés:</strong> ${p.bias}</p><p>${p.explain}</p><ul>${p.checks.map(c => `<li>${c}</li>`).join("")}</ul>`;
}

function drawPattern(p) {
  const svg = $("#patternSvg");
  if (!svg) return;
  const points = p.points.map(([x,y]) => `${x},${y}`).join(" ");
  svg.innerHTML = `
    <defs>
      <linearGradient id="lineGrad" x1="0" x2="1"><stop offset="0" stop-color="${COLORS.cyan}"/><stop offset="1" stop-color="${COLORS.orange}"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="0" y="0" width="760" height="420" rx="28" fill="rgba(4,8,18,.45)"/>
    ${[80,160,240,320].map(y => `<line x1="40" y1="${y}" x2="720" y2="${y}" stroke="rgba(148,163,184,.12)"/>`).join("")}
    ${[120,240,360,480,600].map(x => `<line x1="${x}" y1="45" x2="${x}" y2="380" stroke="rgba(148,163,184,.08)"/>`).join("")}
    ${p.lines.map(l => `<line x1="${l[0][0]}" y1="${l[0][1]}" x2="${l[1][0]}" y2="${l[1][1]}" stroke="rgba(255,255,255,.48)" stroke-width="3" stroke-dasharray="8 8"/>`).join("")}
    <polyline points="${points}" fill="none" stroke="url(#lineGrad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
    ${p.points.map(([x,y], idx) => `<circle cx="${x}" cy="${y}" r="8" fill="${idx % 2 ? COLORS.orange : COLORS.cyan}" stroke="#fff" stroke-width="2"/>`).join("")}
    <text x="48" y="50" fill="${COLORS.muted}" font-family="Inter" font-size="18" font-weight="800">${p.label}</text>
  `;
}

function renderOnchain() {
  const el = $("#onchainCards");
  if (!el) return;
  el.innerHTML = BTC_DATA.onchain.map(i => `
    <article class="indicator-card">
      <span class="tag">${i.tag}</span><h3>${i.title}</h3>
      <code>${i.formula}</code>
      <p><strong>Boa leitura:</strong> ${i.good}</p><p><strong>Armadilha:</strong> ${i.trap}</p>
    </article>
  `).join("");
}

function renderOnchainRegimeChart() {
  const phase = ["Topo", "Queda", "Capitulação", "Acumulação", "Retomada"];
  plot("onchainRegimeChart", [
    {x:phase,y:[3.8,2.1,1.0,1.2,1.8],type:"scatter",mode:"lines+markers",line:{color:COLORS.orange,width:3},name:"MVRV didático"},
    {x:phase,y:[1.08,.98,.92,1.01,1.05],type:"scatter",mode:"lines+markers",line:{color:COLORS.cyan,width:3},name:"SOPR didático",yaxis:"y2"}
  ], baseLayout({
    yaxis:{title:"MVRV",fixedrange:true},
    yaxis2:{title:"SOPR",overlaying:"y",side:"right",fixedrange:true,gridcolor:"rgba(0,0,0,0)",tickfont:{color:COLORS.muted}},
    xaxis:{title:"Fase de ciclo",fixedrange:true}
  }));
}

function renderDerivatives() {
  const el = $("#derivativeCards");
  if (!el) return;
  el.innerHTML = BTC_DATA.derivatives.map(i => `
    <article class="indicator-card">
      <span class="tag">${i.tag}</span><h3>${i.title}</h3>
      <code>${i.formula}</code>
      <p><strong>Boa leitura:</strong> ${i.good}</p><p><strong>Armadilha:</strong> ${i.trap}</p>
    </article>
  `).join("");
}

function renderDerivativeRiskChart() {
  const x = ["acumulação", "alta inicial", "euforia", "stress", "capitulação", "limpeza"];
  plot("derivativeRiskChart", [
    {x,y:[25,45,88,96,40,22],type:"bar",marker:{color:[COLORS.green,COLORS.cyan,COLORS.orange,COLORS.red,COLORS.purple,COLORS.green]},name:"Risco didático",hovertemplate:"%{x}<br>%{y}/100<extra></extra>"}
  ], baseLayout({ yaxis:{title:"Risco de alavancagem",range:[0,100],fixedrange:true},xaxis:{title:"Regime",fixedrange:true},showlegend:false }));
}

function renderScore() {
  const controls = $("#scoreControls");
  if (!controls) return;
  BTC_DATA.scoreWeights.forEach(w => state.score[w.key] ??= 50);
  controls.innerHTML = BTC_DATA.scoreWeights.map(w => `
    <div class="score-row">
      <label for="score-${w.key}"><span>${w.label}</span><span id="val-${w.key}">${state.score[w.key]}</span></label>
      <small>${w.hint} Peso: ${w.weight}%</small>
      <input id="score-${w.key}" type="range" min="0" max="100" value="${state.score[w.key]}" data-score="${w.key}" />
    </div>
  `).join("");
  $$('[data-score]').forEach(input => input.addEventListener("input", () => {
    state.score[input.dataset.score] = Number(input.value);
    updateScore();
  }));
  updateScore();
}

function updateScore() {
  let total = 0;
  BTC_DATA.scoreWeights.forEach(w => {
    total += (state.score[w.key] || 0) * (w.weight / 100);
    const val = $("#val-" + w.key);
    if (val) val.textContent = state.score[w.key];
  });
  const score = Math.round(total);
  const ring = $(".score-ring");
  if (ring) ring.style.background = `conic-gradient(${score >= 70 ? COLORS.green : score <= 35 ? COLORS.red : COLORS.orange} ${score}%, rgba(255,255,255,.08) 0)`;
  $("#scoreNumber").textContent = score;
  let title = "Neutro";
  let text = "Mercado sem confluência suficiente. Espere confirmação ou reduza tamanho de posição.";
  if (score >= 70) { title = "Confluência forte"; text = "Sinais combinados favorecem risco, mas ainda precisam de invalidação clara e gestão de posição."; }
  if (score <= 35) { title = "Risco ou capitulação"; text = "Sinais frágeis ou mercado em stress. Pode ser zona de oportunidade, mas só com confirmação e controle emocional."; }
  $("#scoreTitle").textContent = title;
  $("#scoreText").textContent = text;
}

function renderChecklist() {
  const el = $("#checklist");
  if (!el) return;
  el.innerHTML = `<div class="checklist-grid">${BTC_DATA.checklist.map((c,i) => `<label class="check-item"><input type="checkbox"/> <span>${i+1}. ${c}</span></label>`).join("")}</div>`;
}

function renderCodeBlocks() {
  const el = $("#codeGrid");
  if (!el) return;
  el.innerHTML = BTC_DATA.pseudoCode.map(c => `<article class="code-card"><h3>${c.title}</h3><pre><code>${escapeHTML(c.code)}</code></pre></article>`).join("");
}

function renderGlossary() {
  const filters = $("#glossaryFilters");
  const grid = $("#glossaryGrid");
  if (!filters || !grid) return;
  const cats = ["Todos", ...new Set(BTC_DATA.glossary.map(g => g.cat))];
  filters.innerHTML = cats.map(cat => `<button class="${cat === state.glossaryCat ? "active" : ""}" data-cat="${cat}">${cat}</button>`).join("");
  $$("[data-cat]").forEach(btn => btn.addEventListener("click", () => { state.glossaryCat = btn.dataset.cat; renderGlossary(); }));
  const q = ($("#glossarySearch")?.value || "").toLowerCase().trim();
  const items = BTC_DATA.glossary.filter(g => (state.glossaryCat === "Todos" || g.cat === state.glossaryCat) && (!q || `${g.term} ${g.cat} ${g.def}`.toLowerCase().includes(q)));
  grid.innerHTML = items.map(g => `<article class="glossary-card"><small>${g.cat}</small><strong>${g.term}</strong><p>${g.def}</p></article>`).join("");
  const search = $("#glossarySearch");
  if (search && !search.dataset.bound) { search.dataset.bound = "1"; search.addEventListener("input", renderGlossary); }
}

function renderSources() {
  const el = $("#sourceGrid");
  if (!el) return;
  el.innerHTML = BTC_DATA.sources.map(s => `<article class="source-card"><small>${s.type}</small><h3>${s.name}</h3><p>${s.note}</p><a href="${s.url}" target="_blank" rel="noreferrer">${s.url}</a></article>`).join("");
}

function setupSearch() {
  document.addEventListener("keydown", ev => {
    if (ev.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      ev.preventDefault();
      scrollToId("glossario");
      setTimeout(() => $("#glossarySearch")?.focus(), 350);
    }
  });
}

async function fetchLivePrice() {
  const priceEl = $("#livePrice");
  const subEl = $("#liveSub");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_change=true", { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("API indisponível");
    const json = await res.json();
    const btc = json.bitcoin;
    if (!btc?.usd) throw new Error("Sem preço");
    priceEl.textContent = fmtUSD(btc.usd, 0);
    subEl.textContent = `${btc.usd_24h_change?.toFixed?.(2) || "0"}% em 24h via CoinGecko`;
  } catch (err) {
    priceEl.textContent = "modo offline";
    subEl.textContent = "dados estáticos ativos";
  }
}

function escapeHTML(str) { return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
