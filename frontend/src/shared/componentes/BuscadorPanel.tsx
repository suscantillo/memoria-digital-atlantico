import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { colores } from '../../app/tema';
import { soloLectores } from './TablaPanel';

interface Props {
  id: string;
  etiqueta: string;
  placeholder: string;
  valor: string;
  onCambiar: (valor: string) => void;
}

export function BuscadorPanel({ id, etiqueta, placeholder, valor, onCambiar }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2.25,
        bgcolor: '#FFFFFF',
        borderRadius: 999,
        boxShadow: '0 6px 0 #F5D79E',
        '&:focus-within': { outline: `3px solid ${colores.naranja}`, outlineOffset: 2 },
      }}
    >
      <SearchIcon aria-hidden sx={{ color: colores.azulMarino }} />
      <Box component="label" htmlFor={id} sx={soloLectores}>
        {etiqueta}
      </Box>
      <InputBase
        id={id}
        type="search"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        sx={{ flex: 1, minWidth: 0, height: 52, fontSize: 17 }}
      />
    </Box>
  );
}
