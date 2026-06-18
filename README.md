# Bitcoin Analytics Lab

Site pessoal para GitHub Pages com duas áreas principais:

1. **Tutorial** — estudo estruturado de ciclos, tendência, momentum, estrutura, on-chain e derivativos.
2. **Radar Anti-FOMO** — hub de dados automáticos, veredito mecânico, RSI 1H/4H/1D e checklist de confluência.

## Como publicar

Suba todo o conteúdo desta pasta para a raiz do repositório GitHub e ative **Settings > Pages > Deploy from a branch > main > /root**.

Arquivos essenciais:

- `index.html`
- `.nojekyll`
- `assets/css/styles.css`
- `assets/js/data.js`
- `assets/js/app.js`
- `README.md`
- `SOURCES.md`

## Observação

O site usa APIs públicas sem chave. Se alguma fonte bloquear CORS, rate limit ou ficar indisponível, o radar marca o dado como parcial e mantém fallback visual.

## v3.4 — Radar tático e mobile

Esta versão adiciona um painel tático de leitura rápida dentro do Radar Anti-FOMO:

- tabela compacta com Preço, RSI 1H/4H, Fear & Greed, Funding e Volume 1H;
- Semáforo Anti-FOMO com estados vermelho, amarelo, verde e cinza;
- botão "Modo texto" para leitura ultracompacta no celular;
- atalhos diretos para Binance Spot, Binance Futures, Coinbase e CoinEx;
- alerta de volume 1H comparado à média recente;
- correção dos cards do tutorial para evitar colunas estreitas e quebras estranhas.

O site continua mantendo o tutorial completo, gráficos e áreas de ciclo. O modo texto apenas oculta partes pesadas quando ativado pelo usuário.
