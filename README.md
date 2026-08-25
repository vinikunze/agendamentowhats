# Bormann Jr.

Site editorial de marca pessoal para **Bormann Jr.** — hair stylist,
Expert Team Wella Professionals Brasil e diretor criativo do
**Bormann Jr Concept** · *Concept Hair Expert* (Sinop — Mato Grosso).

A hierarquia do site é conceitual, não comercial:

```
BORMANN JR.  →  visão / trabalho  →  BORMANN JR CONCEPT  →  contato
```

---

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

Produção:

```bash
npm run build
npm run start
```

Verificação completa antes de publicar:

```bash
npm run verify       # lint + typecheck + build
```

---

## Editar conteúdo

**Todo o texto e todos os dados do site saem de um arquivo só:**

### `src/content/site.ts`

Nada é buscado de API, nada está escrito dentro de componente. Edite esse
arquivo e o site inteiro acompanha — inclusive os dados estruturados de SEO.

Ele está dividido em três naturezas, e a diferença importa:

| Bloco | O que é |
|---|---|
| **confirmado** | Verificado em fonte pública (bios do Instagram, Google Business, registro da empresa). Está no ar. |
| **`pending`** | Ainda não fornecido. Enquanto for `null` ou `[]`, **a seção correspondente não é renderizada**. |
| **`draftCopy`** | Texto editorial provisório, escrito a partir do posicionamento real. Revisar na voz do Bormann. |

### A regra do projeto: nada é inventado

Contato, endereço e horário estão no site porque foram confirmados em duas
fontes independentes. O que **não** está: lista de serviços, depoimentos,
número de clientes, tempo de carreira, prêmios e preços — nada disso foi
verificado, então nada disso aparece. As seções que dependeriam desses dados
não existem, em vez de existirem preenchidas com suposição.

Isso é reforçado por teste automatizado. `tests/site.spec.ts` falha se:

- aparecer um número de WhatsApp diferente do confirmado;
- entrar na página um superlativo não verificado ("anos de experiência",
  "mil clientes", "o melhor");
- a seção de serviços ou de depoimentos aparecer sem os dados correspondentes.

Ou seja: a regra não depende de ninguém lembrar dela.

---

## Dados reais já aplicados

Confirmados nas bios oficiais do Instagram e na ficha do Google Business, e
já no ar em `src/content/site.ts`:

| Dado | Valor | Fonte |
|---|---|---|
| WhatsApp | `5566999021873` | link das bios de **@bormannjr** e **@bormannjrconcept** |
| Telefone | (66) 99902-1873 | Google Business — **mesmo número** do WhatsApp |
| Endereço | R. Tancredo Neves, 330 — Jardim Itália, Sinop/MT, 78555-324 | Google Business |
| Horário | Terça a sábado, 09h às 18h | bio de @bormannjrconcept |
| Cargo | Hair Stylist · Diretor Criativo | bio de @bormannjr |
| Credencial | Expert Team Wella Professionals Brasil | bio de @bormannjr |
| Cursos | Cursos VIPs | bio de @bormannjr |
| Promessa | Atendimento personalizado | bio de @bormannjrconcept |
| Assinatura | Concept Hair Expert | logotipo |

Com isso, o CTA principal virou **"Agendar pelo WhatsApp"** e o Schema.org
passou a publicar uma ficha `HairSalon` completa — endereço, telefone,
horário de funcionamento e ação de agendamento.

### ⚠️ Uma divergência a resolver

A bio do Instagram diz **09h às 18h**; a ficha do Google diz que fecha às
**19h**. O site segue a bio. Vale acertar o Google — ou corrigir `contact.hours`
se o horário real for outro.

---

## O que ainda falta

- [ ] **Fotografia** — hoje o site usa chapas de tom. Ver a seção abaixo.
      É o item que mais muda o resultado.
- [ ] **`seo.siteUrl`** — trocar `https://bormannjr.com.br` pelo domínio real
      antes do deploy (afeta canonical, sitemap, robots e OpenGraph).
- [ ] **`services`** — a lista real de serviços. Enquanto estiver vazia, a
      seção não existe.
- [ ] **`testimonials`** — depoimentos reais e autorizados. Idem.
- [ ] **`person.discipline`** — a bio atual não repete "visagista", embora o
      canal de vídeo e o Facebook usem o termo. Confirmar se continua no
      posicionamento; se não, troque por `null` e a página se ajusta sozinha.
- [ ] **`courses.detail`** — se quiser publicar formato, carga horária ou
      próximas turmas dos Cursos VIPs.
