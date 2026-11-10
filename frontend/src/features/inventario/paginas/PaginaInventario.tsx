import AddIcon from '@mui/icons-material/Add';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { guardarBlob, pedirArchivo } from '../../../shared/api/descargas';
import { BuscadorPanel } from '../../../shared/componentes/BuscadorPanel';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import {
  estiloCajaTabla,
  estiloTablaPanel,
  LINEA_PUNTEADA,
  soloLectores,
} from '../../../shared/componentes/TablaPanel';
import { TarjetaConteo } from '../../../shared/componentes/TarjetaConteo';
import { ChipEstado } from '../componentes/ChipEstado';
import { useContadoresPiezas, useInventario } from '../hooks';
import {
  NOMBRE_TIPO,
  type CampoOrdenPieza,
  type EstadoPieza,
  type ParametrosListarPiezas,
  type PiezaInventario,
  type TipoPieza,
} from '../tipos';

const PARAMS_INICIALES: ParametrosListarPiezas = {
  pagina: 1,
  limite: 10,
  orden: 'codigo',
  direccion: 'asc',
};

const TARJETAS: { estado: EstadoPieza; ayuda: string; fondo: string }[] = [
  { estado: 'REGISTRADA', ayuda: 'Sin escaneo todavía', fondo: colores.papel },
  { estado: 'ESCANEADA', ayuda: 'Esperan control de calidad', fondo: '#FFE7A8' },
  { estado: 'REVISADA', ayuda: 'Aprobadas, sin publicar', fondo: '#BFEFF4' },
  { estado: 'PUBLICADA', ayuda: 'Visibles en el portal', fondo: '#8FE0E8' },
];

const COLOR_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: colores.papel,
  FOTOGRAFIA: colores.amarillo,
  PERIODICO: '#8FE0E8',
};

// cada opción de orden fija campo y dirección: "más recientes" solo tiene sentido descendente
const ORDENES: Record<
  string,
  { orden: CampoOrdenPieza; direccion: 'asc' | 'desc'; nombre: string }
> = {
  codigo: { orden: 'codigo', direccion: 'asc', nombre: 'Código' },
  titulo: { orden: 'titulo', direccion: 'asc', nombre: 'Título' },
  recientes: { orden: 'creadoEn', direccion: 'desc', nombre: 'Más recientes' },
};

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'short' });

