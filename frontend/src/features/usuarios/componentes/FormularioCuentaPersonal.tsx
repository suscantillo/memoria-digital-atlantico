import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useCrearCuentaPersonal } from '../hooks';
import type { CrearCuentaPersonal } from '../tipos';

const CUENTA_VACIA: CrearCuentaPersonal = {
  nombre: '',
  correo: '',
  contrasenaTemporal: '',
};

export function FormularioCuentaPersonal() {
  const [cuenta, setCuenta] = useState(CUENTA_VACIA);
  const [intento, setIntento] = useState(false);
  const crear = useCrearCuentaPersonal();
  const invalido =
    cuenta.nombre.trim() === '' ||
    cuenta.correo.trim() === '' ||
    cuenta.contrasenaTemporal.length < 12;

  const cambiar =
    (campo: keyof CrearCuentaPersonal) => (evento: React.ChangeEvent<HTMLInputElement>) =>
      setCuenta((actual) => ({ ...actual, [campo]: evento.target.value }));

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntento(true);
    if (invalido) return;
    crear.mutate(cuenta, {
      onSuccess: () => {
        setCuenta(CUENTA_VACIA);
        setIntento(false);
      },
    });
  };

  return (
    <Box component="form" onSubmit={enviar} noValidate aria-labelledby="titulo-cuenta-personal">
      <Typography id="titulo-cuenta-personal" variant="h2" component="h3" gutterBottom>
        Crear cuenta de PERSONAL
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Nombre"
          value={cuenta.nombre}
          onChange={cambiar('nombre')}
          required
          inputProps={{ maxLength: 120 }}
          error={intento && cuenta.nombre.trim() === ''}
          helperText={intento && cuenta.nombre.trim() === '' ? 'Indica el nombre.' : ' '}
        />
        <TextField
          label="Correo"
          type="email"
          value={cuenta.correo}
          onChange={cambiar('correo')}
          required
          inputProps={{ maxLength: 200 }}
          error={intento && cuenta.correo.trim() === ''}
          helperText={intento && cuenta.correo.trim() === '' ? 'Indica el correo.' : ' '}
        />
        <TextField
          label="Contraseña temporal"
          type="password"
          value={cuenta.contrasenaTemporal}
          onChange={cambiar('contrasenaTemporal')}
          required
          inputProps={{ minLength: 12, maxLength: 200 }}
          error={intento && cuenta.contrasenaTemporal.length < 12}
          helperText={
            intento && cuenta.contrasenaTemporal.length < 12
              ? 'Debe tener al menos 12 caracteres.'
              : 'Al menos 12 caracteres.'
          }
        />
        <Box aria-live="polite">
          {crear.isError && (
            <MensajeError error={crear.error} titulo="No se pudo crear la cuenta" />
          )}
          {crear.isSuccess && (
            <Alert severity="success" onClose={() => crear.reset()}>
              Cuenta de PERSONAL creada para {crear.data.correo}.
            </Alert>
          )}
        </Box>
        <Button type="submit" variant="contained" disabled={crear.isPending}>
          {crear.isPending ? 'Creando…' : 'Crear cuenta'}
        </Button>
      </Stack>
    </Box>
  );
}
