import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { BuscadorPanel } from '../../../shared/componentes/BuscadorPanel';
import { EncabezadoPanel } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import {
  estiloCajaTabla,
  estiloTablaPanel,
  LINEA_PUNTEADA,
  soloLectores,
} from '../../../shared/componentes/TablaPanel';
import { TarjetaConteo } from '../../../shared/componentes/TarjetaConteo';
import type { RolUsuario } from '../../../shared/tipos/usuario';
import { DialogoNuevaCuenta } from '../componentes/DialogoNuevaCuenta';
import { useCambiarActiva, useUsuarios } from '../hooks';
import type { CuentaUsuario, ParametrosListarUsuarios } from '../tipos';

const ROLES: { rol: RolUsuario; ayuda: string; fondo: string; chip: [string, string] }[] = [
  {
    rol: 'ADMIN',
    ayuda: 'Administran cuentas y todo el panel',
    fondo: colores.papel,
    chip: [colores.azulMarino, colores.amarillo],
  },
  {
    rol: 'PERSONAL',
    ayuda: 'Registran, escanean y revisan',
    fondo: '#FFE7A8',
    chip: ['#FFE7A8', '#6E4300'],
  },
  {
    rol: 'PUBLICO',
    ayuda: 'Consultan el portal con cuenta',
    fondo: '#CFF4F7',
    chip: ['#CFF4F7', '#005F6B'],
  },
];

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' });

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Los contadores leen meta.total con limite 1: no hace falta otra ruta en la API. */
function useTotalPorRol(rol: RolUsuario) {
  return useUsuarios({ pagina: 1, limite: 1, rol }).data?.meta.total;
}

