# Bitcoin Cycle Lab

Site tutorial interativo para estudo pessoal de Bitcoin: ciclos, curvas, análise técnica, on-chain, derivativos, market cap, padrões gráficos e score de confluência.

## Como publicar no GitHub Pages

1. Envie todos os arquivos desta pasta para a raiz do repositório.
2. Confirme que `index.html` está na raiz.
3. Vá em `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione branch `main` e pasta `/root` ou `/`.
6. Salve e aguarde o deploy.

O site foi feito para funcionar como estático. Ele usa Plotly via CDN para os gráficos e tenta buscar preço ao vivo na API pública da CoinGecko. Se a API falhar, o site continua funcionando com dados estáticos.

## Mobile

A versão 2 foi otimizada para celular:

- menu lateral vira drawer;
- gráficos sem zoom, pan ou modebar;
- eixos com `fixedrange`;
- campo de pesquisa por data;
- atalhos de datas macro;
- seções mais espaçadas e leitura em trilha.

## Observação

Material educacional. Não é recomendação financeira.
