import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useCrearUbicacion } from '../hooks';
import type { CrearUbicacion, Ubicacion } from '../tipos';

const VACIO: CrearUbicacion = { deposito: '', estanteria: '', caja: '', descripcion: '' };

interface Props {
  /** Id del título que nombra el formulario (el de la ventana que lo contiene). */
  idTitulo: string;
  onCreada: (ubicacion: Ubicacion) => void;
  onCancelar: () => void;
}

export function FormularioUbicacion({ idTitulo, onCreada, onCancelar }: Props) {
  const [valores, setValores] = useState<CrearUbicacion>(VACIO);
  const [intentado, setIntentado] = useState(false);
  const crear = useCrearUbicacion();

  const faltan = {
    deposito: valores.deposito.trim() === '',
    estanteria: valores.estanteria.trim() === '',
    caja: valores.caja.trim() === '',
  };
  const invalido = faltan.deposito || faltan.estanteria || faltan.caja;

  const cambiar = (campo: keyof CrearUbicacion) => (e: ChangeEvent<HTMLInputElement>) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentado(true);
    if (invalido) return;
    crear.mutate(valores, { onSuccess: onCreada });
  };

  return (
    <Box component="form" onSubmit={enviar} noValidate aria-labelledby={idTitulo}>
      {/* sobre el papel, los campos en blanco se distinguen mejor del fondo */}
      <Stack spacing={2} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF' } }}>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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
        </Box>
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
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            onClick={onCancelar}
            sx={{ borderRadius: 999, px: 3, fontWeight: 700, color: colores.azulMarino }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={crear.isPending}
            sx={{ borderRadius: 999, px: 3.5, fontWeight: 800, boxShadow: '0 5px 0 #0E2D6B' }}
          >
            {crear.isPending ? 'Guardando…' : 'Guardar ubicación'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
