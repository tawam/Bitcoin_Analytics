# Bitcoin Cycle Lab

Dashboard interativo para estudo pessoal de ciclos do Bitcoin, análise técnica, on-chain, derivativos e market cap.

## Como usar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Vá em `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione a branch `main` e a pasta `/root`.
6. Abra a URL gerada pelo GitHub Pages.

## Estrutura

```text
bitcoin-cycle-lab/
├── index.html
├── README.md
└── assets/
    ├── css/styles.css
    └── js/
        ├── data.js
        └── app.js
```

## Observações

O site usa Plotly via CDN para gráficos. O preço ao vivo tenta carregar a API pública da CoinGecko no navegador. Se a API falhar, o site continua funcionando com dados estáticos.

Dados históricos de ciclo são aproximações pedagógicas, com base em Binance, CoinGecko, Bitbo, Reuters, TradingView, StockCharts, Glassnode, CryptoQuant e CoinGlass. Para decisões reais, confira a exchange usada, o candle e a fonte primária.

Não é recomendação financeira.
