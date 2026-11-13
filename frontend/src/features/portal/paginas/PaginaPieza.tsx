import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { FUENTE_MAQUINA } from '../componentes/TarjetaResultado';
import { RUTA_EXPLORAR, rutaExplorar } from '../explorar';
import { usePdfConSesion, usePiezaPortal } from '../hooks';
import { NOMBRE_TIPO, type PiezaPortal, type TipoPieza } from '../tipos';

const CODIGO_VALIDO = /^MDA-\d{4}-\d{4}$/;
const curva = 'cubic-bezier(.2, .8, .2, 1)';
const sinMovimiento = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;

const deriva = keyframes`
  from { transform: translateX(-160px); }
  to { transform: translateX(110vw); }
`;
const estampa = keyframes`
  0% { opacity: 0; transform: scale(2.2) rotate(-20deg); }
  55% { opacity: 1; transform: scale(.92) rotate(-8deg); }
  100% { transform: scale(1) rotate(-8deg); }
`;
const flota = keyframes`
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
`;
const cajon = keyframes`
  from { opacity: 0; transform: translateY(80px) rotate(6deg); }
  to { opacity: 1; transform: rotate(-1.5deg); }
`;
const entra = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: none; }
`;
const gira = keyframes`
  to { transform: rotate(360deg); }
`;
const brilla = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(204, 63, 20, .9); }
  50% { box-shadow: 0 0 0 10px rgba(204, 63, 20, 0); }
`;

const RESTRINGIDA: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento de consulta restringida',
  FOTOGRAFIA: 'Fotografía de consulta restringida',
  PERIODICO: 'Periódico de consulta restringida',
};

const EN_CAJA: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento aún sin digitalizar',
  FOTOGRAFIA: 'Fotografía aún sin digitalizar',
  PERIODICO: 'Periódico aún sin digitalizar',
};

const TIPO_PLURAL_RUTA: Record<TipoPieza, string> = {
  DOCUMENTO: 'DOCUMENTOS',
  FOTOGRAFIA: 'FOTOGRAFÍAS',
  PERIODICO: 'PERIÓDICOS',
};

const LINEAS = [
  '100%',
  '96%',
  '100%',
  '88%',
  '100%',
  '92%',
  '70%',
  '100%',
  '95%',
  '100%',
  '84%',
  '60%',
];

function tituloDe(pieza: PiezaPortal) {
  if (pieza.restringida) return RESTRINGIDA[pieza.tipo];
  if (!pieza.digitalizada) return EN_CAJA[pieza.tipo];
  return pieza.titulo ?? 'Sin título';
}

/** Sello de la ficha: qué puede ver el visitante de esta pieza. */
function selloDe(pieza: PiezaPortal) {
  if (pieza.restringida) return { texto: 'RESTRINGIDA', color: colores.naranja };
  if (!pieza.digitalizada) return { texto: 'EN SU CAJA', color: colores.azulMarino };
  return { texto: 'PUBLICADA', color: colores.turquesaOscuro };
}