export function PaginaUsuarios() {
  const { usuario } = useAuth();
  const [params, setParams] = useState<ParametrosListarUsuarios>({ pagina: 1, limite: 10 });
  const [busqueda, setBusqueda] = useState('');
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const consulta = useUsuarios(params);
  const cambiarActiva = useCambiarActiva();
  const totales: Record<RolUsuario, number | undefined> = {
    ADMIN: useTotalPorRol('ADMIN'),
    PERSONAL: useTotalPorRol('PERSONAL'),
    PUBLICO: useTotalPorRol('PUBLICO'),
  };

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setParams((p) => (p.busqueda === busqueda ? p : { ...p, busqueda, pagina: 1 }));
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const alternar = (cuenta: CuentaUsuario) =>
    cambiarActiva.mutate(
      { id: cuenta.id, activa: !cuenta.activa },
      {
        onSuccess: () =>
          setAviso(`${cuenta.activa ? 'Cuenta desactivada' : 'Cuenta activada'}: ${cuenta.correo}`),
        onError: () => setAviso(`No se pudo cambiar la cuenta ${cuenta.correo}.`),
      },
    );

  const filas = consulta.data?.datos ?? [];

  return (
    <Stack spacing={3.5}>
      <EncabezadoPanel
        titulo="Usuarios"
        descripcion="Cuentas del personal del archivo. Solo el administrador ve esta sección."
        accion={
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreando(true)}
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1.5,
              fontSize: 17,
              fontWeight: 800,
              boxShadow: `0 6px 0 ${colores.azulMarino}`,
            }}
          >
            Nueva cuenta del personal
          </Button>
        }
      />

      <Box
        component="section"
        aria-label="Cuentas por rol"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {ROLES.map(({ rol, ayuda, fondo }) => (
          <TarjetaConteo
            key={rol}
            etiqueta={rol}
            valor={totales[rol]}
            ayuda={ayuda}
            fondo={fondo}
            activa={params.rol === rol}
            onClick={() =>
              setParams((p) => ({ ...p, rol: p.rol === rol ? undefined : rol, pagina: 1 }))
            }
          />
        ))}
      </Box>

      <BuscadorPanel
        id="buscar-usuarios"
        etiqueta="Buscar cuentas"
        placeholder="Buscar por nombre o correo…"
        valor={busqueda}
        onCambiar={setBusqueda}
      />

      {consulta.isError ? (
        <MensajeError error={consulta.error} titulo="No se pudieron cargar las cuentas" />
      ) : (
        <Box sx={estiloCajaTabla}>
          <Box sx={{ height: 4 }} aria-hidden>
            {(consulta.isFetching || cambiarActiva.isPending) && (
              <LinearProgress color="secondary" />
            )}
          </Box>
          <TableContainer>
            <Table aria-label="Cuentas" sx={{ ...estiloTablaPanel, minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Persona</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Último ingreso</TableCell>
                  <TableCell>
                    <Box component="span" sx={soloLectores}>
                      Acciones
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.map((cuenta) => {
                  const propia = cuenta.id === usuario?.id;
                  const [fondoChip, textoChip] = ROLES.find((r) => r.rol === cuenta.rol)?.chip ?? [
                    colores.papel,
                    colores.azulMarino,
                  ];
                  return (
                    <TableRow key={cuenta.id} sx={{ opacity: cuenta.activa ? 1 : 0.7 }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            aria-hidden
                            sx={{
                              flex: 'none',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor:
                                fondoChip === colores.azulMarino ? colores.amarillo : fondoChip,
                              display: 'grid',
                              placeItems: 'center',
                              fontFamily: 'h1.fontFamily',
                              fontWeight: 900,
                            }}
                          >
                            {iniciales(cuenta.nombre)}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              {cuenta.nombre}
                              {propia && (
                                <Box
                                  component="span"
                                  sx={{ ml: 1, fontSize: 13, color: colores.naranja }}
                                >
                                  (tú)
                                </Box>
                              )}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 14,
                                color: 'text.secondary',
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {cuenta.correo}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 999,
                            bgcolor: fondoChip,
                            color: textoChip,
                            fontFamily: 'h1.fontFamily',
                            fontWeight: 800,
                            fontSize: 13,
                            letterSpacing: '0.06em',
                          }}
                        >
                          {cuenta.rol}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: cuenta.activa ? '#005F6B' : '#A8320F' }}
                      >
                        {cuenta.activa ? 'Activa' : 'Desactivada'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {cuenta.ultimoIngreso
                          ? fecha.format(new Date(cuenta.ultimoIngreso))
                          : 'Nunca'}
                      </TableCell>
                      <TableCell align="right">
                        {/* las cuentas públicas son de cada persona (Ley 1581): el panel no las toca */}
                        {propia || cuenta.rol === 'PUBLICO' ? (
                          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                            {propia ? 'Tu cuenta' : 'La gestiona su dueño'}
                          </Typography>
                        ) : (
                          <Button
                            variant="outlined"
                            color={cuenta.activa ? 'error' : 'success'}
                            disabled={cambiarActiva.isPending}
                            onClick={() => alternar(cuenta)}
                            aria-label={`${cuenta.activa ? 'Desactivar' : 'Activar'} la cuenta de ${cuenta.nombre}`}
                            sx={{
                              borderRadius: 999,
                              borderWidth: 2,
                              fontWeight: 800,
                              '&:hover': { borderWidth: 2 },
                            }}
                          >
                            {cuenta.activa ? 'Desactivar' : 'Activar'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {consulta.isSuccess && filas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, fontWeight: 700 }}>
                      Ninguna cuenta coincide con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={consulta.data?.meta.total ?? 0}
            page={params.pagina - 1}
            rowsPerPage={params.limite}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(_e, pagina) => setParams((p) => ({ ...p, pagina: pagina + 1 }))}
            onRowsPerPageChange={(e) =>
              setParams((p) => ({ ...p, limite: Number(e.target.value), pagina: 1 }))
            }
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            getItemAriaLabel={(tipo) => (tipo === 'next' ? 'Página siguiente' : 'Página anterior')}
            sx={{ borderTop: LINEA_PUNTEADA }}
          />
        </Box>
      )}

      <Typography sx={{ color: 'text.secondary' }}>
        Las cuentas públicas las gestiona cada persona desde su cuenta (Ley 1581): el panel no las
        edita ni las borra.
      </Typography>

      <DialogoNuevaCuenta
        abierto={creando}
        onCerrar={() => setCreando(false)}
        onCreada={(cuenta) => {
          setCreando(false);
          setAviso(`Cuenta creada: ${cuenta.correo}`);
        }}
      />
      <Snackbar
        open={aviso !== null}
        autoHideDuration={5000}
        onClose={() => setAviso(null)}
        message={aviso}
      />
    </Stack>
  );
}
