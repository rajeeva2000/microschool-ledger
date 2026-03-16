/**
 * MSLMark — Microschool Ledger platform logo mark
 *
 * Usage:
 *   <MSLMark />                    — default 40px, on-dark variant
 *   <MSLMark size={56} />          — larger
 *   <MSLMark variant="solid" />    — solid pine background (for favicon, light surfaces)
 *   <MSLMark variant="ondark" />   — ghost outline (for nav bars, dark headers)
 *
 * Full lockup with wordmark:
 *   <MSLLockup />
 *   <MSLLockup size={32} />
 */

export function MSLMark({ size = 40, variant = 'ondark', className = '' }) {
  if (variant === 'solid') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Microschool Ledger"
      >
        <rect x="0.5" y="0.5" width="39" height="39" rx="6" fill="#3C4535" />
        <line x1="12" y1="0" x2="12" y2="40" stroke="#c9a84c" strokeWidth="2.5" />
        <line x1="0" y1="13" x2="40" y2="13" stroke="white" strokeWidth="0.7" opacity="0.25" />
        <line x1="0" y1="21" x2="40" y2="21" stroke="white" strokeWidth="0.7" opacity="0.25" />
        <line x1="0" y1="29" x2="40" y2="29" stroke="white" strokeWidth="0.7" opacity="0.25" />
        <text
          x="26" y="25"
          fontFamily="Georgia, serif"
          fontSize="10"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >MSL</text>
      </svg>
    );
  }

  // ondark variant (default) — ghost outline, for use on pine/dark backgrounds
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Microschool Ledger"
    >
      <rect
        x="0.5" y="0.5" width="39" height="39" rx="6"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.75"
      />
      <line x1="12" y1="0" x2="12" y2="40" stroke="#c9a84c" strokeWidth="2" opacity="0.9" />
      <line x1="0" y1="13" x2="40" y2="13" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="0" y1="21" x2="40" y2="21" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="0" y1="29" x2="40" y2="29" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <text
        x="26" y="25"
        fontFamily="Georgia, serif"
        fontSize="10"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >MSL</text>
    </svg>
  );
}

/**
 * MSLLockup — mark + wordmark side by side
 * Always use on dark backgrounds.
 */
export function MSLLockup({ size = 40, className = '' }) {
  const textScale = size / 40;
  const totalWidth = Math.round(220 * textScale);

  return (
    <svg
      width={totalWidth}
      height={size}
      viewBox="0 0 220 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Microschool Ledger"
    >
      {/* Mark */}
      <rect
        x="0.5" y="0.5" width="39" height="39" rx="6"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.75"
      />
      <line x1="12" y1="0" x2="12" y2="40" stroke="#c9a84c" strokeWidth="2" opacity="0.9" />
      <line x1="0" y1="13" x2="40" y2="13" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="0" y1="21" x2="40" y2="21" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="0" y1="29" x2="40" y2="29" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <text
        x="26" y="25"
        fontFamily="Georgia, serif"
        fontSize="10"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >MSL</text>
      {/* Wordmark */}
      <text
        x="52" y="22"
        fontFamily="Georgia, serif"
        fontSize="13"
        fontWeight="400"
        fontStyle="italic"
        fill="rgba(255,255,255,0.85)"
      >Microschool</text>
      <text
        x="52" y="37"
        fontFamily="Georgia, serif"
        fontSize="13"
        fontWeight="700"
        fill="white"
      >Ledger</text>
    </svg>
  );
}
