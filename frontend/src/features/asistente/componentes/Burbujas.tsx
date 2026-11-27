import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { colores } from '../../../app/tema';
import migaSaludo from '../../../assets/miga/miga-saludo.webp';

export const VERDE_MIGA = '#E3EFC4';

export function AvatarMiga({ tamano = 34 }: { tamano?: number }) {
  return (
    <Box
      component="img"
      src={migaSaludo}
      alt=""
      sx={{
        flex: 'none',
        width: tamano,
        height: tamano,
        objectFit: 'contain',
        bgcolor: VERDE_MIGA,
        borderRadius: '50%',
      }}
    />
  );
}

/** Lo que dice Miga: avatar a la izquierda y burbuja crema. */
export function MensajeMiga({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
      <AvatarMiga />
      <Box
        sx={{
          minWidth: 0,
          bgcolor: colores.crema,
          borderRadius: '4px 20px 20px 20px',
          px: 2,
          py: 1.5,
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** Lo que preguntó la persona: burbuja azul a la derecha. */
export function MensajePersona({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        alignSelf: 'flex-end',
        maxWidth: '82%',
        bgcolor: colores.azulMarino,
        color: '#FFFFFF',
        borderRadius: '20px 4px 20px 20px',
        px: 2,
        py: 1.5,
        fontSize: 15,
        lineHeight: 1.45,
        overflowWrap: 'anywhere',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </Box>
  );
}

/** HU-24, criterio 2: sin IA, Miga avisa que respondió con el buscador. */
export function AvisoModoBusqueda() {
  return (
    <Box
      role="note"
      sx={{
        ml: '44px',
        display: 'flex',
        gap: 1,
        alignItems: 'flex-start',
        px: 1.5,
        py: 1.25,
        borderRadius: 3,
        bgcolor: '#FFE7A3',
        fontSize: 13.5,
        lineHeight: 1.45,
      }}
    >
      <SearchIcon aria-hidden sx={{ fontSize: 19, mt: '1px' }} />
      <span>
        <strong>Miga está en modo búsqueda.</strong> Te muestra lo que encuentra el buscador del
        archivo con tus palabras.
      </span>
    </Box>
  );
}

const rebote = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: .35; }
  40% { transform: translateY(-5px); opacity: 1; }
`;

/** Mientras llega la respuesta. Con «reducir movimiento» los puntos quedan quietos. */
export function MigaPensando() {
  return (
    <MensajeMiga>
      <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box aria-hidden sx={{ display: 'flex', gap: 0.6 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: colores.azulMarino,
                animation: `${rebote} 1.1s ${i * 0.15}s infinite ease-in-out`,
              }}
            />
          ))}
        </Box>
        Revisando las cajas del archivo…
      </Box>
    </MensajeMiga>
  );
}
