import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { colores } from '../../../app/tema';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import type { DireccionOrden } from '../../../shared/tipos/api';
import { useUbicaciones } from '../hooks';
import type { CampoOrdenUbicacion, ParametrosListarUbicaciones } from '../tipos';

const columnas: { campo: CampoOrdenUbicacion; etiqueta: string }[] = [
  { campo: 'deposito', etiqueta: 'Depósito' },
  { campo: 'estanteria', etiqueta: 'Estantería' },
  { campo: 'caja', etiqueta: 'Caja' },
];

const LINEA = '1px dashed #EBD9B0';

const estiloTabla = {
  '& th': {
    fontFamily: FUENTE_FICHA,
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colores.azulMarino,
    borderBottom: `2px dashed #EBD9B0`,
    py: 1.75,
  },
  '& td': { borderBottom: LINEA, py: 1.5, fontSize: 15 },
  '& tbody tr:last-of-type td': { borderBottom: 0 },
  '& tbody tr:hover': { bgcolor: '#FFF8EA' },
  '& .MuiTableSortLabel-root.Mui-active, & .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon':
    { color: colores.naranja },
} as const;

interface Props {
  params: ParametrosListarUbicaciones;
  onCambiar: (cambios: Partial<ParametrosListarUbicaciones>) => void;
}

export function TablaUbicaciones({ params, onCambiar }: Props) {
  const consulta = useUbicaciones(params);

  const ordenarPor = (campo: CampoOrdenUbicacion) => {
    const direccion: DireccionOrden =
      params.orden === campo && params.direccion === 'asc' ? 'desc' : 'asc';
    onCambiar({ orden: campo, direccion, pagina: 1 });
  };

  if (consulta.isError) {
    return <MensajeError error={consulta.error} titulo="No se pudo cargar el listado" />;
  }

  const filas = consulta.data?.datos ?? [];
  const total = consulta.data?.meta.total ?? 0;

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 6px 0 #F5D79E',
      }}
    >
      <Box sx={{ height: 4 }} aria-hidden>
        {consulta.isFetching && <LinearProgress color="secondary" />}
      </Box>
      <TableContainer>
        <Table aria-label="Ubicaciones registradas" sx={estiloTabla}>
          <caption style={{ captionSide: 'top', textAlign: 'left', padding: '8px 16px' }}>
            <Typography component="span" variant="body2" color="text.secondary" role="status">
              {consulta.isPending ? 'Cargando…' : `${total} ubicaciones`}
            </Typography>
          </caption>
          <TableHead>
            <TableRow>
              {columnas.map(({ campo, etiqueta }) => {
                const activa = params.orden === campo;
                return (
                  <TableCell
                    key={campo}
                    sortDirection={activa ? params.direccion : false}
                    aria-sort={
                      activa ? (params.direccion === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                  >
                    <TableSortLabel
                      active={activa}
                      direction={activa ? params.direccion : 'asc'}
                      onClick={() => ordenarPor(campo)}
                    >
                      {etiqueta}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
              <TableCell>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filas.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{u.deposito}</TableCell>
                <TableCell sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>
                  {u.estanteria}
                </TableCell>
                <TableCell sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>{u.caja}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{u.descripcion ?? '—'}</TableCell>
              </TableRow>
            ))}
            {consulta.isSuccess && filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay ubicaciones que coincidan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={params.pagina - 1}
        rowsPerPage={params.limite}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_e, pagina) => onCambiar({ pagina: pagina + 1 })}
        onRowsPerPageChange={(e) => onCambiar({ limite: Number(e.target.value), pagina: 1 })}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        getItemAriaLabel={(tipo) => (tipo === 'next' ? 'Página siguiente' : 'Página anterior')}
        sx={{ borderTop: LINEA }}
      />
    </Box>
  );
}