/** Banda de bienvenida cuando la ficha se abre escaneando el QR de la caja. */
function BienvenidaQr({ codigo }: { codigo: string }) {
  return (
    <Box
      component="section"
      aria-label="Abriste esta pieza con su código QR"
      sx={{
        position: 'relative',
        width: '100vw',
        left: 'calc(50% - 50vw)',
        mt: { xs: -1, sm: -2 },
        bgcolor: colores.turquesa,
        color: '#FFFFFF',
        px: 3,
        pt: { xs: 3, md: 4 },
        pb: { xs: 9, md: 10 },
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)',
        overflow: 'hidden',
      }}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox="0 0 150 60"
        sx={{
          position: 'absolute',
          left: 0,
          top: 40,
          width: 130,
          fill: colores.papel,
          opacity: 0.85,
          animation: `${deriva} 26s linear infinite`,
          ...sinMovimiento,
        }}
      >
        <path d="M10 50h130l-14-18-20 4-10-24-30 8-14 14-24-2z" />
      </Box>
      <Box sx={{ position: 'relative', maxWidth: 1180, mx: 'auto' }}>
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            bgcolor: colores.azulMarino,
            fontFamily: FUENTE_MAQUINA,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          QR · {codigo}
        </Box>
        <Typography
          component="p"
          sx={{
            m: '18px 0 0',
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          }}
        >
          ¡Encontraste
          <br />
          una pieza!
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 18, maxWidth: 520 }}>
          Esta es la copia digital de lo que guarda la caja que tienes al frente.
        </Typography>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: { xs: 0, md: 40 },
            // en el celular va arriba, para no tapar el texto de la bienvenida
            top: { xs: -4, md: 'auto' },
            bottom: { xs: 'auto', md: 6 },
            px: 1.5,
            py: 1,
            border: `4px solid ${colores.amarillo}`,
            borderRadius: 2,
            color: colores.amarillo,
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: { xs: 14, md: 18 },
            letterSpacing: '.08em',
            lineHeight: 1.1,
            textAlign: 'center',
            transform: 'rotate(-8deg)',
            animation: `${estampa} .6s .3s ${curva} both`,
            ...sinMovimiento,
          }}
        >
          ADUANA
          <br />
          1919
        </Box>
      </Box>
    </Box>
  );
}

function HojaEnLaCaja({ restringida }: { restringida: boolean }) {
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 400,
        mx: 2,
        p: { xs: 2.5, md: 3.5 },
        bgcolor: colores.papel,
        border: `3px dashed ${colores.naranja}`,
        borderRadius: 5,
        color: colores.azulMarino,
      }}
    >
      {restringida && (
        <LockOutlinedIcon aria-hidden sx={{ color: colores.naranja, fontSize: 38 }} />
      )}
      <Typography
        component="h2"
        sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 26, lineHeight: 1.05, mb: 1 }}
      >
        {restringida ? 'Pieza de consulta restringida' : 'Esta pieza aún está en su caja'}
      </Typography>
      <Typography sx={{ lineHeight: 1.45, fontSize: 17 }}>
        {restringida
          ? 'Por su contenido solo se consulta en la sala del Archivo. Lleva este código y te la mostramos allí.'
          : 'Todavía no tiene copia digital. Puedes consultarla en la sala del Archivo con su código.'}
      </Typography>
    </Box>
  );
}

const estiloBotonVisor = {
  minWidth: 50,
  height: 50,
  border: 0,
  borderRadius: 999,
  fontSize: 26,
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'transform .2s',
  '&:hover': { transform: 'translateY(-3px) scale(1.04)' },
} as const;

/**
 * El PDF se lee con cuenta (HU-15). Sin sesión se ofrece iniciarla y volver a esta misma pieza; con
 * sesión se trae con el token y se muestra con el lector del navegador. `children` es la hoja de
 * muestra: se ve mientras no hay documento y donde el navegador no puede mostrarlo (Chrome y
 * Safari en celulares).
 */
function VisorPdf({ url, titulo, children }: { url: string; titulo: string; children: ReactNode }) {
  const { usuario } = useAuth();
  const { pathname, search } = useLocation();
  const { enlace, cargando, fallo } = usePdfConSesion(url, Boolean(usuario));
  const aviso = !usuario
    ? 'Este documento se lee con una cuenta. Inicia sesión y vuelves a esta misma pieza.'
    : fallo
      ? 'No pudimos abrir el documento. Recarga la página e intenta otra vez.'
      : cargando || !enlace
        ? 'Abriendo el documento…'
        : 'Este navegador no muestra el PDF aquí. Ábrelo con el botón de abajo.';
  const hoja = (
    <Box sx={{ position: 'relative', textAlign: 'center' }}>
      {children}
      <Typography role="status" sx={{ maxWidth: 300, mx: 'auto', color: '#FFFFFF', fontSize: 16 }}>
        {aviso}
      </Typography>
    </Box>
  );
  const estiloBoton = { flex: 'none', borderRadius: 999, px: 3, fontWeight: 800 } as const;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        p: { xs: 2, md: 3.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box
        // sin documento solo se ve la hoja de muestra con el aviso
        {...(enlace
          ? {
              component: 'object',
              data: `${enlace}#view=FitH`,
              type: 'application/pdf',
              'aria-label': `Documento PDF: ${titulo}`,
            }
          : {})}
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          border: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hoja}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        {!usuario ? (
          <>
            <Button
              component={RouterLink}
              to="/ingresar"
              state={{ desde: `${pathname}${search}` }}
              variant="contained"
              color="warning"
              sx={estiloBoton}
            >
              Iniciar sesión para leerlo
            </Button>
            <Button
              component={RouterLink}
              to="/registro"
              variant="outlined"
              sx={{ ...estiloBoton, color: '#FFFFFF', borderColor: '#FFFFFF' }}
            >
              Crear cuenta
            </Button>
          </>
        ) : (
          enlace && (
            <Button
              href={enlace}
              target="_blank"
              rel="noopener"
              variant="contained"
              color="warning"
              sx={estiloBoton}
            >
              Abrir en otra pestaña
            </Button>
          )
        )}
      </Box>
    </Box>
  );
}

