# Bormann Jr.

Site editorial de marca pessoal para **Bormann Jr.** — hair stylist e visagista,
Expert Team Wella Professionals Brasil e creative director do **Bormann Jr Concept**
(Sinop — Mato Grosso).

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
| **confirmado** | Verificado em fonte pública (bio do Instagram, registro da empresa). Pode publicar. |
| **`pending`** | Ainda não fornecido. Enquanto for `null` ou `[]`, **a seção correspondente não é renderizada**. |
| **`draftCopy`** | Texto editorial provisório, escrito a partir do posicionamento real. Revisar na voz do Bormann. |

### A regra do projeto: nada é inventado

Não há telefone, endereço, horário, lista de serviços, depoimento, número de
clientes, tempo de carreira nem prêmio no site — porque nada disso foi
confirmado. As seções que dependiam desses dados simplesmente não existem, em
vez de existirem preenchidas com suposição.

Isso é reforçado por teste automatizado: `tests/site.spec.ts` falha se um
`tel:` ou um link de WhatsApp aparecer na página sem o dado ter sido
preenchido em `site.ts`.

---

## O que ainda precisa vir do cliente

Preencha em `src/content/site.ts` e a seção correspondente aparece sozinha.

**Contato — objeto `contact`**

- [ ] `whatsapp` — só dígitos com DDI, ex.: `'5566999999999'`
      → liga o CTA principal ao WhatsApp e cria o link no rodapé
- [ ] `phoneDisplay` — telefone formatado para exibição
- [ ] `bookingUrl` — plataforma de agendamento, se houver
      → vira o destino do CTA primário, à frente do WhatsApp
- [ ] `address` — logradouro, bairro, cidade, UF, CEP
      → aparece na ficha do Concept, no rodapé e no Schema.org local
- [ ] `hours` — dias e horários de atendimento
- [ ] `email`, `mapsUrl`

> ⚠️ Circulam em diretórios online um endereço e um telefone ligados ao
> **Salão WSW** — marca relacionada, porém **distinta** do Bormann Jr Concept.
> Nada disso foi confirmado, então nada disso está no código. Confirme antes de
> preencher.

**Serviços — array `services`**

- [ ] Lista real dos serviços oferecidos. Vazio = seção não existe.

**Prova social — array `testimonials`**

- [ ] Depoimentos reais e autorizados. Vazio = seção não existe.

**SEO — objeto `seo`**

- [ ] `siteUrl` — trocar `https://bormannjr.com.br` pelo domínio real antes do
      deploy (afeta canonical, sitemap, robots e OpenGraph).

**Fotografia** — ver a seção abaixo.

---

## Fotografia

As imagens em `public/images/` hoje **não são fotografias**. São chapas de tom:
estudos de luz abstratos, gerados na paleta do projeto, que ocupam o lugar da
fotografia real para que a composição possa ser avaliada e testada. Não são
imagens de banco e não fingem ser fotos de ninguém.

```
public/images/bormann/     retrato do hero, assinatura, galeria, fita do feed
public/images/concept/     o espaço do salão
```

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
    sections/           Hero, Manifesto, Work, Concept, Services,
                        Testimonials, InstagramStrip, FinalCta
    gallery/            WorkGallery, EditorialFigure
    motion/             Reveal, MaskReveal, LineReveal
    ui/                 Cta, SectionHeading, FittedWordmark
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

`npm run qa` percorre 375, 390, 430, 768, 1440 e 1920, mais uma passada com
movimento reduzido, e salva as capturas e um relatório em `.qa/`.

### Estado atual

- lint, typecheck e build de produção: limpos
- Playwright: 17 passando
- axe-core (WCAG 2.1 AA + best practice): 0 violações
- CLS 0 · LCP ~276ms no desktop, ~1,35s no mobile
- nenhum scroll horizontal, nenhum erro de console, em nenhum viewport

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

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Motion · Lenis · sharp (geração de imagens) · Playwright + axe-core.
