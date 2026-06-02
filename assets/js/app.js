const D = window.BTC_LAB_DATA;
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const colors = {
  bg: '#070912', panel: '#0f172a', text:'#e5eefc', muted:'#94a3b8',
  orange:'#f7931a', gold:'#fbbf24', cyan:'#22d3ee', blue:'#60a5fa', purple:'#a78bfa', red:'#ef4444', green:'#22c55e', grid:'rgba(148,163,184,.16)'
};

function fmtUsd(n){
  if(n === null || n === undefined || Number.isNaN(Number(n))) return 'N/A';
  const v = Number(n);
  if(v >= 1e12) return '$' + (v/1e12).toFixed(2) + 'T';
  if(v >= 1e9) return '$' + (v/1e9).toFixed(2) + 'B';
  if(v >= 1e6) return '$' + (v/1e6).toFixed(2) + 'M';
  if(v >= 1000) return '$' + v.toLocaleString('en-US',{maximumFractionDigits:0});
  return '$' + v.toLocaleString('en-US',{maximumFractionDigits:2});
}
function fmt(n, d=0){return Number(n).toLocaleString('pt-BR',{maximumFractionDigits:d, minimumFractionDigits:d});}
function pct(n){return (n>0?'+':'') + Number(n).toFixed(1) + '%';}
function daysBetween(a,b){return Math.round((new Date(b)-new Date(a))/(1000*60*60*24));}
function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'});}

function plotLayout(title='', height=380){
  return {
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{family:'Inter, system-ui, sans-serif', color:colors.text},
    margin:{l:54,r:28,t:38,b:60}, height,
    title:{text:title, font:{size:14,color:colors.text}, x:0.02, xanchor:'left'},
    xaxis:{gridcolor:colors.grid, zerolinecolor:colors.grid, tickfont:{color:colors.muted}, titlefont:{color:colors.muted}},
    yaxis:{gridcolor:colors.grid, zerolinecolor:colors.grid, tickfont:{color:colors.muted}, titlefont:{color:colors.muted}},
    legend:{orientation:'h', x:0, y:1.13, font:{color:colors.muted}},
    hoverlabel:{bgcolor:'#0b1020', bordercolor:'rgba(255,255,255,.18)', font:{color:'#fff'}}
  };
}
const plotConfig = {responsive:true, displayModeBar:false};
function plot(id, traces, layout={}){
  const el = document.getElementById(id);
  if(!el || !window.Plotly) return;
  Plotly.newPlot(el, traces, {...plotLayout('', el.classList.contains('tall')?510:el.classList.contains('sm')?310:398), ...layout}, plotConfig);
}

