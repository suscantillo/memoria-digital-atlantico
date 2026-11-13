import Box from '@mui/material/Box';
import { colores } from '../../../app/tema';

export type Pestana = 'sin-asignar' | 'asignados' | 'todos' | 'revisados';

export interface OpcionPestana {
  valor: Pestana;
  texto: string;
  /** null mientras se cuenta. */
  conteo: number | null;
}

interface Props {
  pestanas: OpcionPestana[];
  actual: Pestana;
  onCambiar: (pestana: Pestana) => void;
}

/**
 * ADMIN: «Sin asignar», «Asignados», «Todos» y «Revisados». PERSONAL: «Por revisar» y
 * «Revisados». Lo revisado se vuelve a ver aquí, sin poder decidir otra vez.
 */
export function PestanasCola({ pestanas, actual, onCambiar }: Props) {
  return (
    <Box
      role="tablist"
      aria-label="Escaneos en revisión"
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
    >
      {pestanas.map(({ valor, texto, conteo }) => {
        const activa = valor === actual;
        return (
          <Box
            key={valor}
            component="button"
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(valor)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 44,
              px: 2,
              border: 0,
              borderRadius: 999,
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 800,
              bgcolor: activa ? colores.azulMarino : '#FFFFFF',
              color: activa ? '#FFFFFF' : colores.azulMarino,
              boxShadow: activa ? `0 4px 0 ${colores.naranja}` : '0 4px 0 #F5D79E',
              transition: 'transform .15s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            {texto}
            <Box
              component="span"
              sx={{
                minWidth: 26,
                px: 0.75,
                borderRadius: 999,
                fontSize: 13,
                lineHeight: '22px',
                bgcolor: activa ? colores.amarillo : '#FFF1C9',
                color: colores.azulMarino,
              }}
            >
              {conteo ?? '…'}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
