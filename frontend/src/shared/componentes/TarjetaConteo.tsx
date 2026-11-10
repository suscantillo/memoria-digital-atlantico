import Box from '@mui/material/Box';
import { colores } from '../../app/tema';
import { FUENTE_FICHA } from './EncabezadoPanel';

interface Props {
  etiqueta: string;
  valor: number | undefined;
  ayuda: string;
  fondo: string;
  activa: boolean;
  onClick: () => void;
}

/** Contador que además filtra la lista: por eso es un botón con aria-pressed. */
export function TarjetaConteo({ etiqueta, valor, ayuda, fondo, activa, onClick }: Props) {
  return (
    <Box
      component="button"
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      sx={{
        p: 2.25,
        border: 0,
        borderRadius: 4,
        bgcolor: fondo,
        color: colores.azulMarino,
        textAlign: 'left',
        fontFamily: 'inherit',
        cursor: 'pointer',
        boxShadow: activa
          ? `0 0 0 4px ${colores.azulMarino}, 0 8px 0 ${colores.azulMarino}`
          : '0 8px 0 rgba(14, 45, 107, 0.14)',
        transition: 'transform .2s, box-shadow .2s',
        '&:hover': { transform: 'translateY(-3px)' },
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'block',
          fontFamily: FUENTE_FICHA,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.06em',
        }}
      >
        {etiqueta}
      </Box>
      <Box
        component="span"
        sx={{
          display: 'block',
          mt: 0.75,
          fontFamily: 'h1.fontFamily',
          fontWeight: 900,
          fontSize: 42,
          lineHeight: 1,
        }}
      >
        {valor ?? '–'}
      </Box>
      <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: 14, fontWeight: 600 }}>
        {ayuda}
      </Box>
    </Box>
  );
}
