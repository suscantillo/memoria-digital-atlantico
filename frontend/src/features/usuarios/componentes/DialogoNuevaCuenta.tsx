import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, type FormEvent } from 'react';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useCrearCuenta } from '../hooks';
import type { CrearCuenta, CuentaUsuario } from '../tipos';

const ID_TITULO = 'titulo-nueva-cuenta';
const VACIA: CrearCuenta = { nombre: '', correo: '', rol: 'PERSONAL', contrasena: '' };
const PATRON_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ROLES = [
  { rol: 'PERSONAL', detalle: 'Registra piezas, carga escaneos y revisa calidad' },
  { rol: 'ADMIN', detalle: 'Además administra las cuentas del personal' },
] as const;

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onCreada: (cuenta: CuentaUsuario) => void;
}

/** El formulario se desmonta al cerrar la ventana, así que cada apertura empieza vacía. */
function FormularioCuenta({ onCerrar, onCreada }: Omit<Props, 'abierto'>) {
  const [valores, setValores] = useState<CrearCuenta>(VACIA);
  const [intentado, setIntentado] = useState(false);
  const crear = useCrearCuenta();

  const errores = {
    nombre: valores.nombre.trim() === '',
    correo: !PATRON_CORREO.test(valores.correo.trim()),
    contrasena: valores.contrasena.length < 8,
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentado(true);
    if (errores.nombre || errores.correo || errores.contrasena) return;
    crear.mutate(
      { ...valores, nombre: valores.nombre.trim(), correo: valores.correo.trim() },
      { onSuccess: onCreada },
    );
  };

  return (
    <Box component="form" onSubmit={enviar} noValidate aria-labelledby={ID_TITULO}>
      <Stack spacing={2} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF' } }}>
        <TextField
          id="cuenta-nombre"
          label="Nombre completo"
          value={valores.nombre}
          onChange={(e) => setValores((v) => ({ ...v, nombre: e.target.value }))}
          required
          error={intentado && errores.nombre}
          helperText={intentado && errores.nombre ? 'Escribe el nombre.' : ' '}
        />
        <TextField
          id="cuenta-correo"
          label="Correo"
          type="email"
          autoComplete="off"
          value={valores.correo}
          onChange={(e) => setValores((v) => ({ ...v, correo: e.target.value }))}
          required
          error={intentado && errores.correo}
          helperText={intentado && errores.correo ? 'Escribe un correo válido.' : ' '}
        />
        <Box component="fieldset" sx={{ m: 0, p: 0, border: 0 }}>
          <Typography component="legend" sx={{ fontWeight: 800, mb: 1 }}>
            Rol
          </Typography>
          <RadioGroup
            value={valores.rol}
            onChange={(e) =>
              setValores((v) => ({ ...v, rol: e.target.value as CrearCuenta['rol'] }))
            }
            sx={{ gap: 1 }}
          >
            {ROLES.map(({ rol, detalle }) => (
              <FormControlLabel
                key={rol}
                value={rol}
                control={<Radio color="secondary" />}
                label={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box component="span" sx={{ fontWeight: 800 }}>
                      {rol}
                    </Box>
                    <Box component="span" sx={{ fontSize: 14, color: 'text.secondary' }}>
                      {detalle}
                    </Box>
                  </Box>
                }
                sx={{
                  m: 0,
                  pr: 1.5,
                  py: 0.5,
                  border: '2px solid',
                  borderColor: valores.rol === rol ? colores.naranja : '#E2CFA3',
                  borderRadius: 3.5,
                  bgcolor: '#FFFFFF',
                }}
              />
            ))}
          </RadioGroup>
        </Box>
        <TextField
          id="cuenta-contrasena"
          label="Contraseña inicial"
          type="password"
          autoComplete="new-password"
          value={valores.contrasena}
          onChange={(e) => setValores((v) => ({ ...v, contrasena: e.target.value }))}
          required
          error={intentado && errores.contrasena}
          helperText={
            intentado && errores.contrasena
              ? 'Mínimo 8 caracteres.'
              : 'Mínimo 8 caracteres. Entrégala en persona.'
          }
        />

        <Box aria-live="polite">
          {crear.isError && (
            <MensajeError error={crear.error} titulo="No se pudo crear la cuenta" />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
          <Button onClick={onCerrar} sx={{ borderRadius: 999, px: 3, fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={crear.isPending}
            sx={{
              borderRadius: 999,
              px: 3.5,
              fontWeight: 800,
              boxShadow: `0 5px 0 ${colores.azulMarino}`,
            }}
          >
            {crear.isPending ? 'Creando…' : 'Crear cuenta'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export function DialogoNuevaCuenta({ abierto, onCerrar, onCreada }: Props) {
  const tema = useTheme();
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
        sx={{ pr: 7, pt: 3, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 28 }}
      >
        Nueva cuenta del personal
      </DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onCerrar}
        sx={{ position: 'absolute', right: 12, top: 18, color: colores.azulMarino }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pt: '8px !important', pb: 3 }}>
        <FormularioCuenta onCerrar={onCerrar} onCreada={onCreada} />
      </DialogContent>
    </Dialog>
  );
}