function initParticles(){
  const canvas = document.getElementById('orbCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h,dpr,particles=[];
  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.width = Math.floor(innerWidth*dpr);
    h = canvas.height = Math.floor(innerHeight*dpr);
    canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
    particles = Array.from({length: Math.min(90, Math.floor(innerWidth/18))}, () => ({
      x: Math.random()*w, y:Math.random()*h, r:(Math.random()*1.8+0.4)*dpr,
      vx:(Math.random()-.5)*0.18*dpr, vy:(Math.random()-.5)*0.18*dpr,
      a:Math.random()*.55+.1
    }));
  }
  function frame(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(247,147,26,${p.a})`; ctx.fill();
    }
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<130*dpr){
          ctx.strokeStyle=`rgba(34,211,238,${(1-dist/(130*dpr))*0.12})`;
          ctx.lineWidth=1*dpr; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  resize(); addEventListener('resize', resize); frame();
}

function renderTables(){
  const rows = D.cycles.map(c=>`<tr>
    <td><b>${c.label}</b><br><span class="tinyPill">${c.maturity}</span></td>
    <td>${c.lowDate}<br>${fmtUsd(c.low)}</td>
    <td>${c.topDate}<br>${fmtUsd(c.top)}</td>
    <td>${c.nextLowDate || 'em aberto'}<br>${c.nextLow?fmtUsd(c.nextLow):'em monitoramento'}</td>
    <td>${fmt(c.bullDays)} dias</td>
    <td>${c.bearDays?fmt(c.bearDays)+' dias':'em aberto'}</td>
    <td>${c.returnX.toFixed(c.returnX>100?0:2)}x</td>
    <td>${c.drawdown?pct(c.drawdown):'em aberto'}</td>
    <td>${c.note}</td>
  </tr>`).join('');
  $('#cycleTable tbody').innerHTML = rows;

  $('#athTable tbody').innerHTML = D.athComparison.map(a=>`<tr>
    <td><b>${a.source}</b><br><span class="tinyPill">${a.pair}</span></td>
    <td>${a.date}</td><td>${fmtUsd(a.ath)}</td><td>${a.note}</td>
  </tr>`).join('');

  $('#halvingTable tbody').innerHTML = D.halvings.map(h=>`<tr>
    <td>${h.n}º halving</td><td>${h.date}</td><td>${h.block.toLocaleString('pt-BR')}</td><td>${h.price?fmtUsd(h.price):'projetado'}</td>
  </tr>`).join('');
}

function renderKpis(){
  const mature = D.cycles.filter(c=>['2017','2021','2025'].includes(c.id));
  const avgBull = mature.reduce((s,c)=>s+c.bullDays,0)/mature.length;
  const bears = D.cycles.filter(c=>c.bearDays && c.id !== '2011');
  const avgBear = bears.reduce((s,c)=>s+c.bearDays,0)/bears.length;
  const last = D.cycles.find(c=>c.current);
  const top = D.athComparison.find(a=>a.source==='Binance');
  $('#kpiGrid').innerHTML = `
    <div class="card"><h4>ATH base Binance</h4><div class="metric accent">${fmtUsd(top.ath)}</div><p>Usado como wick principal do ciclo atual. O site mostra a divergência entre fontes para evitar mistura metodológica.</p></div>
    <div class="card"><h4>Duração média das altas maduras</h4><div class="metric cyan">${fmt(avgBull)} <small>dias</small></div><p>Média dos ciclos 2015/2017, 2018/2021 e 2022/2025. A repetição temporal é um dos sinais mais fortes.</p></div>
    <div class="card"><h4>Duração média das baixas completas</h4><div class="metric purple">${fmt(avgBear)} <small>dias</small></div><p>Média sem o ciclo experimental de 2011. Novembro de 2026 encaixa na janela histórica.</p></div>
    <div class="card"><h4>Halving até topo atual</h4><div class="metric">${last.halvingToTop} <small>dias</small></div><p>Quase igual aos ciclos de 2017 e 2021. Esse encaixe fortalece a hipótese de topo em outubro de 2025.</p></div>`;
}

function renderOverviewCharts(){
  const cycles = D.cycles.filter(c=>c.id !== '2011');
  plot('cycleReturnDrawChart', [
    {type:'bar', x:cycles.map(c=>c.id), y:cycles.map(c=>c.returnX), name:'Alta em múltiplos', marker:{color:colors.orange}, hovertemplate:'%{x}<br>Alta: %{y:.2f}x<extra></extra>'},
    {type:'scatter', mode:'lines+markers', x:cycles.filter(c=>c.drawdown).map(c=>c.id), y:cycles.filter(c=>c.drawdown).map(c=>Math.abs(c.drawdown)), name:'Drawdown %', yaxis:'y2', line:{color:colors.red,width:3}, marker:{size:9}, hovertemplate:'%{x}<br>Drawdown: %{y:.1f}%<extra></extra>'}
  ], {
    title:{text:'Força da alta versus profundidade da queda', x:.02, font:{size:15,color:colors.text}},
    yaxis:{title:'Múltiplo de alta', type:'log', gridcolor:colors.grid, tickfont:{color:colors.muted}},
    yaxis2:{title:'Drawdown %', overlaying:'y', side:'right', gridcolor:'rgba(0,0,0,0)', tickfont:{color:colors.muted}},
    annotations:[{text:'Escala log no eixo da alta', xref:'paper', yref:'paper', x:.02,y:1.08,showarrow:false,font:{size:12,color:colors.muted}}]
  });

  plot('halvingProgressChart', [{
    type:'scatter', mode:'lines+markers', x:cycles.map(c=>c.id), y:cycles.map(c=>c.halvingToTop),
    name:'Dias do halving até topo', line:{color:colors.gold,width:4}, marker:{size:10,color:colors.gold}, hovertemplate:'Ciclo %{x}<br>%{y} dias<extra></extra>'
  }], {title:{text:'Halving até topo por ciclo', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Dias'}});
}

function renderCurveCharts(){
  const cycles = D.cycles.filter(c=>c.id !== '2011');
  plot('bullDurationChart', [{type:'bar', x:cycles.map(c=>c.label.replace('Ciclo ','')), y:cycles.map(c=>c.bullDays), marker:{color:colors.orange}, hovertemplate:'%{x}<br>%{y} dias<extra></extra>'}], {
    title:{text:'Duração das altas', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Dias de fundo até topo'}
  });
  plot('bearDurationChart', [{type:'bar', x:cycles.filter(c=>c.bearDays).map(c=>c.label.replace('Ciclo ','')), y:cycles.filter(c=>c.bearDays).map(c=>c.bearDays), marker:{color:colors.purple}, hovertemplate:'%{x}<br>%{y} dias<extra></extra>'}], {
    title:{text:'Duração das baixas completas', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Dias de topo até fundo'}
  });
  plot('drawdownChart', [{type:'bar', x:cycles.filter(c=>c.drawdown).map(c=>c.id), y:cycles.filter(c=>c.drawdown).map(c=>c.drawdown), marker:{color:colors.red}, hovertemplate:'%{x}<br>%{y:.1f}%<extra></extra>'}], {
    title:{text:'Drawdown dos ciclos', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Queda %', range:[-95,0]}
  });
  plot('logForceChart', [{type:'scatter', mode:'lines+markers', x:cycles.map(c=>c.id), y:cycles.map(c=>Math.log10(c.returnX)), line:{color:colors.cyan,width:4}, marker:{size:10}, hovertemplate:'%{x}<br>log10(alta): %{y:.2f}<extra></extra>'}], {
    title:{text:'Força da alta em escala log', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'log10(múltiplo de alta)'}
  });
  plot('currentWindowChart', [{type:'bar', orientation:'h', y:D.currentWindow.map(w=>w.label), x:D.currentWindow.map(w=>w.daysFromTop), marker:{color:[colors.green, colors.orange, colors.gold, colors.red]}, hovertemplate:'%{y}<br>%{x} dias após topo<extra></extra>'}], {
    title:{text:'Janela temporal da curva atual', x:.02, font:{size:15,color:colors.text}}, xaxis:{title:'Dias depois do topo de 06/10/2025'}, margin:{l:120,r:28,t:42,b:60}
  });
  plotMacroCurve();
}

function plotMacroCurve(){
  const x=[0,12,25,39,52,66,78,88,100];
  const y=[0,8,18,30,48,72,100,63,36];
  const text=['Fundo macro','Acumulação','Recuperação','Rompimento','Halving/ETF','Expansão','Topo','Liquidação','Bear/lateral'];
  plot('macroCurveChart', [{type:'scatter', mode:'lines+markers+text', x, y, text, textposition:'top center', line:{color:colors.orange,width:4,shape:'spline'}, marker:{size:10,color:colors.gold}, hovertemplate:'%{text}<br>Ponto macro %{x}<extra></extra>'}], {
    title:{text:'Curva esquemática por pontos macro', x:.02, font:{size:15,color:colors.text}},
    xaxis:{title:'Tempo relativo do ciclo', showticklabels:false}, yaxis:{title:'Preço relativo', showticklabels:false},
    annotations:[{x:100,y:36,text:'Região atual: queda/lateralização',showarrow:true,arrowhead:3,ax:-80,ay:-50,font:{color:'#fecaca'},arrowcolor:colors.red}]
  });
}

function syntheticSeries(n=180){
  const arr=[]; let p=100;
  for(let i=0;i<n;i++){
    const trend=i*0.33;
    const wave=Math.sin(i/8)*7 + Math.sin(i/21)*13;
    const shock=i>105&&i<128 ? -(i-105)*.8 : i>=128&&i<150 ? -18+(i-128)*.9 : 0;
    p=100+trend+wave+shock;
    arr.push({i, close:Math.max(40,p), high:Math.max(42,p+3+Math.sin(i)*2), low:Math.max(35,p-3-Math.cos(i)*2)});
  }
  return arr;
}
function sma(values, period){return values.map((_,i)=> i<period-1?null:values.slice(i-period+1,i+1).reduce((a,b)=>a+b,0)/period);}
function ema(values, period){const k=2/(period+1); let out=[], prev=values[0]; values.forEach((v,i)=>{prev=i===0?v:v*k+prev*(1-k); out.push(prev)}); return out;}
function rsi(values, period=14){let out=Array(values.length).fill(null); for(let i=period;i<values.length;i++){let g=0,l=0; for(let j=i-period+1;j<=i;j++){const d=values[j]-values[j-1]; if(d>=0)g+=d; else l-=d;} const rs=l===0?100:g/l; out[i]=100-(100/(1+rs));} return out;}
function stoch(data, period=14){let k=Array(data.length).fill(null); for(let i=period-1;i<data.length;i++){const slice=data.slice(i-period+1,i+1); const lo=Math.min(...slice.map(d=>d.low)); const hi=Math.max(...slice.map(d=>d.high)); k[i]=100*(data[i].close-lo)/(hi-lo);} return {k,d:sma(k.map(v=>v??0),3).map((v,i)=>i<period?null:v)};}

function renderTechnicalCharts(){
  const s=syntheticSeries(); const x=s.map(d=>d.i); const close=s.map(d=>d.close);
  const sma50=sma(close,50), ema21=ema(close,21), r=rsi(close,14), st=stoch(s,14);
  plot('maDemoChart', [
    {type:'scatter', mode:'lines', x, y:close, name:'Preço', line:{color:colors.text,width:2}},
    {type:'scatter', mode:'lines', x, y:ema21, name:'EMA 21', line:{color:colors.orange,width:3}},
    {type:'scatter', mode:'lines', x, y:sma50, name:'SMA 50', line:{color:colors.cyan,width:3}}
  ], {title:{text:'Médias móveis como tendência e suporte dinâmico', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Preço sintético'}});
  plot('rsiDemoChart', [
    {type:'scatter', mode:'lines', x, y:r, name:'RSI 14', line:{color:colors.purple,width:3}},
    {type:'scatter', mode:'lines', x, y:x.map(()=>70), name:'70', line:{color:colors.red,width:1,dash:'dot'}},
    {type:'scatter', mode:'lines', x, y:x.map(()=>30), name:'30', line:{color:colors.green,width:1,dash:'dot'}}
  ], {title:{text:'RSI 14 com zonas de excesso', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'RSI', range:[0,100]}});
  plot('stochDemoChart', [
    {type:'scatter', mode:'lines', x, y:st.k, name:'%K', line:{color:colors.gold,width:3}},
    {type:'scatter', mode:'lines', x, y:st.d, name:'%D', line:{color:colors.cyan,width:2}},
    {type:'scatter', mode:'lines', x, y:x.map(()=>80), name:'80', line:{color:colors.red,width:1,dash:'dot'}},
    {type:'scatter', mode:'lines', x, y:x.map(()=>20), name:'20', line:{color:colors.green,width:1,dash:'dot'}}
  ], {title:{text:'Estocástico, localização do fechamento dentro da faixa recente', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Oscilador', range:[0,100]}});
}

function renderOnchainCharts(){
  const phases=['Fundo','Acumulação','Recuperação','Euforia inicial','Topo','Capitulação'];
  plot('mvrvChart', [{type:'scatter',mode:'lines+markers',x:phases,y:[0.78,1.05,1.7,2.8,4.1,1.15],line:{color:colors.orange,width:4},marker:{size:10},name:'MVRV'}], {
    title:{text:'MVRV esquemático por fase de ciclo', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'MVRV'}, shapes:[{type:'rect',xref:'paper',x0:0,x1:1,y0:0.8,y1:1.05,fillcolor:'rgba(34,197,94,.12)',line:{width:0}},{type:'rect',xref:'paper',x0:0,x1:1,y0:3.2,y1:4.5,fillcolor:'rgba(239,68,68,.10)',line:{width:0}}]
  });
  plot('soprChart', [{type:'bar',x:phases,y:[0.92,0.99,1.04,1.08,1.18,0.94],marker:{color:[colors.green,colors.cyan,colors.orange,colors.orange,colors.red,colors.green]},name:'SOPR'}], {
    title:{text:'SOPR, lucro ou prejuízo realizado', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'SOPR'}, shapes:[{type:'line',x0:-.5,x1:5.5,y0:1,y1:1,line:{color:colors.text,width:1,dash:'dot'}}]
  });
  plot('reserveChart', [{type:'scatter',mode:'lines+markers',x:['Bear','Acumulação','Bull inicial','Euforia','Distribuição','Capitulação'],y:[100,92,83,72,79,88],line:{color:colors.cyan,width:4},marker:{size:9},name:'Reservas em exchanges'}], {
    title:{text:'Reservas em exchanges, leitura qualitativa', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Índice 100 = base'}
  });
}

function renderDerivativesCharts(){
  plot('fundingOiChart', [
    {type:'scatter',mode:'lines+markers',x:['Medo','Short crowded','Neutral','Bull','Euforia','Flush'],y:[-0.02,-0.06,0.0,0.025,0.075,-0.04],name:'Funding %',line:{color:colors.gold,width:3},yaxis:'y'},
    {type:'bar',x:['Medo','Short crowded','Neutral','Bull','Euforia','Flush'],y:[45,64,52,79,100,38],name:'Open Interest índice',marker:{color:'rgba(34,211,238,.55)'},yaxis:'y2'}
  ], {title:{text:'Funding e open interest, onde a alavancagem mora', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Funding %'}, yaxis2:{title:'OI índice',overlaying:'y',side:'right',gridcolor:'rgba(0,0,0,0)'}});
  plot('liquidationChart', [{type:'bar',x:['Longs liquidados','Shorts liquidados','Spot vendido','ETF outflow'],y:[22,8,15,11],marker:{color:[colors.red,colors.green,colors.orange,colors.purple]},hovertemplate:'%{x}<br>Índice %{y}<extra></extra>'}], {title:{text:'Pressões de liquidação, leitura de risco', x:.02, font:{size:15,color:colors.text}}, yaxis:{title:'Índice sintético'}});
}

function renderMarketCap(){
  const supplyInput=$('#supplyInput'), priceInput=$('#priceInput'), capOut=$('#capOut'), rankOut=$('#rankOut');
  const comps=[{name:'Ouro',cap:20e12},{name:'Microsoft',cap:3.4e12},{name:'Apple',cap:3.1e12},{name:'Prata',cap:1.8e12},{name:'BTC em 126k',cap:126198.07*20_000_000}];
  function calc(){
    const p=Number(priceInput.value), s=Number(supplyInput.value);
    const cap=p*s; capOut.textContent=fmtUsd(cap);
    const above=comps.filter(c=>cap>=c.cap).map(c=>c.name);
    rankOut.textContent=above.length?`Maior que: ${above.join(', ')}`:'Abaixo dos comparativos listados.';
  }
  [supplyInput, priceInput].forEach(i=>i.addEventListener('input',calc)); calc();
  plot('marketCapCompareChart', [{type:'bar',orientation:'h',y:comps.map(c=>c.name).reverse(),x:comps.map(c=>c.cap/1e12).reverse(),marker:{color:[colors.orange,colors.cyan,colors.purple,colors.blue,colors.gold].reverse()},hovertemplate:'%{y}<br>%{x:.2f}T USD<extra></extra>'}], {title:{text:'Comparativos de market cap', x:.02, font:{size:15,color:colors.text}}, xaxis:{title:'Trilhões de USD'}, margin:{l:100,r:26,t:42,b:55}});
}

function renderIndicators(){
  $('#indicatorGrid').innerHTML = D.indicatorCards.map(card=>`<div class="card" data-search="${card.title} ${card.group} ${card.read}">
    <span class="tinyPill">${card.group}</span><h4>${card.title}</h4><p>${card.read}</p>
    <div class="codeBox"><div class="codeHead"><span>Fórmula mental</span></div><pre>${card.formula}</pre></div>
    <p style="margin-top:12px"><b class="positive">Bom uso:</b> ${card.good}</p>
    <p><b class="negative">Armadilha:</b> ${card.bad}</p>
  </div>`).join('');
}

function renderGlossary(){
  const list=$('#glossaryList'), q=$('#glossarySearch'), cat=$('#glossaryCat');
  const cats=[...new Set(D.glossary.map(g=>g.cat))];
  cat.innerHTML='<option value="all">Todas as categorias</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  function draw(){
    const query=q.value.toLowerCase(); const c=cat.value;
    const filtered=D.glossary.filter(g=>(c==='all'||g.cat===c)&&(`${g.term} ${g.cat} ${g.def}`.toLowerCase().includes(query)));
    list.innerHTML=filtered.map(g=>`<div class="termCard"><span>${g.cat}</span><b>${g.term}</b><p>${g.def}</p></div>`).join('') || `<div class="card"><p>Nada encontrado.</p></div>`;
  }
  q.addEventListener('input',draw); cat.addEventListener('change',draw); draw();
}

function renderCodeBlocks(){
  $('#codeGrid').innerHTML = D.pseudoCode.map((c,i)=>`<div class="card"><h4>${c.title}</h4><div class="codeBox"><div class="codeHead"><span>${c.lang}</span><button class="copyBtn" data-copy="code${i}">copiar</button></div><pre id="code${i}">${c.code}</pre></div></div>`).join('');
  $$('[data-copy]').forEach(btn=>btn.addEventListener('click',()=>{const txt=$('#'+btn.dataset.copy).textContent;navigator.clipboard?.writeText(txt);btn.textContent='copiado';setTimeout(()=>btn.textContent='copiar',1200)}));
}

function renderSources(){
  $('#sourceList').innerHTML = D.sources.map(s=>`<div class="sourceItem"><a href="${s.url}" target="_blank" rel="noopener">${s.name}</a><p>${s.use}</p></div>`).join('');
}

const patternData = {
  pivotAlta:{title:'Pivot de alta', desc:'Rompe topo anterior, recua sem perder o fundo e confirma fundo mais alto. O erro clássico é comprar o rompimento sem esperar confirmação.', points:[[20,220],[90,170],[150,205],[220,135],[280,165],[350,85],[420,110]]},
  pivotBaixa:{title:'Pivot de baixa', desc:'Perde fundo anterior, repica sem recuperar topo e confirma topo mais baixo. Repique dentro de estrutura baixista não é reversão.', points:[[20,90],[90,145],[150,110],[220,185],[280,155],[350,225],[420,195]]},
  canalAlta:{title:'Canal de alta', desc:'Linhas paralelas ascendentes. Compra boa costuma nascer perto do suporte, não no topo do canal.', points:[[20,220],[90,178],[150,205],[220,145],[290,166],[360,105],[430,134]], channel:'up'},
  canalBaixa:{title:'Canal de baixa', desc:'Linhas paralelas descendentes. Alta dentro do canal pode ser só repique até resistência.', points:[[20,90],[90,130],[150,108],[220,165],[290,142],[360,205],[430,184]], channel:'down'},
  cunhaAsc:{title:'Cunha ascendente', desc:'Preço sobe, mas a amplitude aperta. Frequentemente sinaliza perda de força e risco de rompimento para baixo.', points:[[20,220],[90,155],[150,190],[220,135],[290,160],[360,118],[430,135]], wedge:'rising'},
  cunhaDesc:{title:'Cunha descendente', desc:'Preço cai, mas a pressão vendedora perde amplitude. Rompimento para cima com volume costuma ser sinal melhor.', points:[[20,90],[90,155],[150,120],[220,180],[290,150],[360,195],[430,175]], wedge:'falling'}
};
function renderPattern(name='pivotAlta'){
  const p=patternData[name]; const svg=$('#patternSvg'); if(!svg) return;
  const pts=p.points.map(([x,y])=>`${x},${y}`).join(' ');
  let lines='';
  if(p.channel==='up') lines='<line x1="20" y1="240" x2="430" y2="120" stroke="#22d3ee" stroke-width="2" stroke-dasharray="7 8"/><line x1="20" y1="185" x2="430" y2="65" stroke="#22d3ee" stroke-width="2" stroke-dasharray="7 8"/>';
  if(p.channel==='down') lines='<line x1="20" y1="70" x2="430" y2="184" stroke="#22d3ee" stroke-width="2" stroke-dasharray="7 8"/><line x1="20" y1="130" x2="430" y2="244" stroke="#22d3ee" stroke-width="2" stroke-dasharray="7 8"/>';
  if(p.wedge==='rising') lines='<line x1="20" y1="222" x2="430" y2="135" stroke="#fbbf24" stroke-width="2" stroke-dasharray="7 8"/><line x1="20" y1="150" x2="430" y2="108" stroke="#fbbf24" stroke-width="2" stroke-dasharray="7 8"/>';
  if(p.wedge==='falling') lines='<line x1="20" y1="92" x2="430" y2="176" stroke="#fbbf24" stroke-width="2" stroke-dasharray="7 8"/><line x1="20" y1="158" x2="430" y2="198" stroke="#fbbf24" stroke-width="2" stroke-dasharray="7 8"/>';
  svg.innerHTML=`<defs><linearGradient id="lineg" x1="0" x2="1"><stop stop-color="#f7931a"/><stop offset="1" stop-color="#22d3ee"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect x="0" y="0" width="460" height="280" rx="20" fill="rgba(2,6,23,.1)"/>
    ${lines}
    <polyline points="${pts}" fill="none" stroke="url(#lineg)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
    ${p.points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="6" fill="${i===p.points.length-1?'#fbbf24':'#e5eefc'}"/>`).join('')}
    <text x="20" y="34" fill="#e5eefc" font-size="20" font-weight="800">${p.title}</text>
    <text x="20" y="260" fill="#94a3b8" font-size="12">Confirmação > desenho bonito. Volume, fechamento e contexto mandam.</text>`;
  $('#patternTitle').textContent=p.title; $('#patternDesc').textContent=p.desc;
}
function initPatterns(){
  $$('.patternControls button').forEach(btn=>btn.addEventListener('click',()=>{$$('.patternControls button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderPattern(btn.dataset.pattern)}));
  renderPattern('pivotAlta');
}

function initScore(){
  const root=$('#scoreInputs');
  root.innerHTML=D.scoreWeights.map(w=>`<div class="sliderRow"><label>${w.label}<br><span style="color:var(--muted);font-size:11px">peso ${w.weight}%</span></label><input type="range" min="0" max="100" value="50" data-weight="${w.weight}" data-key="${w.key}"><output>50</output></div>`).join('');
  function calc(){
    let total=0;
    $$('input[type=range]',root).forEach(inp=>{const v=Number(inp.value); inp.nextElementSibling.textContent=v; total+=v*Number(inp.dataset.weight)/100;});
    const score=Math.round(total); const deg=Math.round(score*3.6);
    $('#scoreOrb').style.setProperty('--deg',deg+'deg'); $('#scoreOrb strong').textContent=score;
    $('#scoreText').textContent = score>=70 ? 'Confluência forte. Ainda assim, procure invalidadores.' : score<=35 ? 'Regime fraco ou capitulação. Não confunda barato com seguro.' : 'Zona neutra. Melhor esperar confirmação do que forçar narrativa.';
  }
  root.addEventListener('input',calc); calc();
}

function initTabs(){
  $$('.tabs').forEach(tabs=>{
    tabs.addEventListener('click',e=>{
      const btn=e.target.closest('.tabBtn'); if(!btn) return;
      const wrap=tabs.closest('.tabWrap');
      $$('.tabBtn',tabs).forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      $$('.tabPanel',wrap).forEach(p=>p.classList.toggle('active', p.id===btn.dataset.tab));
    });
  });
}

function initNav(){
  $$('.nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); scrollToId(a.getAttribute('href').slice(1)); document.querySelector('.sidebar')?.classList.remove('open');}));
  $('.mobileMenu')?.addEventListener('click',()=>$('.sidebar')?.classList.toggle('open'));
  const ids=$$('.nav a').map(a=>a.getAttribute('href').slice(1));
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){$$('.nav a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+entry.target.id));}})
  },{rootMargin:'-40% 0px -55% 0px',threshold:0});
  ids.forEach(id=>{const el=document.getElementById(id); if(el) obs.observe(el);});
}

function initGlobalSearch(){
  const input=$('#globalSearch'); if(!input) return;
  input.addEventListener('keydown',e=>{
    if(e.key!=='Enter') return;
    const q=input.value.toLowerCase().trim(); if(!q) return;
    const map=[['rsi','tecnica'],['média','tecnica'],['media','tecnica'],['estoc','tecnica'],['drawdown','curvas'],['halving','curvas'],['mvrv','onchain'],['sopr','onchain'],['funding','derivativos'],['liquidação','derivativos'],['market','marketcap'],['pivot','estrutura'],['cunha','estrutura'],['canal','estrutura'],['score','metodo'],['fontes','fontes']];
    const hit=map.find(([k])=>q.includes(k));
    scrollToId(hit?hit[1]:'glossario');
    if(!hit){$('#glossarySearch').value=q; $('#glossarySearch').dispatchEvent(new Event('input'));}
  });
}

async function fetchLivePrice(){
  const el=$('#livePrice'); const sub=$('#liveSub');
  try{
    const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',{cache:'no-store'});
    if(!r.ok) throw new Error('api');
    const j=await r.json(); const b=j.bitcoin;
    el.textContent=fmtUsd(b.usd); sub.textContent=`CoinGecko API, variação 24h ${pct(b.usd_24h_change)} • market cap ${fmtUsd(b.usd_market_cap)}`;
  }catch(err){
    el.textContent='offline'; sub.textContent='API ao vivo indisponível. Use os dados estáticos e confira na exchange antes de decidir.';
  }
}

function init(){
  initParticles(); renderKpis(); renderTables(); renderOverviewCharts(); renderCurveCharts(); renderTechnicalCharts(); renderOnchainCharts(); renderDerivativesCharts(); renderMarketCap(); renderIndicators(); renderGlossary(); renderCodeBlocks(); renderSources(); initPatterns(); initScore(); initTabs(); initNav(); initGlobalSearch(); fetchLivePrice();
}
window.addEventListener('DOMContentLoaded', init);
