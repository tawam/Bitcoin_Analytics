const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const API = {
  binanceSpot: 'https://api.binance.com/api/v3',
  binanceFutures: 'https://fapi.binance.com/fapi/v1',
  fearGreed: 'https://api.alternative.me/fng/?limit=1&format=json',
  coinGecko: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true'
};

const state = {
  activeTf:'1h', candles:{}, rsi:{}, live:null, lastUpdated:null, errors:[]
};

const plotConfig = {displayModeBar:false, scrollZoom:false, doubleClick:false, responsive:true, staticPlot:false, editable:false};
const plotLayoutBase = {
  paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
  font:{family:'Inter, sans-serif', color:'#c5d2e6'}, margin:{l:46,r:18,t:18,b:52},
  xaxis:{showgrid:false, zeroline:false, fixedrange:true, color:'#7f8da5', tickangle:0, automargin:true, tickfont:{size:12}},
  yaxis:{gridcolor:'rgba(255,255,255,.065)', zeroline:false, fixedrange:true, color:'#7f8da5', automargin:true, tickfont:{size:12}},
  hoverlabel:{bgcolor:'#10192b', bordercolor:'#33415f', font:{color:'#eef3ff'}},
  showlegend:false,
  hovermode:'x unified',
  dragmode:false
};

function isMobileChart(){ return window.matchMedia('(max-width:640px)').matches; }
function formatTickLabel(date, tf, mobile=isMobileChart()){
  const d = new Date(date);
  if(tf === '1h') return mobile
    ? d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})
    : d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  if(tf === '4h') return mobile
    ? d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})
    : d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
  return mobile
    ? d.toLocaleDateString('pt-BR',{month:'short'})
    : d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'});
}
function buildDateAxis(rows, tf){
  const mobile = isMobileChart();
  const count = rows?.length || 0;
  const tickCount = mobile ? (tf==='1d' ? 4 : 5) : (tf==='1d' ? 6 : 7);
  const step = Math.max(1, Math.floor((count - 1) / Math.max(1, tickCount - 1)));
  const vals = [];
  for(let i=0;i<count;i+=step) vals.push(new Date(rows[i].time));
  if(count && vals.length && +vals[vals.length-1] !== +new Date(rows[count-1].time)) vals.push(new Date(rows[count-1].time));
  const uniqueVals = vals.filter((v,i,a)=>i===0 || +v !== +a[i-1]);
  const ticktext = uniqueVals.map(v => formatTickLabel(v, tf, mobile));
  return {
    ...plotLayoutBase.xaxis,
    type:'date',
    tickmode:'array',
    tickvals: uniqueVals,
    ticktext,
    tickangle:0,
    automargin:true,
    hoverformat: tf==='1d' ? '%d/%m/%Y' : '%d/%m/%Y %H:%M'
  };
}

function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2600); }
function fmtUSD(v){ if(v===null||v===undefined||isNaN(v)) return '—'; return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:v>1000?0:2}).format(v); }
function fmtPct(v, digits=2){ if(v===null||v===undefined||isNaN(v)) return '—'; return `${v>=0?'+':''}${Number(v).toFixed(digits)}%`; }
function fmtNum(v,d=2){ if(v===null||v===undefined||isNaN(v)) return '—'; return Number(v).toLocaleString('en-US',{maximumFractionDigits:d}); }
function shortDate(ts){ return new Date(ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}); }
function dayLabel(){ return new Date().toLocaleDateString('pt-BR',{weekday:'long'}); }
function cls(val,type='ok'){ return val?type:'bad'; }

async function fetchJSON(url, label, timeout=8500){
  const ctrl = new AbortController(); const timer=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const res = await fetch(url, {signal:ctrl.signal, cache:'no-store'});
    if(!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
    return await res.json();
  }catch(e){ state.errors.push(`${label}: ${e.message}`); return null; }
  finally{ clearTimeout(timer); }
}

function parseBinanceKline(row){ return { time: row[0], open:+row[1], high:+row[2], low:+row[3], close:+row[4], volume:+row[5], closeTime:row[6] }; }
function ema(values, period){
  const k = 2/(period+1); const out=[]; let prev=null;
  values.forEach((v,i)=>{ if(prev===null){ prev=v; } else { prev = v*k + prev*(1-k); } out.push(prev); });
  return out;
}
function rsiWilder(closes, period=14){
  const out = Array(closes.length).fill(null); if(closes.length<=period) return out;
  let gain=0, loss=0;
  for(let i=1;i<=period;i++){ const d=closes[i]-closes[i-1]; if(d>=0) gain+=d; else loss-=d; }
  let avgGain=gain/period, avgLoss=loss/period; out[period] = avgLoss===0?100:100-(100/(1+(avgGain/avgLoss)));
  for(let i=period+1;i<closes.length;i++){ const d=closes[i]-closes[i-1]; const g=Math.max(d,0), l=Math.max(-d,0); avgGain=(avgGain*(period-1)+g)/period; avgLoss=(avgLoss*(period-1)+l)/period; out[i]=avgLoss===0?100:100-(100/(1+(avgGain/avgLoss))); }
  return out;
}
function enrichCandles(candles){
  const closes = candles.map(c=>c.close);
  const e21=ema(closes,21), e50=ema(closes,50), rsi=rsiWilder(closes,14);
  return candles.map((c,i)=>({...c, ema21:e21[i], ema50:e50[i], rsi:rsi[i]}));
}
function latest(arr){ return arr && arr.length ? arr[arr.length-1] : null; }
function avg(arr){ const vals=arr.filter(v=>Number.isFinite(v)); return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null; }

