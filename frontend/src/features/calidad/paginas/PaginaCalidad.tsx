import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { colores } from '../../../app/tema';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { usePublicarPieza } from '../../inventario/hooks';
import { NOMBRE_TIPO } from '../../inventario/tipos';
import { VisorEscaneo } from '../componentes/VisorEscaneo';
import { useArchivosEnRevision, useResolverArchivo } from '../hooks';
import type { ArchivoDigital } from '../tipos';

const CRITERIOS = [
  { clave: 'legible', texto: 'Se lee completo y nítido' },
  { clave: 'completo', texto: 'No le falta ninguna página' },
  { clave: 'coincide', texto: 'Corresponde a esta pieza' },
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
  archivo: ArchivoDigital;
  aprobado: boolean;
  publicada: boolean;
}

/** Ficha de la cola: el color dice su estado sin tener que leerla. */
function FichaCola({
  archivo,
  actual,
  resultado,
  onClick,
}: {
  archivo: ArchivoDigital;
  actual: boolean;
  resultado: Resultado | undefined;
  onClick: () => void;
}) {
  const fondo = actual
    ? colores.azulMarino
    : resultado
      ? resultado.aprobado
        ? '#CFF4F7'
        : '#FFDCCF'
      : '#FFFFFF';
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-current={actual ? 'step' : undefined}
      aria-label={`${archivo.pieza.codigo}, ${archivo.pieza.titulo}${
        resultado ? (resultado.aprobado ? ', aprobado' : ', rechazado') : ', por revisar'
      }`}
      sx={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: 44,
        px: 1.75,
        border: 0,
        borderRadius: 999,
        bgcolor: fondo,
        color: actual ? '#FFFFFF' : colores.azulMarino,
        fontFamily: FUENTE_FICHA,
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        boxShadow: actual ? `0 4px 0 ${colores.naranja}` : '0 4px 0 #F5D79E',
        transition: 'transform .2s',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      {resultado &&
        (resultado.aprobado ? (
          <CheckIcon aria-hidden fontSize="small" />
        ) : (
          <CloseIcon aria-hidden fontSize="small" />
        ))}
      {archivo.pieza.codigo}
    </Box>
  );
}

export function PaginaCalidad() {
  const consulta = useArchivosEnRevision();
  const resolver = useResolverArchivo();
  const publicar = usePublicarPieza();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Record<string, Resultado>>({});
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [motivoVacio, setMotivoVacio] = useState(false);

  // al resolver un escaneo la API lo saca de EN_REVISION; se conserva aquí para ver el avance
  const cola = useMemo(() => {
    const porId = new Map<string, ArchivoDigital>();
    Object.values(resultados).forEach((r) => porId.set(r.archivo.id, r.archivo));
    (consulta.data?.datos ?? []).forEach((a) => porId.set(a.id, a));
    return [...porId.values()].sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
  }, [consulta.data, resultados]);

  const pendientes = cola.filter((a) => !resultados[a.id]);
  const actual = cola.find((a) => a.id === seleccionId) ?? pendientes[0] ?? cola[0] ?? null;
  const resultado = actual ? resultados[actual.id] : undefined;
  const siguiente = pendientes.find((a) => a.id !== actual?.id) ?? null;
  const revisados = cola.length - pendientes.length;
  const marcadosCount = CRITERIOS.filter((c) => marcados[c.clave]).length;

  const irA = (id: string) => {
    setSeleccionId(id);
    setMarcados({});
    setRechazando(false);
    setMotivo('');
    setMotivoVacio(false);
    resolver.reset();
    publicar.reset();
  };

  const decidir = (aprobado: boolean) => {
    if (!actual) return;
    if (!aprobado && !motivo.trim()) {
      setMotivoVacio(true);
      return;
    }
    const archivo = actual;
    resolver.mutate(
      { id: archivo.id, motivoRechazo: aprobado ? undefined : motivo.trim() },
      {
        onSuccess: () => {
          setSeleccionId(archivo.id);
          setResultados((r) => ({ ...r, [archivo.id]: { archivo, aprobado, publicada: false } }));
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
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography
                role="status"
                sx={{ fontFamily: 'h1.fontFamily', fontWeight: 800, fontSize: 18 }}
              >
                {pendientes.length === 0
                  ? `¡Listo! Revisaste los ${cola.length} escaneos`
                  : `${revisados} de ${cola.length} revisados`}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={cola.length ? (revisados / cola.length) * 100 : 0}
                aria-hidden
                sx={{
                  flex: '1 1 160px',
                  maxWidth: 320,
                  height: 10,
                  borderRadius: 999,
                  bgcolor: '#F5D79E',
                  '& .MuiLinearProgress-bar': { bgcolor: colores.turquesa, borderRadius: 999 },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', pb: 1, pt: 0.5 }}>
              {cola.map((archivo) => (
                <FichaCola
                  key={archivo.id}
                  archivo={archivo}
                  actual={archivo.id === actual.id}
                  resultado={resultados[archivo.id]}
                  onClick={() => irA(archivo.id)}
                />
              ))}
            </Box>
          </Box>

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
                    label={`${formato(actual.tipoMime)} · ${tamanoLegible(actual.tamano)}`}
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
                      sx={{ borderRadius: 999, minHeight: 52, fontSize: 17, fontWeight: 800 }}
                    >
                      Aprobar
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
                    {resultado.aprobado
                      ? resultado.publicada
                        ? 'PUBLICADO'
                        : 'APROBADO'
                      : 'RECHAZADO'}
                  </Box>
                  <Typography role="status">
                    {!resultado.aprobado
                      ? 'El motivo quedó en el historial. Hay que cargar un escaneo nuevo.'
                      : resultado.publicada
                        ? 'La pieza ya aparece en el portal.'
                        : 'La pieza pasa a REVISADA. Puedes publicarla ahora o después desde el inventario.'}
                  </Typography>
                  {publicar.isError && (
                    <MensajeError error={publicar.error} titulo="No se pudo publicar" />
                  )}
                  {resultado.aprobado && !resultado.publicada && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      disabled={publicar.isPending}
                      onClick={() =>
                        publicar.mutate(resultado.archivo.pieza.id, {
                          onSuccess: () =>
                            setResultados((r) => ({
                              ...r,
                              [resultado.archivo.id]: { ...resultado, publicada: true },
                            })),
                        })
                      }
                      sx={{
                        borderRadius: 999,
                        fontWeight: 800,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      Publicar en el portal
                    </Button>
                  )}
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
