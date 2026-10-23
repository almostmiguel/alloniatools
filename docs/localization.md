# Interface em português

A interface usa português brasileiro, procurando seguir os termos da edição de Pathfinder 2e publicada pela New Order: ancestralidade, biografia, talento, perícia, traço, magia e mestre.

- Os menus estão em `js/navigation.js`; os atalhos da página inicial, em `index.html`.
- Os rótulos compartilhados estão em `Parser.UI_LABELS`, em `js/parser.js`. `Parser.uiToFull` traduz apenas os pontos de exibição que a chamam; não modifica conteúdo nem elementos da página automaticamente.
- Filtros mantêm `header`, valores e chaves de estado originais. A tradução é aplicada a `displayHeader` e aos rótulos visíveis. Assim, links e seleções salvas continuam funcionando.
- Abas mantêm seus identificadores e recebem rótulos traduzidos na renderização.
- Nomes próprios, abreviações de fontes, comandos de dados, sintaxe de busca, URLs e nomes de arquivos permanecem intactos.
- Os textos de regras e nomes de conteúdo em `data/` são traduzidos separadamente, nos próprios arquivos JSON. Esta alteração não os traduz automaticamente.

Terminologia conferida em publicações da [New Order sobre o Guia da Sociedade Pathfinder](https://newordereditora.com/financiamento-coletivo-guia-da-sociedade-pathfinder/) e sobre [Kingmaker](https://newordereditora.com/cenotafio-de-saladino-pathfinder-kingmaker/). Rótulos genéricos de interface, como “Salvar” e “Configurações”, são traduções do site, não termos oficiais do jogo.

Execute `npm test` para verificar a interface e as demais funcionalidades. As alterações de texto não exigem regenerar os arquivos de dados.
