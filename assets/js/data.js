window.BTC_STATIC = {
  cycleRows: [
    {cycle:'2011', bullDays:158, bearDays:162, drawdown:-92, halvingToTop:null, multiple:90, start:'2011-01-02', top:'2011-06-09', bottom:'2011-11-18'},
    {cycle:'2011–2013', bullDays:742, bearDays:411, drawdown:-85, halvingToTop:366, multiple:563, start:'2011-11-18', top:'2013-11-29', bottom:'2015-01-14'},
    {cycle:'2015–2017', bullDays:1068, bearDays:363, drawdown:-83, halvingToTop:526, multiple:118, start:'2015-01-14', top:'2017-12-17', bottom:'2018-12-15'},
    {cycle:'2018–2021', bullDays:1061, bearDays:376, drawdown:-77, halvingToTop:548, multiple:21, start:'2018-12-15', top:'2021-11-10', bottom:'2022-11-21'},
    {cycle:'2022–2025', bullDays:1050, bearDays:null, drawdown:-46, halvingToTop:535, multiple:8, start:'2022-11-21', top:'2025-10-06', bottom:null}
  ],
  macroCurve: [
    {label:'Fundo pós-FTX', date:'2022-11-21', y:1, note:'Capitulação do ciclo anterior'},
    {label:'Acumulação', date:'2023-10-01', y:2.1, note:'Recuperação silenciosa'},
    {label:'ETF / rompimento', date:'2024-03-01', y:4.2, note:'Antigo ATH rompido'},
    {label:'Halving', date:'2024-04-19', y:4.0, note:'Redução da emissão'},
    {label:'ATH', date:'2025-10-06', y:8.0, note:'Topo Binance ~US$126.198'},
    {label:'Quebra', date:'2025-10-10', y:6.2, note:'Liquidação forte'},
    {label:'Bear / lateral', date:'2026-06-01', y:4.4, note:'Digestão do ciclo'},
    {label:'Janela', date:'2026-11-01', y:3.5, note:'Possível busca por fundo'}
  ],
  presetDates: [
    {label:'Fundo 2018', date:'2018-12-15', detail:'Fundo macro pós-ciclo 2017.'},
    {label:'Topo 2021', date:'2021-11-10', detail:'Topo macro do ciclo pós-halving 2020.'},
    {label:'Fundo 2022', date:'2022-11-21', detail:'Fundo do bear FTX/contágio.'},
    {label:'Halving 2024', date:'2024-04-19', detail:'Quarto halving do Bitcoin.'},
    {label:'ATH 2025', date:'2025-10-06', detail:'ATH base Binance usado no site.'},
    {label:'Janela nov/26', date:'2026-11-01', detail:'Janela estatística de fundo, não previsão fechada.'}
  ],
  patterns: [
    {title:'Pivot de alta', svg:'bullPivot', text:'Fundo mais alto seguido de rompimento de topo anterior. Sugere mudança de estrutura.'},
    {title:'Pivot de baixa', svg:'bearPivot', text:'Topo mais baixo seguido de perda de fundo anterior. Sugere deterioração da tendência.'},
    {title:'Canal de alta', svg:'upChannel', text:'Preço respeita suportes e resistências ascendentes. Compra ruim costuma ser perto do topo do canal.'},
    {title:'Canal de baixa', svg:'downChannel', text:'Topos e fundos descendentes. Repique dentro do canal ainda pode ser só correção.'},
    {title:'Cunha ascendente', svg:'risingWedge', text:'Preço sobe comprimindo amplitude. Em tendência cansada pode preceder queda.'},
    {title:'Cunha descendente', svg:'fallingWedge', text:'Preço cai comprimindo amplitude. Em capitulação pode preceder recuperação.'}
  ],
  glossary: [
    ['RSI','Índice de força relativa. Mede velocidade do movimento. Abaixo de 30 costuma indicar sobrevenda; acima de 70, sobrecompra.'],
    ['EMA','Média móvel exponencial. Dá mais peso aos candles recentes e ajuda a ler tendência.'],
    ['Drawdown','Queda percentual do topo até o fundo. Mede a dor de um ciclo.'],
    ['Halving','Evento que reduz pela metade a emissão de novos bitcoins por bloco.'],
    ['Funding Rate','Pagamento periódico entre comprados e vendidos em contratos perpétuos.'],
    ['Fear & Greed','Índice de sentimento de 0 a 100. Baixo indica medo; alto indica ganância.'],
    ['Market cap','Preço multiplicado pelo supply circulante. Mede tamanho de mercado.'],
    ['Pivot','Mudança estrutural formada por sequência de topo/fundo.'],
    ['Cunha','Padrão de compressão em que as linhas de suporte e resistência convergem.'],
    ['Order book','Livro de ordens. Mostra ofertas de compra e venda visíveis no momento.'],
    ['SOPR','Métrica on-chain que indica se moedas estão sendo vendidas com lucro ou prejuízo.'],
    ['MVRV','Compara valor de mercado ao valor realizado. Ajuda a medir euforia ou desconto.'],
    ['Open Interest','Total de contratos futuros/perpétuos abertos. Mede alavancagem.'],
    ['DCA condicional','Aportes recorrentes condicionados por regras de preço/sentimento, diferente de DCA puro.'],
    ['Confluência','Quando vários sinais independentes apontam para a mesma leitura.']
  ]
};
