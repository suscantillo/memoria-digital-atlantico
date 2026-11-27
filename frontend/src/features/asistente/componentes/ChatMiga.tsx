import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { colores } from '../../../app/tema';
import migaSorpresa from '../../../assets/miga/miga-sorpresa.webp';
import { RUTA_EXPLORAR } from '../../portal/explorar';
import type { useConversacionMiga } from '../hooks';
import { filtrosDePregunta } from '../palabras';
import { LIMITE_PREGUNTA, type TurnoConversacion } from '../tipos';
import {
  AvatarMiga,
  AvisoModoBusqueda,
  MensajeMiga,
  MensajePersona,
  MigaPensando,
} from './Burbujas';
import { TarjetaRecomendacion } from './TarjetaRecomendacion';

/** Para empezar: preguntas que el catálogo de prueba sí sabe responder. */
const SUGERENCIAS = [
  '¿Cómo era Barranquilla a comienzos del siglo XX?',
  'Periódicos del siglo XIX',
  'Fotos del río Magdalena',
  'Documentos de la Asamblea Departamental',
];

const estiloSugerencia = {
  justifyContent: 'flex-start',
  textAlign: 'left',
  minHeight: 44,
  px: 2,
  borderRadius: 4.5,
  border: `2px solid ${colores.azulMarino}`,
  bgcolor: '#FFFFFF',
  color: colores.azulMarino,
  fontFamily: 'body1.fontFamily',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: 1.3,
  '&:hover': { bgcolor: colores.crema },
} as const;

/** Explorar con los mismos filtros que usó Miga, para ver más resultados. */
function enlaceExplorar(pregunta: string) {
  const { palabras, tipo, decada } = filtrosDePregunta(pregunta);
  const params = new URLSearchParams();
  if (palabras[0]) params.set('busqueda', palabras[0]);
  if (tipo) params.set('tipo', tipo);
  if (decada !== undefined) params.set('decada', String(decada));
  const consulta = params.toString();
  return consulta ? `${RUTA_EXPLORAR}?${consulta}` : RUTA_EXPLORAR;
}

interface PropsTurno {
  turno: TurnoConversacion;
  onPreguntar: (texto: string) => void;
  onNavegar: () => void;
}

