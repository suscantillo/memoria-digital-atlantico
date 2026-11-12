interface Props {
  color?: string;
  tamano?: number;
}

/** Fachada de la Aduana con sus columnas: el edificio donde funciona el archivo. */
export function Isotipo({ color = 'currentColor', tamano = 40 }: Props) {
  return (
    <svg width={tamano} height={tamano * 0.85} viewBox="0 0 40 34" aria-hidden focusable="false">
      <path d="M20 2 2 11h36z" fill={color} />
      <rect x="4" y="12" width="32" height="3" fill={color} />
      {[7, 15, 23, 31].map((x) => (
        <rect key={x} x={x} y="16" width="4" height="12" fill={color} />
      ))}
      <rect x="2" y="29" width="36" height="4" fill={color} />
    </svg>
  );
}
