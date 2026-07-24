// Canonical ∀ mark — the settled brand lockup glyph (Geist w350, outlined
// path). Brand rule: never render the mark with a live font; this path is
// byte-identical to the outline used in axiom-brand's w350 assets and the
// canonical favicon. Sized in em so it tracks the surrounding text like the
// typed glyph it replaces; fill follows the CSS `color` of its context.
export function AxiomGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="21 0 617 710"
      width="0.63em"
      height="0.72em"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M21 0L278 710L381 710L638 0L554 0L481 207L178 207L105 0ZM204 283L455 283L329 642Z"
      />
    </svg>
  );
}
