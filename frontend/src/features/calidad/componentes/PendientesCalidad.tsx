import Box from '@mui/material/Box';
import { colores } from '../../../app/tema';
import { useColaRevision, useEsAdmin } from '../hooks';

/**
 * Lo que le toca a cada quien, junto a «Control de calidad» en el menú: al ADMIN, los escaneos
 * sin revisor por asignar; al PERSONAL, los que le asignaron (HU-23).
 */
export function PendientesCalidad() {
  const esAdmin = useEsAdmin();
  const { data } = useColaRevision();
  const total = esAdmin
    ? (data?.datos.filter((a) => !a.revisor).length ?? 0)
    : (data?.meta.total ?? 0);
  if (total === 0) return null;
  const texto = esAdmin
    ? total === 1
      ? ' escaneo sin revisor asignado'
      : ' escaneos sin revisor asignado'
    : total === 1
      ? ' escaneo asignado para revisar'
      : ' escaneos asignados para revisar';
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
        {texto}
      </Box>
    </Box>
  );
}
