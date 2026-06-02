const BTC_DATA = {
  meta: {
    version: "2.0 mobile tutorial",
    updated: "2026-06-02",
    method: "Binance BTC/USDT como base principal do ATH atual; agregadores e imprensa como checagem contextual. Dados antigos são aproximados e devem ser tratados por zona temporal, não por precisão cirúrgica de wick.",
    disclaimer: "Material educacional. Não é recomendação de compra, venda ou alavancagem."
  },
  athSources: [
    {source:"Binance", date:"2025-10-06", ath:126198.07, use:"Base principal do ATH atual", note:"Preço histórico BTC, par BTC/USD ou BTC/USDT conforme página de preço."},
    {source:"CoinGecko", date:"2025-10-06", ath:126080, use:"Agregador de checagem", note:"ATH agregado, útil para comparação ampla de mercado."},
    {source:"Reuters / CoinShares", date:"2025-10-06", ath:126223, use:"Confirmação jornalística", note:"Reportagem citando recorde e fluxos de produtos digitais."},
    {source:"CoinEx", date:"2025-10-05", ath:126000, use:"Comparação de exchange", note:"Usado para mostrar diferença de wick entre corretoras."}
  ],
  halvings: [
    {id:"H1", label:"1º halving", date:"2012-11-28", block:210000, rewardBefore:50, rewardAfter:25, price:12.35, summary:"Primeiro choque de emissão. Mercado ainda pequeno."},
    {id:"H2", label:"2º halving", date:"2016-07-09", block:420000, rewardBefore:25, rewardAfter:12.5, price:650.63, summary:"Ciclo que levou ao topo de 2017."},
    {id:"H3", label:"3º halving", date:"2020-05-11", block:630000, rewardBefore:12.5, rewardAfter:6.25, price:8821.42, summary:"Ciclo de liquidez global, Covid e entrada institucional."},
    {id:"H4", label:"4º halving", date:"2024-04-19", block:840000, rewardBefore:6.25, rewardAfter:3.125, price:63821.47, summary:"Ciclo dos ETFs spot e institucionalização maior."},
    {id:"H5", label:"5º halving projetado", date:"2028-03-01", block:1050000, rewardBefore:3.125, rewardAfter:1.5625, price:null, projected:true, summary:"Data aproximada. Depende do tempo médio de bloco."}
  ],
  cycles: [
    {
      id:"2011", label:"Ciclo 2010 a 2011", lowDate:"2010-07-18", low:0.05, topDate:"2011-06-08", top:31.91, nextLowDate:"2011-11-18", nextLow:2.01,
      bullDays:325, bearDays:163, returnX:638.2, drawdown:-93.7, halvingDate:null, halvingToTop:null,
      maturity:"experimental", sourceGrade:"baixa", note:"Mercado ilíquido, era Mt. Gox. Serve mais como curiosidade histórica do que como modelo para o ciclo atual."
    },
    {
      id:"2013", label:"Ciclo 2011 a 2013", lowDate:"2011-11-18", low:2.01, topDate:"2013-11-30", top:1163, nextLowDate:"2015-01-14", nextLow:165.07,
      bullDays:743, bearDays:410, returnX:578.6, drawdown:-85.8, halvingDate:"2012-11-28", halvingToTop:367,
      maturity:"early", sourceGrade:"média", note:"Primeiro grande ciclo pós-halving. Ainda muito imaturo, com baixa liquidez e grande influência de poucas exchanges."
    },
    {
      id:"2017", label:"Ciclo 2015 a 2017", lowDate:"2015-01-14", low:165.07, topDate:"2017-12-17", top:19783, nextLowDate:"2018-12-15", nextLow:3232.51,
      bullDays:1068, bearDays:363, returnX:119.85, drawdown:-83.7, halvingDate:"2016-07-09", halvingToTop:526,
      maturity:"mature", sourceGrade:"boa", note:"Primeiro ciclo maduro de varejo global, euforia de ICOs e blow-off top clássico."
    },
    {
      id:"2021", label:"Ciclo 2018 a 2021", lowDate:"2018-12-15", low:3232.51, topDate:"2021-11-10", top:69044.77, nextLowDate:"2022-11-21", nextLow:15760.19,
      bullDays:1061, bearDays:376, returnX:21.36, drawdown:-77.2, halvingDate:"2020-05-11", halvingToTop:548,
      maturity:"institutional-start", sourceGrade:"boa", note:"Ciclo com liquidez global extrema, entrada institucional e topo duplo em 2021."
    },
    {
      id:"2025", label:"Ciclo 2022 a 2025", lowDate:"2022-11-21", low:15760.19, topDate:"2025-10-06", top:126198.07, nextLowDate:null, nextLow:null,
      bullDays:1050, bearDays:null, returnX:8.01, drawdown:null, halvingDate:"2024-04-19", halvingToTop:535,
      maturity:"ETF era", sourceGrade:"alta", current:true, note:"Ciclo dos ETFs spot. O tempo da alta encaixa muito bem em 2017 e 2021, mas a multiplicação é menor."
    }
  ],
  currentWindow: [
    {id:"curto", label:"Fundo curto", date:"2026-10-06", daysFromTop:365, confidence:72, desc:"Rima com bears de aproximadamente 12 meses."},
    {id:"central1", label:"Janela central", date:"2026-11-01", daysFromTop:391, confidence:84, desc:"Centro da tese de queda ou lateralização até novembro."},
    {id:"central2", label:"Janela estendida", date:"2026-11-15", daysFromTop:405, confidence:82, desc:"Ainda compatível com bears mais longos do histórico."},
    {id:"longo", label:"Bear estendido", date:"2026-11-30", daysFromTop:420, confidence:78, desc:"Rima com a baixa de 2013 a 2015, mas exige confirmação macro e on-chain."},
    {id:"excesso", label:"Excesso de tempo", date:"2026-12-15", daysFromTop:435, confidence:56, desc:"Possível, mas já começa a pedir uma tese mais forte de stress macro."}
  ],
  quickDates: [
    {label:"Fundo 2018", date:"2018-12-15"},
    {label:"Topo 2021", date:"2021-11-10"},
    {label:"Fundo 2022", date:"2022-11-21"},
    {label:"Halving 2024", date:"2024-04-19"},
    {label:"ATH 2025", date:"2025-10-06"},
    {label:"Janela nov 2026", date:"2026-11-01"}
  ],
  macroEvents: [
    {date:"2010-07-18", title:"Fundo inicial 2010", type:"fundo", desc:"Base do primeiro grande ciclo de alta conhecido."},
    {date:"2011-06-08", title:"Topo 2011", type:"topo", desc:"Pico experimental de um mercado ainda muito pequeno."},
    {date:"2011-11-18", title:"Fundo 2011", type:"fundo", desc:"Capitulação após o primeiro grande crash."},
    {date:"2012-11-28", title:"1º halving", type:"halving", desc:"Recompensa por bloco caiu de 50 para 25 BTC."},
    {date:"2013-11-30", title:"Topo 2013", type:"topo", desc:"Grande expansão pós primeiro halving."},
    {date:"2015-01-14", title:"Fundo 2015", type:"fundo", desc:"Fundo do bear após o topo de 2013."},
    {date:"2016-07-09", title:"2º halving", type:"halving", desc:"Recompensa por bloco caiu para 12,5 BTC."},
    {date:"2017-12-17", title:"Topo 2017", type:"topo", desc:"Euforia de varejo, ICOs e topo parabólico clássico."},
    {date:"2018-12-15", title:"Fundo 2018", type:"fundo", desc:"Fundo após drawdown de mais de 80%."},
    {date:"2020-05-11", title:"3º halving", type:"halving", desc:"Recompensa por bloco caiu para 6,25 BTC."},
    {date:"2021-11-10", title:"Topo 2021", type:"topo", desc:"Topo nominal próximo de US$ 69 mil."},
    {date:"2022-11-21", title:"Fundo 2022", type:"fundo", desc:"Fundo em meio ao colapso de confiança do mercado cripto."},
    {date:"2024-04-19", title:"4º halving", type:"halving", desc:"Recompensa por bloco caiu para 3,125 BTC."},
    {date:"2025-10-06", title:"ATH 2025", type:"topo", desc:"Topo do ciclo ETF, base principal Binance em US$ 126.198,07."},
    {date:"2026-10-06", title:"Janela curta de fundo", type:"janela", desc:"365 dias depois do topo de outubro de 2025."},
    {date:"2026-11-01", title:"Janela central", type:"janela", desc:"Ponto central da hipótese de baixa ou lateralização até novembro de 2026."},
    {date:"2026-11-30", title:"Janela estendida", type:"janela", desc:"420 dias depois do topo, semelhante a bears mais longos."}
  ],
  indicators: [
    {id:"ma", title:"Médias móveis", group:"Tendência", formula:"SMA(n) = soma dos fechamentos / n", read:"Suaviza o preço para mostrar tendência. SMA200 diária ou semanal é macro; EMA21 e EMA50 mostram pulso mais curto.", trap:"Em lateralização, cruzamento de médias produz muito falso sinal."},
    {id:"rsi", title:"RSI", group:"Momentum", formula:"RSI = 100 - 100 / (1 + RS)", read:"Mede força relativa de ganhos contra perdas. Acima de 70 sugere força ou excesso; abaixo de 30 sugere fraqueza ou exaustão.", trap:"RSI sobrevendido não é compra automática em tendência de baixa."},
    {id:"stoch", title:"Estocástico", group:"Momentum", formula:"%K = 100 × (Close - LowestLow) / (HighestHigh - LowestLow)", read:"Compara o fechamento com a faixa recente. Ajuda a ver viradas de curto prazo quando o preço está em zona extrema.", trap:"Em tendência forte, pode saturar e cruzar várias vezes sem reversão real."}
  ],
  onchain: [
    {title:"MVRV", tag:"lucro agregado", formula:"Market Value / Realized Value", good:"Próximo de 1 costuma sugerir dor e capitulação.", trap:"Com a maturidade do ativo, zonas históricas podem mudar."},
    {title:"Realized Price", tag:"custo médio on-chain", formula:"Realized Cap / Supply", good:"Preço abaixo do realized price indica mercado vendendo abaixo do custo agregado.", trap:"Não captura moedas perdidas nem negociação fora da cadeia."},
    {title:"SOPR", tag:"lucro realizado", formula:"Valor vendido / valor pago", good:"SOPR recuperando acima de 1 após capitulação pode sinalizar mudança de regime.", trap:"Pode oscilar perto de 1 por meses em acumulação."},
    {title:"Exchange reserves", tag:"oferta em corretoras", formula:"BTC em exchanges", good:"Queda de reservas pode indicar menor oferta líquida para venda.", trap:"Movimento institucional, custódia e ETFs podem distorcer a leitura."}
  ],
  derivatives: [
    {title:"Funding rate", tag:"pressão long ou short", formula:"Pagamento periódico entre lados", good:"Funding extremo pode preparar squeeze contrário.", trap:"Funding positivo pode durar em bull forte sem marcar topo imediato."},
    {title:"Open interest", tag:"alavancagem aberta", formula:"Contratos abertos", good:"OI alto + preço comprimido = risco de explosão de volatilidade.", trap:"OI alto não diz direção sozinho."},
    {title:"Liquidações", tag:"desalavancagem", formula:"Fechamento forçado", good:"Cascatas limpam excesso e podem marcar capitulação local.", trap:"Uma liquidação grande pode iniciar, e não terminar, a queda."}
  ],
  patterns: [
    {id:"pivotAlta", label:"Pivot de alta", bias:"Reversão ou continuação altista", points:[[70,300],[160,240],[240,285],[340,190],[450,240],[565,130],[675,170]], lines:[[[160,240],[340,190]],[[240,285],[450,240]],[[340,190],[565,130]]], explain:"O preço rompe um topo anterior e depois sustenta um fundo mais alto. A confirmação vem quando o mercado deixa de fazer topos e fundos descendentes.", checks:["Rompimento com fechamento acima do topo", "Pullback segura acima do fundo anterior", "Volume ou momentum acompanha", "Invalidação abaixo do fundo protegido"]},
    {id:"pivotBaixa", label:"Pivot de baixa", bias:"Perda de estrutura", points:[[70,130],[160,205],[250,160],[350,255],[460,210],[560,310],[675,270]], lines:[[[160,205],[350,255]],[[250,160],[460,210]],[[350,255],[560,310]]], explain:"O preço perde um fundo relevante e depois falha em recuperar topo anterior. É a estrutura dizendo que vendedores controlam os repiques.", checks:["Rompimento de fundo com fechamento", "Reteste falha", "Topo mais baixo", "Invalidação acima do topo protegido"]},
    {id:"canalAlta", label:"Canal de alta", bias:"Tendência organizada", points:[[70,320],[160,250],[250,275],[345,200],[455,225],[560,145],[680,170]], lines:[[[65,326],[680,151]],[[65,265],[680,90]]], explain:"O preço sobe dentro de linhas paralelas. Enquanto respeita suporte e faz fundos ascendentes, a tendência continua válida.", checks:["Base do canal segura", "Topos e fundos ascendentes", "Rompimento superior pode ser excesso", "Perda da base muda a leitura"]},
    {id:"canalBaixa", label:"Canal de baixa", bias:"Tendência de queda", points:[[70,110],[160,180],[245,150],[345,235],[455,205],[560,295],[680,265]], lines:[[[65,98],[680,278]],[[65,170],[680,350]]], explain:"Repiques dentro de canal de baixa ainda são repiques. A reversão só fica mais séria quando rompe topo e sustenta fundo mais alto.", checks:["Topos e fundos descendentes", "Repiques falham no topo do canal", "Rompimento precisa de fechamento", "Reteste decide se é reversão ou falso rompimento"]},
    {id:"cunhaAsc", label:"Cunha ascendente", bias:"Alta perdendo amplitude", points:[[80,300],[170,230],[260,260],[355,205],[455,225],[565,195],[680,205]], lines:[[[70,310],[690,200]],[[120,220],[690,185]]], explain:"O preço sobe, mas cada avanço tem menos espaço. Muitas vezes isso mostra perda de força compradora e risco de rompimento para baixo.", checks:["Linhas convergentes", "Volume ou momentum enfraquecendo", "Rompimento inferior confirma", "Sem rompimento, é só hipótese"]},
    {id:"cunhaDesc", label:"Cunha descendente", bias:"Queda perdendo amplitude", points:[[80,130],[170,210],[260,180],[355,235],[455,215],[565,250],[680,238]], lines:[[[70,120],[690,235]],[[120,225],[690,255]]], explain:"O preço cai, mas a pressão vendedora perde amplitude. Pode antecipar reversão para cima quando rompe a linha superior com confirmação.", checks:["Linhas convergentes", "Queda perde força", "Rompimento superior com fechamento", "Reteste saudável aumenta validade"]}
  ],
  scoreWeights: [
    {key:"trend", label:"Tendência", weight:20, hint:"Preço, médias e estrutura de topos/fundos."},
    {key:"momentum", label:"Momentum", weight:15, hint:"RSI, estocástico e divergências."},
    {key:"onchain", label:"On-chain", weight:25, hint:"MVRV, SOPR, realized price e reservas."},
    {key:"derivatives", label:"Derivativos", weight:15, hint:"Funding, OI e liquidações."},
    {key:"macro", label:"Macro e liquidez", weight:15, hint:"Juros, dólar, ETF, liquidez global."},
    {key:"sentiment", label:"Sentimento", weight:10, hint:"Euforia, medo, consenso e narrativa."}
  ],
  checklist: [
    "Defini a fonte principal de preço?",
    "Separei fato, inferência e especulação?",
    "O ciclo temporal favorece minha tese?",
    "A estrutura de topos e fundos confirma?",
    "Momentum concorda ou diverge?",
    "On-chain mostra lucro, dor ou capitulação?",
    "Derivativos estão alavancados demais para um lado?",
    "Existe ponto claro de invalidação?"
  ],
  pseudoCode: [
    {title:"RSI 14", code:"gains = positive_changes(close, 14)\nlosses = abs(negative_changes(close, 14))\nRS = average(gains) / average(losses)\nRSI = 100 - (100 / (1 + RS))"},
    {title:"SMA e EMA", code:"SMA_200 = average(close[-200:])\nk = 2 / (period + 1)\nEMA_today = close_today * k + EMA_yesterday * (1 - k)"},
    {title:"Estocástico", code:"lowest = min(low[-14:])\nhighest = max(high[-14:])\nK = 100 * (close - lowest) / (highest - lowest)\nD = SMA(K, 3)"},
    {title:"Pivot de alta", code:"if close > previous_high and pullback_low > previous_low:\n    structure = 'pivot de alta confirmado'\nelse:\n    structure = 'rompimento sem confirmação'"},
    {title:"MVRV", code:"market_value = price * circulating_supply\nrealized_value = sum(value_of_each_coin_at_last_move)\nMVRV = market_value / realized_value"},
    {title:"Score de confluência", code:"score = trend*.20 + momentum*.15 + onchain*.25 + derivatives*.15 + macro*.15 + sentiment*.10\nif score > 70: regime = 'risk-on com confirmação'\nelif score < 35: regime = 'risk-off ou capitulação em observação'\nelse: regime = 'neutro, aguardar sinal'"}
  ],
  glossary: [
    {term:"Alta", cat:"Ciclo", def:"Período entre fundo macro e topo do ciclo. No Bitcoin maduro, as últimas três altas ficaram perto de 1.050 a 1.068 dias."},
    {term:"Baixa", cat:"Ciclo", def:"Período entre topo macro e fundo posterior. Bears recentes completos ficaram perto de 363 a 410 dias."},
    {term:"Drawdown", cat:"Risco", def:"Queda percentual do topo até o fundo. Mede profundidade da dor, não apenas tempo."},
    {term:"Halving até topo", cat:"Ciclo", def:"Número de dias entre halving e topo posterior. Em 2017, 2021 e 2025 ficou perto de 526 a 548 dias."},
    {term:"Força log", cat:"Ciclo", def:"Log10 do múltiplo de valorização. Ajuda a comparar ciclos sem os primeiros anos esmagarem visualmente os recentes."},
    {term:"Pivot de alta", cat:"Estrutura", def:"Rompimento de topo anterior seguido de fundo mais alto. Sugere mudança de estrutura para cima."},
    {term:"Pivot de baixa", cat:"Estrutura", def:"Perda de fundo anterior seguida de topo mais baixo. Sugere controle vendedor."},
    {term:"Canal de alta", cat:"Estrutura", def:"Preço respeita linhas paralelas ascendentes, alternando suporte e resistência."},
    {term:"Canal de baixa", cat:"Estrutura", def:"Preço respeita linhas paralelas descendentes. Repique dentro dele não confirma reversão sozinho."},
    {term:"Cunha ascendente", cat:"Padrão", def:"Linhas convergentes subindo. Pode indicar alta perdendo amplitude e risco de rompimento para baixo."},
    {term:"Cunha descendente", cat:"Padrão", def:"Linhas convergentes caindo. Pode indicar queda perdendo amplitude e possível reversão para cima."},
    {term:"RSI", cat:"Momentum", def:"Oscilador que mede força relativa de ganhos contra perdas em uma janela."},
    {term:"Média móvel", cat:"Tendência", def:"Preço médio suavizado em uma janela. Ajuda a ler tendência e suporte dinâmico."},
    {term:"Estocástico", cat:"Momentum", def:"Compara fechamento atual com máxima e mínima de um período."},
    {term:"MVRV", cat:"On-chain", def:"Relação entre valor de mercado e valor realizado. Mostra lucro ou prejuízo agregado não realizado."},
    {term:"Realized Price", cat:"On-chain", def:"Preço médio pelo qual moedas se moveram pela última vez on-chain. Aproxima custo médio agregado."},
    {term:"SOPR", cat:"On-chain", def:"Spent Output Profit Ratio. Mostra se moedas gastas foram vendidas em lucro ou prejuízo."},
    {term:"Funding Rate", cat:"Derivativos", def:"Taxa paga entre longs e shorts em contratos perpétuos. Funding extremo pode indicar excesso de posicionamento."},
    {term:"Open Interest", cat:"Derivativos", def:"Total de contratos derivativos abertos. OI alto aumenta risco de cascata de liquidação."},
    {term:"Liquidação", cat:"Derivativos", def:"Fechamento forçado de posição alavancada por margem insuficiente."},
    {term:"Market Cap", cat:"Valuation", def:"Preço multiplicado pela oferta circulante. Ajuda a comparar tamanho de mercado."},
    {term:"Dominância BTC", cat:"Mercado", def:"Participação do Bitcoin no valor total do mercado cripto."}
  ],
  sources: [
    {name:"Binance", type:"Preço e ATH", url:"https://www.binance.com/en/price/bitcoin", note:"Base principal para o ATH atual usado no site."},
    {name:"CoinGecko", type:"Agregador", url:"https://www.coingecko.com/en/coins/bitcoin", note:"Comparação de ATH, preço, supply e market cap agregado."},
    {name:"Reuters", type:"Noticiário factual", url:"https://www.reuters.com/world/asia-pacific/bitcoin-hits-all-time-high-above-125000-2025-10-05/", note:"Confirmação jornalística do recorde de outubro de 2025."},
    {name:"Bitbo Charts", type:"Histórico e halving", url:"https://charts.bitbo.io/", note:"Datas de halving, fundos anuais, histórico e gráficos de ciclo."},
    {name:"TradingView", type:"Indicadores", url:"https://www.tradingview.com/support/solutions/43000502338-relative-strength-index-rsi/", note:"Referência didática para RSI e análise técnica."},
    {name:"StockCharts", type:"Indicadores e padrões", url:"https://school.stockcharts.com/", note:"Referência de médias, estocástico, suportes, resistências e padrões gráficos."},
    {name:"Glassnode", type:"On-chain", url:"https://docs.glassnode.com/", note:"MVRV, realized price, SOPR e métricas de rede."},
    {name:"CryptoQuant", type:"On-chain e derivativos", url:"https://cryptoquant.com/", note:"Funding, exchange reserves e métricas de fluxo."},
    {name:"CoinGlass", type:"Derivativos", url:"https://www.coinglass.com/", note:"Open interest, funding e liquidações."},
    {name:"Plotly.js", type:"Visualização", url:"https://plotly.com/javascript/configuration-options/", note:"Biblioteca usada para gráficos, com zoom e pan desativados no mobile."}
  ]
};
