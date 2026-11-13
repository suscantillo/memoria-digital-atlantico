import type { TipoPieza } from '../tipos';

interface Props {
  tipo: TipoPieza;
  tamano?: number;
  color?: string;
}

/** Ícono de línea de cada tipo de pieza, el mismo del diseño. */
export function IconoTipo({ tipo, tamano = 48, color = 'currentColor' }: Props) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {tipo === 'DOCUMENTO' && (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h6" />
        </>
      )}
      {tipo === 'FOTOGRAFIA' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 16-5-5-8 8" />
        </>
      )}
      {tipo === 'PERIODICO' && (
        <>
          <path d="M4 5h13v14H6a2 2 0 0 1-2-2z" />
          <path d="M17 9h3v8a2 2 0 0 1-2 2" />
          <path d="M8 9h5M8 13h5M8 16h3" />
        </>
      )}
    </svg>
  );
}
