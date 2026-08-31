export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#18181b" />
      <text
        x="16"
        y="21.5"
        textAnchor="middle"
        fill="#f59e0b"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        100
      </text>
    </svg>
  );
}
