# Conectar a oficina ao WhatsApp

A integração está implementada e testada localmente com uma API simulada. **Ainda precisa de uma conta WhatsApp Cloud API, credenciais e um servidor HTTPS com disco persistente para receber mensagens reais.** A página no GitHub Pages continua sendo uma demonstração independente: os dados daquele navegador não viram agendamentos reais.

## 1. Começar pelo número de teste da Meta

1. Entre em [Meta for Developers](https://developers.facebook.com/apps/) com a conta responsável pela oficina. Cadastre-se como desenvolvedor se a Meta solicitar.
2. Crie um aplicativo com o caso de uso/produto WhatsApp, vinculado ao portfólio empresarial. Os rótulos variam conforme o painel e a conta.
3. Abra **WhatsApp → Configuração da API**. Use o número de teste disponibilizado pela Meta. Não desregistre nem migre o número que já atende clientes.
4. Adicione e confirme, no painel, os destinatários de teste: inicialmente seu telefone e o telefone de um mecânico. O telefone da recepção precisa ser diferente do número remetente da API.
5. Anote o **Phone Number ID** e a versão Graph mostrada no exemplo de envio. O ID não é o número com DDD nem o WhatsApp Business Account ID.
6. O token de teste é temporário. Para uso contínuo, será necessário um token apropriado, com acesso ao ativo WhatsApp e permissões de envio; confirme a validade e as permissões no painel da Meta.

Não publique tokens, App Secret ou códigos de verificação em commits, mensagens do chat ou capturas de tela. Coloque-os nos campos de secrets da hospedagem quando ela estiver definida.

A conexão do número já usado no aplicativo depende da elegibilidade e do fluxo de cadastro da conta. Verifique a opção oficial de coexistência ou migração antes de alterar esse número. Esta implementação atende conversas **individuais**; não automatiza grupos.

## 2. Hospedar o serviço

GitHub Pages não executa webhooks nem mantém uma agenda compartilhada. O serviço `backend/server.mjs` precisa de:

- Node **22.23.3**, porta HTTP configurável e um endereço público **HTTPS** por proxy/host;
- um processo sempre ativo (para receber webhooks, enviar a fila e gerar o resumo);
- disco persistente para SQLite, incluindo os arquivos `-wal` e `-shm`;
- **uma única instância**, com um único processo escritor; sem réplicas automáticas;
- saída HTTPS para `graph.facebook.com` e entrada HTTPS da Meta no webhook.

Pode rodar em uma VPS ou serviço de containers com volume persistente. A opção preparada é Render (serviço Starter + disco persistente); a conta e a contratação ainda estão pendentes. Nenhum serviço pago foi contratado automaticamente. Não use disco temporário de função serverless.

### Opção preparada: Render

O arquivo `render.yaml` descreve um serviço **Starter pago**, uma única instância e disco de 1 GB. O preço e a disponibilidade devem ser conferidos na tela de criação e em [Render Pricing](https://render.com/pricing); não há valor fixado no projeto.

1. Crie/acesse sua conta no [Render](https://dashboard.render.com/) e conecte o GitHub.
2. Use **New → Blueprint**, selecione `vinikunze/agendamentowhats` e a branch `claude/bormann-jr-premium-site-i25vzv`, onde está o `render.yaml`.
3. Confira serviço, disco e custo recorrente antes de confirmar a criação. Os campos secretos/privados são solicitados pelo Render; preencha com os dados da etapa Meta.
4. O Render gera `WHATSAPP_VERIFY_TOKEN`. Copie esse valor **somente para o campo de verificação do webhook na Meta**, nunca para o chat.
5. Após a implantação, use o endereço HTTPS `.onrender.com` exibido pelo Render na etapa de webhook abaixo. Não use a URL do GitHub Pages como callback.
6. Deixe as notificações fora da janela desativadas no primeiro teste. Depois de aprovar o modelo, acrescente `WHATSAPP_NOTICE_TEMPLATE` nas variáveis privadas do serviço.

A implantação automática a cada push está desligada: futuras atualizações do backend exigem **Manual Deploy** no Render. O site demonstrativo mantém sua publicação própria pelo GitHub Pages. A receita ainda precisa ser validada na conta Render: não há implantação de backend ativa neste momento.

### Alternativa: container em servidor próprio

Há um Dockerfile sem dependências npm de runtime:

```bash
docker build -f backend/Dockerfile -t agenda-whatsapp .
docker volume create agenda-whatsapp-data
docker run -d --name agenda-whatsapp --restart unless-stopped \
  --env-file /caminho/privado/whatsapp.env \
  -p 127.0.0.1:8080:8080 \
  -v agenda-whatsapp-data:/data agenda-whatsapp
```

Coloque um proxy HTTPS à frente da porta 8080. O processo usa o usuário `node` (UID 1000); o volume deve permitir escrita desse usuário. A imagem foi construída neste ambiente e passou por inicialização, webhook assinado e reinicialização com volume persistente. Esse teste usou dados fictícios e rede externa desativada; a publicação no Render ainda está pendente.

Sem Docker, com Node instalado e variáveis injetadas pelo host:

```bash
npm run whatsapp:start
```

O serviço não precisa de `npm ci` nem do build Next para funcionar: usa módulos nativos de Node e o domínio compartilhado em `src/lib/agenda.ts`. O flag `--experimental-strip-types` faz parte do comando. O SQLite nativo desta versão do Node ainda emite aviso experimental; mantenha a versão fixada e teste antes de atualizá-la.

## 3. Configuração privada

Os nomes estão em `backend/config.example`. Configure diretamente no host; nunca use prefixo `NEXT_PUBLIC_`.

| Variável | Conteúdo |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Token com acesso ao número remetente, mantido em secret. |
| `WHATSAPP_APP_SECRET` | Segredo do aplicativo Meta, usado para validar a assinatura HMAC do corpo recebido. Precisa estar disponível ao processo, não como placeholder de proxy. |
| `WHATSAPP_VERIFY_TOKEN` | Valor aleatório privado, com pelo menos 32 caracteres, escolhido para a verificação do webhook. Use o mesmo valor no painel Meta. |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número remetente no painel Meta. |
| `WHATSAPP_GRAPH_VERSION` | Versão suportada indicada pela Meta, no formato `vNN.0`. Não há versão de produção presumida pelo código. |
| `WHATSAPP_TEAM_JSON` | Lista privada de participantes, nomes únicos, telefone internacional somente com dígitos, função `reception` ou `mechanic`. |
| `DATABASE_PATH` | Caminho no volume persistente, por exemplo `/data/agenda.sqlite`. |
| `WORKSHOP_TIMEZONE` | Padrão `America/Cuiaba`; ajuste se a oficina estiver em outro fuso. |
| `WORKSHOP_SUMMARY_TIME` | Padrão `07:00`, horário local, todos os dias. |
| `WHATSAPP_NOTICE_TEMPLATE` | Opcional: nome de modelo aprovado pela Meta, sem parâmetros, para aviso fora da janela de atendimento. |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Idioma exato do modelo; padrão `pt_BR`. |
| `PORT` | Padrão `8080`. |

Formato de `WHATSAPP_TEAM_JSON` (números **fictícios**, substitua apenas no campo privado do host):

```json
[
  { "name": "Recepção", "phone": "5511999990001", "role": "reception" },
  { "name": "Carlos", "phone": "5511999990002", "role": "mechanic" }
]
```

Use o identificador do telefone exatamente como a Meta o informa em `wa_id`/`from`, com país e DDD e sem `+`. O serviço não tenta adivinhar variações do nono dígito. Só participantes cadastrados podem consultar ou modificar a agenda. Não altere nomes de mecânicos com serviços em aberto sem antes organizar essas atribuições.

## 4. Registrar o webhook e validar

Depois de publicar o backend e configurar os secrets:

1. Verifique `GET https://SEU_HOST/healthz`: deve retornar `ok`. Isso prova que o processo está ativo, **não** que a credencial Meta está válida.
2. Na configuração de webhook do aplicativo, informe `https://SEU_HOST/webhooks/whatsapp` e o mesmo `WHATSAPP_VERIFY_TOKEN`.
3. Assine o campo/evento **messages** para o ativo WhatsApp correspondente. Confira se o aplicativo está inscrito na conta WhatsApp Business usada no teste.
4. Pelo telefone cadastrado como recepção, envie **Ajuda** ao número de teste. Receber uma resposta real confirma o caminho de entrada e saída; a confirmação de webhook sozinha não basta.
5. Cada participante que quiser receber notificações envia **Ativar avisos**. **Parar avisos** interrompe os avisos proativos; consultas e respostas a comandos continuam disponíveis.
6. A recepção envia `Agendar amanhã às 8h: Amarok, troca de 4 pneus.`. A resposta mostra um agendamento **a confirmar**, com o ID real (o banco novo começa no 1).
7. Envie `Confirmar 1`. O mecânico recebe o aviso, responde `Assumir 1`, depois `Começar 1` e `Finalizar 1`. Se a recepção ativou avisos, recebe as atualizações. Substitua `1` pelo ID retornado.
8. Reinicie o serviço e consulte `Agenda amanhã`: os registros devem continuar no disco persistente.

As mensagens têm formato definido, como na demonstração. Não há transcrição de áudio nem interpretação irrestrita por IA. Mensagens de áudio/imagem recebem instruções de uso, sem baixar a mídia.

## 5. Janela de 24 horas e resumo diário

Respostas em texto são enviadas quando a última mensagem daquele participante ainda está dentro da janela de 24 horas (com margem de 5 minutos). O relógio vem da mensagem assinada pela Meta; uma confirmação de entrega não abre a janela.

Fora dela, é necessário um modelo aprovado. Sugestão para submeter à Meta (a categoria/aprovação depende da análise da Meta):

> Há uma atualização na agenda da oficina. Responda “Agenda hoje” ou “Agenda amanhã” para consultar os serviços.

Cadastre um modelo **sem parâmetros ou cabeçalhos obrigatórios** e coloque o nome aprovado em `WHATSAPP_NOTICE_TEMPLATE`. O serviço envia no máximo um aviso desse tipo por pessoa por dia. O modelo avisa que há atualização; os detalhes vêm quando a pessoa responde e consulta a agenda. Pode haver cobrança conforme a política vigente da Meta.

Sem modelo, o aviso aguarda uma mensagem da pessoa; não se tenta enviar texto fora da janela. Avisos pendentes com mais de 24 horas expiram para não disparar informações antigas. O resumo é registrado uma vez por dia às 7h, com tolerância de até 30 minutos após uma reinicialização. Se o serviço ficou desligado nesse intervalo, não envia um resumo atrasado à tarde. Ele vai apenas a quem ativou os avisos e segue a mesma regra de janela/modelo.

## Operação e limites

- Agenda, deduplicação de webhooks e fila de saída são gravadas em transação SQLite. Reentrega do mesmo evento não repete o comando. A atribuição é serializada, e somente o responsável pode começar/finalizar.
- A API aceitar uma mensagem não comprova a entrega. A fila registra `accepted`, `sent`, `delivered`, `read` e `failed` conforme as respostas e webhooks.
- Em timeout, erro 5xx ou interrupção durante envio, o resultado pode ser incerto. A fila marca `unknown` e **não reenvia automaticamente**, evitando avisos duplicados. Erros 4xx ficam `failed`; corrija credenciais/modelo/destinatário antes de decidir uma nova tentativa. Webhooks de status podem resolver um resultado incerto por seu identificador de correlação.
- Consulte contagens e IDs com `node backend/status.mjs`, usando `DATABASE_PATH` no ambiente privado do host. O comando é somente leitura e não imprime telefones, mensagens ou tokens. Configure monitoramento dos logs `send_needs_review`, `delivery_failed`, `webhook_failed` e `flush_failed` no host. Não há painel administrativo público nem botão de reenvio nesta versão.
- Não há endpoint público para listar a agenda. O webhook exige assinatura sobre o corpo original e descarta remetentes fora do cadastro. Não coloque os secrets no frontend.
- Faça backup consistente do SQLite no host (API de backup SQLite ou serviço parado com os arquivos associados). Proteja o volume e os backups: eles contêm telefones e informações dos serviços. A política de retenção deve ser definida antes de uso prolongado.
- O histórico de conversas da agenda limita-se às 300 mensagens mais recentes; agendamentos e registros de deduplicação/fila permanecem no banco. Esta versão destina-se a uma oficina e uma instância.
- Não há integração de grupos nem sincronização com o localStorage da página de demonstração.

## Verificação de desenvolvimento

```bash
npm run test:unit
npm run test:whatsapp
npm run lint
npm run typecheck
```

`test:whatsapp` usa SQLite real em memória/arquivo temporário, servidor HTTP local e uma API Meta simulada; não exige secrets nem envia mensagens. Cobre recebimento assinado, calendário real, autorização, persistência, deduplicação, confirmação, atribuição, atualização, notificações, opt-in/out, janela de atendimento, modelo, resumo diário e falhas de envio. Testes reais com a Meta, publicação HTTPS e restauração de backup ainda dependem da ativação da conta e da hospedagem.
