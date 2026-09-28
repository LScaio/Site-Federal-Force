# Federal Force #10466 — site cinematográfico

Experiência narrativa em cenas: abertura com o robô 3D → Quem Somos → FRC → Temporada REBUILT (mini-site) → Temporada REEFSCAPE (mini-site) → Nossa Evolução → Além da Arena → (Parceiros) → cena final → rodapé.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · GSAP (ScrollTrigger) · React Three Fiber · Drei · Lenis.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + build de produção em dist/
```

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` faz o build e publica o site a cada push na branch principal: baixa as imagens do Drive, gera o site com o caminho do repositório e envia para o Pages.

1. **Settings → General → Repository name:** `SiteFederalForce` (o endereço do site segue o nome do repositório).
2. **Settings → Pages → Build and deployment → Source:** `GitHub Actions`.
3. Faça um push (ou rode o workflow em **Actions → Deploy GitHub Pages → Run workflow**).

Endereço final: **https://lscaio.github.io/SiteFederalForce/** — e as seções, por exemplo, `https://lscaio.github.io/SiteFederalForce/reefscape/galeria`.

## Páginas e endereços

O site tem três páginas. Abrir qualquer endereço leva direto à seção (a abertura só roda em `/`); a URL acompanha a rolagem e voltar/avançar funciona. Maiúsculas e acentos são aceitos (`/Reefscape/Galeria`, `/rebuilt/Robô`).

**Início** — Hero → Quem Somos → Além da Arena → FRC → Nossa Evolução → (Parceiros) → Final

| Endereço | Seção |
| --- | --- |
| `/` | Abertura + Hero |
| `/quem-somos` (ou `/temporadas`) | Quem Somos, com o botão **“Conheça as nossas temporadas”** |
| `/alem-da-arena` (ou `/projetos`) | Projetos sociais |
| `/frc` | O que é a FRC |
| `/evolucao` | Nossa Evolução (os nomes das temporadas levam às páginas delas) |
| `/final` (ou `/contato`) | Cena final + rodapé |

**Temporadas (páginas próprias, com botão Voltar no topo e no fim)**

| Endereço | Página |
| --- | --- |
| `/rebuilt` · `/rebuilt/historia` · `/desafio` · `/robo` · `/estrategia` · `/resultados` · `/galeria` · `/cad` | Temporada Rebuilt 2026 |
| `/reefscape` · `/reefscape/historia` · `/desafio` · `/robo` · `/estrategia` · `/resultados` · `/galeria` | Temporada Reefscape 2025 |

O botão “Conheça as nossas temporadas” abre um seletor com as duas temporadas, cada uma estilizada pelo seu moodboard (`src/components/ui/SeasonPicker.tsx`). Rotas em `src/lib/routes.ts`, navegação em `src/lib/router.ts`. Como é um SPA, o servidor precisa devolver `index.html` para qualquer caminho: o projeto inclui `public/_redirects` (Netlify), `vercel.json` (Vercel) e gera `dist/404.html` no build (GitHub Pages).

## Fefo (mascote)

Animação quadro a quadro com os frames de `Hero(Telainicial)/AnimaçãoCorujaDireita` e `/AnimaçãoCorujaEsquerda` (01 pousado · 02–03 decolagem · 04–08 voo · 09–12 pouso). Ele atravessa a Hero e pousa sobre o robô; na rolagem, decola, voa em arco e pousa no fim da primeira linha dos títulos marcados com `<Perch id="…" />`. Pousado, acompanha o título; só voa quando muda de poleiro. Física e máquina de estados em `src/components/ui/fefoFlight.ts`, validadas por `npm run test:fefo`.

## Fonte única de conteúdo: Drive "Dados_Site_Federal"

Todo texto, imagem e modelo vem do Drive. Nada foi inventado.

| Pasta do Drive | Uso no site | Arquivo no código |
| --- | --- | --- |
| `Hero(Telainicial)` | Logo, mascote Fefo (`CorujaFederal.png`), CAD 3D do robô com cores (`Assembly final.obj` + `.mtl`) | `src/content/drive.ts → hero` |
| `Intro geral da equipe` | Quem Somos: texto + mosaico de fotos | `quemSomos`, `quemSomosTexto` |
| `FRC` | Seção FRC: texto, logo, imagens de arenas/robôs/equipes, vídeo do YouTube | `frc`, `frcTexto` |
| `Equipe Rebuilt 2026` | Mini-site REBUILT: texto, fotos, **moodboard** (paleta, tipografia, linguagem visual) | `rebuilt`, `rebuiltTexto`, `src/index.css` (`rb-*`) |
| `Equipe Reefscape 2025` | Mini-site REEFSCAPE: texto, fotos, **moodboard** | `reefscape`, `reefscapeTexto`, `src/index.css` (`rf-*`) |
| `Projetos_Sociais` | Além da Arena: Force Voice, STEAM Girls, Rocket Force (textos + imagens) | `projetosTexto`, `projetosImagens` |

