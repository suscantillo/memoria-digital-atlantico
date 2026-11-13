import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { colores } from '../../../app/tema';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { NOMBRE_TIPO } from '../../inventario/tipos';
import { ColaRevision } from '../componentes/ColaRevision';
import { VisorEscaneo } from '../componentes/VisorEscaneo';
import { useColaRevision, useDecidirEscaneo } from '../hooks';
import type { ArchivoEnRevision } from '../tipos';

const CRITERIOS = [
  { clave: 'legible', texto: 'Se lee completo y nítido' },
  { clave: 'completo', texto: 'No le falta ninguna página' },
  { clave: 'datosCorrectos', texto: 'Los datos corresponden a esta pieza' },
] as const;

// los motivos más comunes se eligen con un clic; el campo sigue libre para lo demás
const MOTIVOS_RAPIDOS = [
  'Imagen borrosa',
  'Falta una página',
  'Recortado o torcido',
  'No corresponde a la pieza',
];

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

function tamanoLegible(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function formato(tipoMime: string) {
  return tipoMime === 'application/pdf'
    ? 'PDF'
    : (tipoMime.split('/')[1] ?? tipoMime).toUpperCase();
}

interface Resultado {
  archivo: ArchivoEnRevision;
  aprobado: boolean;
}

export function PaginaCalidad() {
  const consulta = useColaRevision();
  const resolver = useDecidirEscaneo();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Record<string, Resultado>>({});
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [motivoVacio, setMotivoVacio] = useState(false);
  const [colaAbierta, setColaAbierta] = useState(false);

  // al resolver un escaneo la API lo saca de EN_REVISION; se conserva aquí para ver el avance
  const cola = useMemo(() => {
    const porId = new Map<string, ArchivoEnRevision>();
    Object.values(resultados).forEach((r) => porId.set(r.archivo.id, r.archivo));
    (consulta.data?.datos ?? []).forEach((a) => porId.set(a.id, a));
    return [...porId.values()].sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
  }, [consulta.data, resultados]);

  const pendientes = cola.filter((a) => !resultados[a.id]);
  const actual = cola.find((a) => a.id === seleccionId) ?? pendientes[0] ?? cola[0] ?? null;
  const resultado = actual ? resultados[actual.id] : undefined;
  const indice = actual ? pendientes.findIndex((a) => a.id === actual.id) : -1;
  const posicion = indice + 1;
  // la API cuenta lo que sigue EN_REVISION; los revisados en esta sesión ya no están ahí
  const totalPendientes = consulta.data?.meta.total ?? pendientes.length;
  const anterior = indice > 0 ? pendientes[indice - 1] : null;
  const siguiente =
    indice >= 0
      ? (pendientes[indice + 1] ?? null)
      : (pendientes.find((a) => a.id !== actual?.id) ?? null);
  const revisados = Object.keys(resultados).length;
  const marcadosCount = CRITERIOS.filter((c) => marcados[c.clave]).length;

  const irA = (id: string) => {
    setSeleccionId(id);
    setMarcados({});
    setRechazando(false);
    setMotivo('');
    setMotivoVacio(false);
    resolver.reset();
  };

  const decidir = (aprobado: boolean) => {
    if (!actual) return;
    if (!aprobado && !motivo.trim()) {
      setMotivoVacio(true);
      return;
    }
    const archivo = actual;
    resolver.mutate(
      {
        id: archivo.id,
        decision: aprobado ? { tipo: 'aprobar' } : { tipo: 'rechazar', motivo: motivo.trim() },
      },
      {
        onSuccess: () => {
          setSeleccionId(archivo.id);
          setResultados((r) => ({ ...r, [archivo.id]: { archivo, aprobado } }));
        },
      },
    );
  };

  return (
    <Stack spacing={3}>
      <EncabezadoPanel
        titulo="Control de calidad"
        descripcion="Revisa cada escaneo antes de que llegue al portal."
      />

      {consulta.isPending && (
        <Box role="status" sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress aria-label="Cargando escaneos" />
        </Box>
      )}
      {consulta.isError && (
        <MensajeError error={consulta.error} titulo="No se pudieron cargar los escaneos" />
      )}

      {consulta.isSuccess && cola.length === 0 && (
        <Box
          sx={{
            p: 5,
            textAlign: 'center',
            bgcolor: colores.papel,
            borderRadius: 5,
            boxShadow: '0 8px 0 #F5D79E',
          }}
        >
          <Typography sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 28 }}>
            Mesa limpia
          </Typography>
          <Typography sx={{ mt: 1 }}>No hay escaneos esperando revisión.</Typography>
        </Box>
      )}

      {actual && (
        <>
          <Box
            component="nav"
            aria-label="Escaneos por revisar"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 2.5 },
              px: 2,
              py: 1.25,
              bgcolor: colores.papel,
              // en el celular la barra se parte en dos filas y un óvalo se ve deforme
              borderRadius: { xs: '24px', sm: 999 },
              boxShadow: '0 6px 0 #F5D79E',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                aria-label="Escaneo anterior por revisar"
                disabled={!anterior}
                onClick={() => anterior && irA(anterior.id)}
                sx={{ color: colores.azulMarino }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, lineHeight: 1.2 }}>
                  {actual.pieza.codigo}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {posicion > 0 ? `${posicion} de ${totalPendientes}` : 'ya revisado'}
                </Typography>
              </Box>
              <IconButton
                aria-label="Siguiente escaneo por revisar"
                disabled={!siguiente}
                onClick={() => siguiente && irA(siguiente.id)}
                sx={{ color: colores.azulMarino }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <Typography
              role="status"
              sx={{ flex: '1 1 200px', fontFamily: 'h1.fontFamily', fontWeight: 800 }}
            >
              {totalPendientes === 0
                ? '¡Listo! No quedan escaneos por revisar'
                : totalPendientes === 1
                  ? 'Queda 1 por revisar'
                  : `Quedan ${totalPendientes} por revisar`}
              {revisados > 0 && (
                <Box
                  component="span"
                  sx={{ fontFamily: 'body1.fontFamily', fontWeight: 600, color: 'text.secondary' }}
                >
                  {' '}
                  · {revisados} {revisados === 1 ? 'revisado' : 'revisados'} en esta sesión
                </Box>
              )}
            </Typography>
            <Button
              variant="contained"
              startIcon={<FormatListBulletedIcon />}
              onClick={() => setColaAbierta(true)}
              sx={{ borderRadius: 999, fontWeight: 700 }}
            >
              Ver cola
            </Button>
          </Box>

          <ColaRevision
            abierta={colaAbierta}
            onCerrar={() => setColaAbierta(false)}
            cola={cola}
            totalPendientes={totalPendientes}
            actualId={actual.id}
            resultados={resultados}
            onElegir={irA}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            <VisorEscaneo key={actual.id} archivo={actual} />

            <Box
              component="section"
              aria-labelledby="titulo-decision"
              sx={{
                position: { md: 'sticky' },
                top: { md: 24 },
                p: 2.5,
                bgcolor: colores.papel,
                borderTop: `8px solid ${colores.naranja}`,
                boxShadow: '8px 8px 0 #F5D79E',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                  <Chip
                    label={actual.pieza.codigo}
                    size="small"
                    sx={{
                      bgcolor: colores.azulMarino,
                      color: '#FFFFFF',
                      fontFamily: FUENTE_FICHA,
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    label={NOMBRE_TIPO[actual.pieza.tipo]}
                    size="small"
                    sx={{ bgcolor: '#FFE7A8', fontWeight: 700 }}
                  />
                  <Chip
                    label={`${formato(actual.tipoMime)} · ${tamanoLegible(actual.tamanoBytes)}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography
                  id="titulo-decision"
                  component="h2"
                  sx={{
                    fontFamily: 'h1.fontFamily',
                    fontWeight: 900,
                    fontSize: 22,
                    lineHeight: 1.15,
                  }}
                >
                  {actual.pieza.titulo}
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.secondary' }}>
                  Subido por {actual.subidoPor.nombre} · {fecha.format(new Date(actual.creadoEn))}
                </Typography>
              </Box>

              {!resultado && !rechazando && (
                <>
                  <Box sx={{ borderTop: '2px dashed #EBD9B0' }} aria-hidden />
                  <Box component="fieldset" sx={{ m: 0, p: 0, border: 0 }}>
                    <Typography component="legend" sx={{ fontWeight: 800, mb: 1, p: 0 }}>
                      ¿Está listo para el portal?{' '}
                      <Box
                        component="span"
                        sx={{ fontFamily: FUENTE_FICHA, color: 'text.secondary' }}
                      >
                        {marcadosCount}/3
                      </Box>
                    </Typography>
                    <Stack spacing={0.5}>
                      {CRITERIOS.map(({ clave, texto }) => (
                        <FormControlLabel
                          key={clave}
                          control={
                            <Checkbox
                              checked={!!marcados[clave]}
                              onChange={(e) =>
                                setMarcados((m) => ({ ...m, [clave]: e.target.checked }))
                              }
                              sx={{ '&.Mui-checked': { color: colores.turquesaOscuro } }}
                            />
                          }
                          label={texto}
                          sx={{
                            m: 0,
                            minHeight: 44,
                            '& .MuiFormControlLabel-label': { fontWeight: 600 },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Stack spacing={1.25}>
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<CheckIcon />}
                      disabled={marcadosCount < CRITERIOS.length || resolver.isPending}
                      onClick={() => decidir(true)}
                      sx={{
                        borderRadius: 999,
                        minHeight: 52,
                        fontSize: 17,
                        fontWeight: 800,
                        bgcolor: colores.turquesaOscuro,
                        color: '#FFFFFF',
                        boxShadow: `0 6px 0 ${colores.azulMarino}`,
                        '&:hover': {
                          bgcolor: '#006E7B',
                          boxShadow: `0 6px 0 ${colores.azulMarino}`,
                        },
                        '&.Mui-disabled': {
                          bgcolor: '#E2DCD2',
                          color: '#6B6457',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      Aprobar y publicar
                    </Button>
                    {marcadosCount < CRITERIOS.length && (
                      <Typography
                        sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center' }}
                      >
                        Marca los tres criterios para aprobar.
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="large"
                      startIcon={<CloseIcon />}
                      onClick={() => setRechazando(true)}
                      sx={{
                        borderRadius: 999,
                        minHeight: 48,
                        fontWeight: 800,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      Rechazar
                    </Button>
                  </Stack>
                </>
              )}

              {!resultado && rechazando && (
                <Stack spacing={1.5} sx={{ borderTop: '2px dashed #EBD9B0', pt: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>¿Qué le pasa al escaneo?</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {MOTIVOS_RAPIDOS.map((m) => (
                      <Chip
                        key={m}
                        label={m}
                        clickable
                        color={motivo === m ? 'secondary' : 'default'}
                        variant={motivo === m ? 'filled' : 'outlined'}
                        onClick={() => {
                          setMotivo(m);
                          setMotivoVacio(false);
                        }}
                        sx={{ fontWeight: 700 }}
                      />
                    ))}
                  </Box>
                  <TextField
                    id="motivo-rechazo"
                    label="Motivo del rechazo"
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      setMotivoVacio(false);
                    }}
                    multiline
                    minRows={2}
                    required
                    error={motivoVacio}
                    helperText={
                      motivoVacio ? 'Elige o escribe el motivo.' : 'Lo verá quien cargó el escaneo.'
                    }
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF' } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      onClick={() => {
                        setRechazando(false);
                        setMotivoVacio(false);
                      }}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    >
                      Volver
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={resolver.isPending}
                      onClick={() => decidir(false)}
                      sx={{ flex: 1, borderRadius: 999, minHeight: 48, fontWeight: 800 }}
                    >
                      Confirmar rechazo
                    </Button>
                  </Box>
                </Stack>
              )}

              {resolver.isError && (
                <MensajeError error={resolver.error} titulo="No se pudo guardar" />
              )}

              {resultado && (
                <Stack spacing={1.5} sx={{ borderTop: '2px dashed #EBD9B0', pt: 2 }}>
                  <Box
                    sx={{
                      alignSelf: 'flex-start',
                      px: 1.75,
                      py: 0.75,
                      border: `4px solid ${resultado.aprobado ? colores.turquesaOscuro : colores.naranja}`,
                      borderRadius: 2,
                      color: resultado.aprobado ? colores.turquesaOscuro : colores.naranja,
                      fontFamily: 'h1.fontFamily',
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: '0.08em',
                      rotate: '-3deg',
                    }}
                  >
                    {resultado.aprobado ? 'PUBLICADO' : 'RECHAZADO'}
                  </Box>
                  <Typography role="status">
                    {resultado.aprobado
                      ? 'La pieza ya aparece en el portal.'
                      : 'El motivo quedó en el historial y la pieza volvió a REGISTRADA: hay que cargar un escaneo nuevo.'}
                  </Typography>
                  {siguiente && (
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => irA(siguiente.id)}
                      sx={{ borderRadius: 999, minHeight: 52, fontWeight: 800 }}
                    >
                      Siguiente: {siguiente.pieza.codigo}
                    </Button>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </>
      )}
    </Stack>
  );
}
