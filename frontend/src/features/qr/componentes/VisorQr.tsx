import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { colores } from '../../../app/tema';
import { extraerCodigo } from '../codigo';

type EstadoCamara = 'pidiendo' | 'activa' | 'denegada' | 'sin-camara' | 'no-soportada';

// BarcodeDetector aún no está en los tipos de TypeScript
interface DetectorCodigos {
  detect(fuente: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
type ConstructorDetector = new (opciones: { formats: string[] }) => DetectorCodigos;
type LectorJsQr = (
  datos: Uint8ClampedArray,
  ancho: number,
  alto: number,
  opciones: { inversionAttempts: 'dontInvert' },
) => { data: string } | null;

const soloLectores = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

const barrer = keyframes`
  0%, 100% { top: 6%; }
  50% { top: 90%; }
`;

const destello = keyframes`
  from { opacity: .85; }
  to { opacity: 0; }
`;

/** Con BarcodeDetector (Chrome, Android) se lee nativo; si no existe, como en iPhone, se usa jsQR. */
async function crearLector(): Promise<(video: HTMLVideoElement) => Promise<string | null>> {
  const Detector = (window as unknown as { BarcodeDetector?: ConstructorDetector }).BarcodeDetector;
  if (Detector) {
    const detector = new Detector({ formats: ['qr_code'] });
    return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
  }
  // se carga solo aquí: quien nunca abre la cámara no descarga el lector
  const jsQR = (await import('jsqr')).default as unknown as LectorJsQr;
  const lienzo = document.createElement('canvas');
  const contexto = lienzo.getContext('2d', { willReadFrequently: true });
  return (video) => {
    if (!contexto || !video.videoWidth) return Promise.resolve(null);
    // a 640 px de ancho el QR se sigue leyendo y cada cuadro cuesta mucho menos
    const escala = Math.min(1, 640 / video.videoWidth);
    lienzo.width = Math.round(video.videoWidth * escala);
    lienzo.height = Math.round(video.videoHeight * escala);
    contexto.drawImage(video, 0, 0, lienzo.width, lienzo.height);
    const { data } = contexto.getImageData(0, 0, lienzo.width, lienzo.height);
    const resultado = jsQR(data, lienzo.width, lienzo.height, { inversionAttempts: 'dontInvert' });
    return Promise.resolve(resultado?.data ?? null);
  };
}

function motivoDelError(error: unknown): EstadoCamara {
  const nombre = error instanceof DOMException ? error.name : '';
  if (nombre === 'NotAllowedError' || nombre === 'SecurityError') return 'denegada';
  if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError') return 'sin-camara';
  return 'no-soportada';
}

const MENSAJES: Record<Exclude<EstadoCamara, 'activa'>, { titulo: string; texto: string }> = {
  pidiendo: {
    titulo: 'Abriendo la cámara…',
    texto: 'Si el navegador te pregunta, permite el uso de la cámara.',
  },
  denegada: {
    titulo: 'No tenemos permiso para usar la cámara',
    texto:
      'Actívalo en el candado junto a la dirección del sitio y vuelve a intentarlo, o escribe el código abajo.',
  },
  'sin-camara': {
    titulo: 'No encontramos una cámara',
    texto: 'Este dispositivo no tiene cámara disponible. Escribe el código de la pieza abajo.',
  },
  'no-soportada': {
    titulo: 'Este navegador no puede abrir la cámara',
    texto: 'Prueba en otro navegador o escribe el código de la pieza abajo.',
  },
};

function Esquina({ arriba, izquierda }: { arriba: boolean; izquierda: boolean }) {
  const borde = `6px solid ${colores.amarillo}`;
  return (
    <Box
      sx={{
        position: 'absolute',
        width: 54,
        height: 54,
        [arriba ? 'top' : 'bottom']: 18,
        [izquierda ? 'left' : 'right']: 18,
        borderTop: arriba ? borde : 0,
        borderBottom: arriba ? 0 : borde,
        borderLeft: izquierda ? borde : 0,
        borderRight: izquierda ? 0 : borde,
        borderRadius: `${arriba && izquierda ? 18 : 0}px ${arriba && !izquierda ? 18 : 0}px ${
          !arriba && !izquierda ? 18 : 0
        }px ${!arriba && izquierda ? 18 : 0}px`,
      }}
    />
  );
}

interface Props {
  onCodigo: (codigo: string) => void;
}

/** Visor de la cámara trasera que lee códigos QR y entrega el código de pieza que encuentre. */
export function VisorQr({ onCodigo }: Props) {
  const refVideo = useRef<HTMLVideoElement>(null);
  const [estado, setEstado] = useState<EstadoCamara>('pidiendo');
  const [ajeno, setAjeno] = useState(false);
  const [leido, setLeido] = useState(false);
  const [intento, setIntento] = useState(0);
  // la función cambia en cada render del padre; el bucle siempre usa la última
  const refOnCodigo = useRef(onCodigo);
  refOnCodigo.current = onCodigo;

  useEffect(() => {
    let cancelado = false;
    let flujo: MediaStream | null = null;
    let temporizador = 0;
    setEstado('pidiendo');
    setLeido(false);

    // sin HTTPS (o fuera de localhost) el navegador ni siquiera ofrece la cámara
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setEstado('no-soportada');
      return;
    }

    const iniciar = async () => {
      try {
        flujo = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        const video = refVideo.current;
        if (cancelado || !video) return;
        video.srcObject = flujo;
        await video.play();
        setEstado('activa');

        const leer = await crearLector();
        const revisar = async () => {
          if (cancelado) return;
          const texto = await leer(video).catch(() => null);
          if (cancelado) return;
          const codigo = texto ? extraerCodigo(texto) : null;
          if (codigo) {
            setLeido(true);
            // el navegador bloquea la vibración si la persona aún no ha tocado la página
            if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(80);
            refOnCodigo.current(codigo);
            return;
          }
          setAjeno(texto !== null);
          // cinco lecturas por segundo bastan y no recalientan el celular
          temporizador = window.setTimeout(() => void revisar(), 200);
        };
        void revisar();
      } catch (error) {
        if (!cancelado) setEstado(motivoDelError(error));
      }
    };
    void iniciar();

    return () => {
      cancelado = true;
      window.clearTimeout(temporizador);
      flujo?.getTracks().forEach((pista) => pista.stop());
    };
  }, [intento]);

  const mensaje = estado === 'activa' ? null : MENSAJES[estado];
  const Icono = estado === 'pidiendo' ? PhotoCameraIcon : NoPhotographyIcon;

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
          mx: 'auto',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          borderRadius: 6,
          bgcolor: colores.azulMarino,
          boxShadow: `0 10px 0 ${colores.amarillo}`,
        }}
      >
        <Box
          component="video"
          ref={refVideo}
          muted
          playsInline
          aria-label="Vista de la cámara"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            visibility: estado === 'activa' ? 'visible' : 'hidden',
          }}
        />

        {estado === 'activa' && (
          <Box aria-hidden sx={{ position: 'absolute', inset: 0 }}>
            <Esquina arriba izquierda />
            <Esquina arriba izquierda={false} />
            <Esquina arriba={false} izquierda />
            <Esquina arriba={false} izquierda={false} />
            {!leido && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  height: 4,
                  borderRadius: 2,
                  bgcolor: colores.naranja,
                  boxShadow: `0 0 18px 4px ${colores.naranja}`,
                  animation: `${barrer} 2.6s ease-in-out infinite`,
                }}
              />
            )}
            {leido && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: colores.amarillo,
                  animation: `${destello} .5s ease-out both`,
                }}
              />
            )}
          </Box>
        )}

        {mensaje && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 4,
              textAlign: 'center',
              color: '#DDE3EE',
              '--color-foco': colores.amarillo,
            }}
          >
            <Icono aria-hidden sx={{ fontSize: 56, color: colores.amarillo }} />
            <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: 20 }}>
              {mensaje.titulo}
            </Typography>
            <Typography sx={{ maxWidth: 320 }}>{mensaje.texto}</Typography>
            {estado === 'denegada' && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setIntento((n) => n + 1)}
                sx={{ mt: 1, borderRadius: 999, px: 3 }}
              >
                Intentar de nuevo
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Box role="status" aria-live="polite" sx={{ minHeight: 28, mt: 2.5, textAlign: 'center' }}>
        {estado === 'activa' && !leido && (
          <Typography sx={{ fontWeight: 600 }}>
            {ajeno
              ? 'Ese QR no es de una pieza del archivo. Busca el que dice MDA.'
              : 'Apunta al QR de la pieza y mantén el celular quieto.'}
          </Typography>
        )}
        {leido && <Typography sx={{ fontWeight: 800 }}>¡Pieza encontrada! Abriendo…</Typography>}
        {/* el aviso ya se ve en el visor; aquí se repite oculto para que el lector de pantalla lo anuncie */}
        {mensaje && <Box sx={soloLectores}>{mensaje.titulo}</Box>}
      </Box>
    </Box>
  );
}
