import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { colores } from '../../../app/tema';
import type { Ubicacion } from '../tipos';
import { FormularioUbicacion } from './FormularioUbicacion';

const ID_TITULO = 'titulo-nueva-ubicacion';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onCreada: (ubicacion: Ubicacion) => void;
}

/** Ventana para registrar una ubicación sin salir del listado. Al cerrarse, el formulario se vacía. */
export function DialogoNuevaUbicacion({ abierto, onCerrar, onCreada }: Props) {
  const tema = useTheme();
  // en el celular ocupa toda la pantalla: una ventana flotante deja los campos muy apretados
  const pantallaCompleta = useMediaQuery(tema.breakpoints.down('sm'));

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullScreen={pantallaCompleta}
      fullWidth
      maxWidth="sm"
      aria-labelledby={ID_TITULO}
      PaperProps={{
        sx: {
          bgcolor: colores.papel,
          borderTop: `8px solid ${colores.naranja}`,
          borderRadius: pantallaCompleta ? 0 : 4,
          boxShadow: '8px 10px 0 #F5D79E',
        },
      }}
    >
      <DialogTitle
        id={ID_TITULO}
        sx={{
          pr: 7,
          pt: 3,
          fontFamily: 'h1.fontFamily',
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: '-0.02em',
          color: colores.azulMarino,
        }}
      >
        Nueva ubicación
      </DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onCerrar}
        sx={{ position: 'absolute', right: 12, top: 18, color: colores.azulMarino }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pt: '8px !important', pb: 3 }}>
        <FormularioUbicacion idTitulo={ID_TITULO} onCreada={onCreada} onCancelar={onCerrar} />
      </DialogContent>
    </Dialog>
  );
}