/** Mesa de luz: fondo cuadriculado, la copia digital al centro y controles de acercar. */
function MesaDeLuz({ pieza }: { pieza: PiezaPortal }) {
  const [escala, setEscala] = useState(1);
  const [falloImagen, setFalloImagen] = useState(false);
  const ajustar = (valor: number) =>
    setEscala(Math.max(0.6, Math.min(2.2, Math.round(valor * 10) / 10)));
  const imagen =
    !pieza.restringida && !falloImagen && pieza.archivo?.tipoMime.startsWith('image/')
      ? pieza.archivo
      : null;
  const pdf =
    !pieza.restringida && pieza.archivo?.tipoMime === 'application/pdf' ? pieza.archivo : null;

  return (
    <Box
      component="section"
      aria-label="Mesa de luz: copia digital de la pieza"
      sx={{
        position: 'relative',
        height: { xs: 440, md: 700 },
        bgcolor: colores.azulMarino,
        borderRadius: '26px',
        overflow: 'hidden',
        clipPath: 'polygon(0 2%, 100% 0, 99% 100%, 1% 98%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.14,
          backgroundImage:
            'linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {imagen ? (
        <>
          <Box sx={{ transform: `scale(${escala})`, transition: `transform .35s ${curva}` }}>
            <Box
              component="img"
              src={imagen.url}
              alt={tituloDe(pieza)}
              onError={() => setFalloImagen(true)}
              sx={{
                display: 'block',
                maxWidth: { xs: 280, md: 520 },
                maxHeight: { xs: 320, md: 560 },
                boxShadow: '0 30px 60px rgba(0, 0, 0, .45)',
                animation: `${flota} 6s ease-in-out infinite`,
                ...sinMovimiento,
              }}
            />
          </Box>
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: 28,
              top: 28,
              px: 1.75,
              py: 0.75,
              borderRadius: 999,
              bgcolor: colores.amarillo,
              color: colores.azulMarino,
              fontFamily: FUENTE_MAQUINA,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {Math.round(escala * 100)} %
          </Box>
          <Box
            role="toolbar"
            aria-label="Controles del visor"
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 26,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              p: 1,
              bgcolor: colores.papel,
              borderRadius: 999,
              boxShadow: '0 10px 0 rgba(0, 0, 0, .25)',
            }}
          >
            <Box
              component="button"
              type="button"
              aria-label="Alejar"
              onClick={() => ajustar(escala - 0.2)}
              sx={{ ...estiloBotonVisor, bgcolor: colores.azulMarino, color: '#FFFFFF' }}
            >
              −
            </Box>
            <Box
              component="button"
              type="button"
              onClick={() => ajustar(1)}
              sx={{
                ...estiloBotonVisor,
                px: 2,
                bgcolor: 'transparent',
                color: colores.azulMarino,
                fontFamily: 'h1.fontFamily',
                fontSize: 17,
              }}
            >
              Ajustar
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="Acercar"
              onClick={() => ajustar(escala + 0.2)}
              sx={{ ...estiloBotonVisor, bgcolor: colores.naranja, color: '#FFFFFF' }}
            >
              +
            </Box>
          </Box>
        </>
      ) : pdf ? (
        <VisorPdf url={pdf.url} titulo={tituloDe(pieza)}>
          <Box
            aria-hidden
            sx={{
              width: { xs: 170, md: 320 },
              height: { xs: 210, md: 420 },
              mx: 'auto',
              mb: { xs: 2, md: 3 },
              p: { xs: 2.5, md: 4 },
              bgcolor: '#EADFC6',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              boxShadow: '0 30px 60px rgba(0, 0, 0, .45)',
              animation: `${flota} 6s ease-in-out infinite`,
              ...sinMovimiento,
            }}
          >
            <Box sx={{ height: 12, width: '50%', bgcolor: '#B9A57E', mb: 2 }} />
            {LINEAS.map((ancho, i) => (
              <Box key={i} sx={{ height: 8, width: ancho, bgcolor: '#CBBB97' }} />
            ))}
          </Box>
        </VisorPdf>
      ) : (
        <HojaEnLaCaja restringida={pieza.restringida} />
      )}

      {/* en el PDF taparía los botones del lector */}
      {imagen && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: 28,
            top: 28,
            width: 122,
            height: 122,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 128 128"
            sx={{
              width: '100%',
              height: '100%',
              animation: `${gira} 14s linear infinite`,
              ...sinMovimiento,
            }}
          >
            <defs>
              <path id="circulo-ficha" d="M64 64m-48 0a48 48 0 1 1 96 0a48 48 0 1 1-96 0" />
            </defs>
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke={colores.amarillo}
              strokeWidth="3"
              strokeDasharray="4 6"
            />
            <text
              fontFamily="Archivo Variable, sans-serif"
              fontWeight="800"
              fontSize="12"
              letterSpacing="2.4"
              fill={colores.amarillo}
            >
              <textPath href="#circulo-ficha">DIGITALIZADO · CONTROL DE CALIDAD ·</textPath>
            </text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function FichaCatalografica({ pieza }: { pieza: PiezaPortal }) {
  const sello = selloDe(pieza);
  const filas: [string, string][] = [
    ['Tipo', NOMBRE_TIPO[pieza.tipo].singular],
    ...(pieza.anio !== null ? ([['Año', String(pieza.anio)]] as [string, string][]) : []),
    ['Código', pieza.codigo],
  ];
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: colores.papel,
        p: '28px 26px 40px',
        boxShadow: '10px 12px 0 #F5D79E',
        borderTop: `10px solid ${colores.naranja}`,
        transform: 'rotate(-1.5deg)',
        animation: `${cajon} .9s .2s ${curva} both`,
        ...sinMovimiento,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 12,
          width: 18,
          height: 18,
          ml: '-9px',
          borderRadius: 999,
          bgcolor: colores.crema,
          boxShadow: 'inset 0 2px 3px rgba(0, 0, 0, .2)',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          fontFamily: FUENTE_MAQUINA,
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        <span>FICHA CATALOGRÁFICA</span>
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.25,
            border: `2px solid ${sello.color}`,
            color: sello.color,
            transform: 'rotate(-4deg)',
          }}
        >
          {sello.texto}
        </Box>
      </Box>
      <Typography
        id="titulo-pieza"
        variant="h1"
        sx={{
          m: '16px 0 18px',
          fontSize: { xs: 30, md: 34 },
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
        }}
      >
        {tituloDe(pieza)}
      </Typography>
      {pieza.descripcion && (
        <Typography sx={{ mb: 2, fontSize: 17, lineHeight: 1.5 }}>{pieza.descripcion}</Typography>
      )}
      <Box component="dl" sx={{ m: 0, fontFamily: FUENTE_MAQUINA, fontSize: 17 }}>
        {filas.map(([etiqueta, valor]) => (
          <Box
            key={etiqueta}
            sx={{ display: 'flex', gap: 1.5, py: 1.1, borderBottom: '1px solid #D8C9A8' }}
          >
            <Box
              component="dt"
              sx={{ flex: 'none', width: 92, fontWeight: 700, color: colores.naranja }}
            >
              {etiqueta}
            </Box>
            <Box component="dd" sx={{ m: 0, fontWeight: 700 }}>
              {valor}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function DondeEstaElOriginal({ pieza }: { pieza: PiezaPortal }) {
  const { deposito, estanteria, caja } = pieza.ubicacion;
  return (
    <Box
      component="section"
      aria-labelledby="titulo-original"
      sx={{
        bgcolor: colores.amarillo,
        borderRadius: '22px',
        p: 2.75,
        display: 'grid',
        gap: 1.75,
        animation: `${entra} .8s .4s ${curva} both`,
        ...sinMovimiento,
      }}
    >
      <Typography
        id="titulo-original"
        component="h2"
        sx={{ m: 0, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 24 }}
      >
        ¿Dónde está el original?
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        <Box
          aria-hidden
          sx={{
            flex: 'none',
            width: 150,
            p: 1,
            bgcolor: colores.azulMarino,
            borderRadius: 1.5,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '5px',
          }}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <Box
              key={i}
              sx={{
                height: 24,
                bgcolor: i === 4 ? colores.naranja : '#C9B48A',
                borderRadius: i === 4 ? '2px' : 0,
                animation: i === 4 ? `${brilla} 1.8s ease-out infinite` : undefined,
                ...(i === 4 && sinMovimiento),
              }}
            />
          ))}
        </Box>
        {/* la ubicación ya trae su nombre completo: «Depósito A», «Estantería 2», «Caja 01» */}
        <Box sx={{ display: 'grid', gap: 0.5, fontSize: 17 }}>
          <span>{deposito}</span>
          <strong>{estanteria}</strong>
          <Box
            component="span"
            sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 30, lineHeight: 1 }}
          >
            {caja}
          </Box>
        </Box>
      </Box>
      <Typography sx={{ m: 0, fontSize: 16, lineHeight: 1.4 }}>
        ¿Necesitas verlo en persona? Pídelo en sala con el código <strong>{pieza.codigo}</strong>.
      </Typography>
    </Box>
  );
}

