import Box from '@mui/material/Box';
import { colores } from '../../../app/tema';
import { useColaRevision } from '../hooks';

/** El número de escaneos que esperan revisión, junto a «Control de calidad» en el menú. */
export function PendientesCalidad() {
  const { data } = useColaRevision();
  const total = data?.meta.total ?? 0;
  if (total === 0) return null;
  return (
    <Box
      component="span"
      sx={{
        ml: 1,
        px: 1.1,
        py: '1px',
        borderRadius: 999,
        bgcolor: colores.amarillo,
        color: colores.azulMarino,
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1.5,
      }}
    >
      {total}
      <Box
        component="span"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {total === 1 ? ' escaneo por revisar' : ' escaneos por revisar'}
      </Box>
    </Box>
  );
}
