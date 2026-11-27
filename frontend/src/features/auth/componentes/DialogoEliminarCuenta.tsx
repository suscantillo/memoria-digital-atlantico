import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useEliminarMiCuenta } from '../hooks';

const ID_TITULO = 'titulo-eliminar-cuenta';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onEliminada: () => void;
}

export function DialogoEliminarCuenta({ abierto, onCerrar, onEliminada }: Props) {
  const [contrasena, setContrasena] = useState('');
  const eliminar = useEliminarMiCuenta();

  const cerrar = () => {
    if (eliminar.isPending) return;
    setContrasena('');
    eliminar.reset();
    onCerrar();
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!contrasena) return;
    eliminar.mutate(contrasena, { onSuccess: onEliminada });
  };

  return (
    <Dialog
      open={abierto}
      onClose={cerrar}
      fullWidth
      maxWidth="xs"
      aria-labelledby={ID_TITULO}
      PaperProps={{
        component: 'form',
        onSubmit: enviar,
        noValidate: true,
        sx: { bgcolor: colores.papel, borderTop: `8px solid ${colores.naranja}`, borderRadius: 4 },
      }}
    >
      <DialogTitle id={ID_TITULO} sx={{ fontWeight: 900, color: colores.azulMarino }}>
        ¿Eliminar tu cuenta?
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Se borran tu nombre, tu correo y tu consentimiento, y se cierran todas tus sesiones. No se
          puede deshacer.
        </Alert>
        <Typography sx={{ mb: 2 }}>Para confirmar, escribe tu contraseña.</Typography>
        <TextField
          id="contrasena-eliminar"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
          fullWidth
        />
        <Box aria-live="assertive" sx={{ mt: 2 }}>
          {eliminar.isError && <MensajeError error={eliminar.error} />}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={cerrar} disabled={eliminar.isPending}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={!contrasena || eliminar.isPending}
          sx={{ borderRadius: 999 }}
        >
          {eliminar.isPending ? 'Eliminando…' : 'Eliminar mi cuenta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