async function loadLiveData(){
  state.errors=[];
  setStatus('loading');
  const intervals = { '1h':'1h', '4h':'4h', '1d':'1d' };
  const klinePromises = Object.entries(intervals).map(async ([tf,bin])=>{
    const url = `${API.binanceSpot}/klines?symbol=BTCUSDT&interval=${bin}&limit=180`;
    const data = await fetchJSON(url, `Binance candles ${tf}`);
    state.candles[tf] = Array.isArray(data) && data.length ? enrichCandles(data.map(parseBinanceKline)) : [];
  });
  const [ticker, depth, funding, fng, cg] = await Promise.all([
    fetchJSON(`${API.binanceSpot}/ticker/24hr?symbol=BTCUSDT`, 'Binance ticker'),
    fetchJSON(`${API.binanceSpot}/depth?symbol=BTCUSDT&limit=100`, 'Binance order book'),
    fetchJSON(`${API.binanceFutures}/premiumIndex?symbol=BTCUSDT`, 'Binance funding'),
    fetchJSON(API.fearGreed, 'Alternative.me F&G'),
    fetchJSON(API.coinGecko, 'CoinGecko price'),
    ...klinePromises
  ]).then(([ticker, depth, funding, fng, cg])=>[ticker, depth, funding, fng, cg]);

  const live = buildLiveModel({ticker, depth, funding, fng, cg});
  state.live=live; state.lastUpdated=new Date();
  renderAllLive();
  setStatus(live.dataOk && !state.errors.length ? 'live' : 'partial');
}

function buildLiveModel({ticker, depth, funding, fng, cg}){
  const c1=latest(state.candles['1h']); const c4=latest(state.candles['4h']); const cD=latest(state.candles['1d']);
  const prevD = state.candles['1d']?.at(-2);
  const gecko = cg?.bitcoin || null;
  const price = ticker ? +ticker.lastPrice : (gecko?.usd ?? null);
  const ch24 = ticker ? +ticker.priceChangePercent : (gecko?.usd_24h_change ?? null);
  const fngRow = fng?.data?.[0];
  const fngValue = fngRow ? +fngRow.value : null;
  const fngClass = fngRow ? fngRow.value_classification : 'indisponível';
  const fundingRate = funding && funding.lastFundingRate!==undefined ? +funding.lastFundingRate*100 : null;
  const nextFunding = funding?.nextFundingTime ? new Date(+funding.nextFundingTime) : null;
  const depthModel = analyzeDepth(depth, price);
  const activeRows = state.candles[state.activeTf] || [];
  const volumes = activeRows.slice(-20).map(x=>x.volume) || [];
  const activeLast = latest(activeRows);
  const volAvg = avg(volumes.slice(0,-1));
  const volRatio = volAvg && activeLast ? activeLast.volume / volAvg : null;
  const rows1h = state.candles['1h'] || [];
  const last1h = latest(rows1h);
  const vol1hBase = rows1h.slice(-169, -1).map(x=>x.volume);
  const vol1hAvg = avg(vol1hBase);
  const vol1hRatio = vol1hAvg && last1h ? last1h.volume / vol1hAvg : null;
  const volumeStatus = volumeStatusFromRatio(vol1hRatio);
  const rsi1 = c1?.rsi ?? null, rsi4 = c4?.rsi ?? null, rsiD=cD?.rsi ?? null;
  const dayRed = cD ? cD.close < cD.open : null;
  const dailyChange = cD ? ((cD.close/cD.open)-1)*100 : null;
  const emaDist = c4?.ema21 ? ((c4.close/c4.ema21)-1)*100 : null;
  const essentialMissing = [];
  if(!c1 || !c4 || !cD || rsi1===null || rsi4===null || rsiD===null) essentialMissing.push('candles/RSI Binance 1H, 4H e 1D');
  if(price===null || !Number.isFinite(price)) essentialMissing.push('preço BTCUSDT');
  if(fngValue===null || !Number.isFinite(fngValue)) essentialMissing.push('Fear & Greed Alternative.me');
  if(fundingRate===null || !Number.isFinite(fundingRate)) essentialMissing.push('funding Binance Futures');
  const dataOk = essentialMissing.length===0;
  const criteria = {
    dayRed: dayRed===true,
    rsiShort: (rsi1!==null && rsi1<30) || (rsi4!==null && rsi4<30),
    rsiDContext: rsiD!==null && rsiD<45,
    fngLow: fngValue!==null && fngValue<=30,
    fundingOk: fundingRate!==null && fundingRate<=0.01,
    volumeStress: vol1hRatio!==null && vol1hRatio>=1.5
  };
  const score = Object.values(criteria).filter(Boolean).length;
  const scoreMax = Object.keys(criteria).length;
  let verdict='🛑 SINAL VERMELHO', action='Feche o app. Não compre por FOMO.', level='red';
  if(!dataOk){
    verdict='⚠️ DADOS INDISPONÍVEIS'; action='Não gerar sinal. Atualize mais tarde ou confira manualmente nas fontes.'; level='gray';
  } else if(criteria.dayRed && criteria.rsiShort && criteria.fngLow && score>=4){
    verdict='✅ JANELA DE APORTE'; action=`Aporte liberado pela regra pessoal: ${fngValue<=10?'US$ 105':fngValue<=20?'US$ 70':'US$ 35'}.`; level='green';
  } else if(score>=3){
    verdict='🟡 ATENÇÃO'; action='Há estresse parcial, mas ainda falta confluência.'; level='yellow';
  }
  const missing = [];
  if(!dataOk) missing.push(...essentialMissing);
  if(dataOk && !criteria.dayRed) missing.push('vela diária vermelha');
  if(dataOk && !criteria.rsiShort) missing.push('RSI 1H ou 4H abaixo de 30');
  if(dataOk && !criteria.fngLow) missing.push('Fear & Greed abaixo de 30');
  if(dataOk && !criteria.fundingOk) missing.push('funding neutro/negativo');
  if(dataOk && !criteria.volumeStress) missing.push('volume acima da média');
  return { dataOk, essentialMissing, price, ch24, gecko, fngValue, fngClass, fundingRate, nextFunding, depthModel, rsi1, rsi4, rsiD, dayRed, dailyChange, emaDist, volRatio, vol1hRatio, volumeStatus, criteria, score, scoreMax, verdict, action, level, missing, candles:{c1,c4,cD}, ticker, funding };
}

