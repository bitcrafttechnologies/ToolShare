/**
 * ToolShare mark — the toolbox glyph from the Figma header lockup.
 * Inline rather than an asset so it inherits `currentColor` from the link.
 */
export function Toolbox({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 9.5h19a1 1 0 0 1 1 1v8a1.5 1.5 0 0 1-1.5 1.5h-18A1.5 1.5 0 0 1 1.5 18.5v-8a1 1 0 0 1 1-1Z" />
      <path d="M8 9.5V6a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 6v3.5" />
      <path d="M1.5 13.5h21" />
      <path d="M9.5 12v3h5v-3" />
    </svg>
  );
}