function Turno({ turno, onPreguntar, onNavegar }: PropsTurno) {
  const { respuesta } = turno;
  const sinPiezas = respuesta.piezas.length === 0;
  const sugerencias = sinPiezas ? SUGERENCIAS.slice(0, 2) : respuesta.sugerencias;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <MensajePersona>{turno.pregunta}</MensajePersona>
      <MensajeMiga>
        {sinPiezas && (
          <Box
            component="img"
            src={migaSorpresa}
            alt=""
            sx={{ float: 'right', width: 64, ml: 1, mt: -0.5 }}
          />
        )}
        {sinPiezas && <strong>¡Uy! </strong>}
        {respuesta.mensaje}
      </MensajeMiga>
      {respuesta.modo === 'BUSQUEDA' && <AvisoModoBusqueda />}

      {!sinPiezas && (
        <Box
          component="ul"
          aria-label="Piezas recomendadas por Miga"
          sx={{
            m: 0,
            ml: '44px',
            p: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1.25,
          }}
        >
          {respuesta.piezas.map((pieza) => (
            <li key={pieza.codigo}>
              <TarjetaRecomendacion pieza={pieza} onAbrir={onNavegar} />
            </li>
          ))}
        </Box>
      )}

      {(sugerencias.length > 0 || !sinPiezas) && (
        <Box sx={{ ml: '44px', display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {sugerencias.map((s) => (
            <Button key={s} onClick={() => onPreguntar(s)} sx={{ ...estiloSugerencia, py: 0.5 }}>
              {s}
            </Button>
          ))}
          {!sinPiezas && (
            <Link
              component={RouterLink}
              to={enlaceExplorar(turno.pregunta)}
              onClick={onNavegar}
              sx={{ fontFamily: 'h1.fontFamily', fontWeight: 700, fontSize: 14 }}
            >
              Ver más en Explorar →
            </Link>
          )}
        </Box>
      )}
    </Box>
  );
}

interface Props {
  id: string;
  abierto: boolean;
  onCerrar: () => void;
  conversacion: ReturnType<typeof useConversacionMiga>;
}

/**
 * El chat con Miga. En el computador es una ventana sobre la página, encima del botón flotante;
 * en el celular sube como una hoja desde abajo.
 */
export function ChatMiga({ id, abierto, onCerrar, conversacion }: Props) {
  const tema = useTheme();
  const movil = useMediaQuery(tema.breakpoints.down('sm'));
  const idTitulo = useId();
  const idAyuda = useId();
  const [texto, setTexto] = useState('');
  const campo = useRef<HTMLTextAreaElement>(null);
  const final = useRef<HTMLDivElement>(null);
  const { turnos, preguntar, reiniciar, pensando, enCurso, error } = conversacion;

  // al abrir, se puede escribir de una vez
  useEffect(() => {
    if (abierto) requestAnimationFrame(() => campo.current?.focus());
  }, [abierto]);

  // la respuesta nueva queda a la vista
  useEffect(() => {
    final.current?.scrollIntoView({ block: 'end' });
  }, [turnos.length, pensando]);

  const enviar = (evento?: FormEvent) => {
    evento?.preventDefault();
    if (!texto.trim() || pensando) return;
    preguntar(texto);
    setTexto('');
  };

  const alTeclear = (evento: KeyboardEvent) => {
    // Enter envía; Mayús + Enter hace un salto de línea
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      enviar();
    }
  };

  const alNavegar = () => {
    if (movil) onCerrar();
  };

  const lleno = texto.length >= LIMITE_PREGUNTA;

  const contenido = (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: colores.azulMarino }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCerrar();
      }}
    >
      <Box
        sx={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pl: 2.25,
          pr: 1,
          py: 1.5,
          bgcolor: colores.azulMarino,
          color: '#FFFFFF',
          '--color-foco': colores.amarillo,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <AvatarMiga tamano={46} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              id={idTitulo}
              component="h2"
              sx={{ fontFamily: 'h1.fontFamily', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}
            >
              Miga
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.85 }}>
              Guardiana de la memoria del Atlántico
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flex: 'none' }}>
          {turnos.length > 0 && (
            <IconButton
              onClick={() => {
                reiniciar();
                campo.current?.focus();
              }}
              aria-label="Nueva conversación"
              sx={{ color: '#FFFFFF', width: 44, height: 44 }}
            >
              <RestartAltIcon />
            </IconButton>
          )}
          <IconButton
            onClick={onCerrar}
            aria-label="Cerrar a Miga"
            sx={{ color: '#FFFFFF', width: 44, height: 44 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        aria-live="polite"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <MensajeMiga>
          <strong>¡Hola! Soy Miga.</strong> Dime qué te da curiosidad —una época, un lugar, un tema—
          y te muestro lo que hay en el archivo.
        </MensajeMiga>

        {turnos.length === 0 && !pensando && (
          <Box sx={{ ml: '44px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {SUGERENCIAS.map((s) => (
              <Button key={s} onClick={() => preguntar(s)} sx={estiloSugerencia}>
                {s}
              </Button>
            ))}
          </Box>
        )}

        {turnos.map((turno) => (
          <Turno key={turno.id} turno={turno} onPreguntar={preguntar} onNavegar={alNavegar} />
        ))}

        {enCurso && (
          <>
            <MensajePersona>{enCurso}</MensajePersona>
            <MigaPensando />
          </>
        )}

        {error && !pensando && (
          <MensajeMiga>
            No pude conectarme con el archivo. Revisa tu conexión e inténtalo de nuevo en un
            momento.
          </MensajeMiga>
        )}
        <div ref={final} />
      </Box>

      <Box
        component="form"
        onSubmit={enviar}
        sx={{
          flex: 'none',
          px: 1.75,
          pt: 1.25,
          pb: movil ? 2.5 : 1.5,
          borderTop: '1px solid #EFE3CC',
          bgcolor: colores.papel,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        <Box
          component="label"
          htmlFor={`${id}-pregunta`}
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
          }}
        >
          Escríbele a Miga
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Box
            component="textarea"
            id={`${id}-pregunta`}
            ref={campo}
            rows={1}
            value={texto}
            maxLength={LIMITE_PREGUNTA}
            onChange={(e) => setTexto(e.target.value.slice(0, LIMITE_PREGUNTA))}
            onKeyDown={alTeclear}
            placeholder="Pregúntale a Miga…"
            aria-describedby={idAyuda}
            aria-invalid={lleno || undefined}
            sx={{
              flex: 1,
              minWidth: 0,
              boxSizing: 'border-box',
              minHeight: 50,
              maxHeight: 120,
              resize: 'none',
              fieldSizing: 'content',
              px: 2,
              py: 1.5,
              borderRadius: 6,
              border: `2px solid ${lleno ? '#A8320F' : colores.azulMarino}`,
              bgcolor: '#FFFFFF',
              color: colores.azulMarino,
              font: 'inherit',
              fontSize: 15,
              lineHeight: 1.35,
              '&::placeholder': { color: '#6B7891' },
            }}
          />
          <IconButton
            type="submit"
            aria-label="Enviar pregunta"
            disabled={!texto.trim() || pensando}
            sx={{
              flex: 'none',
              width: 50,
              height: 50,
              bgcolor: colores.naranja,
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#A8320F' },
              '&.Mui-disabled': { bgcolor: '#E8C3B6', color: '#FFFFFF' },
            }}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </Box>
        <Typography
          id={idAyuda}
          component="p"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            fontSize: 12,
            color: lleno ? '#A8320F' : 'text.secondary',
            fontWeight: lleno ? 600 : 400,
          }}
        >
          <span>
            {lleno
              ? 'Acórtala un poco: Miga lee hasta 500 caracteres.'
              : 'Usa IA, pero solo recomienda piezas del archivo.'}
          </span>
          <Box component="span" sx={{ flex: 'none', fontVariantNumeric: 'tabular-nums' }}>
            {texto.length} / {LIMITE_PREGUNTA}
          </Box>
        </Typography>
      </Box>
    </Box>
  );

  if (movil) {
    return (
      <Drawer
        anchor="bottom"
        open={abierto}
        onClose={onCerrar}
        PaperProps={{
          id,
          'aria-labelledby': idTitulo,
          sx: { height: '88dvh', borderRadius: '28px 28px 0 0', overflow: 'hidden' },
        }}
      >
        {contenido}
      </Drawer>
    );
  }

  if (!abierto) return null;
  return (
    <Paper
      id={id}
      role="dialog"
      aria-labelledby={idTitulo}
      elevation={0}
      sx={{
        position: 'fixed',
        zIndex: (t) => t.zIndex.speedDial,
        right: 28,
        bottom: 132,
        width: 420,
        height: 'min(640px, calc(100vh - 170px))',
        borderRadius: 7,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        boxShadow: '0 24px 60px rgba(14, 45, 107, .35)',
      }}
    >
      {contenido}
    </Paper>
  );
}