function volumeStatusFromRatio(ratio){
  if(ratio===null || ratio===undefined || !Number.isFinite(ratio)) return {label:'indisponível', className:'bad', detail:'Volume 1H não carregado.'};
  if(ratio>=2.5) return {label:'pânico', className:'bad', detail:'Volume 1H acima de 2,5x a média recente.'};
  if(ratio>=1.5) return {label:'estresse', className:'warn', detail:'Volume 1H acima de 1,5x a média recente.'};
  if(ratio>=1.0) return {label:'ativo', className:'ok', detail:'Volume 1H acima da média, mas sem capitulação clara.'};
  return {label:'morno', className:'ok', detail:'Volume 1H abaixo da média recente.'};
}

function analyzeDepth(depth, price){
  if(!depth || !price) return {label:'indisponível', detail:'Order book não carregado.', bidWall:null, askWall:null, bidSum:null, askSum:null};
  const bids = depth.bids.map(([p,q])=>({p:+p,q:+q,usd:+p*+q})).filter(x=>x.p>=price*.99);
  const asks = depth.asks.map(([p,q])=>({p:+p,q:+q,usd:+p*+q})).filter(x=>x.p<=price*1.01);
  const bidSum=bids.reduce((a,b)=>a+b.usd,0), askSum=asks.reduce((a,b)=>a+b.usd,0);
  const bidWall=bids.sort((a,b)=>b.usd-a.usd)[0], askWall=asks.sort((a,b)=>b.usd-a.usd)[0];
  let label='equilibrado'; if(bidSum>askSum*1.25) label='suporte visível'; if(askSum>bidSum*1.25) label='oferta pesada';
  return {label, detail:`Bids 1%: ${fmtUSD(bidSum)} · Asks 1%: ${fmtUSD(askSum)}`, bidWall, askWall, bidSum, askSum};
}
function setStatus(mode){ const s=$('#sideStatus'); if(!s) return; s.className='status-pill'; if(mode==='live') {s.classList.add('live'); s.innerHTML='<span></span> dados atualizados';} else if(mode==='partial'){s.classList.add('err'); s.innerHTML='<span></span> dados parciais';} else {s.innerHTML='<span></span> atualizando dados...';} }

function renderAllLive(){ renderTacticalPanel(); renderLiveCards(); renderSources(); renderVerdict(); renderChecklist(); renderCharts(); renderDatePresets(); renderDecisionList(); }

function tacticalRead(label, value, detail, okClass=''){
  return `<tr><th>${label}</th><td>${value}</td><td class="${okClass}">${detail}</td></tr>`;
}
function renderTacticalPanel(){
  const l=state.live;
  if(!l){
    $('#tacticalRows').innerHTML = tacticalRead('Status','—','aguardando APIs');
    return;
  }
  let trafficClass = 'red';
  let title = 'Sinal vermelho';
  let text = 'A regra anti-FOMO ainda não liberou janela de aporte. A ação padrão é aguardar.';
  if(!l.dataOk){
    trafficClass = 'gray';
    title = 'Dados indisponíveis';
    text = 'Faltam dados essenciais. O site não gera sinal com API incompleta.';
  } else if(l.criteria.rsiShort && l.criteria.fngLow && l.criteria.dayRed && l.score>=4){
    trafficClass = 'green';
    title = 'Janela da regra pessoal';
    text = 'RSI curto estressado + medo global + queda diária. Confira liquidez e contexto antes de qualquer decisão.';
  } else if(l.criteria.rsiShort || l.criteria.fngLow || l.score>=3){
    trafficClass = 'yellow';
    title = 'Atenção, estresse parcial';
    text = 'Há sinais de tensão, mas a confluência ainda não está completa.';
  }
  const light=$('#trafficLight');
  if(light) light.className = `traffic-light ${trafficClass}`;
  const t=$('#trafficTitle'); if(t) t.textContent = title;
  const tx=$('#trafficText'); if(tx) tx.textContent = text;

  const rsiShortVal = `${fmtNum(l.rsi1,1)} / ${fmtNum(l.rsi4,1)}`;
  const rsiRead = l.criteria.rsiShort ? 'gatilho ativo < 30' : 'sem sobrevenda curta';
  const fngRead = l.fngValue!==null ? (l.fngValue<=10?'pânico extremo':l.fngValue<=20?'medo extremo':l.fngValue<=30?'medo':'sem medo tático') : 'indisponível';
  const fundingRead = l.fundingRate!==null ? (l.fundingRate<=0?'neutro/negativo':'positivo') : 'indisponível';
  $('#tacticalRows').innerHTML = [
    tacticalRead('Preço atual', fmtUSD(l.price), `${fmtPct(l.ch24)} 24h`, l.ch24<0?'warn':'ok'),
    tacticalRead('RSI 1H / 4H', rsiShortVal, rsiRead, l.criteria.rsiShort?'warn':''),
    tacticalRead('Fear & Greed', l.fngValue!==null?`${l.fngValue} · ${l.fngClass}`:'—', fngRead, l.criteria.fngLow?'warn':''),
    tacticalRead('Funding', l.fundingRate!==null?`${fmtNum(l.fundingRate,4)}%`:'—', fundingRead, l.criteria.fundingOk?'ok':''),
    tacticalRead('Volume 1H', l.vol1hRatio?`${fmtNum(l.vol1hRatio,2)}x média`:'—', l.volumeStatus.label, l.volumeStatus.className),
    tacticalRead('Semáforo', title, l.dataOk ? `${l.score}/${l.scoreMax} critérios` : 'bloqueado', trafficClass==='green'?'ok':trafficClass==='yellow'?'warn':'bad')
  ].join('');
}
function setCompactMode(enabled){
  document.body.classList.toggle('compact-mode', enabled);
  localStorage.setItem('btcCompactMode', enabled ? '1' : '0');
  const btn=$('#toggleCompact');
  if(btn) btn.textContent = enabled ? 'Modo completo' : 'Modo texto';
}

