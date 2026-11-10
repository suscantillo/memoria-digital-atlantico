import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
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
  { clave: 'coincide', texto: 'Coincide con la ficha de la pieza' },
] as const;

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' });

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

interface Resuelto {
  archivo: ArchivoDigital;
  aprobado: boolean;
  publicada: boolean;
}

const botonPildora = { borderRadius: 999, minHeight: 52, fontSize: 17, fontWeight: 800 } as const;

export function PaginaCalidad() {
  const consulta = useArchivosEnRevision();
  const resolver = useResolverArchivo();
  const publicar = usePublicarPieza();
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [resuelto, setResuelto] = useState<Resuelto | null>(null);
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [faltanCriterios, setFaltanCriterios] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [motivoVacio, setMotivoVacio] = useState(false);

  const cola = consulta.data?.datos ?? [];
  const actual = resuelto?.archivo ?? cola.find((a) => a.id === seleccionId) ?? cola[0] ?? null;

  const empezarCon = (id: string | null) => {
    setSeleccionId(id);
    setResuelto(null);
    setMarcados({});
    setFaltanCriterios(false);
    setRechazando(false);
    setMotivo('');
    setMotivoVacio(false);
    resolver.reset();
    publicar.reset();
  };

  const aprobar = () => {
    if (!actual) return;
    if (!CRITERIOS.every((c) => marcados[c.clave])) {
      setFaltanCriterios(true);
      return;
    }
    resolver.mutate(
      { id: actual.id },
      { onSuccess: () => setResuelto({ archivo: actual, aprobado: true, publicada: false }) },
    );
  };

  const rechazar = () => {
    if (!actual) return;
    if (!motivo.trim()) {
      setMotivoVacio(true);
      return;
    }
    resolver.mutate(
      { id: actual.id, motivoRechazo: motivo.trim() },
      { onSuccess: () => setResuelto({ archivo: actual, aprobado: false, publicada: false }) },
    );
  };

  const siguiente = cola.find((a) => a.id !== resuelto?.archivo.id) ?? null;

  return (
    <Stack spacing={3.5}>
      <EncabezadoPanel
        titulo="Control de calidad"
        descripcion="Revisa cada escaneo antes de que llegue al portal: si se lee bien, está completo y corresponde a su pieza."
      />

      {consulta.isPending && (
        <Box role="status" sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress aria-label="Cargando escaneos" />
        </Box>
      )}
      {consulta.isError && (
        <MensajeError error={consulta.error} titulo="No se pudieron cargar los escaneos" />
      )}

      {consulta.isSuccess && !actual && (
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0, 1fr) 320px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Box component="section" aria-labelledby="titulo-cola">
            <Typography
              id="titulo-cola"
              component="h2"
              sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: 15, mb: 1.5 }}
            >
              {cola.length} EN_REVISION
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {cola.map((archivo) => {
                const elegido = archivo.id === actual.id;
                return (
                  <li key={archivo.id}>
                    <Box
                      component="button"
                      type="button"
                      aria-current={elegido}
                      onClick={() => empezarCon(archivo.id)}
                      sx={{
                        width: '100%',
                        textAlign: 'left',
                        p: '14px 16px 14px 18px',
                        border: 0,
                        borderLeft: `8px solid ${colores.amarillo}`,
                        borderRadius: '4px 14px 14px 4px',
                        bgcolor: elegido ? '#FFFFFF' : colores.papel,
                        color: colores.azulMarino,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        boxShadow: elegido ? `8px 8px 0 ${colores.azulMarino}` : '0 6px 0 #F5D79E',
                        transition: 'transform .3s',
                        '&:hover': { transform: 'translateX(6px)' },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: 'block',
                          fontFamily: FUENTE_FICHA,
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {archivo.pieza.codigo} · {formato(archivo.tipoMime)}
                      </Box>
                      <Box
                        component="span"
                        sx={{ display: 'block', mt: 0.5, fontWeight: 800, lineHeight: 1.25 }}
                      >
                        {archivo.pieza.titulo}
                      </Box>
                    </Box>
                  </li>
                );
              })}
            </Box>
          </Box>

          <VisorEscaneo key={actual.id} archivo={actual} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box
              sx={{
                p: '18px 20px',
                bgcolor: colores.papel,
                borderTop: `8px solid ${colores.naranja}`,
                boxShadow: '8px 8px 0 #F5D79E',
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontFamily: 'h1.fontFamily',
                  fontWeight: 900,
                  fontSize: 24,
                  lineHeight: 1.1,
                  mb: 1.5,
                }}
              >
                {actual.pieza.titulo}
              </Typography>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '6px 12px',
                  fontFamily: FUENTE_FICHA,
                  fontSize: 15,
                  '& dt': { fontWeight: 700, color: colores.naranja },
                  '& dd': { m: 0, fontWeight: 700, overflowWrap: 'anywhere' },
                }}
              >
                <dt>Pieza</dt>
                <dd>
                  {actual.pieza.codigo} · {NOMBRE_TIPO[actual.pieza.tipo]}
                </dd>
                <dt>Archivo</dt>
                <dd>
                  {formato(actual.tipoMime)} · {tamanoLegible(actual.tamano)}
                </dd>
                <dt>Subido por</dt>
                <dd>{actual.subidoPor.nombre}</dd>
                <dt>Fecha</dt>
                <dd>{fecha.format(new Date(actual.creadoEn))}</dd>
              </Box>
            </Box>

            {!resuelto && (
              <>
                <Box component="fieldset" sx={{ m: 0, p: 0, border: 0 }}>
                  <Typography
                    component="legend"
                    sx={{ fontFamily: 'h1.fontFamily', fontWeight: 800, fontSize: 18, mb: 1 }}
                  >
                    Lista de calidad
                  </Typography>
                  <Stack spacing={1}>
                    {CRITERIOS.map(({ clave, texto }) => (
                      <FormControlLabel
                        key={clave}
                        control={
                          <Checkbox
                            checked={!!marcados[clave]}
                            onChange={(e) => {
                              setMarcados((m) => ({ ...m, [clave]: e.target.checked }));
                              setFaltanCriterios(false);
                            }}
                            sx={{ '&.Mui-checked': { color: colores.turquesaOscuro } }}
                          />
                        }
                        label={texto}
                        sx={{
                          m: 0,
                          pr: 1.5,
                          minHeight: 48,
                          border: '2px solid',
                          borderColor: marcados[clave] ? colores.turquesaOscuro : '#D8C9A8',
                          borderRadius: 3.5,
                          bgcolor: marcados[clave] ? '#CFF4F7' : '#FFFFFF',
                          '& .MuiFormControlLabel-label': { fontWeight: 700 },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Box aria-live="assertive">
                  {faltanCriterios && (
                    <Typography sx={{ fontWeight: 700, color: '#A8320F' }}>
                      Marca los tres criterios antes de aprobar.
                    </Typography>
                  )}
                  {resolver.isError && (
                    <MensajeError error={resolver.error} titulo="No se pudo guardar la revisión" />
                  )}
                </Box>

                {!rechazando ? (
                  <Stack spacing={1.25}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={aprobar}
                      disabled={resolver.isPending}
                      sx={{ ...botonPildora, boxShadow: `0 6px 0 ${colores.azulMarino}` }}
                    >
                      ✓ Aprobar escaneo
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setRechazando(true)}
                      sx={{ ...botonPildora, borderWidth: 3, '&:hover': { borderWidth: 3 } }}
                    >
                      ✕ Rechazar
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={1.25}>
                    <TextField
                      id="motivo-rechazo"
                      label="Motivo del rechazo"
                      value={motivo}
                      onChange={(e) => {
                        setMotivo(e.target.value);
                        setMotivoVacio(false);
                      }}
                      multiline
                      minRows={3}
                      required
                      error={motivoVacio}
                      helperText={
                        motivoVacio
                          ? 'Escribe el motivo para poder rechazar.'
                          : 'Queda en el historial de la pieza y lo ve quien cargó el escaneo.'
                      }
                      placeholder="Ej.: imagen borrosa, falta una página…"
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={rechazar}
                        disabled={resolver.isPending}
                        sx={{ ...botonPildora, flex: '1 1 160px' }}
                      >
                        Confirmar rechazo
                      </Button>
                      <Button
                        onClick={() => {
                          setRechazando(false);
                          setMotivoVacio(false);
                        }}
                        sx={{ ...botonPildora, flex: '1 1 100px', fontWeight: 700 }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Stack>
                )}
              </>
            )}

            {resuelto && (
              <Box
                role="status"
                sx={{
                  p: 2.5,
                  borderRadius: 4.5,
                  bgcolor: resuelto.aprobado ? '#CFF4F7' : '#FFDCCF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'h1.fontFamily',
                    fontWeight: 900,
                    fontSize: 21,
                    lineHeight: 1.2,
                  }}
                >
                  {!resuelto.aprobado
                    ? 'Escaneo RECHAZADO.'
                    : resuelto.publicada
                      ? '¡Publicada! Ya aparece en el portal.'
                      : 'Escaneo APROBADO.'}
                </Typography>
                <Typography>
                  {!resuelto.aprobado
                    ? 'El motivo quedó en el historial de la pieza. Hay que cargar un escaneo nuevo.'
                    : resuelto.publicada
                      ? 'La pieza pasó a PUBLICADA.'
                      : 'La pieza pasa a REVISADA. Puedes publicarla ahora o después.'}
                </Typography>
                {publicar.isError && (
                  <MensajeError error={publicar.error} titulo="No se pudo publicar" />
                )}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {resuelto.aprobado && !resuelto.publicada && (
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={publicar.isPending}
                      onClick={() =>
                        publicar.mutate(resuelto.archivo.pieza.id, {
                          onSuccess: () => setResuelto({ ...resuelto, publicada: true }),
                        })
                      }
                      sx={{
                        borderRadius: 999,
                        fontWeight: 800,
                        boxShadow: `0 5px 0 ${colores.azulMarino}`,
                      }}
                    >
                      Publicar en el portal
                    </Button>
                  )}
                  {siguiente && (
                    <Button
                      variant="contained"
                      onClick={() => empezarCon(siguiente.id)}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    >
                      Siguiente escaneo →
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
