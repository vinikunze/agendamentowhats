# Agenda da Oficina

Demonstração funcional de uma agenda de oficina por mensagens. A recepção agenda,
os mecânicos assumem o serviço e registram início e conclusão. As quatro conversas
compartilham a mesma agenda, sem login e sem integração externa.

**Esta versão é uma demonstração local.** Não envia WhatsApp, não tem backend,
inteligência artificial, notificações reais ou disparos agendados. Os registros
ficam no `localStorage` deste navegador. Outro computador ou navegador terá sua
própria cópia. Não use para guardar a agenda real da oficina.

## Executar

Node **22.23.3** (`.nvmrc`) e npm. As fontes Inter estão no pacote da aplicação;
não há download de fontes do Google durante build ou navegação.

```bash
npm ci
npm run dev
```

Abra o servidor de desenvolvimento na porta 3000.

```bash
npm run verify  # lint, tipos, testes de domínio e build
npm run start   # servir o build de produção
```

## Experimentar

A demonstração usa segunda-feira, **05/10/2026**, como “hoje”. “Amanhã” é 06/10.
Os horários nos celulares são ilustrativos das quatro etapas da rotina.

1. Confirme a proposta da Amarok com **Confirmar 23**. Enquanto for uma proposta,
   ela não entra no resumo nem gera aviso para os mecânicos.
2. Na conversa da equipe, use **Assumir 23** como João. Troque para Pedro ou Marcos
   para experimentar outro participante. Um serviço já atribuído mantém o responsável.
3. Consulte o resumo, que acompanha as alterações, ou escreva `Agenda 07/10`.
4. Na última conversa, use **Começar 23** e **Finalizar 23**. A recepção recebe as
   atualizações e o histórico permanece disponível.

O Corolla (#24, Pedro) e a S10 (#25, sem responsável) são exemplos já confirmados.
O botão **Ver agenda** permite filtrar por data/status, confirmar, remarcar e cancelar.
**Criar um agendamento** abre uma alternativa por formulário; a criação ainda exige
confirmação na conversa. **Recomeçar demonstração** restaura os exemplos após confirmação.

### Comandos

Os comandos têm formatos definidos; não são interpretação irrestrita de linguagem natural.
Os menus dos celulares mostram a ajuda.

| Onde | Mensagem de exemplo |
| --- | --- |
| Recepção | `Agendar amanhã às 8h: Amarok, troca de 4 pneus. Sem mecânico definido.` |
| Recepção | `Agendar 07/10 às 10h: Gol, revisão. Com João.` |
| Recepção | `Confirmar 26` |
| Recepção | `Remarcar 26 para 08/10 às 14h30` |
| Recepção | `Cancelar 26` |
| Mecânico | `Assumir 26` |
| Mecânico responsável | `Começar 26` / `Finalizar 26` |
| Qualquer conversa | `Agenda hoje` / `Agenda amanhã` / `Agenda 07/10` |

Datas aceitas: hoje, amanhã, dia da semana, DD/MM, DD/MM/AAAA ou AAAA-MM-DD.
Datas sem ano usam 2026, o ano da demonstração. Não são aceitas datas anteriores
à data de referência. Mecânicos de exemplo: João, Pedro e Marcos.

As validações impedem confirmação duplicada, troca indevida de responsável,
conclusão sem início e dois serviços no mesmo horário para o mesmo mecânico.
Não há previsão de duração dos serviços: sobreposições de intervalos não são calculadas.
A proteção de atribuição é local; concorrência entre dispositivos exige um backend.
As abas do mesmo navegador recebem alterações de armazenamento, sem garantia
transacional para edições simultâneas. Até 300 mensagens são preservadas;
os agendamentos não são removidos por esse limite.

## Testes

```bash
npm run test:unit
npx playwright install chromium  # apenas se não houver Chromium instalado
npm run test
```

Com o Chromium do sistema:

```bash
CHROMIUM_PATH=/usr/bin/chromium npm run test
```

Para testar um servidor já em execução (inclusive produção/exportação estática):

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 CHROMIUM_PATH=/usr/bin/chromium npm run test
```

Playwright valida desktop e celular: fluxo completo, persistência, atribuição,
formulários, remarcação, cancelamento, filtros, recuperação de entrada inválida,
reinício, navegação por teclado, console e acessibilidade com axe. Os artefatos
vão para o diretório temporário do sistema, fora do repositório.

## Publicação no GitHub Pages

O Pages atual serve a raiz da branch. Por isso, `index.html`, `_next/` e os
demais arquivos exportados estão versionados na raiz, com `.nojekyll` para
preservar as pastas do Next. Não edite esses arquivos gerados diretamente.
Para atualizar a demonstração nesse modo:

```bash
NEXT_PUBLIC_BASE_PATH=/agendamentowhats npm run prepare:pages
```

Confira e envie as alterações geradas junto com o código-fonte. O script
atualiza somente os caminhos conhecidos da exportação, mantendo `src/` intacto.
A raiz passa a servir o aplicativo, em vez do README renderizado pelo Jekyll.

Se o Pages for alterado para publicação por **GitHub Actions**, o workflow
também suporta esse modo. Para gerar somente o artefato nesse caso:

```bash
NEXT_PUBLIC_BASE_PATH=/agendamentowhats npm run build:pages
```

O resultado fica em `out/`. O workflow utiliza o nome real do repositório para o
subcaminho e só executa o deploy por Actions quando esse é o modo configurado.
Os comandos locais geram arquivos; o envio ao GitHub inicia a publicação.
A demonstração permanece local por navegador mesmo se hospedada publicamente.

## Organização

- `src/lib/agenda.ts`: regras, datas, comandos e validação dos dados salvos.
- `src/lib/agenda-store.ts`: persistência versionada e assinatura de alterações.
- `src/components/workshop-demo.tsx`: composição das quatro etapas.
- `src/components/chat-phone.tsx`: conversa reutilizável e envio de mensagens.
- `src/components/agenda-view.tsx`: consulta e filtros.
- `src/components/booking-form.tsx`: criação, edição e remarcação.
- `src/components/modal.tsx`: diálogo nativo com foco, Escape e fechamento.
- `tests/`: regras de negócio e testes de navegador.
- `docs/design/`: referência visual gerada a partir da projeção fornecida.

## Evolução para WhatsApp real

A conexão oficial fica para a próxima fase: número da WhatsApp Business Platform,
backend com banco e autorização por telefone, webhook com assinatura validada,
fila de notificações, transações para atribuição exclusiva e tarefas de resumo diário.
Mensagens proativas precisam respeitar consentimento, janela de atendimento e regras
de templates vigentes do provedor. Credenciais devem existir somente no servidor.
A recepção e os mecânicos poderão usar o WhatsApp; esta interface serve para
validar o fluxo, sem exigir que a equipe acesse um sistema web durante o trabalho.
