# Imagens das demonstrações

Os arquivos deste diretório **não são fotografias**. São ilustrações vetoriais
abstratas, geradas para o MVP do gerador de landing pages, deliberadamente
estilizadas para que ninguém as confunda com um estabelecimento real. Nenhuma
foto de pousada ou hotel real foi usada.

## Onde entram as fotos definitivas

Cada arquivo `.svg` aqui é referenciado por um objeto `LodgingImage` em
`features/lodging-demo/data/<slug>.ts`. Para trocar por fotografia de verdade:

1. Coloque o arquivo (`.jpg`, `.webp` ou `.avif`) em `public/demo/<slug>/`.
2. No arquivo de dados, atualize `src`, `width`, `height` e `alt` da entrada
   correspondente. O `role` (`hero`, `gallery`, `destination`, `final-cta`)
   define onde a imagem aparece — mantenha-o.
3. Atualize ou remova o `credit`, que é exibido no rodapé da página.

O componente `DemoImage` detecta a extensão: SVG é servido direto e raster
passa pelo otimizador do `next/image`. Não é preciso mexer em código.

## Proporções esperadas

| Papel         | Proporção usada na composição              |
| ------------- | ------------------------------------------ |
| `hero`        | 3:2 (hero editorial) ou 16:9 (fullscreen)  |
| `gallery`     | mistura de retrato (4:5) e paisagem (3:2)  |
| `destination` | paisagem larga, 8:5                        |
| `final-cta`   | paisagem larga com espaço vazio na base    |
| quartos       | 16:11, com o assunto fora do canto inferior|

Use apenas imagens próprias, licenciadas ou com autorização do
estabelecimento. Fotos de hospedagens reais sem autorização não entram aqui.