function renderLiveCards(){
  const l=state.live; const err=state.errors.length;
  const geckoUpdated = l.gecko?.last_updated_at ? shortDate(l.gecko.last_updated_at*1000) : 'Fonte: CoinGecko';
  const geckoDesc = l.gecko ? `${fmtPct(l.gecko.usd_24h_change)} 24h · vol. ${fmtUSD(l.gecko.usd_24h_vol)}` : 'Preço agregado indisponível';
  $('#liveCards').innerHTML = [
    card('Preço Binance Spot', fmtUSD(l.price), `${fmtPct(l.ch24)} em 24h · BTCUSDT`, l.ch24>=0?'ok':'bad'),
    listCard('CoinGecko agregado', [
      ['Market cap', l.gecko ? fmtUSD(l.gecko.usd_market_cap) : '—'],
      ['24h', l.gecko ? fmtPct(l.gecko.usd_24h_change) : '—'],
      ['Volume 24h', l.gecko ? fmtUSD(l.gecko.usd_24h_vol) : '—']
    ], geckoUpdated, l.gecko?'ok':'bad'),
    listCard('RSI 1H / 4H / 1D', [
      ['RSI 1H', fmtNum(l.rsi1,1)],
      ['RSI 4H', fmtNum(l.rsi4,1)],
      ['RSI 1D', fmtNum(l.rsiD,1)]
    ], 'RSI calculado no navegador via candles Binance', (l.rsi1<30||l.rsi4<30)?'warn':(l.dataOk?'ok':'bad')),
    card('Fear & Greed', l.fngValue!==null?`${l.fngValue} · ${l.fngClass}`:'—', 'Fonte: Alternative.me', l.fngValue!==null ? (l.fngValue<=30?'warn':'ok') : 'bad'),
    card('Funding Binance Futures', l.fundingRate!==null?`${fmtNum(l.fundingRate,4)}%`:'—', l.nextFunding?`próx.: ${shortDate(l.nextFunding)}`:'Fonte: Binance Futures', l.fundingRate!==null ? (l.fundingRate<=0?'warn':'ok') : 'bad'),
    card('Vela diária', l.dayRed===null?'—':(l.dayRed?'vermelha':'não vermelha'), `${fmtPct(l.dailyChange)} no candle diário em formação`, l.dayRed===null?'bad':(l.dayRed?'warn':'bad')),
    card('Distância EMA 21', fmtPct(l.emaDist), 'base 4H: preço vs EMA 21', l.emaDist===null?'bad':(l.emaDist<0?'warn':'ok')),
    card('Status do Volume 1H', l.vol1hRatio?`${fmtNum(l.vol1hRatio,2)}x · ${l.volumeStatus.label}`:'—', l.volumeStatus.detail, l.volumeStatus.className),
    card('Livro de ordens', l.depthModel.label, l.depthModel.detail, l.depthModel.label==='oferta pesada'?'bad':l.depthModel.label==='suporte visível'?'warn':(l.depthModel.label==='indisponível'?'bad':'ok'))
  ].join('');
  if(err) $('#liveCards').insertAdjacentHTML('beforeend', `<div class="live-card"><h4>Falhas de API <span class="bad">${err}</span></h4><strong>parcial</strong><p>${state.errors.slice(0,3).join(' · ')}</p></div>`);
  updateMarketPanel();
}

function card(title,value,desc,kind){ return `<div class="live-card"><h4>${title} <span class="${kind}">●</span></h4><strong>${value}</strong><p>${desc}</p></div>`; }
function listCard(title, items, desc, kind){
  const rows = items.map(([label, value]) => `<div class="metric-row"><b>${label}</b><span>${value}</span></div>`).join('');
  return `<div class="live-card list-card"><h4>${title} <span class="${kind}">●</span></h4><div class="metric-list">${rows}</div><p>${desc}</p></div>`;
}
function renderSources(){
  const updated = state.lastUpdated ? shortDate(state.lastUpdated) : '—';
  $('#apiSources').innerHTML = ['Binance Spot: candles, ticker e book','Binance Futures: funding BTCUSDT','Alternative.me: Fear & Greed','CoinGecko: preço agregado, market cap e volume','Sem dados simulados no Radar',`Atualizado: ${updated}`].map(x=>`<span>${x}</span>`).join('');
}
function renderVerdict(){
  const l=state.live; const icon=l.level==='green'?'✅':l.level==='yellow'?'🟡':l.level==='gray'?'⚠️':'🛑';
  $('#verdictPanel').innerHTML = `<div class="verdict-main"><span>${icon}</span><div><h3>${l.verdict}</h3><p>${l.action}</p><p><b>Score:</b> ${l.dataOk ? `${l.score}/${l.scoreMax} critérios principais` : 'bloqueado por dados essenciais indisponíveis'}.</p><p><b>O que falta:</b> ${l.missing.length?l.missing.join(', '):'todos os gatilhos principais foram atendidos'}.</p><p><b>Sazonalidade:</b> ${dayLabel()} · ${liquidityNote()}.</p></div></div>`;
}

