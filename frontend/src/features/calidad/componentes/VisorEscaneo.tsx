import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useContenidoArchivo } from '../hooks';
import type { ArchivoDigital } from '../tipos';

/** Muestra el escaneo tal como se cargó: PDF con el visor del navegador o imagen. */
export function VisorEscaneo({ archivo }: { archivo: ArchivoDigital }) {
  const contenido = useContenidoArchivo(archivo.id);
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
        position: 'relative',
        height: { xs: 420, md: 580 },
        borderRadius: 6,
        overflow: 'hidden',
        bgcolor: colores.azulMarino,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, .12)',
          '--color-foco': colores.amarillo,
        }}
      >
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, overflowWrap: 'anywhere' }}>
          {archivo.nombre}
        </Typography>
        {url && (
          <Link
            href={url}
            target="_blank"
            rel="noopener"
            sx={{ ml: 'auto', color: colores.amarillo, fontWeight: 700, flex: 'none' }}
          >
            Abrir en otra pestaña
          </Link>
        )}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', p: esPdf ? 0 : 3 }}>
        {contenido.isPending && (
          <CircularProgress aria-label="Cargando el escaneo" sx={{ color: colores.amarillo }} />
        )}
        {contenido.isError && (
          <MensajeError error={contenido.error} titulo="No se pudo abrir el escaneo" />
        )}
        {url && esPdf && (
          <Box
            component="object"
            data={url}
            type="application/pdf"
            aria-label={`Escaneo de ${archivo.pieza.codigo}`}
            sx={{ width: '100%', height: '100%', border: 0 }}
          >
            <Typography sx={{ color: '#FFFFFF', p: 3 }}>
              Este navegador no muestra PDF aquí; usa «Abrir en otra pestaña».
            </Typography>
          </Box>
        )}
        {url && !esPdf && (
          <Box
            component="img"
            src={url}
            alt={`Escaneo de ${archivo.pieza.codigo}: ${archivo.pieza.titulo}`}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 24px 40px rgba(0,0,0,.45)',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
