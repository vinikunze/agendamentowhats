import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function send(page: Page, region: string, text: string) {
  const chat = page.getByRole('region', { name: region, exact: true })
  await chat.getByRole('textbox').fill(text)
  await chat
    .getByRole('button', { name: `Enviar — ${region}`, exact: true })
    .click()
  return chat
}

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('confirma, atribui e conclui o serviço com atualizações entre as conversas', async ({
  page,
}) => {
  const reception = page.getByRole('region', { name: 'Recepção', exact: true })
  const team = page.getByRole('region', { name: 'Equipe — João', exact: true })
  const progress = page.getByRole('region', {
    name: 'Atendimento — João',
    exact: true,
  })
  const summary = page.getByRole('region', {
    name: 'Resumo da equipe',
    exact: true,
  })
  await expect(summary).not.toContainText('Amarok')
  await reception
    .getByRole('button', { name: 'Confirmar 23', exact: true })
    .click()
  await expect(team).toContainText('Novo agendamento #23')
  await expect(summary).toContainText('3 carros agendados')
  await team.getByRole('button', { name: 'Assumir 23', exact: true }).click()
  await expect(team).toContainText('Serviço atribuído a você')
  await expect(reception).toContainText('João assumiu Amarok')
  await progress
    .getByRole('button', { name: 'Começar 23', exact: true })
    .click()
  await expect(progress).toContainText('Amarok em atendimento')
  await progress
    .getByRole('button', { name: 'Finalizar 23', exact: true })
    .click()
  await expect(reception).toContainText('Serviço #23 concluído')
  await expect(summary).toContainText('Concluído')
  await page.reload()
  await expect(reception).toContainText('Serviço #23 concluído')
  await expect(summary).toContainText('Concluído')
})

test('impede que outro mecânico assuma ou atualize um serviço já atribuído', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Confirmar 23', exact: true }).click()
  await page.getByRole('button', { name: 'Assumir 23', exact: true }).click()
  await page.getByLabel('Conversando como').selectOption('Pedro')
  const team = await send(page, 'Equipe — Pedro', 'Assumir 23')
  await expect(team).toContainText('João já assumiu este serviço')
  const progress = await send(page, 'Atendimento — Pedro', 'Começar 23')
  await expect(progress).toContainText('Só o responsável pode atualizá-lo')
  await page
    .getByRole('button', { name: 'Ver agenda', exact: true })
    .last()
    .click()
  const row = page.getByRole('article', { name: 'Agendamento 23' })
  await expect(row).toContainText('João')
  await expect(row).toContainText('Agendado')
})

test('aceita um novo agendamento por mensagem e mantém a confirmação explícita', async ({
  page,
}) => {
  const reception = await send(
    page,
    'Recepção',
    'Agendar 07/10 às 10h: Gol, revisão. Com Marcos.',
  )
  await expect(reception).toContainText('Conferir agendamento #26')
  await expect(reception).toContainText('Responsável: Marcos')
  await reception
    .getByRole('button', { name: 'Confirmar 26', exact: true })
    .click()
  await expect(reception).toContainText('Agendamento salvo')
  const summary = await send(page, 'Resumo da equipe', 'Agenda 07/10')
  await expect(summary).toContainText('Gol')
  await expect(summary).toContainText('Revisão · Marcos')
})

test('permite editar a proposta e criar um agendamento pelo formulário', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Editar', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByLabel('Carro', { exact: true }).fill('Hilux')
  await dialog.getByLabel('Serviço', { exact: true }).fill('Alinhamento')
  await dialog.getByRole('button', { name: 'Conferir na conversa' }).click()
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Recepção', exact: true }),
  ).toContainText('Hilux · Alinhamento')
  await page.getByRole('button', { name: 'Criar um agendamento' }).click()
  dialog = page.getByRole('dialog')
  await dialog.getByLabel('Carro', { exact: true }).fill('Onix')
  await dialog.getByLabel('Serviço', { exact: true }).fill('Troca de bateria')
  await dialog.getByLabel('Horário', { exact: true }).fill('11:00')
  await dialog.getByRole('button', { name: 'Conferir na conversa' }).click()
  await expect(
    page.getByRole('region', { name: 'Recepção', exact: true }),
  ).toContainText('Conferir agendamento #26')
})

test('remarca, filtra e cancela sem apagar o histórico', async ({ page }) => {
  await page.getByRole('button', { name: 'Confirmar 23', exact: true }).click()
  await page
    .getByRole('button', { name: 'Ver agenda', exact: true })
    .last()
    .click()
  await page
    .getByRole('article', { name: 'Agendamento 23' })
    .getByRole('button', { name: 'Remarcar' })
    .click()
  await page
    .getByRole('dialog')
    .getByLabel('Horário', { exact: true })
    .fill('10:30')
  await page.getByRole('button', { name: 'Salvar novo horário' }).click()
  await page
    .getByRole('button', { name: 'Ver agenda', exact: true })
    .last()
    .click()
  let row = page.getByRole('article', { name: 'Agendamento 23' })
  await expect(row).toContainText('10:30')
  await row.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar cancelamento' }).click()
  row = page.getByRole('article', { name: 'Agendamento 23' })
  await expect(row).toContainText('Cancelado')
  await page
    .getByRole('dialog')
    .getByRole('combobox', { name: 'Status', exact: true })
    .selectOption('cancelled')
  await expect(
    page.getByRole('article', { name: /Agendamento \d/ }),
  ).toHaveCount(1)
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Resumo da equipe', exact: true }),
  ).not.toContainText('Amarok')
})

test('oferece ajuda para mensagens inválidas e confirma antes de reiniciar', async ({
  page,
}) => {
  const reception = await send(
    page,
    'Recepção',
    'Agendar 31/02 às 25h: Gol, óleo',
  )
  await expect(reception).toContainText('Confira a data e o horário')
  await page.getByRole('button', { name: 'Recomeçar demonstração' }).click()
  await page.getByRole('button', { name: 'Continuar como está' }).click()
  await expect(reception).toContainText('Confira a data e o horário')
  await page.getByRole('button', { name: 'Recomeçar demonstração' }).click()
  await page.getByRole('button', { name: 'Recomeçar', exact: true }).click()
  await expect(reception).not.toContainText('Confira a data e o horário')
  await expect(
    reception.getByRole('button', { name: 'Confirmar 23', exact: true }),
  ).toBeVisible()
})

test('carrega sem erros, mantém o layout e permite fechar diálogos pelo teclado', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page).toHaveTitle('Agenda da Oficina — Tudo pelo WhatsApp')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Tudo pelo WhatsApp.',
  )
  await expect(
    page.getByRole('region', { name: 'Recepção', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page
    .getByRole('button', { name: 'Ver agenda', exact: true })
    .last()
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(errors).toEqual([])
})

test('acessibilidade da tela e do formulário', async ({ page }) => {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page.getByRole('button', { name: 'Criar um agendamento' }).click()
  const form = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(form.violations).toEqual([])
})