function liquidityNote(){ const d=new Date().getDay(); return (d===0||d===6)?'fim de semana tende a ter liquidez mais irregular':'dia útil tende a ter mais liquidez institucional'; }
function renderChecklist(){
  const l=state.live;
  const rows = [
    ['Ação do Preço 1D', l.dayRed, `${l.dayRed?'Vela vermelha':'Sem vela vermelha'} · ${fmtPct(l.dailyChange)}`],
    ['RSI 1H / 4H', l.criteria.rsiShort, `1H ${fmtNum(l.rsi1,1)} · 4H ${fmtNum(l.rsi4,1)} · gatilho < 30`],
    ['RSI Diário', l.rsiD<45, `1D ${fmtNum(l.rsiD,1)} · contexto de correção abaixo de 45`],
    ['Afastamento EMA', l.emaDist<0, `Preço ${fmtPct(l.emaDist)} da EMA 21 no 4H`],
    ['Fear & Greed', l.criteria.fngLow, `${l.fngValue ?? '—'} · gatilho abaixo de 30`],
    ['Funding Binance Futures', l.criteria.fundingOk, `${fmtNum(l.fundingRate,4)}% · neutro/negativo ajuda`],
    ['Volume 1H', l.criteria.volumeStress, `${l.vol1hRatio?fmtNum(l.vol1hRatio,2)+'x média':'—'} · ${l.volumeStatus?.label || '—'} · estresse > 1,5x`],
    ['Livro de Ordens', l.depthModel.label!=='oferta pesada', l.depthModel.detail]
  ];
  $('#checklistGrid').innerHTML = rows.map(([name,ok,detail])=>`<article class="check-item"><h4>${ok?'✅':'❌'} ${name}</h4><p>${detail}</p></article>`).join('');
}


function renderEmptyChart(id, message){
  const el=document.getElementById(id); if(!el) return;
  if(window.Plotly) Plotly.purge(el);
  el.innerHTML = `<div class="empty-chart">${message}</div>`;
}

function renderCharts(){
  renderPriceChart(state.activeTf); renderRsiChart(state.activeTf); renderVolumeChart(state.activeTf); renderCycleCharts();
}
function renderPriceChart(tf){
  const rows=state.candles[tf]||[]; if(!rows.length || !window.Plotly){ renderEmptyChart('priceChart','Sem candles reais disponíveis para este período.'); return; }
  $('#priceChartLabel').textContent=`BTCUSDT · ${tf.toUpperCase()}`;
  const x=rows.map(r=>new Date(r.time));
  const data=[
    {type:'candlestick', x, open:rows.map(r=>r.open), high:rows.map(r=>r.high), low:rows.map(r=>r.low), close:rows.map(r=>r.close), name:'Preço', increasing:{line:{color:'#40d99a'}}, decreasing:{line:{color:'#ff5f7b'}}, hovertemplate:'%{x|%d/%m/%Y %H:%M}<br>O %{open:$,.0f} · H %{high:$,.0f}<br>L %{low:$,.0f} · C %{close:$,.0f}<extra></extra>'},
    {type:'scatter', mode:'lines', x, y:rows.map(r=>r.ema21), name:'EMA 21', line:{color:'#f5b544', width:2}, hovertemplate:'EMA 21 %{y:$,.0f}<extra></extra>'},
    {type:'scatter', mode:'lines', x, y:rows.map(r=>r.ema50), name:'EMA 50', line:{color:'#52d8ff', width:2}, hovertemplate:'EMA 50 %{y:$,.0f}<extra></extra>'}
  ];
  const layout={...plotLayoutBase, margin:{...plotLayoutBase.margin,b:isMobileChart()?42:48}, xaxis:{...buildDateAxis(rows, tf), rangeslider:{visible:false}}, yaxis:{...plotLayoutBase.yaxis, tickprefix:'$', nticks:isMobileChart()?4:5}};
  renderPriceChartNote(tf, rows);
  Plotly.react('priceChart',data,layout,plotConfig);
}
function renderPriceChartNote(tf, rows){
  const note = $('#priceChartNote'); if(!note || !rows.length) return;
  const last = latest(rows);
  const above21 = last.ema21 && last.close >= last.ema21;
  const above50 = last.ema50 && last.close >= last.ema50;
  const regime = above21 && above50 ? 'preço acima das EMAs 21/50: tendência curta favorece compradores.' : (!above21 && !above50 ? 'preço abaixo das EMAs 21/50: pressão curta segue defensiva.' : 'preço entre as EMAs: zona de transição, exige confirmação.');
  note.innerHTML = `<b>Leitura rápida:</b> ${regime}`;
}

