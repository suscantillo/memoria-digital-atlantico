import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { guardarBlob, pedirArchivo } from '../../../shared/api/descargas';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { PaginaNoEncontrada } from '../../portal/paginas/PaginaNoEncontrada';
import { CargaEscaneo } from '../componentes/CargaEscaneo';
import { ChipEstado } from '../componentes/ChipEstado';
import { useEditarPieza, useFichaPieza } from '../hooks';
import { ESTADOS_PIEZA, NOMBRE_TIPO, type FichaPieza } from '../tipos';

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });
const fechaHora = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const AYUDA_ESTADO = {
  REGISTRADA: 'Existe en el inventario',
  ESCANEADA: 'Tiene escaneo en revisión',
  REVISADA: 'Escaneo aprobado',
  PUBLICADA: 'Visible en el portal',
} as const;

function Tarjeta({
  titulo,
  accion,
  children,
}: {
  titulo: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  const id = `tarjeta-${titulo.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <Box
      component="section"
      aria-labelledby={id}
      sx={{
        p: { xs: 2.25, md: 3 },
        bgcolor: '#FFFFFF',
        borderRadius: 4,
        boxShadow: '0 6px 0 #F5D79E',
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography
          id={id}
          component="h2"
          sx={{ flex: 1, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 22 }}
        >
          {titulo}
        </Typography>
        {accion}
      </Box>
      {children}
    </Box>
  );
}

/** Edición de título y descripción (HU-08); el formulario nace con los valores guardados. */
function EditarDatos({ pieza, onListo }: { pieza: FichaPieza; onListo: () => void }) {
  const [titulo, setTitulo] = useState(pieza.titulo);
  const [descripcion, setDescripcion] = useState(pieza.descripcion ?? '');
  const editar = useEditarPieza(pieza.id);
  const tituloVacio = titulo.trim() === '';

  const guardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (tituloVacio) return;
    editar.mutate(
      { titulo: titulo.trim(), descripcion: descripcion.trim() || null },
      { onSuccess: onListo },
    );
  };

  return (
    <Box component="form" onSubmit={guardar} noValidate>
      <Stack spacing={2}>
        <TextField
          id="editar-titulo"
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          error={tituloVacio}
          helperText={tituloVacio ? 'El título no puede quedar vacío.' : undefined}
          required
          fullWidth
        />
        <TextField
          id="editar-descripcion"
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        {editar.isError && <MensajeError error={editar.error} titulo="No se guardó el cambio" />}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={editar.isPending || tituloVacio}
            sx={{ borderRadius: 999, px: 3, fontWeight: 800 }}
          >
            {editar.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button onClick={onListo} disabled={editar.isPending} sx={{ borderRadius: 999 }}>
            Cancelar
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function Escaneo({ pieza }: { pieza: FichaPieza }) {
  const [cargadoAhora, setCargadoAhora] = useState(false);
  const ultimo = pieza.archivos[0];

  if (ultimo?.estado === 'EN_REVISION') {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <HourglassTopIcon aria-hidden sx={{ color: '#A0600F', mt: 0.25 }} />
        <Box>
          <Typography sx={{ fontWeight: 800 }}>
            {cargadoAhora ? 'Escaneo cargado. ' : ''}Espera control de calidad
          </Typography>
          <Typography sx={{ fontFamily: FUENTE_FICHA, fontSize: 14, overflowWrap: 'anywhere' }}>
            {ultimo.nombre} · {fechaHora.format(new Date(ultimo.creadoEn))}
          </Typography>
          <Link component={RouterLink} to="/panel/calidad" sx={{ fontWeight: 700 }}>
            Ir a control de calidad
          </Link>
        </Box>
      </Box>
    );
  }

  if (ultimo?.estado === 'APROBADO') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
          <CheckIcon aria-hidden sx={{ color: colores.turquesaOscuro }} />
          Escaneo aprobado
        </Typography>
        <Box
          component="dl"
          sx={{ m: 0, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 0.75 }}
        >
          <Box component="dt" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Archivo
          </Box>
          <Box component="dd" sx={{ m: 0, fontFamily: FUENTE_FICHA, overflowWrap: 'anywhere' }}>
            {ultimo.nombre}
          </Box>
          <Box component="dt" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Tema
          </Box>
          <Box component="dd" sx={{ m: 0 }}>
            {ultimo.tema}
          </Box>
          <Box component="dt" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Autor
          </Box>
          <Box component="dd" sx={{ m: 0 }}>
            {ultimo.autor}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {ultimo.palabrasClave.map((palabra) => (
            <Chip key={palabra} label={palabra} size="small" />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {ultimo?.estado === 'RECHAZADO' && (
        <Alert severity="warning">
          <strong>El último escaneo se rechazó:</strong> {ultimo.motivoRechazo}. Carga uno nuevo.
        </Alert>
      )}
      <CargaEscaneo
        piezaId={pieza.id}
        codigo={pieza.codigo}
        onCargado={() => setCargadoAhora(true)}
      />
    </Stack>
  );
}

/** Los cuatro pasos de la pieza, con el actual marcado: dice de un vistazo qué le falta. */
function Recorrido({ pieza }: { pieza: FichaPieza }) {
  const actual = ESTADOS_PIEZA.indexOf(pieza.estado);
  return (
    <Box
      component="ol"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column' }}
    >
      {ESTADOS_PIEZA.map((estado, i) => {
        const hecho = i <= actual;
        return (
          <Box
            component="li"
            key={estado}
            aria-current={i === actual ? 'step' : undefined}
            sx={{ display: 'flex', gap: 1.5, position: 'relative', pb: i < 3 ? 2 : 0 }}
          >
            {i < 3 && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: 13,
                  top: 28,
                  bottom: 0,
                  width: 3,
                  bgcolor: i < actual ? colores.turquesaOscuro : '#E2CFA3',
                }}
              />
            )}
            <Box
              aria-hidden
              sx={{
                flex: 'none',
                width: 29,
                height: 29,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                fontWeight: 900,
                bgcolor: hecho ? colores.turquesaOscuro : '#FFFFFF',
                color: hecho ? '#FFFFFF' : '#4B5A73',
                border: hecho ? 'none' : '2px dashed #9AA4B8',
                boxShadow: i === actual ? `0 0 0 4px ${colores.amarillo}` : 'none',
              }}
            >
              {i < actual ? '✓' : i + 1}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: 'h1.fontFamily',
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: '0.05em',
                }}
              >
                {estado}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                {AYUDA_ESTADO[estado]}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function PaginaFichaPieza() {
  const { id = '' } = useParams();
  const { state } = useLocation() as { state?: { creada?: boolean } };
  const consulta = useFichaPieza(id);
  const [editando, setEditando] = useState(false);
  const [errorQr, setErrorQr] = useState(false);

  if (
    consulta.error instanceof AxiosError &&
    [400, 404].includes(consulta.error.response?.status ?? 0)
  ) {
    return <PaginaNoEncontrada />;
  }
  if (consulta.isPending) {
    return (
      <Box role="status" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress aria-label="Cargando la pieza" />
      </Box>
    );
  }
  if (consulta.isError) {
    return <MensajeError error={consulta.error} titulo="No se pudo abrir la pieza" />;
  }

  const pieza = consulta.data;
  const descargarQr = async () => {
    setErrorQr(false);
    try {
      guardarBlob(await pedirArchivo(`/piezas/${pieza.id}/qr`), `${pieza.codigo}.png`);
    } catch {
      setErrorQr(true);
    }
  };

  const datos: [string, string][] = [
    ['Tipo', NOMBRE_TIPO[pieza.tipo]],
    ['Año', String(pieza.anio)],
    ['Ubicación', pieza.ubicacion.etiqueta],
    ['Registro', fecha.format(new Date(pieza.creadoEn))],
  ];

  return (
    <Stack spacing={3}>
      <Link
        component={RouterLink}
        to="/panel/inventario"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 700,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowBackIcon fontSize="small" aria-hidden />
        Inventario
      </Link>

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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              component="span"
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                bgcolor: colores.azulMarino,
                color: '#FFFFFF',
                fontFamily: FUENTE_FICHA,
                fontWeight: 700,
              }}
            >
              {pieza.codigo}
            </Box>
            <ChipEstado estado={pieza.estado} restringida={pieza.restringida} />
          </Box>
          <Typography
            variant="h1"
            sx={{ m: 0, fontSize: { xs: 32, md: 44 }, lineHeight: 1.05, letterSpacing: '-0.025em' }}
          >
            {pieza.titulo}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<QrCode2Icon />}
            onClick={descargarQr}
            sx={{ borderRadius: 999, fontWeight: 800, color: colores.amarillo }}
          >
            Descargar QR
          </Button>
          {pieza.estado === 'PUBLICADA' && (
            <Button
              component="a"
              href={`/p/${pieza.codigo}`}
              target="_blank"
              rel="noopener"
              endIcon={<OpenInNewIcon />}
              sx={{ borderRadius: 999, fontWeight: 700 }}
            >
              Ver en el portal
            </Button>
          )}
        </Box>
      </Box>

      {state?.creada && (
        <Alert severity="success">
          Pieza registrada con el código <strong>{pieza.codigo}</strong>. Ya puedes imprimir su QR y
          cargar el escaneo.
        </Alert>
      )}
      {errorQr && <Alert severity="error">No se pudo descargar el QR de {pieza.codigo}.</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Tarjeta
            titulo="Datos"
            accion={
              !editando && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setEditando(true)}
                  sx={{ borderRadius: 999, fontWeight: 700 }}
                >
                  Editar
                </Button>
              )
            }
          >
            {editando ? (
              <EditarDatos pieza={pieza} onListo={() => setEditando(false)} />
            ) : (
              <>
                <Typography
                  sx={{
                    mb: 2,
                    lineHeight: 1.55,
                    color: pieza.descripcion ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {pieza.descripcion ?? 'Sin descripción. Usa «Editar» para agregar una.'}
                </Typography>
                <Box
                  component="dl"
                  sx={{
                    m: 0,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      sm: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 1.5,
                  }}
                >
                  {datos.map(([etiqueta, valor]) => (
                    <Box key={etiqueta} sx={{ p: 1.5, bgcolor: colores.crema, borderRadius: 3 }}>
                      <Box
                        component="dt"
                        sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary' }}
                      >
                        {etiqueta}
                      </Box>
                      <Box
                        component="dd"
                        sx={{
                          m: 0,
                          fontFamily: FUENTE_FICHA,
                          fontWeight: 700,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {valor}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Tarjeta>

          <Tarjeta titulo="Escaneo">
            <Escaneo pieza={pieza} />
          </Tarjeta>
        </Stack>

        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Tarjeta titulo="Recorrido">
            <Recorrido pieza={pieza} />
          </Tarjeta>

          <Tarjeta titulo="Historial">
            {pieza.eventos.length === 0 ? (
              <Typography color="text.secondary">Todavía no hay eventos.</Typography>
            ) : (
              <Box
                component="ol"
                sx={{
                  listStyle: 'none',
                  m: 0,
                  p: 0,
                  borderLeft: `3px solid ${colores.amarillo}`,
                  pl: 2,
                }}
              >
                {pieza.eventos.map((evento) => (
                  <Box component="li" key={evento.id} sx={{ position: 'relative', pb: 1.75 }}>
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        left: -23.5,
                        top: 5,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: colores.naranja,
                        border: '2px solid #FFFFFF',
                      }}
                    />
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {evento.descripcion}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      <Box component="time" dateTime={evento.creadoEn}>
                        {fechaHora.format(new Date(evento.creadoEn))}
                      </Box>
                      {evento.usuario && ` · ${evento.usuario.nombre}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Tarjeta>
        </Stack>
      </Box>
    </Stack>
  );
}
