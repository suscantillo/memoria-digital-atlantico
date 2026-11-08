import LockIcon from '@mui/icons-material/Lock';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { AxiosError } from 'axios';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { extraerCodigo } from '../../qr/codigo';
import { VisorDocumento } from '../componentes/VisorDocumento';
import { usePiezaPortal } from '../hooks';
import { NOMBRE_TIPO, type PiezaPortal, type TipoPieza } from '../tipos';
import { PaginaNoEncontrada } from './PaginaNoEncontrada';

const aparecer = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
`;

const brillar = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(204, 63, 20, .9); }
  50% { box-shadow: 0 0 0 7px rgba(204, 63, 20, 0); }
`;

// una pieza restringida no muestra su título; se nombra por su tipo, con el género de cada palabra
const TITULO_RESTRINGIDA: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento restringido',
  FOTOGRAFIA: 'Fotografía restringida',
  PERIODICO: 'Periódico restringido',
};

const MONO = '"Courier New", ui-monospace, monospace';
const curva = 'cubic-bezier(.2, .8, .2, 1)';

const chip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  px: 1.5,
  py: 0.6,
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14,
} as const;

function titulo(pieza: PiezaPortal) {
  return pieza.restringida ? TITULO_RESTRINGIDA[pieza.tipo] : (pieza.titulo ?? '');
}

/** Hoja vacía en el lugar del visor, para que el documento siga siendo el centro aunque falte. */
function HojaAusente({ restringida }: { restringida: boolean }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 420, md: 'calc(100vh - 140px)' },
        minHeight: 420,
        maxHeight: 980,
        bgcolor: colores.azulMarino,
        borderRadius: 5,
        overflow: 'hidden',
        boxShadow: `0 10px 0 ${colores.amarillo}`,
        display: 'grid',
        placeItems: 'center',
        p: 3,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: '58%',
          maxWidth: 360,
          aspectRatio: '8.5 / 11',
          bgcolor: '#EADFC6',
          opacity: 0.18,
          rotate: '-3deg',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          maxWidth: 380,
          p: { xs: 2.5, md: 3.5 },
          bgcolor: colores.papel,
          border: `3px dashed ${colores.naranja}`,
          borderRadius: 4,
        }}
      >
        {restringida && <LockIcon aria-hidden sx={{ color: colores.naranja, fontSize: 36 }} />}
        <Typography
          component="h2"
          sx={{
            fontFamily: 'h1.fontFamily',
            fontWeight: 900,
            fontSize: 24,
            lineHeight: 1.05,
            mb: 1,
          }}
        >
          {restringida ? 'Pieza de consulta restringida' : 'Esta pieza aún está en su caja'}
        </Typography>
        <Typography sx={{ lineHeight: 1.45 }}>
          {restringida
            ? 'Por su contenido solo se consulta en la sala del Archivo. Lleva este código y te la mostramos allí.'
            : 'Todavía no tiene copia digital. Puedes consultarla en la sala del Archivo con su código.'}
        </Typography>
      </Box>
    </Box>
  );
}

function DondeVive({ pieza }: { pieza: PiezaPortal }) {
  const { deposito, estanteria, caja } = pieza.ubicacion;
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: colores.amarillo,
        borderRadius: 4.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* estantería en miniatura con la caja de la pieza encendida */}
      <Box
        aria-hidden
        sx={{
          flex: 'none',
          width: 84,
          p: 0.75,
          bgcolor: colores.azulMarino,
          borderRadius: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 0.5,
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Box
            key={i}
            sx={{
              height: 14,
              bgcolor: i === 4 ? colores.naranja : '#C9B48A',
              animation: i === 4 ? `${brillar} 1.8s ease-out infinite` : undefined,
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, fontSize: 15 }}>
        <span>El original vive en</span>
        <Box
          component="span"
          sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 22, lineHeight: 1 }}
        >
          Caja {caja}
        </Box>
        <span>
          {deposito} · Estantería {estanteria}
        </span>
      </Box>
    </Box>
  );
}