function renderRsiChart(tf){
  const rows=state.candles[tf]||[]; if(!rows.length || !window.Plotly){ renderEmptyChart('rsiChart','Sem RSI real disponível.'); return; }
  const x=rows.map(r=>new Date(r.time));
  const y=rows.map(r=>r.rsi);
  Plotly.react('rsiChart',[
    {type:'scatter',mode:'lines',x,y,name:'RSI 14',line:{color:'#9a7cff',width:3}, hovertemplate:'RSI %{y:.1f}<extra></extra>'},
    {type:'scatter',mode:'lines',x,y:rows.map(()=>30),name:'Sobrevenda',line:{color:'#40d99a',dash:'dot'}, hoverinfo:'skip'},
    {type:'scatter',mode:'lines',x,y:rows.map(()=>70),name:'Sobrecompra',line:{color:'#ff5f7b',dash:'dot'}, hoverinfo:'skip'}
  ],{...plotLayoutBase, margin:{...plotLayoutBase.margin,b:isMobileChart()?38:44}, xaxis:buildDateAxis(rows, tf), yaxis:{...plotLayoutBase.yaxis,range:[0,100],nticks:5}},plotConfig);
}
function renderVolumeChart(tf){
  const rows=state.candles[tf]||[]; if(!rows.length || !window.Plotly){ renderEmptyChart('volumeChart','Sem volume real disponível.'); return; }
  const x=rows.map(r=>new Date(r.time));
  const colors=rows.map(r=>r.close>=r.open?'#40d99a':'#ff5f7b');
  Plotly.react('volumeChart',[{type:'bar',x,y:rows.map(r=>r.volume),marker:{color:colors},name:'Volume',hovertemplate:'Volume %{y:,.0f}<extra></extra>'}],{...plotLayoutBase, margin:{...plotLayoutBase.margin,b:isMobileChart()?38:44}, xaxis:buildDateAxis(rows, tf), yaxis:{...plotLayoutBase.yaxis,nticks:isMobileChart()?3:4}},plotConfig);
}
function renderCycleCharts(){
  if(!window.Plotly) return; const rows=BTC_STATIC.cycleRows;
  const barLayout={...plotLayoutBase, margin:{l:52,r:12,t:12,b:54}};
  Plotly.react('bullDurationChart',[{type:'bar',x:rows.map(r=>r.cycle),y:rows.map(r=>r.bullDays),marker:{color:'#f5b544'},name:'dias'}],{...barLayout,yaxis:{...barLayout.yaxis,title:'dias'}},plotConfig);
  Plotly.react('bearDurationChart',[{type:'bar',x:rows.filter(r=>r.bearDays).map(r=>r.cycle),y:rows.filter(r=>r.bearDays).map(r=>r.bearDays),marker:{color:'#ff5f7b'},name:'dias'}],{...barLayout,yaxis:{...barLayout.yaxis,title:'dias'}},plotConfig);
  Plotly.react('drawdownChart',[{type:'bar',x:rows.map(r=>r.cycle),y:rows.map(r=>r.drawdown),marker:{color:'#ff5f7b'},name:'drawdown %'}],{...barLayout,yaxis:{...barLayout.yaxis,ticksuffix:'%',title:'queda %'}},plotConfig);
  const h=rows.filter(r=>r.halvingToTop); Plotly.react('halvingChart',[{type:'scatter',mode:'lines+markers',x:h.map(r=>r.cycle),y:h.map(r=>r.halvingToTop),line:{color:'#52d8ff',width:3},marker:{size:10},name:'dias'}],{...barLayout,yaxis:{...barLayout.yaxis,title:'dias'}},plotConfig);
  Plotly.react('logForceChart',[{type:'bar',x:rows.map(r=>r.cycle),y:rows.map(r=>Math.log10(r.multiple)),text:rows.map(r=>`${r.multiple}x`),textposition:'outside',marker:{color:'#9a7cff'},name:'log10(múltiplo)'}],{...barLayout,yaxis:{...barLayout.yaxis,title:'log10'}},plotConfig);
  const m=BTC_STATIC.macroCurve; Plotly.react('macroCurveChart',[{type:'scatter',mode:'lines+markers+text',x:m.map(r=>r.date),y:m.map(r=>r.y),text:m.map(r=>r.label),textposition:'top center',line:{color:'#f5b544',width:3},marker:{size:10,color:'#ff7a3d'},name:'curva'}],{...plotLayoutBase,yaxis:{...plotLayoutBase.yaxis,visible:false}},plotConfig);
}

