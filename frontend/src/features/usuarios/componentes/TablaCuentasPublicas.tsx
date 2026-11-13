import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import type { DireccionOrden } from '../../../shared/tipos/api';
import { useCambiarEstadoCuentaPublica, useCuentasPublicas } from '../hooks';
import type { CampoOrdenUsuario, CuentaPublica, ParametrosListarUsuarios } from '../tipos';

const COLUMNAS: { campo: CampoOrdenUsuario; etiqueta: string }[] = [
  { campo: 'nombre', etiqueta: 'Nombre' },
  { campo: 'correo', etiqueta: 'Correo' },
  { campo: 'creadoEn', etiqueta: 'Registro' },
];

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO');

interface Props {
  params: ParametrosListarUsuarios;
  onCambiar: (cambios: Partial<ParametrosListarUsuarios>) => void;
}

/**
 * Cuentas PUBLICO del portal. El ADMIN las consulta con su consentimiento y las desactiva (no
 * pueden volver a entrar y se revocan sus sesiones) o las reactiva. No se cambian de rol.
 */
export function TablaCuentasPublicas({ params, onCambiar }: Props) {
  const consulta = useCuentasPublicas(params);
  const cambiarEstado = useCambiarEstadoCuentaPublica();
  const [seleccionada, setSeleccionada] = useState<CuentaPublica | null>(null);

  const cambiarOrden = (campo: CampoOrdenUsuario) => {
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
    <>
      <Paper variant="outlined">
        <Box sx={{ height: 4 }} aria-hidden>
          {consulta.isFetching && <LinearProgress />}
        </Box>
        <TableContainer>
          <Table aria-label="Cuentas del portal" size="small">
            <caption style={{ captionSide: 'top', textAlign: 'left', padding: '8px 16px' }}>
              <Typography component="span" variant="body2" color="text.secondary" role="status">
                {consulta.isPending ? 'Cargando…' : `${total} cuentas del portal`}
              </Typography>
            </caption>
            <TableHead>
              <TableRow>
                {COLUMNAS.map(({ campo, etiqueta }) => {
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
                        onClick={() => cambiarOrden(campo)}
                      >
                        {etiqueta}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
                <TableCell>Aviso de privacidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((cuenta) => (
                <TableRow key={cuenta.id} hover>
                  <TableCell>{cuenta.nombre}</TableCell>
                  <TableCell>{cuenta.correo}</TableCell>
                  <TableCell>{fecha(cuenta.creadoEn)}</TableCell>
                  <TableCell>
                    {cuenta.consentimientoEn
                      ? `Aceptó v${cuenta.versionPrivacidad ?? '?'} el ${fecha(cuenta.consentimientoEn)}`
                      : 'Sin registro'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={cuenta.activo ? 'Activa' : 'Desactivada'}
                      color={cuenta.activo ? 'success' : 'default'}
                      variant={cuenta.activo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    {cuenta.activo ? (
                      <Button
                        size="small"
                        color="error"
                        disabled={cambiarEstado.isPending}
                        onClick={() => setSeleccionada(cuenta)}
                      >
                        Desactivar
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        disabled={cambiarEstado.isPending}
                        onClick={() => cambiarEstado.mutate({ id: cuenta.id, desactivar: false })}
                      >
                        Reactivar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {consulta.isSuccess && filas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {params.busqueda
                      ? 'No hay cuentas que coincidan.'
                      : 'Todavía nadie se ha registrado en el portal.'}
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
          onPageChange={(_evento, pagina) => onCambiar({ pagina: pagina + 1 })}
          onRowsPerPageChange={(evento) =>
            onCambiar({ limite: Number(evento.target.value), pagina: 1 })
          }
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          getItemAriaLabel={(tipo) => (tipo === 'next' ? 'Página siguiente' : 'Página anterior')}
        />
      </Paper>
      {cambiarEstado.isError && (
        <MensajeError error={cambiarEstado.error} titulo="No se pudo actualizar la cuenta" />
      )}
      <Dialog
        open={seleccionada !== null}
        onClose={() => !cambiarEstado.isPending && setSeleccionada(null)}
        aria-labelledby="confirmar-desactivar-publica"
      >
        <DialogTitle id="confirmar-desactivar-publica">
          ¿Desactivar esta cuenta del portal?
        </DialogTitle>
        <DialogContent>
          <Typography>
            {seleccionada?.nombre} ({seleccionada?.correo}) no podrá iniciar sesión ni leer los
            documentos con cuenta, y sus sesiones abiertas se cerrarán. Puedes reactivarla después.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeleccionada(null)} disabled={cambiarEstado.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={cambiarEstado.isPending || !seleccionada}
            onClick={() => {
              if (!seleccionada) return;
              cambiarEstado.mutate(
                { id: seleccionada.id, desactivar: true },
                { onSuccess: () => setSeleccionada(null) },
              );
            }}
          >
            {cambiarEstado.isPending ? 'Desactivando…' : 'Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