function FilaPieza({
  pieza,
  onQr,
}: {
  pieza: PiezaInventario;
  onQr: (p: PiezaInventario) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            aria-hidden
            sx={{
              flex: 'none',
              width: 42,
              height: 42,
              borderRadius: 3,
              bgcolor: COLOR_TIPO[pieza.tipo],
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'h1.fontFamily',
              fontWeight: 900,
            }}
          >
            {NOMBRE_TIPO[pieza.tipo][0]}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Link
              component={RouterLink}
              to={`/panel/piezas/${pieza.id}`}
              underline="hover"
              sx={{ display: 'block', fontWeight: 700, color: 'inherit' }}
            >
              {pieza.titulo}
            </Link>
            <Typography sx={{ fontFamily: FUENTE_FICHA, fontSize: 14, color: 'text.secondary' }}>
              {pieza.codigo} · {NOMBRE_TIPO[pieza.tipo]}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>
        {pieza.ubicacion.etiqueta}
      </TableCell>
      <TableCell>
        <ChipEstado estado={pieza.estado} restringida={pieza.restringida} />
      </TableCell>
      <TableCell sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>{pieza.anio}</TableCell>
      <TableCell sx={{ color: 'text.secondary' }}>
        {fecha.format(new Date(pieza.creadoEn))}
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Descargar QR">
          <IconButton
            aria-label={`Descargar el QR de ${pieza.codigo}`}
            onClick={() => onQr(pieza)}
            sx={{
              borderRadius: 3,
              bgcolor: colores.azulMarino,
              color: colores.amarillo,
              '&:hover': { bgcolor: colores.azulMedio },
            }}
          >
            <QrCode2Icon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export function PaginaInventario() {
  const [params, setParams] = useState<ParametrosListarPiezas>(PARAMS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [claveOrden, setClaveOrden] = useState('codigo');
  const [aviso, setAviso] = useState<string | null>(null);
  const consulta = useInventario(params);
  const contadores = useContadoresPiezas();

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setParams((p) => (p.busqueda === busqueda ? p : { ...p, busqueda, pagina: 1 }));
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const cambiar = (cambios: Partial<ParametrosListarPiezas>) =>
    setParams((p) => ({ ...p, ...cambios, pagina: cambios.pagina ?? 1 }));

  const descargarQr = async (pieza: PiezaInventario) => {
    try {
      guardarBlob(await pedirArchivo(`/piezas/${pieza.id}/qr`), `${pieza.codigo}.png`);
    } catch {
      setAviso(`No se pudo descargar el QR de ${pieza.codigo}.`);
    }
  };

  const hayFiltro = Boolean(params.estado || params.tipo || params.busqueda);
  const total = contadores.data?.total ?? 0;
  const conEscaneo = contadores.data ? total - contadores.data.REGISTRADA : 0;
  const avance = total ? Math.round((conEscaneo / total) * 100) : 0;
  const filas = consulta.data?.datos ?? [];

  return (
    <Stack spacing={3.5}>
      <EncabezadoPanel
        titulo="Inventario"
        descripcion="Todas las piezas del archivo, dónde están y en qué paso de la digitalización van."
        accion={
          <Button
            component={RouterLink}
            to="/panel/piezas/nueva"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1.25,
              fontWeight: 800,
              boxShadow: '0 5px 0 #8F2A0C',
            }}
          >
            Nueva pieza
          </Button>
        }
      />

      <Box
        component="section"
        aria-label="Piezas por estado"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {TARJETAS.map(({ estado, ayuda, fondo }) => (
          <TarjetaConteo
            key={estado}
            etiqueta={estado}
            valor={contadores.data?.[estado]}
            ayuda={ayuda}
            fondo={fondo}
            activa={params.estado === estado}
            onClick={() => cambiar({ estado: params.estado === estado ? undefined : estado })}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          px: 2.5,
          py: 2,
          bgcolor: colores.papel,
          borderRadius: 4.5,
        }}
      >
        <Typography
          id="titulo-avance"
          sx={{ fontFamily: 'h1.fontFamily', fontWeight: 800, fontSize: 17 }}
        >
          Avance de digitalización
        </Typography>
        <LinearProgress
          variant="determinate"
          value={avance}
          aria-labelledby="titulo-avance"
          sx={{
            flex: '1 1 260px',
            height: 18,
            borderRadius: 999,
            bgcolor: '#F5D79E',
            '& .MuiLinearProgress-bar': { bgcolor: colores.turquesa, borderRadius: 999 },
          }}
        />
        <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>
          {contadores.data ? `${conEscaneo} de ${total} piezas con escaneo` : 'Calculando…'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <BuscadorPanel
            id="buscar-piezas"
            etiqueta="Buscar piezas"
            placeholder="Buscar por código o título…"
            valor={busqueda}
            onCambiar={setBusqueda}
          />
        </Box>
        <TextField
          select
          id="filtro-tipo"
          label="Tipo"
          value={params.tipo ?? ''}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
          onChange={(e) =>
            cambiar({ tipo: (e.target.value || undefined) as TipoPieza | undefined })
          }
          sx={{
            minWidth: 160,
            '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 999 },
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {(Object.keys(NOMBRE_TIPO) as TipoPieza[]).map((tipo) => (
            <MenuItem key={tipo} value={tipo}>
              {NOMBRE_TIPO[tipo]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          id="orden-piezas"
          label="Ordenar por"
          value={claveOrden}
          onChange={(e) => {
            const elegido = ORDENES[e.target.value];
            if (!elegido) return;
            setClaveOrden(e.target.value);
            cambiar({ orden: elegido.orden, direccion: elegido.direccion });
          }}
          sx={{
            minWidth: 180,
            '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 999 },
          }}
        >
          {Object.entries(ORDENES).map(([clave, { nombre }]) => (
            <MenuItem key={clave} value={clave}>
              {nombre}
            </MenuItem>
          ))}
        </TextField>
        {hayFiltro && (
          <Button
            onClick={() => {
              setBusqueda('');
              setParams((p) => ({
                ...p,
                estado: undefined,
                tipo: undefined,
                busqueda: '',
                pagina: 1,
              }));
            }}
            sx={{ borderRadius: 999, px: 2.5, fontWeight: 700 }}
            variant="contained"
          >
            Ver todas ✕
          </Button>
        )}
      </Box>

      {consulta.isError ? (
        <MensajeError error={consulta.error} titulo="No se pudo cargar el inventario" />
      ) : (
        <Box sx={estiloCajaTabla}>
          <Box sx={{ height: 4 }} aria-hidden>
            {consulta.isFetching && <LinearProgress color="secondary" />}
          </Box>
          <TableContainer>
            <Table aria-label="Piezas del inventario" sx={{ ...estiloTablaPanel, minWidth: 820 }}>
              <caption style={{ captionSide: 'top', textAlign: 'left', padding: '8px 16px' }}>
                <Typography component="span" variant="body2" color="text.secondary" role="status">
                  {consulta.isPending
                    ? 'Cargando…'
                    : `${consulta.data?.meta.total ?? 0} piezas${params.estado ? ` en estado ${params.estado}` : ''}`}
                </Typography>
              </caption>
              <TableHead>
                <TableRow>
                  <TableCell>Pieza</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Año</TableCell>
                  <TableCell>Registro</TableCell>
                  <TableCell>
                    <Box component="span" sx={soloLectores}>
                      Acciones
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.map((pieza) => (
                  <FilaPieza key={pieza.id} pieza={pieza} onQr={(p) => void descargarQr(p)} />
                ))}
                {consulta.isSuccess && filas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, fontWeight: 700 }}>
                      Ninguna pieza coincide con la búsqueda.
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
            onRowsPerPageChange={(e) => cambiar({ limite: Number(e.target.value) })}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            getItemAriaLabel={(tipo) => (tipo === 'next' ? 'Página siguiente' : 'Página anterior')}
            sx={{ borderTop: LINEA_PUNTEADA }}
          />
        </Box>
      )}

      <Snackbar
        open={aviso !== null}
        autoHideDuration={5000}
        onClose={() => setAviso(null)}
        message={aviso}
      />
    </Stack>
  );
}
