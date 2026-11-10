import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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
import {
  useCambiarRolUsuario,
  useDesactivarUsuario,
  useReactivarUsuario,
  useUsuarios,
} from '../hooks';
import type {
  CampoOrdenUsuario,
  ParametrosListarUsuarios,
  RolAdministrable,
  UsuarioAdministrado,
} from '../tipos';

const COLUMNAS: { campo: CampoOrdenUsuario; etiqueta: string }[] = [
  { campo: 'nombre', etiqueta: 'Nombre' },
  { campo: 'correo', etiqueta: 'Correo' },
  { campo: 'rol', etiqueta: 'Rol' },
  { campo: 'creadoEn', etiqueta: 'Creada' },
];

interface Props {
  params: ParametrosListarUsuarios;
  administradorId: string;
  onCambiar: (cambios: Partial<ParametrosListarUsuarios>) => void;
}

export function TablaUsuarios({ params, administradorId, onCambiar }: Props) {
  const consulta = useUsuarios(params);
  const cambiarRol = useCambiarRolUsuario();
  const desactivar = useDesactivarUsuario();
  const reactivar = useReactivarUsuario();
  const [seleccionado, setSeleccionado] = useState<UsuarioAdministrado | null>(null);

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
          <Table aria-label="Cuentas del personal" size="small">
            <caption style={{ captionSide: 'top', textAlign: 'left', padding: '8px 16px' }}>
              <Typography component="span" variant="body2" color="text.secondary" role="status">
                {consulta.isPending ? 'Cargando…' : `${total} cuentas`}
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
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((usuario) => {
                const esAdministradorActual = usuario.id === administradorId;
                return (
                  <TableRow key={usuario.id} hover>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select<RolAdministrable>
                          aria-label={`Rol de ${usuario.nombre}`}
                          value={usuario.rol}
                          disabled={
                            esAdministradorActual || !usuario.activo || cambiarRol.isPending
                          }
                          onChange={(evento) => {
                            const rol = evento.target.value;
                            if (rol === 'ADMIN' || rol === 'PERSONAL') {
                              cambiarRol.mutate({ id: usuario.id, rol });
                            }
                          }}
                        >
                          <MenuItem value="PERSONAL">PERSONAL</MenuItem>
                          <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{new Date(usuario.creadoEn).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>{usuario.activo ? 'Activa' : 'Desactivada'}</TableCell>
                    <TableCell>
                      {usuario.activo ? (
                        <Button
                          size="small"
                          color="error"
                          disabled={
                            esAdministradorActual || desactivar.isPending || reactivar.isPending
                          }
                          onClick={() => setSeleccionado(usuario)}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          disabled={reactivar.isPending || desactivar.isPending}
                          onClick={() => reactivar.mutate(usuario.id)}
                        >
                          Reactivar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {consulta.isSuccess && filas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay cuentas que coincidan.
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
      {(cambiarRol.isError || desactivar.isError || reactivar.isError) && (
        <MensajeError
          error={cambiarRol.error ?? desactivar.error ?? reactivar.error}
          titulo="No se pudo actualizar la cuenta"
        />
      )}
      <Dialog
        open={seleccionado !== null}
        onClose={() => !desactivar.isPending && setSeleccionado(null)}
        aria-labelledby="confirmar-desactivacion-titulo"
      >
        <DialogTitle id="confirmar-desactivacion-titulo">¿Desactivar esta cuenta?</DialogTitle>
        <DialogContent>
          <Typography>
            {seleccionado?.nombre} no podrá iniciar sesión y sus sesiones serán revocadas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeleccionado(null)} disabled={desactivar.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={desactivar.isPending || !seleccionado}
            onClick={() => {
              if (!seleccionado) return;
              desactivar.mutate(seleccionado.id, {
                onSuccess: () => setSeleccionado(null),
              });
            }}
          >
            {desactivar.isPending ? 'Desactivando…' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
