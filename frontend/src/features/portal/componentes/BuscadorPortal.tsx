import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { colores } from '../../../app/tema';

interface Props {
  valorInicial?: string;
  onBuscar: (texto: string) => void;
  compacto?: boolean;
  /** Color de la sombra plana; en la banda turquesa de Explorar va en azul. */
  sombra?: string;
}

/** Buscador en píldora de la portada y de Explorar. Busca en título y descripción. */
export function BuscadorPortal({
  valorInicial = '',
  onBuscar,
  compacto = false,
  sombra = '#F5D79E',
}: Props) {
  const id = useId();
  const [texto, setTexto] = useState(valorInicial);

  // si la búsqueda cambia desde la dirección (atrás, quitar filtros), el campo la sigue
  useEffect(() => setTexto(valorInicial), [valorInicial]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    onBuscar(texto.trim());
  };

  return (
    <Box
      component="form"
      role="search"
      onSubmit={enviar}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        maxWidth: 560,
        py: 0.75,
        pr: 0.75,
        pl: 2.5,
        bgcolor: '#FFFFFF',
        borderRadius: 999,
        boxShadow: `0 8px 0 ${sombra}`,
        '&:focus-within': { outline: `3px solid ${colores.azulMarino}`, outlineOffset: 3 },
      }}
    >
      <SearchIcon aria-hidden sx={{ color: colores.azulMarino }} />
      <Box
        component="label"
        htmlFor={id}
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        Buscar en el archivo
      </Box>
      <InputBase
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar en el archivo…"
        inputProps={{ maxLength: 100 }}
        sx={{
          flex: 1,
          minWidth: 0,
          height: compacto ? 44 : 52,
          fontSize: compacto ? 17 : 19,
          color: colores.azulMarino,
          // el foco se ve en todo el formulario, no solo en el campo
          '& input:focus-visible': { outline: 'none' },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="secondary"
        endIcon={<ArrowForwardIcon />}
        sx={{
          height: compacto ? 44 : 52,
          px: { xs: 2, sm: 3.25 },
          borderRadius: 999,
          fontSize: compacto ? 16 : 18,
          flex: 'none',
        }}
      >
        Buscar
      </Button>
    </Box>
  );
}