- [ ] **`contact.email`** e **`contact.mapsUrl`** — opcionais.
- [ ] **Logotipo oficial** — o monograma JB do header e do rodapé é uma
      reconstrução tipográfica (`components/ui/BrandMark.tsx`). Com o SVG
      original em mãos, só esse arquivo muda.

## Fotografia

As imagens em `public/images/` hoje **não são fotografias**. São chapas de tom:
estudos de luz abstratos, gerados na paleta do projeto, que ocupam o lugar da
fotografia real para que a composição possa ser avaliada e testada. Não são
imagens de banco e não fingem ser fotos de ninguém.

```
public/images/bormann/     retrato do hero, assinatura, galeria, fita do feed
public/images/concept/     o espaço do salão
```

### O retrato do hero é a peça mais importante

O retrato editorial de Bormann Jr. (fundo escuro, blazer, luz lateral) é
exatamente o registro que o layout foi desenhado para receber. Salve-o como:

```
public/images/bormann/hero-portrait.jpg
```

No desktop ele ocupa 55% da largura, à direita, com o degradê costurando a
borda esquerda; no mobile vem inteiro no topo. Prefira um arquivo em retrato
(3:4 ou mais alto) e com o rosto acima da metade da altura — o degradê e a
tipografia trabalham a faixa inferior.

### Para colocar a fotografia real

1. Salve o arquivo **no mesmo caminho e com o mesmo nome** que a chapa atual.
2. Em `src/content/images.ts`, atualize `width` e `height` para as dimensões
   reais do arquivo.
3. **Reescreva o `alt`** descrevendo o que a foto realmente mostra. Os textos
   atuais descrevem as chapas, porque é isso que está na tela.
4. Se quiser regenerar as chapas restantes:
   `npm run images` (aceita um filtro: `npm run images -- concept`).

A galeria de trabalho depende de proporções **diferentes entre si** — é o que
separa uma galeria editorial de uma grade de Instagram. Ao substituir, prefira
manter essa variação de formato.

A fita do Instagram usa imagens locais de propósito: sem embed, sem API e sem
URL do Instagram como fonte permanente de arquivo. Cada item pode apontar para
o permalink do post pelo campo `href`.

---

## Direção

**Paleta** — preto profundo `#080808`, off-white quente `#F1EEE8`, creme
`#E6DFD4`, cinza quente `#AAA39A`, e um bronze de acento usado com parcimônia
(`#B99A6B` no escuro, `#7D5C2E` no claro — o claro é mais pesado para passar em
contraste AA).

**Tipografia** — duas famílias, não seis:

- **Bodoni Moda** (variável, eixo óptico) — didone de alto contraste, o registro
  de revista de moda.
- **Inter Tight** (variável) — grotesca contemporânea para metadados e corpo.

Toda a escala usa `clamp()`.

**Superfície** — o site é escuro e vira claro na seção do Concept, por um
atributo `data-surface="light"` que troca os papéis dos tokens. A fotografia
larga atravessa a fronteira entre as duas superfícies.

**Tokens** — tudo em `src/app/globals.css`, sob `:root`. Cores, tipografia,
espaçamento, container, easings e durações. Ajuste um token, o site acompanha.

---

## Movimento

- **Motion** (`motion/react`) — revelações, escalonamento, hovers, menu,
  parallax do hero, fita horizontal da galeria.
- **Lenis** — scroll suave em ponteiro/roda. **No celular o scroll é o nativo**
  (`syncTouch` desligado), e o Lenis respeita `prefers-reduced-motion` por
  padrão.
- **GSAP não foi instalado.** A única sequência que o justificaria — a galeria
  horizontal com pinning — está resolvida com `position: sticky` mais o
  `useScroll` do Motion, que já estava no projeto. Não havia motivo para somar
  uma segunda biblioteca de animação ao bundle.

Só `opacity`, `transform` e `clip-path` são animados. Durações entre 240ms e
1,25s, com uma curva expo-out (`cubic-bezier(0.16, 1, 0.3, 1)`). Sem bounce,
sem elástico.

### `prefers-reduced-motion`

Quem pede menos movimento recebe o site inteiro, imediato e sem coreografia —
nada some e nada trava. Há teste automatizado para isso: falha se qualquer
bloco ficar transparente ou recortado a zero esperando um gatilho que, sem
movimento, nunca dispararia.

### Uma armadilha registrada no código