function ComoCitar({ pieza }: { pieza: PiezaPortal }) {
  const [copiado, setCopiado] = useState(false);
  const cita = `${tituloDe(pieza)}${pieza.anio !== null ? ` (${pieza.anio})` : ''}. Archivo Histórico del Atlántico, ${pieza.codigo}.`;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cita);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      // sin permiso de portapapeles la cita sigue visible para copiarla a mano
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#FFFFFF',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 0 #F5D79E',
        animation: `${entra} .8s .6s ${curva} both`,
        ...sinMovimiento,
      }}
    >
      <Box
        sx={{
          flex: 1,
          p: '20px 20px 20px 22px',
          display: 'grid',
          gap: 1.25,
          borderRight: '3px dashed #D8C9A8',
        }}
      >
        <Box component="span" sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 19 }}>
          Cómo citar
        </Box>
        <Box component="span" sx={{ fontFamily: FUENTE_MAQUINA, fontSize: 15, lineHeight: 1.45 }}>
          {cita}
        </Box>
      </Box>
      <Box
        component="button"
        type="button"
        onClick={copiar}
        aria-live="polite"
        sx={{
          flex: 'none',
          width: 104,
          border: 0,
          bgcolor: copiado ? colores.turquesaOscuro : colores.naranja,
          color: '#FFFFFF',
          fontFamily: 'h1.fontFamily',
          fontWeight: 800,
          fontSize: 16,
          cursor: 'pointer',
          transition: 'background-color .3s',
        }}
      >
        {copiado ? '¡Copiada!' : 'Copiar'}
      </Box>
    </Box>
  );
}

