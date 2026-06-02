window.BTC_LAB_DATA = {
  meta: {
    title: "Bitcoin Cycle Lab",
    updated: "2026-06-02",
    timezone: "America/Sao_Paulo",
    baseExchange: "Binance BTC/USDT para o ATH atual; Bitbo/CoinGecko/Reuters para checagem histórica agregada",
    disclaimer: "Ferramenta educacional. Não é recomendação financeira. Dados históricos têm pequenas diferenças por exchange, wick, timezone e metodologia de agregação."
  },
  sources: [
    {name:"Binance BTC Price", url:"https://www.binance.com/en/price/bitcoin", use:"ATH atual, preço, market cap, supply e volume em tempo real quando disponível."},
    {name:"CoinGecko Bitcoin", url:"https://www.coingecko.com/en/coins/bitcoin", use:"Preço agregado, ATH, market cap e histórico agregados."},
    {name:"CoinGecko Historical Data", url:"https://www.coingecko.com/en/coins/bitcoin/historical_data", use:"Histórico diário de preço, market cap e volume."},
    {name:"Bitbo Price Chart", url:"https://charts.bitbo.io/price/", use:"Datas históricas, ciclos, fundos e visualizações de halving."},
    {name:"Bitbo Halving Dates", url:"https://charts.bitbo.io/halving-dates/", use:"Datas dos halvings e progresso do ciclo."},
    {name:"Reuters", url:"https://www.reuters.com/world/asia-pacific/bitcoin-hits-all-time-high-above-125000-2025-10-05/", use:"Confirmação jornalística do ATH de outubro de 2025 e contexto institucional."},
    {name:"TradingView RSI", url:"https://www.tradingview.com/support/solutions/43000502338-relative-strength-index-rsi/", use:"Definição de RSI e leitura de momentum."},
    {name:"StockCharts Moving Averages", url:"https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential", use:"SMA, EMA e suporte/resistência dinâmica."},
    {name:"StockCharts Stochastic", url:"https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/stochastic-oscillator-fast-slow-and-full", use:"Definição de estocástico, %K, %D e leitura."},
    {name:"StockCharts Rising Wedge", url:"https://chartschool.stockcharts.com/table-of-contents/chart-analysis/chart-patterns/rising-wedge", use:"Cunha ascendente e viés baixista."},
    {name:"StockCharts Falling Wedge", url:"https://chartschool.stockcharts.com/table-of-contents/chart-analysis/chart-patterns/falling-wedge", use:"Cunha descendente e viés altista."},
    {name:"Glassnode MVRV", url:"https://insights.glassnode.com/mastering-the-mvrv-ratio/", use:"MVRV, lucro/prejuízo não realizado e leitura on-chain."},
    {name:"Glassnode Realized Price", url:"https://insights.glassnode.com/the-week-onchain-week-02-2025/", use:"Realized price como custo médio on-chain agregado."},
    {name:"CryptoQuant", url:"https://cryptoquant.com/", use:"Funding, reservas em exchanges, SOPR, fluxos e métricas on-chain/derivativos."},
    {name:"CoinGlass", url:"https://www.coinglass.com/", use:"Open interest, funding, liquidações e derivativos."}
  ],
  athComparison: [
    {source:"Binance", pair:"BTC/USDT", date:"2025-10-06", ath:126198.07, note:"Base principal do site para wick atual por exchange grande e líquida."},
    {source:"CoinGecko", pair:"Agregado BTC/USD", date:"2025-10-06", ath:126080, note:"Agregador. Útil para leitura macro, menos específico por exchange."},
    {source:"Reuters", pair:"Referência jornalística", date:"2025-10-05", ath:125245.57, note:"Valor publicado no evento de ATH; pode não capturar wick posterior de exchange."},
    {source:"CoinGecko/Tiger Research", pair:"Relatório", date:"2025-10-06", ath:126210, note:"Valor de relatório/aggregator, próximo ao wick da Binance."},
    {source:"CoinEx", pair:"BTC/USDT", date:"2025-10-06", ath:126000, note:"Valor arredondado/reportado; usado apenas como comparação de dispersão."}
  ],
  halvings: [
    {n:1, date:"2012-11-28", block:210000, price:12.35},
    {n:2, date:"2016-07-09", block:420000, price:650.63},
    {n:3, date:"2020-05-11", block:630000, price:8821.42},
    {n:4, date:"2024-04-19", block:840000, price:63821.47},
    {n:5, date:"2028-03-01", block:1050000, price:null, projected:true}
  ],
  cycles: [
    {
      id:"2011",
      label:"Ciclo 2010/2011",
      lowDate:"2010-07-18", low:0.05,
      topDate:"2011-06-08", top:31.91,
      nextLowDate:"2011-11-18", nextLow:2.01,
      bullDays:325, bearDays:163,
      returnX:638.2, drawdown:-93.7,
      halvingDate:null, halvingToTop:null,
      maturity:"experimental",
      note:"Mercado ilíquido, era Mt. Gox, útil como curiosidade, fraco para previsão moderna."
    },
    {
      id:"2013",
      label:"Ciclo 2011/2013",
      lowDate:"2011-11-18", low:2.01,
      topDate:"2013-11-30", top:1163,
      nextLowDate:"2015-01-14", nextLow:165.07,
      bullDays:743, bearDays:410,
      returnX:578.6, drawdown:-85.8,
      halvingDate:"2012-11-28", halvingToTop:367,
      maturity:"early",
      note:"Primeira grande expansão pós-halving, ainda muito imatura e manipulável por baixa liquidez."
    },
    {
      id:"2017",
      label:"Ciclo 2015/2017",
      lowDate:"2015-01-14", low:165.07,
      topDate:"2017-12-17", top:19783,
      nextLowDate:"2018-12-15", nextLow:3232.51,
      bullDays:1068, bearDays:363,
      returnX:119.85, drawdown:-83.7,
      halvingDate:"2016-07-09", halvingToTop:526,
      maturity:"mature",
      note:"Primeiro ciclo maduro de varejo global, mania ICO e blow-off top clássico."
    },
    {
      id:"2021",
      label:"Ciclo 2018/2021",
      lowDate:"2018-12-15", low:3232.51,
      topDate:"2021-11-10", top:69044.77,
      nextLowDate:"2022-11-21", nextLow:15760.19,
      bullDays:1061, bearDays:376,
      returnX:21.36, drawdown:-77.2,
      halvingDate:"2020-05-11", halvingToTop:548,
      maturity:"institutional-start",
      note:"Ciclo com Covid/liquidez global, entrada institucional e dupla pernada com topo em abril e novembro."
    },
    {
      id:"2025",
      label:"Ciclo 2022/2025",
      lowDate:"2022-11-21", low:15760.19,
      topDate:"2025-10-06", top:126198.07,
      nextLowDate:null, nextLow:null,
      bullDays:1050, bearDays:null,
      returnX:8.01, drawdown:null,
      halvingDate:"2024-04-19", halvingToTop:535,
      maturity:"ETF-era",
      current:true,
      note:"Ciclo dos ETFs spot, maior institucionalização, topo temporal muito alinhado com 2017/2021."
    }
  ],
  currentWindow: [
    {label:"Fundo curto", date:"2026-10-06", daysFromTop:365, confidence:72, desc:"Rima com bears de ~12 meses como 2018 e 2022."},
    {label:"Janela central", date:"2026-11-01", daysFromTop:391, confidence:84, desc:"Ponto médio da tese de queda/lateralização até novembro."},
    {label:"Bear estendido", date:"2026-11-30", daysFromTop:420, confidence:78, desc:"Rima com o bear 2013/2015, mais longo e desgastante."},
    {label:"Excesso de tempo", date:"2026-12-15", daysFromTop:435, confidence:56, desc:"Possível, mas já começa a exigir justificativa macro/on-chain mais forte."}
  ],
  indicatorCards: [
    {id:"rsi", title:"RSI", group:"Momentum", formula:"RSI = 100 - 100 / (1 + RS)", good:"Divergência + estrutura + suporte", bad:"RSI sobrevendido em tendência de baixa pode ficar sobrevendido por muito tempo.", read:"Mede velocidade e magnitude do movimento. Acima de 70 costuma indicar força/excesso; abaixo de 30 fraqueza/exaustão. Em bull market, 40-50 pode segurar como piso."},
    {id:"ma", title:"Médias móveis", group:"Tendência", formula:"SMA(n) = soma dos fechamentos / n", good:"Preço acima das médias longas com inclinação positiva", bad:"Em lateralização, cruzamentos geram whipsaw.", read:"Mostram tendência suavizada. SMA200 diária/semanal é macro; EMA21/50 é pulso mais curto."},
    {id:"stoch", title:"Estocástico", group:"Momentum", formula:"%K = 100 * (Close - LowestLow) / (HighestHigh - LowestLow)", good:"Cruzamento em zona extrema com estrutura confirmando", bad:"Em tendências fortes pode saturar várias vezes.", read:"Compara o fechamento com a faixa recente. Ajuda a detectar viradas de curto/médio prazo."},
    {id:"mvrv", title:"MVRV", group:"On-chain", formula:"MVRV = Market Value / Realized Value", good:"Aproximação de 1 em bears costuma sinalizar dor/capitulação", bad:"Topos e fundos variam com maturidade do mercado.", read:"Mostra lucro/prejuízo não realizado agregado. Valores altos indicam euforia; baixos indicam capitulação."},
    {id:"sopr", title:"SOPR", group:"On-chain", formula:"SOPR = Valor vendido / Valor pago", good:"Recuperar acima de 1 após capitulação", bad:"Pode oscilar em torno de 1 em laterais longas.", read:"Mostra se moedas vendidas estão realizando lucro ou prejuízo."},
    {id:"funding", title:"Funding", group:"Derivativos", formula:"Pagamentos periódicos entre longs e shorts", good:"Funding muito negativo + suporte + capitulação pode indicar squeeze", bad:"Funding positivo demais em topo mostra euforia alavancada.", read:"Mede pressão de posições perpétuas. Ajuda a detectar excesso de longs/shorts."}
  ],
  glossary: [
    {term:"Alta", cat:"Ciclo", def:"Período entre um fundo macro e o topo do ciclo. No Bitcoin maduro, as últimas três altas duraram perto de 1050-1068 dias."},
    {term:"Baixa", cat:"Ciclo", def:"Período entre topo macro e fundo seguinte. Bears recentes duraram perto de 363-410 dias."},
    {term:"Drawdown", cat:"Risco", def:"Queda percentual do topo até o fundo. Mede profundidade da dor, não apenas tempo."},
    {term:"Halving até topo", cat:"Ciclo", def:"Número de dias entre o halving e o topo posterior. Em 2017, 2021 e 2025 ficou perto de 526-548 dias."},
    {term:"Força log", cat:"Ciclo", def:"Valorização medida em log10 do múltiplo de alta. Evita que ciclos antigos gigantes esmaguem visualmente os ciclos recentes."},
    {term:"Pivot de alta", cat:"Estrutura", def:"Sequência em que o preço rompe topo anterior e confirma fundo mais alto. Sugere mudança de estrutura para cima."},
    {term:"Pivot de baixa", cat:"Estrutura", def:"Rompimento de fundo anterior seguido de topo mais baixo. Sugere perda de estrutura."},
    {term:"Canal de alta", cat:"Estrutura", def:"Preço respeita linhas paralelas ascendentes, alternando suporte e resistência."},
    {term:"Canal de baixa", cat:"Estrutura", def:"Preço respeita linhas paralelas descendentes. Repique dentro dele não é necessariamente reversão."},
    {term:"Cunha ascendente", cat:"Padrões", def:"Linhas convergentes subindo. Frequentemente tem viés baixista porque a alta perde amplitude."},
    {term:"Cunha descendente", cat:"Padrões", def:"Linhas convergentes caindo. Frequentemente tem viés altista quando rompe para cima com volume."},
    {term:"RSI", cat:"Indicadores", def:"Oscilador de momentum. Mede força relativa de ganhos contra perdas em uma janela."},
    {term:"Média móvel", cat:"Indicadores", def:"Preço médio suavizado em uma janela. Ajuda a identificar tendência e suporte/resistência dinâmica."},
    {term:"Estocástico", cat:"Indicadores", def:"Oscilador que compara o fechamento atual com a máxima/mínima de um período."},
    {term:"MVRV", cat:"On-chain", def:"Relação entre valor de mercado e valor realizado. Mostra lucro/prejuízo agregado não realizado."},
    {term:"Realized Price", cat:"On-chain", def:"Preço médio pelo qual moedas se moveram pela última vez on-chain. Aproxima custo médio agregado."},
    {term:"SOPR", cat:"On-chain", def:"Spent Output Profit Ratio. Mostra se moedas gastas foram vendidas em lucro ou prejuízo."},
    {term:"Funding Rate", cat:"Derivativos", def:"Taxa paga entre longs e shorts em perpétuos. Funding extremo revela excesso de posicionamento."},
    {term:"Open Interest", cat:"Derivativos", def:"Total de contratos derivativos abertos. OI alto com volatilidade pode virar cascata de liquidação."},
    {term:"Liquidação", cat:"Derivativos", def:"Fechamento forçado de posição alavancada por margem insuficiente."},
    {term:"Market Cap", cat:"Valuation", def:"Preço multiplicado pela oferta circulante. Ajuda a comparar tamanho, não necessariamente valor intrínseco."},
    {term:"Dominância BTC", cat:"Mercado", def:"Participação do Bitcoin no market cap cripto total. Alta dominância pode indicar fuga para qualidade dentro de cripto."}
  ],
  scoreWeights: [
    {key:"trend", label:"Tendência", weight:20, hint:"Preço, médias e estrutura de topos/fundos."},
    {key:"momentum", label:"Momentum", weight:15, hint:"RSI, estocástico e divergências."},
    {key:"onchain", label:"On-chain", weight:25, hint:"MVRV, SOPR, realized price, reservas."},
    {key:"derivatives", label:"Derivativos", weight:15, hint:"Funding, OI e liquidações."},
    {key:"macro", label:"Macro/Liquidez", weight:15, hint:"Juros, dólar, liquidez global, ETFs."},
    {key:"sentiment", label:"Sentimento", weight:10, hint:"Euforia, medo, consenso e narrativa."}
  ],
  pseudoCode: [
    {title:"RSI 14", lang:"pseudocode", code:"gains = positive_changes(close, 14)\nlosses = abs(negative_changes(close, 14))\nRS = average(gains) / average(losses)\nRSI = 100 - (100 / (1 + RS))"},
    {title:"SMA / EMA", lang:"pseudocode", code:"SMA_200 = average(close[-200:])\nEMA_today = close_today * k + EMA_yesterday * (1-k)\nk = 2 / (period + 1)"},
    {title:"Estocástico", lang:"pseudocode", code:"lowest = min(low[-14:])\nhighest = max(high[-14:])\nK = 100 * (close - lowest) / (highest - lowest)\nD = SMA(K, 3)"},
    {title:"Pivot de alta", lang:"pseudocode", code:"if price_breaks(previous_high) and next_pullback_holds_above(previous_low):\n    structure = 'bullish pivot confirmed'\nelse:\n    structure = 'breakout not confirmed'"},
    {title:"MVRV", lang:"pseudocode", code:"market_value = price * circulating_supply\nrealized_value = sum(coin_value_at_last_moved_price)\nMVRV = market_value / realized_value"},
    {title:"Score de confluência", lang:"pseudocode", code:"score = trend*0.20 + momentum*0.15 + onchain*0.25 + derivatives*0.15 + macro*0.15 + sentiment*0.10\nif score > 70: regime = 'risk-on'\nelif score < 35: regime = 'risk-off / capitulation watch'\nelse: regime = 'neutral / wait confirmation'"}
  ]
};