function renderDatePresets(){
  $('#presetDates').innerHTML=BTC_STATIC.presetDates.map(p=>`<button data-date="${p.date}" data-detail="${p.detail}">${p.label}</button>`).join('');
  $$('#presetDates button').forEach(btn=>btn.addEventListener('click',()=>{
    $('#dateSearch').value=btn.dataset.date; findDate(btn.dataset.date, btn.dataset.detail);
  }));
}
async function fetchHistoricalCandle(dateStr, tf){
  const step = tf==='1h'?3600000:tf==='4h'?14400000:86400000;
  const dayStart = Date.UTC(...dateStr.split('-').map((v,i)=>i===1?Number(v)-1:Number(v)));
  if(dayStart > Date.now()) return {future:true};
  // Busca uma janela anterior para calcular RSI/EMA com contexto, não um candle isolado.
  const startTime = dayStart - step*120;
  const endTime = dayStart + 86400000;
  const url = `${API.binanceSpot}/klines?symbol=BTCUSDT&interval=${tf}&startTime=${startTime}&endTime=${endTime}&limit=200`;
  const data = await fetchJSON(url, `Binance histórico ${tf}`);
  if(!Array.isArray(data) || !data.length) return null;
  const rows = enrichCandles(data.map(parseBinanceKline));
  const target=dayStart;
  const sameDay = rows.filter(c=>c.time>=dayStart && c.time<dayStart+86400000);
  const baseRows = sameDay.length ? sameDay : rows;
  const closest=baseRows.reduce((best,c)=>Math.abs(c.time-target)<Math.abs(best.time-target)?c:best,baseRows[0]);
  return {candle:closest, source:'Binance Spot histórico', tf};
}
async function findDate(dateStr, detail=''){
  if(!dateStr){ $('#dateResult').textContent='Escolha uma data primeiro.'; return; }
  $('#dateResult').innerHTML='Buscando candle histórico na Binance...';
  const target=new Date(dateStr+'T00:00:00').getTime();
  const rows=state.candles[state.activeTf]||[];
  const loadedClosest = rows.length ? rows.reduce((best,c)=>Math.abs(c.time-target)<Math.abs(best.time-target)?c:best,rows[0]) : null;
  const deltaDays = loadedClosest ? Math.round((loadedClosest.time-target)/86400000) : Infinity;
  if(loadedClosest && Math.abs(deltaDays)<=3){
    $('#dateResult').innerHTML=`<b>${dateStr}</b>${detail?` · ${detail}`:''}<br> Candle carregado (${state.activeTf.toUpperCase()}): ${shortDate(loadedClosest.time)} · Close ${fmtUSD(loadedClosest.close)} · RSI ${fmtNum(loadedClosest.rsi,1)} · Volume ${fmtNum(loadedClosest.volume,0)}.`;
    return;
  }
  const hist = await fetchHistoricalCandle(dateStr, state.activeTf);
  if(hist?.future){
    $('#dateResult').innerHTML=`<b>${dateStr}</b>${detail?` · ${detail}`:''}<br>Data futura. Não existe candle de mercado para esta data; use como janela projetada de ciclo, não como dado histórico.`;
    return;
  }
  if(hist?.candle){
    const c=hist.candle;
    $('#dateResult').innerHTML=`<b>${dateStr}</b>${detail?` · ${detail}`:''}<br> ${hist.source} (${state.activeTf.toUpperCase()}): ${shortDate(c.time)} · Open ${fmtUSD(c.open)} · Close ${fmtUSD(c.close)} · RSI ${fmtNum(c.rsi,1)} · Volume ${fmtNum(c.volume,0)}.`;
    return;
  }
  $('#dateResult').innerHTML=`<b>${dateStr}</b>${detail?` · ${detail}`:''}<br>Não encontrei candle para esta data na Binance BTCUSDT. Pode ser uma data anterior ao histórico do par na Binance ou falha temporária da API.`;
}

function updateMarketPanel(){
  const l=state.live; if(!l) return;
  const priceInput=$('#calcPrice'), supplyInput=$('#calcSupply');
  if(priceInput && !priceInput.dataset.touched && l.price) priceInput.value = Math.round(l.price);
  const gecko=l.gecko;
  const mc = gecko?.usd_market_cap;
  const vol = gecko?.usd_24h_vol;
  const updated = gecko?.last_updated_at ? shortDate(gecko.last_updated_at*1000) : '—';
  const change = gecko?.usd_24h_change;
  const el=$('#marketSnapshot');
  if(el) el.innerHTML = `
    <div class="market-metric-list">
      <div class="market-metric"><span>Preço agregado</span><strong>${fmtUSD(gecko?.usd)}</strong><small>CoinGecko · BTC/USD</small></div>
      <div class="market-metric"><span>Market cap</span><strong>${fmtUSD(mc)}</strong><small>Preço agregado × supply circulante</small></div>
      <div class="market-metric"><span>Volume 24h</span><strong>${fmtUSD(vol)}</strong><small>Atividade negociada nas últimas 24h</small></div>
      <div class="market-metric"><span>Variação 24h</span><strong class="${change>=0?'positive':'negative'}">${fmtPct(change)}</strong><small>Movimento agregado do mercado</small></div>
      <div class="market-metric"><span>Atualizado</span><strong>${updated}</strong><small>Horário da última leitura</small></div>
    </div>`;
  calculateMarketCap();
}
function calculateMarketCap(){
  const price=Number($('#calcPrice')?.value||0);
  const supply=Number($('#calcSupply')?.value||0);
  const out=$('#calcResult'); if(!out) return;
  if(!price || !supply){ out.innerHTML='Preencha preço e supply para simular.'; return; }
  const cap=price*supply;
  out.innerHTML=`Market cap simulado: <b>${fmtUSD(cap)}</b>. Fórmula: preço × supply circulante.`;
}

