import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { colores } from '../../app/tema';

export const FUENTE_FICHA = '"Courier New", ui-monospace, monospace';

interface Props {
  titulo: string;
  descripcion?: string;
  /** Botón principal de la página, a la derecha del título. */
  accion?: ReactNode;
}

/** Encabezado común de las páginas del panel, como en el diseño del inventario. */
export function EncabezadoPanel({ titulo, descripcion, accion }: Props) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {/* las semillas son ficticias: el aviso evita que alguien las tome por el inventario real */}
        <Typography
          sx={{
            fontFamily: FUENTE_FICHA,
            fontWeight: 700,
            fontSize: { xs: 12, sm: 14 },
            letterSpacing: '0.04em',
            color: colores.naranja,
            textTransform: 'uppercase',
          }}
        >
          Datos de prueba · no es el inventario real del CLENA
        </Typography>
        <Typography
          variant="h1"
          sx={{
            m: 0,
            fontSize: { xs: 40, md: 56 },
            lineHeight: 1,
            letterSpacing: '-0.035em',
          }}
        >
          {titulo}
        </Typography>
        {descripcion && (
          <Typography sx={{ mt: 1, color: 'text.secondary', maxWidth: 560 }}>
            {descripcion}
          </Typography>
        )}
      </Box>
      {accion}
    </Box>
  );
}