export function PaginaPieza() {
  const { codigo: deLaRuta = '' } = useParams();
  const [parametros] = useSearchParams();
  const codigo = extraerCodigo(deLaRuta);
  const consulta = usePiezaPortal(codigo ?? '', codigo !== null);
  const desdeQr = parametros.get('qr') === '1';

  const noExiste =
    codigo === null ||
    (consulta.error instanceof AxiosError && consulta.error.response?.status === 404);
  if (noExiste) return <PaginaNoEncontrada />;

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
  const filas: [string, string][] = [
    ['Tipo', NOMBRE_TIPO[pieza.tipo]],
    ...(pieza.anio ? ([['Año', String(pieza.anio)]] as [string, string][]) : []),
    ['Código', pieza.codigo],
  ];

  return (
    <Box
      component="article"
      aria-labelledby="titulo-pieza"
      sx={{
        display: 'grid',
        // en el computador el documento manda y la ficha lo acompaña al lado; en el celular va
        // el título, luego el documento y debajo los datos
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
        gridTemplateAreas: {
          xs: '"titulo" "documento" "datos"',
          md: '"documento titulo" "documento datos"',
        },
        gridTemplateRows: { md: 'auto 1fr' },
        columnGap: 4,
        rowGap: 3,
        alignItems: 'start',
      }}
    >
      <Box sx={{ gridArea: 'titulo', animation: `${aparecer} .6s ${curva} both` }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Box
            component="span"
            sx={{ ...chip, bgcolor: colores.azulMarino, color: '#FFFFFF', fontFamily: MONO }}
          >
            {pieza.codigo}
          </Box>
          <Box component="span" sx={{ ...chip, bgcolor: colores.naranja, color: '#FFFFFF' }}>
            {NOMBRE_TIPO[pieza.tipo]}
            {pieza.anio ? ` · ${pieza.anio}` : ''}
          </Box>
        </Box>
        <Typography
          id="titulo-pieza"
          variant="h1"
          sx={{ m: 0, fontSize: { xs: 30, md: 34 }, lineHeight: 1.02, letterSpacing: '-0.02em' }}
        >
          {titulo(pieza)}
        </Typography>
        {desdeQr && (
          <Typography
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, fontWeight: 600 }}
          >
            <QrCodeScannerIcon aria-hidden sx={{ color: colores.naranja }} />
            Abriste esta pieza con su código QR.
          </Typography>
        )}
      </Box>

      <Box
        sx={{ gridArea: 'documento', minWidth: 0, animation: `${aparecer} .7s ${curva} .1s both` }}
      >
        {pieza.archivo && !pieza.restringida ? (
          <VisorDocumento
            archivo={pieza.archivo}
            descripcion={titulo(pieza)}
            nombreArchivo={pieza.codigo}
          />
        ) : (
          <HojaAusente restringida={pieza.restringida} />
        )}
      </Box>

      <Box
        sx={{
          gridArea: 'datos',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          animation: `${aparecer} .7s ${curva} .2s both`,
        }}
      >
        <Box
          sx={{
            p: '18px 18px 20px',
            bgcolor: colores.papel,
            borderTop: `6px solid ${colores.naranja}`,
            boxShadow: '6px 8px 0 #F5D79E',
          }}
        >
          <Typography
            component="h2"
            sx={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, mb: 1 }}
          >
            FICHA CATALOGRÁFICA
          </Typography>
          {pieza.descripcion && !pieza.restringida && (
            <Typography sx={{ mb: 1.5, lineHeight: 1.5 }}>{pieza.descripcion}</Typography>
          )}
          <Box component="dl" sx={{ m: 0, fontFamily: MONO, fontSize: 15 }}>
            {filas.map(([etiqueta, valor]) => (
              <Box
                key={etiqueta}
                sx={{ display: 'flex', gap: 1.5, py: 0.8, borderBottom: '1px solid #D8C9A8' }}
              >
                <Box
                  component="dt"
                  sx={{ width: 68, flex: 'none', fontWeight: 700, color: colores.naranja }}
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
        <DondeVive pieza={pieza} />
        <Button
          component={RouterLink}
          to={`/explorar?ubicacion=${pieza.ubicacion.id}`}
          variant="contained"
          color="secondary"
          sx={{
            minHeight: 52,
            borderRadius: 999,
            fontSize: 17,
            fontWeight: 800,
            boxShadow: `0 6px 0 ${colores.azulMarino}`,
          }}
        >
          Ver más de esta caja →
        </Button>
      </Box>
    </Box>
  );
}