- `src/content/drive.ts` — manifesto com o **ID e o nome de cada arquivo** do Drive.
- `src/content/texts.ts` — transcrição **literal** de cada `.txt` (com o arquivo de origem indicado).
- As imagens são carregadas **diretamente do Drive público** (`lh3.googleusercontent.com/d/<id>=w<largura>`), com `srcset`, lazy loading e blur-up progressivo.

### Servir as imagens localmente (recomendado em produção)

```bash
npm run sync:drive                       # baixa as 32 imagens para public/drive/
VITE_DRIVE_SOURCE=local npm run build    # passa a usar /drive/<id>.<ext>
```

## CAD 3D (abertura, Hero e Visualizador usam o MESMO arquivo)

A fonte é a exportação do Onshape `Hero(Telainicial)/Assembly final.obj` + `Assembly final.mtl` (937 MB, 10,4 milhões de triângulos, 76 materiais com cor). O GLB publicado tem 6,7 MB e cerca de 320 mil triângulos, com as cores do CAD. O `CAAD3D` (STL, sem cores) continua como alternativa.

```bash
npm run sync:drive -- --cad     # baixa Assembly final.obj + .mtl para cad-source/ (--stl: também o CAAD3D)
npm run cad:convert -- --z-up   # detecta o formato e gera o GLB otimizado (~300 mil triângulos, meshopt)
# npm run cad:convert -- --keep-parts   # preserva hierarquia/nomes para fichas por subsistema
# npm run cad:convert -- --target 150000 # menos triângulos (arquivo menor)
# --z-up é necessário: o Onshape exporta com Z para cima
git add public/models/federal-robot.glb
```

O OBJ é lido em streaming e agrupado por material (as cores `Kd` do .mtl viram materiais PBR); a conversão leva ~45 s. O conversor identifica o formato pelo conteúdo: GLB (inclusive já comprimido com Draco/meshopt), glTF, OBJ, STL ou ZIP contendo um deles. FBX/STEP não são suportados — nesse caso, exporte como GLB. Meta: GLB < 8 MB.

Enquanto o GLB não existe, a cena mostra uma **silhueta técnica provisória** (wireframe) e o visualizador indica `CAD · aguardando federal-robot.glb`.

### Fichas técnicas de subsistemas (futuro)

`src/components/three/subsystems.ts` já resolve cliques/hover no modelo para subsistemas. Basta cadastrar entradas com os nomes dos nós do GLB (gerado com `--keep-parts`) e, quando existirem no Drive, a ficha técnica — o painel aparece automaticamente.

## Pendências de conteúdo no Drive

Estes itens pedidos no briefing **não existem no Drive**. O código está pronto e eles aparecem assim que forem adicionados:

- **Parceiros** — não há pasta de parceiros. A seção fica oculta enquanto `parceiros` (em `texts.ts`) estiver vazio.
- **Contato** do rodapé — nenhum dado no Drive (`contato`). O Instagram @frc10466 já está no rodapé.
- **Vídeos das temporadas** — não há vídeos nas pastas Rebuilt/Reefscape (o único vídeo é o link da FRC).
- **CAD da Reefscape (Griffo)** — não há CAD na pasta; o visualizador fica na temporada REBUILT.
- Revisão de texto sugerida no Drive (transcrito literalmente): em `Nossa temporada REEFSCAPE (2025).txt`, "Ele foi pensado para Climbar ele conseguia alcançar o último nível, sendo seu ponto mais forte" e "foi a prova de que uma estreia histórica em que…".

## Performance e acessibilidade

- Code splitting: cenas abaixo da dobra, a cena 3D (three/drei ≈ 300 KB gz) e o visualizador CAD são carregados sob demanda; o bundle inicial do app tem ~14 KB gz (+ React/Framer/GSAP).
- Canvas WebGL só renderiza quando próximo da viewport; DPR limitado; iluminação 100% procedural (sem HDRI externo); GLB com meshopt (decoder embutido).
- `prefers-reduced-motion`: abertura pulada, sem Lenis, sem parallax/bolhas, revelações instantâneas.
- Mobile: câmera se ajusta ao retrato, galerias viram carrossel com snap, cards de projetos abrem por toque.
- Botão "Pular abertura", navegação por cenas (menu + trilho lateral) e foco visível por teclado.