function NoEncontrada({ codigo }: { codigo: string }) {
  return (
    <Box
      component="section"
      aria-labelledby="titulo-no-encontrada"
      sx={{
        maxWidth: 760,
        mx: 'auto',
        mt: { xs: 2, md: 6 },
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
        p: { xs: 3, md: 5 },
        bgcolor: colores.papel,
        border: `3px dashed ${colores.naranja}`,
        borderRadius: 5,
      }}
    >
      <svg width="90" height="80" viewBox="0 0 90 80" aria-hidden>
        <path d="M10 30h70v44H10z" fill="#D8C9A8" />
        <path d="M4 18h82v14H4z" fill={colores.naranja} />
        <path d="M38 46h14" stroke={colores.azulMarino} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <Box sx={{ flex: '1 1 300px' }}>
        <Typography
          id="titulo-no-encontrada"
          variant="h1"
          sx={{ m: 0, fontSize: { xs: 30, md: 38 } }}
        >
          No encontramos esa pieza
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 18, lineHeight: 1.45 }}>
          {codigo ? (
            <>
              No hay una pieza publicada con el código <strong>{codigo}</strong>. Revisa que esté
              bien escrito o búscala en el archivo.
            </>
          ) : (
            'Revisa el código o búscala en el archivo.'
          )}
        </Typography>
      </Box>
      <Button
        component={RouterLink}
        to={RUTA_EXPLORAR}
        variant="contained"
        sx={{ minHeight: 50, borderRadius: 999, px: 3 }}
      >
        Ir a explorar
      </Button>
    </Box>
  );
}

