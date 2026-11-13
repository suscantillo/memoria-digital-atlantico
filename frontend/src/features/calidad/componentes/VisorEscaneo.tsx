import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useContenidoEscaneo } from '../hooks';
import type { ArchivoEnRevision } from '../tipos';

/** El escaneo tal como se cargó, ocupando todo el alto disponible: es lo que se está juzgando. */
export function VisorEscaneo({ archivo }: { archivo: ArchivoEnRevision }) {
  const contenido = useContenidoEscaneo(archivo);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!contenido.data) return;
    const creada = URL.createObjectURL(contenido.data);
    setUrl(creada);
    return () => URL.revokeObjectURL(creada);
  }, [contenido.data]);

  const esPdf = archivo.tipoMime === 'application/pdf';

  return (
    <Box
      sx={{
        height: { xs: '70vh', md: 'calc(100vh - 230px)' },
        minHeight: 460,
        borderRadius: 5,
        overflow: 'hidden',
        bgcolor: colores.azulMarino,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 8px 0 ${colores.amarillo}`,
        '--color-foco': colores.amarillo,
      }}
    >
      <Box
        sx={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pl: 2,
          pr: 1,
          py: 0.75,
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, .12)',
        }}
      >
        <Typography
          title={archivo.nombreOriginal}
          sx={{
            flex: 1,
            minWidth: 0,
            fontFamily: 'monospace',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {archivo.nombreOriginal}
        </Typography>
        {url && (
          <Tooltip title="Abrir en otra pestaña">
            <IconButton
              component="a"
              href={url}
              target="_blank"
              rel="noopener"
              aria-label="Abrir el escaneo en otra pestaña"
              sx={{ color: '#FFFFFF', '&:hover': { bgcolor: colores.azulMedio } }}
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center' }}>
        {contenido.isPending && (
          <CircularProgress aria-label="Cargando el escaneo" sx={{ color: colores.amarillo }} />
        )}
        {contenido.isError && (
          <Box sx={{ p: 3 }}>
            <MensajeError error={contenido.error} titulo="No se pudo abrir el escaneo" />
          </Box>
        )}
        {url && esPdf && (
          <Box
            component="iframe"
            src={url}
            title={`Escaneo de ${archivo.pieza.codigo}`}
            sx={{ width: '100%', height: '100%', border: 0, bgcolor: '#525659' }}
          />
        )}
        {url && !esPdf && (
          <Box
            component="img"
            src={url}
            alt={`Escaneo de ${archivo.pieza.codigo}: ${archivo.pieza.titulo}`}
            sx={{
              maxWidth: 'calc(100% - 48px)',
              maxHeight: 'calc(100% - 48px)',
              objectFit: 'contain',
              boxShadow: '0 24px 40px rgba(0, 0, 0, .45)',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