function renderPatterns(){
  $('#patternGrid').innerHTML = BTC_STATIC.patterns.map(p=>`<article class="pattern-card"><div class="pattern-svg">${svgPattern(p.svg)}</div><h4>${p.title}</h4><p>${p.text}</p></article>`).join('');
}
function svgPattern(type){
  const common=`<svg viewBox="0 0 320 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f5b544"/><stop offset="1" stop-color="#52d8ff"/></linearGradient></defs><rect width="320" height="160" fill="transparent"/>`;
  const end=`</svg>`;
  const line=(d,c='url(#g)',w=4,dash='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  if(type==='bullPivot') return common+line('M30 112 L78 88 L126 102 L176 62 L230 72 L288 32')+line('M126 102 L230 72','#40d99a',2,'6 6')+end;
  if(type==='bearPivot') return common+line('M28 38 L82 66 L130 48 L178 94 L230 80 L288 126')+line('M82 66 L230 80','#ff5f7b',2,'6 6')+end;
  if(type==='upChannel') return common+line('M32 118 L288 48','#33415f',2,'8 8')+line('M32 82 L288 12','#33415f',2,'8 8')+line('M40 110 C85 80 118 90 156 58 S236 42 276 22')+end;
  if(type==='downChannel') return common+line('M28 42 L288 112','#33415f',2,'8 8')+line('M28 78 L288 148','#33415f',2,'8 8')+line('M40 48 C86 82 118 68 160 102 S238 114 276 140')+end;
  if(type==='risingWedge') return common+line('M34 122 L286 42','#33415f',2,'8 8')+line('M34 82 L286 38','#33415f',2,'8 8')+line('M44 116 L86 76 L128 100 L170 62 L218 78 L274 44')+end;
  return common+line('M34 38 L286 116','#33415f',2,'8 8')+line('M34 116 L286 122','#33415f',2,'8 8')+line('M44 42 L86 110 L128 72 L172 116 L218 92 L276 118')+end;
}
function renderGlossary(){
  const q=($('#glossarySearch')?.value||'').toLowerCase();
  const rows=BTC_STATIC.glossary.filter(([t,d])=>(t+d).toLowerCase().includes(q));
  $('#glossaryGrid').innerHTML=rows.map(([t,d])=>`<article class="glossary-item"><h4>${t}</h4><p>${d}</p></article>`).join('');
}
function renderDecisionList(){
  const rows=JSON.parse(localStorage.getItem('btcDecisions')||'[]');
  $('#decisionList').innerHTML = rows.length ? rows.map(r=>`<div class="decision-item"><small>${r.date}</small><p>${r.text}</p><p>${r.snapshot}</p></div>`).join('') : '<div class="result-box">Nenhuma decisão registrada ainda.</div>';
}
function saveDecision(){
  const text=$('#decisionNote').value.trim(); if(!text){toast('Escreva uma nota antes.');return;}
  const l=state.live; const snap = l ? `${l.verdict} · preço ${fmtUSD(l.price)} · RSI 1H ${fmtNum(l.rsi1,1)} · F&G ${l.fngValue ?? '—'}` : 'sem snapshot';
  const rows=JSON.parse(localStorage.getItem('btcDecisions')||'[]'); rows.unshift({date:new Date().toLocaleString('pt-BR'),text,snapshot:snap}); localStorage.setItem('btcDecisions',JSON.stringify(rows.slice(0,30))); $('#decisionNote').value=''; renderDecisionList(); toast('Decisão salva no navegador.');
}
function copyVerdict(){
  const l=state.live; if(!l){toast('Dados ainda não carregados.');return;}
  const text=`${l.verdict}\nPreço: ${fmtUSD(l.price)} (${fmtPct(l.ch24)} 24h)\nRSI 1H/4H/1D: ${fmtNum(l.rsi1,1)} / ${fmtNum(l.rsi4,1)} / ${fmtNum(l.rsiD,1)}\nFear & Greed: ${l.fngValue ?? '—'} ${l.fngClass}\nFunding Binance Futures: ${fmtNum(l.fundingRate,4)}%\nVolume 1H: ${l.vol1hRatio?fmtNum(l.vol1hRatio,2)+'x · '+l.volumeStatus.label:'—'}\nScore: ${l.dataOk ? `${l.score}/${l.scoreMax}` : 'dados indisponíveis'}\nAção: ${l.action}\nO que falta: ${l.missing.length?l.missing.join(', '):'nenhum gatilho principal'}`;
  navigator.clipboard?.writeText(text); toast('Veredito copiado.');
}

async function refreshArea(btn){
  const area = btn?.dataset?.area || 'esta área';
  const original = btn?.textContent || 'Atualizar área';
  if(btn){ btn.disabled = true; btn.textContent = 'Atualizando...'; }
  toast(`Atualizando ${area.toLowerCase()}...`);
  try{ await loadLiveData(); toast(`${area} atualizado.`); }
  finally{ if(btn){ btn.disabled = false; btn.textContent = original; } }
}

function setupNav(){
  $('#navToggle')?.addEventListener('click',()=>{ const sb=$('#sidebar'); sb.classList.toggle('open'); $('#navToggle').setAttribute('aria-expanded',sb.classList.contains('open')); });
  $$('.nav-link').forEach(a=>a.addEventListener('click',()=>$('#sidebar')?.classList.remove('open')));
  const obs = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ $$('.nav-link').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id)); } }); },{rootMargin:'-45% 0px -50% 0px', threshold:0});
  $$('.observe').forEach(s=>obs.observe(s));
}
function setupEvents(){
  $('#refreshLive').addEventListener('click',()=>{toast('Atualizando todas as áreas dinâmicas...'); loadLiveData();});
  $$('.area-refresh').forEach(btn=>btn.addEventListener('click',()=>refreshArea(btn)));
  $('#copyVerdict').addEventListener('click',copyVerdict);
  $('#toggleCompact')?.addEventListener('click',()=>setCompactMode(!document.body.classList.contains('compact-mode')));
  $$('#tfTabs .tf').forEach(btn=>btn.addEventListener('click',()=>{ $$('#tfTabs .tf').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); state.activeTf=btn.dataset.tf; renderAllLive(); }));
  $('#findDate').addEventListener('click',()=>findDate($('#dateSearch').value));
  ['calcPrice','calcSupply'].forEach(id=>$('#'+id)?.addEventListener('input',e=>{ e.target.dataset.touched='1'; calculateMarketCap(); }));
  $('#glossarySearch').addEventListener('input',renderGlossary);
  $('#saveDecision').addEventListener('click',saveDecision);
  $('#clearDecisions').addEventListener('click',()=>{localStorage.removeItem('btcDecisions');renderDecisionList();toast('Diário limpo.');});
}
function init(){ setupNav(); setupEvents(); setCompactMode(localStorage.getItem('btcCompactMode')==='1'); renderPatterns(); renderGlossary(); renderDatePresets(); renderDecisionList(); renderCycleCharts(); loadLiveData(); setTimeout(renderCycleCharts,500); }
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize',()=>{ if(window.Plotly){ ['priceChart','rsiChart','volumeChart','bullDurationChart','bearDurationChart','drawdownChart','halvingChart','logForceChart','macroCurveChart'].forEach(id=>{ const el=document.getElementById(id); if(el) Plotly.Plots.resize(el); }); }});