function Columnas({ izquierda, derecha }: { izquierda: ReactNode; derecha: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ flex: '999 1 560px', minWidth: 0 }}>{izquierda}</Box>
      <Box sx={{ flex: '1 1 360px', maxWidth: '100%', display: 'grid', gap: 3.75 }}>{derecha}</Box>
    </Box>
  );
}

/** Ficha pública /p/{codigo}: es la dirección que guarda el QR de cada pieza (HU-12). */
export function PaginaPieza() {
  const { codigo: deLaRuta = '' } = useParams();
  const [parametros] = useSearchParams();
  const codigo = deLaRuta.trim().toUpperCase();
  const valido = CODIGO_VALIDO.test(codigo);
  const consulta = usePiezaPortal(codigo, valido);
  const desdeQr = parametros.get('qr') === '1';

  const noExiste =
    !valido || (consulta.error instanceof AxiosError && consulta.error.response?.status === 404);
  if (noExiste) return <NoEncontrada codigo={deLaRuta} />;

  if (consulta.isError) {
    return <MensajeError error={consulta.error} titulo="No se pudo abrir la pieza" />;
  }

  return (
    <Box
      component="article"
      aria-labelledby="titulo-pieza"
      sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2.5 }}
    >
      {desdeQr && <BienvenidaQr codigo={codigo} />}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          component="p"
          sx={{
            m: 0,
            fontFamily: FUENTE_MAQUINA,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '.04em',
          }}
        >
          ARCHIVO ›{' '}
          {consulta.data ? (
            <Box
              component={RouterLink}
              to={rutaExplorar({ tipo: consulta.data.tipo })}
              sx={{ color: 'inherit' }}
            >
              {TIPO_PLURAL_RUTA[consulta.data.tipo]}
            </Box>
          ) : (
            '…'
          )}{' '}
          › {codigo}
        </Box>
        <Button
          component={RouterLink}
          to={RUTA_EXPLORAR}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ minHeight: 44, borderRadius: 999, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
        >
          Volver a la búsqueda
        </Button>
      </Box>

      {consulta.isPending ? (
        <Columnas
          izquierda={<Skeleton variant="rounded" height={560} sx={{ borderRadius: '26px' }} />}
          derecha={
            <>
              <Skeleton variant="rectangular" height={300} />
              <Skeleton variant="rounded" height={180} sx={{ borderRadius: '22px' }} />
            </>
          }
        />
      ) : (
        <Columnas
          izquierda={<MesaDeLuz pieza={consulta.data} />}
          derecha={
            <>
              <FichaCatalografica pieza={consulta.data} />
              <DondeEstaElOriginal pieza={consulta.data} />
              <ComoCitar pieza={consulta.data} />
            </>
          }
        />
      )}
    </Box>
  );
}
