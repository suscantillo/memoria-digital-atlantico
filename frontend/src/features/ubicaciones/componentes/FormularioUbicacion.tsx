import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useCrearUbicacion } from '../hooks';
import type { CrearUbicacion } from '../tipos';

const VACIO: CrearUbicacion = { deposito: '', estanteria: '', caja: '', descripcion: '' };

export function FormularioUbicacion() {
  const [valores, setValores] = useState<CrearUbicacion>(VACIO);
  const [intentado, setIntentado] = useState(false);
  const crear = useCrearUbicacion();

  const faltan = {
    deposito: valores.deposito.trim() === '',
    estanteria: valores.estanteria.trim() === '',
    caja: valores.caja.trim() === '',
  };
  const invalido = faltan.deposito || faltan.estanteria || faltan.caja;

  const cambiar = (campo: keyof CrearUbicacion) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentado(true);
    if (invalido) return;
    crear.mutate(valores, {
      onSuccess: () => {
        setValores(VACIO);
        setIntentado(false);
      },
    });
  };

  return (
    <Box component="form" onSubmit={enviar} noValidate aria-labelledby="titulo-nueva-ubicacion">
      <Typography id="titulo-nueva-ubicacion" variant="h2" component="h2" gutterBottom>
        Nueva ubicación
      </Typography>
      <Stack spacing={2}>
        <TextField
          id="nueva-deposito"
          label="Depósito"
          value={valores.deposito}
          onChange={cambiar('deposito')}
          required
          error={intentado && faltan.deposito}
          helperText={intentado && faltan.deposito ? 'Indica el depósito.' : ' '}
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          id="nueva-estanteria"
          label="Estantería"
          value={valores.estanteria}
          onChange={cambiar('estanteria')}
          required
          error={intentado && faltan.estanteria}
          helperText={intentado && faltan.estanteria ? 'Indica la estantería.' : ' '}
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          id="nueva-caja"
          label="Caja"
          value={valores.caja}
          onChange={cambiar('caja')}
          required
          error={intentado && faltan.caja}
          helperText={intentado && faltan.caja ? 'Indica la caja.' : ' '}
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          id="nueva-descripcion"
          label="Descripción (opcional)"
          value={valores.descripcion ?? ''}
          onChange={cambiar('descripcion')}
          multiline
          minRows={2}
          inputProps={{ maxLength: 500 }}
        />

        <Box aria-live="polite">
          {crear.isError && <MensajeError error={crear.error} titulo="No se pudo guardar" />}
          {crear.isSuccess && (
            <Alert severity="success" onClose={() => crear.reset()}>
              Ubicación «{crear.data.etiqueta}» registrada.
            </Alert>
          )}
        </Box>

        <Button type="submit" variant="contained" disabled={crear.isPending}>
          {crear.isPending ? 'Guardando…' : 'Guardar ubicación'}
        </Button>
      </Stack>
    </Box>
  );
}
