import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { VERSION_PRIVACIDAD } from '../privacidad';

const MONO = '"Courier New", ui-monospace, monospace';

function Seccion({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <Box component="section" sx={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 1.5 }}>
      <Box
        aria-hidden
        sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: colores.naranja, pt: 0.5 }}
      >
        {numero}
      </Box>
      <Box>
        <Typography component="h2" variant="h3" sx={{ fontWeight: 800, mb: 0.75 }}>
          {titulo}
        </Typography>
        <Box sx={{ lineHeight: 1.6, '& p': { m: 0, mb: 1 }, '& ul': { m: 0, pl: 2.5 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

/** Aviso de privacidad que se acepta al crear una cuenta pública (HU-01, Ley 1581 de 2012). */
export function PaginaPrivacidad() {
  return (
    <Box
      component="article"
      aria-labelledby="titulo-privacidad"
      sx={{
        mx: 'auto',
        maxWidth: 760,
        p: { xs: 3, md: 6 },
        bgcolor: colores.papel,
        borderTop: `6px solid ${colores.naranja}`,
        boxShadow: '6px 8px 0 #F5D79E',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Box>
        <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, mb: 1 }}>
          AVISO DE PRIVACIDAD · VERSIÓN {VERSION_PRIVACIDAD}
        </Typography>
        <Typography id="titulo-privacidad" variant="h1" sx={{ m: 0, fontSize: { xs: 32, md: 44 } }}>
          Tus datos en el archivo
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 18, lineHeight: 1.5 }}>
          Pedimos lo mínimo para darte una cuenta y nada más. Aquí explicamos qué guardamos, para
          qué y cómo lo borras.
        </Typography>
      </Box>

      <Seccion numero="01" titulo="Qué datos guardamos">
        <ul>
          <li>Tu nombre y tu correo.</li>
          <li>Tu contraseña, cifrada: nadie del equipo puede leerla.</li>
          <li>La fecha en que aceptaste este aviso y su versión.</li>
        </ul>
      </Seccion>

      <Seccion numero="02" titulo="Para qué los usamos">
        <p>
          Solo para identificarte al iniciar sesión y dejarte leer y descargar los documentos
          digitalizados. No los vendemos, no los compartimos con terceros y no te enviamos
          publicidad.
        </p>
      </Seccion>

      <Seccion numero="03" titulo="Tus derechos">
        <p>
          Según la Ley 1581 de 2012 puedes conocer, actualizar y rectificar tus datos, pedir que se
          supriman y revocar esta autorización.
        </p>
        <p>
          En{' '}
          <Link component={RouterLink} to="/mi-cuenta" sx={{ fontWeight: 700 }}>
            Mi cuenta
          </Link>{' '}
          ves lo que guardamos de ti y puedes eliminar tu cuenta: se borran tus datos y se cierran
          todas tus sesiones.
        </p>
      </Seccion>

      <Seccion numero="04" titulo="Si no aceptas">
        <p>
          Puedes seguir buscando piezas y viendo sus fichas sin cuenta. Lo que necesita cuenta es
          leer los documentos en PDF.
        </p>
      </Seccion>
    </Box>
  );
}
