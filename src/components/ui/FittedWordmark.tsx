/**
 * Wordmark que ocupa exatamente a largura disponível, em qualquer viewport.
 *
 * Um `font-size` em `vw` não resolve isto: a largura de uma palavra depende
 * dos glifos, então em alguma largura ela sobra e é cortada. Aqui o texto
 * vive num SVG com `textLength` igual à largura do viewBox e
 * `lengthAdjust="spacing"` — o ajuste vai todo para o espacejamento, sem
 * distorcer os traços do didone. O resultado é um wordmark justificado,
 * que nunca estoura e nunca sobra.
 */
export function FittedWordmark({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 1000 100"
      // Decorativo: o nome já está no texto da página.
      aria-hidden="true"
      focusable="false"
      className={`block w-full ${className}`}
    >
      <text
        x="0"
        y="100"
        textLength="1000"
        lengthAdjust="spacing"
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '128px',
          fontVariationSettings: "'opsz' 96",
        }}
      >
        {text}
      </text>
    </svg>
  )
}
