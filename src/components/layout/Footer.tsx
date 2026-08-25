import { Reveal } from '@/components/motion/Reveal'
import { BrandLockup } from '@/components/ui/BrandMark'
import { FittedWordmark } from '@/components/ui/FittedWordmark'
import {
  concept,
  contact,
  draftCopy,
  hasAddress,
  person,
  social,
  whatsappUrl,
} from '@/content/site'

/**
 * Rodapé.
 *
 * Curto. O fecho visual é o wordmark em corpo enorme, cortado pela borda
 * inferior da página — tipografia recortada em vez de uma faixa de links.
 * Só entra aqui o que está confirmado.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      <div className="shell">
        <div className="hairline grid grid-cols-12 gap-x-6 gap-y-10 py-12 lg:py-16">
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <BrandLockup wordmark={concept.name} tagline={concept.tagline} />
            <p className="label mt-5">
              {person.role}
              {person.discipline ? ` / ${person.discipline}` : ''}
              <span aria-hidden="true" className="mx-2 text-accent">/</span>
              {concept.city} — {concept.stateFull}
            </p>
          </div>

          <nav aria-label="Redes sociais" className="col-span-12 sm:col-span-6 lg:col-span-4">
            <p className="label mb-4">Instagram</p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={social.personal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline label text-foreground"
                >
                  {social.personal.handle}
                  <span className="sr-only"> — {social.personal.label}</span>
                </a>
              </li>
              <li>
                <a
                  href={social.concept.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline label text-foreground"
                >
                  {social.concept.handle}
                  <span className="sr-only"> — {social.concept.label}</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Contato: renderiza item por item, só o que existe. */}
          {(hasAddress || whatsappUrl || contact.phoneDisplay || contact.email) && (
            <div className="col-span-12 lg:col-span-4">
              <p className="label mb-4">Contato</p>
              <ul className="flex flex-col gap-2">
                {hasAddress && contact.address && (
                  <li className="label text-foreground">
                    {contact.address.street}, {contact.address.district}
                    <br />
                    {contact.address.city} — {contact.address.state}
                    {contact.address.postalCode ? `, ${contact.address.postalCode}` : ''}
                  </li>
                )}
                {whatsappUrl && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline label text-foreground"
                    >
                      {contact.phoneDisplay ?? 'WhatsApp'}
                    </a>
                  </li>
                )}
                {!whatsappUrl && contact.phoneDisplay && (
                  <li className="label text-foreground">{contact.phoneDisplay}</li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="link-underline label text-foreground">
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* --- Wordmark justificado, apoiado na linha de base --- */}
        <Reveal loose className="select-none pt-10">
          <FittedWordmark text={concept.wordmark} className="text-foreground/[0.13]" />
        </Reveal>

        <div className="hairline flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label">
            &copy; {year} {person.name}. Todos os direitos reservados.
          </p>
          <p className="label">{draftCopy.footer.note}</p>
        </div>
      </div>
    </footer>
  )
}
