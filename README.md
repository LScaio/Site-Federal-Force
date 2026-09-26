# Federal Force #10466 — site cinematográfico

Experiência narrativa em cenas: abertura com o robô 3D → Quem Somos → FRC → Temporada REBUILT (mini-site) → Temporada REEFSCAPE (mini-site) → Nossa Evolução → Além da Arena → (Parceiros) → cena final → rodapé.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · GSAP (ScrollTrigger) · React Three Fiber · Drei · Lenis.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + build de produção em dist/
```

## Fonte única de conteúdo: Drive "Dados_Site_Federal"

Todo texto, imagem e modelo vem do Drive. Nada foi inventado.

| Pasta do Drive | Uso no site | Arquivo no código |
| --- | --- | --- |
| `Hero(Telainicial)` | Logo, mascote Fefo (`CorujaFederal.png`), CAD 3D do robô (`CAAD3D`) | `src/content/drive.ts → hero` |
| `Intro geral da equipe` | Quem Somos: texto + mosaico de fotos | `quemSomos`, `quemSomosTexto` |
| `FRC` | Seção FRC: texto, logo, imagens de arenas/robôs/equipes, vídeo do YouTube | `frc`, `frcTexto` |
| `Equipe Rebuilt 2026` | Mini-site REBUILT: texto, fotos, **moodboard** (paleta, tipografia, linguagem visual) | `rebuilt`, `rebuiltTexto`, `src/index.css` (`rb-*`) |
| `Equipe Reefscape 2025` | Mini-site REEFSCAPE: texto, fotos, **moodboard** | `reefscape`, `reefscapeTexto`, `src/index.css` (`rf-*`) |
| `Projetos_Sociais` | Além da Arena: Force Voice, STEAM Girls, Rocket Force | `projetosTexto` |

- `src/content/drive.ts` — manifesto com o **ID e o nome de cada arquivo** do Drive.
- `src/content/texts.ts` — transcrição **literal** de cada `.txt` (com o arquivo de origem indicado).
- As imagens são carregadas **diretamente do Drive público** (`lh3.googleusercontent.com/d/<id>=w<largura>`), com `srcset`, lazy loading e blur-up progressivo.

### Servir as imagens localmente (recomendado em produção)

```bash
npm run sync:drive                       # baixa as 32 imagens para public/drive/
VITE_DRIVE_SOURCE=local npm run build    # passa a usar /drive/<id>.<ext>
```

## CAD 3D (abertura, Hero e Visualizador usam o MESMO arquivo)

A fonte é o arquivo `Hero(Telainicial)/CAAD3D` do Drive (218,6 MB, sem extensão). O tamanho é idêntico ao de `3D_Phoenix_Cinza.stl` e corresponde a um STL binário de 4.371.930 triângulos. O site espera o GLB otimizado em `public/models/federal-robot.glb`:

```bash
npm run sync:drive -- --cad     # baixa o CAAD3D para cad-source/
npm run cad:convert -- --z-up   # detecta o formato e gera o GLB otimizado (~300 mil triângulos, meshopt)
# npm run cad:convert -- --keep-parts   # preserva hierarquia/nomes para fichas por subsistema
# npm run cad:convert -- --target 150000 # menos triângulos (arquivo menor)
# sem --z-up se o robô aparecer deitado (STLs de CAD costumam vir com Z para cima)
git add public/models/federal-robot.glb
```

Teste com um STL sintético do mesmo tamanho: 218 MB → 7,2 MB, 300 mil triângulos, ~15 s. O conversor identifica o formato pelo conteúdo: GLB (inclusive já comprimido com Draco/meshopt), glTF, OBJ, STL ou ZIP contendo um deles. FBX/STEP não são suportados — nesse caso, exporte como GLB. Meta: GLB < 8 MB.

Enquanto o GLB não existe, a cena mostra uma **silhueta técnica provisória** (wireframe) e o visualizador indica `CAD · aguardando federal-robot.glb`.

### Fichas técnicas de subsistemas (futuro)

`src/components/three/subsystems.ts` já resolve cliques/hover no modelo para subsistemas. Basta cadastrar entradas com os nomes dos nós do GLB (gerado com `--keep-parts`) e, quando existirem no Drive, a ficha técnica — o painel aparece automaticamente.

## Pendências de conteúdo no Drive

Estes itens pedidos no briefing **não existem no Drive**. O código está pronto e eles aparecem assim que forem adicionados:

- **Parceiros** — não há pasta de parceiros. A seção fica oculta enquanto `parceiros` (em `texts.ts`) estiver vazio.
- **Redes sociais e contato** do rodapé — nenhum dado no Drive (`redesSociais`, `contato`).
- **Vídeos das temporadas** — não há vídeos nas pastas Rebuilt/Reefscape (o único vídeo é o link da FRC).
- **Imagens dos projetos sociais** — as subpastas têm só o `.txt`. Os cards usam composição tipográfica.
- **CAD da Reefscape (Griffo)** — não há CAD na pasta; o visualizador fica na temporada REBUILT.
- **GLB** — o `CAAD3D` precisa ser convertido (ver seção CAD acima).
- Revisão de texto sugerida no Drive (transcrito literalmente): em `Nossa temporada REEFSCAPE (2025).txt`, "Ele foi pensado para Climbar ele conseguia alcançar o último nível, sendo seu ponto mais forte" e "foi a prova de que uma estreia histórica em que…".

## Performance e acessibilidade

- Code splitting: cenas abaixo da dobra, a cena 3D (three/drei ≈ 300 KB gz) e o visualizador CAD são carregados sob demanda; o bundle inicial do app tem ~14 KB gz (+ React/Framer/GSAP).
- Canvas WebGL só renderiza quando próximo da viewport; DPR limitado; iluminação 100% procedural (sem HDRI externo); GLB com meshopt (decoder embutido).
- `prefers-reduced-motion`: abertura pulada, sem Lenis, sem parallax/bolhas, revelações instantâneas.
- Mobile: câmera se ajusta ao retrato, galerias viram carrossel com snap, cards de projetos abrem por toque.
- Botão "Pular abertura", navegação por cenas (menu + trilho lateral) e foco visível por teclado.
