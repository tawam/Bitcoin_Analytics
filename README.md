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

O site usa APIs públicas sem chave. Se alguma fonte bloquear CORS, rate limit ou ficar indisponível, o radar marca o dado como parcial e mantém apoio visual.


## v3.1

- Radar não usa candles simulados: se dados essenciais falham, o sinal é bloqueado.
- Funding identificado como Binance Futures, não global.
- CoinGecko aparece como visão agregada de market cap e volume.
- Busca por data tenta consultar candles históricos na Binance quando a data não está na janela carregada.
- Gráficos reforçados para mobile sem zoom/pan acidental.
