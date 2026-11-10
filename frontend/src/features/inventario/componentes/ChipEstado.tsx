import Box from '@mui/material/Box';
import { colores } from '../../../app/tema';
import type { EstadoPieza } from '../tipos';

const ESTILOS: Record<EstadoPieza, { borde: string; fondo: string; texto: string }> = {
  REGISTRADA: { borde: '2px dashed #4B5A73', fondo: '#FFFFFF', texto: '#33415A' },
  ESCANEADA: { borde: '2px solid #A0600F', fondo: '#FFEDC2', texto: '#6E4300' },
  REVISADA: { borde: '2px solid #00808F', fondo: '#CFF4F7', texto: '#005F6B' },
  PUBLICADA: { borde: '2px solid #00808F', fondo: '#00808F', texto: '#FFFFFF' },
};

export function ChipEstado({
  estado,
  restringida = false,
}: {
  estado: EstadoPieza;
  restringida?: boolean;
}) {
  const estilo = ESTILOS[estado];
  return (
    <Box
      component="span"
      sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}
    >
      <Box
        component="span"
        sx={{
          px: 1.25,
          py: 0.4,
          border: estilo.borde,
          borderRadius: 2,
          bgcolor: estilo.fondo,
          color: estilo.texto,
          fontFamily: 'h1.fontFamily',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '0.06em',
        }}
      >
        {estado === 'PUBLICADA' ? '✓ PUBLICADA' : estado}
      </Box>
      {restringida && (
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.3,
            borderRadius: 999,
            bgcolor: colores.azulMarino,
            color: colores.amarillo,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          RESTRINGIDA
        </Box>
      )}
    </Box>
  );
}
