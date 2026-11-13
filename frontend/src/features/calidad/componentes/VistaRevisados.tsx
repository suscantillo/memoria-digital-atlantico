import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { NOMBRE_TIPO } from '../../inventario/tipos';
import type { ArchivoEnRevision } from '../tipos';
import { VisorEscaneo } from './VisorEscaneo';

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

interface Props {
  consulta: UseQueryResult<ArchivoEnRevision[]>;
  /** El escaneo que se abre primero (llega desde «Escaneos» con ?archivo=). */
  inicial: string | null;
}

/** Pestaña «Revisados»: el escaneo con su sello y la decisión que se tomó, solo para consultar. */
export function VistaRevisados({ consulta, inicial }: Props) {
  const [elegido, setElegido] = useState<string | null>(inicial);
  const lista = consulta.data ?? [];
  const actual = lista.find((a) => a.id === elegido) ?? lista[0] ?? null;

  if (consulta.isPending) {
    return (
      <Box role="status" sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress aria-label="Cargando lo revisado" />
      </Box>
    );
  }
  if (consulta.isError) {
    return <MensajeError error={consulta.error} titulo="No se pudo cargar lo revisado" />;
  }
  if (!actual) {
    return (
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
          Nada revisado todavía
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Cuando apruebes o rechaces un escaneo, aquí lo vuelves a ver con su decisión.
        </Typography>
      </Box>
    );
  }

  const aprobado = actual.estado === 'APROBADO';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: '240px minmax(0, 1fr)',
          lg: '240px minmax(0, 1fr) 320px',
        },
        gap: 3,
        alignItems: 'start',
      }}
    >
      <Box
        component="ol"
        aria-label="Escaneos revisados"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          gap: 1,
          overflowX: { xs: 'auto', md: 'visible' },
          maxHeight: { md: 'calc(100vh - 260px)' },
          overflowY: { md: 'auto' },
          pb: { xs: 1, md: 0 },
        }}
      >
        {lista.map((a) => {
          const ok = a.estado === 'APROBADO';
          const activo = a.id === actual.id;
          return (
            <li key={a.id} style={{ flex: 'none' }}>
              <Box
                component="button"
                type="button"
                onClick={() => setElegido(a.id)}
                aria-current={activo ? 'true' : undefined}
                sx={{
                  width: { xs: 200, md: '100%' },
                  textAlign: 'left',
                  p: '10px 12px',
                  border: 0,
                  borderLeft: `6px solid ${ok ? colores.turquesa : colores.naranja}`,
                  borderRadius: '0 12px 12px 0',
                  bgcolor: activo ? '#FFFFFF' : colores.papel,
                  boxShadow: activo ? `0 0 0 3px ${colores.azulMarino}` : '0 4px 0 #F5D79E',
                  color: colores.azulMarino,
                  font: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: 13 }}>
                  {a.pieza.codigo}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>
                  {a.pieza.titulo}
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 900, color: ok ? '#005F6B' : '#A8320F' }}
                >
                  {ok ? '✓ APROBADO' : '✕ RECHAZADO'}
                </Typography>
              </Box>
            </li>
          );
        })}
      </Box>

      <Box sx={{ position: 'relative', minWidth: 0 }}>
        <VisorEscaneo key={actual.id} archivo={actual} />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 70,
            right: 24,
            px: 2,
            py: 0.75,
            border: `5px solid ${aprobado ? colores.turquesaOscuro : colores.naranja}`,
            borderRadius: 2,
            color: aprobado ? colores.turquesaOscuro : colores.naranja,
            bgcolor: 'rgba(251, 246, 234, .9)',
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: { xs: 20, md: 26 },
            letterSpacing: '.08em',
            rotate: '-6deg',
            pointerEvents: 'none',
          }}
        >
          {aprobado ? 'APROBADO' : 'RECHAZADO'}
        </Box>
      </Box>

      <Box
        component="section"
        aria-labelledby="titulo-revisado"
        sx={{
          gridColumn: { md: '2', lg: 'auto' },
          p: 2.5,
          bgcolor: colores.papel,
          borderTop: `8px solid ${aprobado ? colores.turquesa : colores.naranja}`,
          boxShadow: '8px 8px 0 #F5D79E',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: 14 }}>
          {actual.pieza.codigo} · {NOMBRE_TIPO[actual.pieza.tipo]}
        </Typography>
        <Typography
          id="titulo-revisado"
          component="h2"
          sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 22, lineHeight: 1.15 }}
        >
          {actual.pieza.titulo}
        </Typography>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            columnGap: 1.5,
            rowGap: 0.5,
            fontSize: 15,
            '& dt': { fontWeight: 800, color: colores.naranja },
            '& dd': { m: 0 },
          }}
        >
          <dt>Decisión</dt>
          <dd>{aprobado ? 'Aprobado y publicado' : 'Rechazado'}</dd>
          <dt>Revisor</dt>
          <dd>{actual.revisor?.nombre ?? 'Administración'}</dd>
          {actual.revisadoEn && (
            <>
              <dt>Fecha</dt>
              <dd>{fecha.format(new Date(actual.revisadoEn))}</dd>
            </>
          )}
          <dt>Subió</dt>
          <dd>{actual.subidoPor.nombre}</dd>
        </Box>
        {!aprobado && actual.motivoRechazo && (
          <Box
            sx={{ p: 1.5, borderRadius: 3, bgcolor: '#FFDCCF', color: '#7A2408', fontWeight: 600 }}
          >
            Motivo: {actual.motivoRechazo}
          </Box>
        )}
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          La decisión ya quedó en el historial de la pieza; aquí solo se consulta.
        </Typography>
        {aprobado && actual.pieza.estado === 'PUBLICADA' && (
          <Button
            component={RouterLink}
            to={`/p/${actual.pieza.codigo}`}
            target="_blank"
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            Ver en el portal
          </Button>
        )}
        {!aprobado && actual.pieza.estado === 'REGISTRADA' && (
          <Button
            component={RouterLink}
            to={`/panel/escaneo/${actual.pieza.codigo}`}
            variant="contained"
            color="secondary"
            startIcon={<UploadFileIcon />}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            Cargar un escaneo nuevo
          </Button>
        )}
      </Box>
    </Box>
  );
}