`maskReveal` **nunca** pode ser aplicada ao próprio elemento observado por
`whileInView`. Um elemento recortado em `inset(100%)` tem área visível zero, e
o IntersectionObserver leva esse recorte em conta: a razão de interseção é
sempre 0, o gatilho nunca dispara, e a animação impede a si mesma de começar.

Por isso existe `components/motion/MaskReveal.tsx`, com dois elementos: o de
fora é observado, o de dentro é recortado.

---

## Estrutura

```
src/
  app/
    layout.tsx          fontes, metadata, JSON-LD
    page.tsx            composição da homepage
    globals.css         design tokens + camadas base/components
    sitemap.ts robots.ts icon.png apple-icon.png
  content/
    site.ts             ← FONTE ÚNICA DE CONTEÚDO
    images.ts           catálogo de imagens e alt text
    blur-data.json      placeholders de blur (gerado)
  components/
    layout/             Header, Footer, SmoothScroll
    sections/           Hero, Manifesto, Work, Concept, Services, Courses,
                        Testimonials, InstagramStrip, FinalCta
    gallery/            WorkGallery, EditorialFigure
    motion/             Reveal, MaskReveal, LineReveal
    ui/                 Cta, SectionHeading, FittedWordmark, BrandMark
  lib/
    motion.ts           vocabulário de movimento
    schema.ts           dados estruturados (só dado confirmado)
scripts/                geradores de imagem e ferramentas de auditoria
tests/                  Playwright
```

### Camadas de CSS

`globals.css` usa `@layer base` e `@layer components` **de propósito**. CSS sem
camada vence CSS em camada, então um reset solto como `a { color: inherit }`
derrotaria silenciosamente `text-foreground` do Tailwind. Ao acrescentar estilo
próprio, mantenha-o dentro de uma camada.

---

## Testes e auditoria

```bash
npm run test     # Playwright: desktop + mobile
npm run qa       # varredura em 6 viewports: overflow, console, alvos de toque
npm run audit    # axe-core + LCP/CLS (rodar contra o build de produção)
npm run shots    # capturas por seção, para revisão de composição
```

`npm run qa` percorre 375, 390, 430, 768, 1024, 1280, 1440 e 1920, mais uma
passada com movimento reduzido, e salva as capturas e um relatório em `.qa/`.
O 1024 está na lista porque é exatamente onde o menu desktop entra — a largura
mais apertada em que logotipo, navegação e botão precisam caber numa linha.

Alguns testes são de conteúdo, não de código: o suite falha se aparecer um
número de WhatsApp diferente do confirmado, se a numeração das seções pular
ou repetir, ou se entrar na página um superlativo não verificado
("anos de experiência", "mil clientes", "o melhor").

### Estado atual

- lint, typecheck e build de produção: limpos
- Playwright: 23 passando (desktop + mobile)
- axe-core (WCAG 2.1 AA + best practice): 0 violações
- CLS 0 · LCP ~272ms no desktop, ~1,37s no mobile
- nenhum scroll horizontal, nenhum erro de console, em nenhum dos 8 viewports

### Ambiente

Se o Chromium do sistema não for o que o Playwright baixaria, aponte:

```bash
CHROMIUM_PATH=/caminho/para/chromium npm run test
```

---

## Acessibilidade

HTML semântico, navegação por teclado, `focus-visible` visível em tudo, link de
pular para o conteúdo, menu mobile com foco preso e fechamento por `Esc`, alt
text descritivo, contraste AA verificado nas duas superfícies, e alvos de toque
ampliados em ponteiro grosso sem alterar o desenho no desktop.

---

## Publicar no GitHub

O repositório é
[vinikunze/bormannjrconcept](https://github.com/vinikunze/bormannjrconcept).
O trabalho está commitado na branch `claude/bormann-jr-premium-site-i25vzv`.

Para que as edições passem a ir direto para lá, o app do Claude precisa de
permissão de escrita neste repositório — hoje o push volta com `403`. Um dos
dois caminhos resolve:

1. **Instalar/autorizar o app no repositório**
   → https://github.com/apps/claude/installations/select_target
   Escolha a conta `vinikunze` e marque `bormannjrconcept` (ou "All
   repositories").

2. **Reconectar o GitHub na sua conta Claude**
   → claude.ai → Settings → Connectors → GitHub → reconectar.

Feito isso, o push acontece normalmente:

```bash
git push -u origin claude/bormann-jr-premium-site-i25vzv
```

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Motion · Lenis · sharp (geração de imagens) · Playwright + axe-core.
