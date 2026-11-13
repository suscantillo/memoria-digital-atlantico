import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useUbicaciones } from '../../ubicaciones/hooks';
import { useCrearPieza } from '../hooks';
import type { CrearPieza, TipoPieza } from '../tipos';

const ETIQUETAS_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: 'Documento',
  FOTOGRAFIA: 'Fotografía',
  PERIODICO: 'Periódico',
};

const PARAMETROS_UBICACIONES = {
  pagina: 1,
  limite: 100,
  orden: 'deposito',
  direccion: 'asc',
} as const;

export function PaginaNuevaPieza() {
  const [tipo, setTipo] = useState<TipoPieza | ''>('');
  const [titulo, setTitulo] = useState('');
  const [anio, setAnio] = useState('');
  const [ubicacionId, setUbicacionId] = useState('');
  const [intentado, setIntentado] = useState(false);
  const navegar = useNavigate();
  const ubicaciones = useUbicaciones(PARAMETROS_UBICACIONES);
  const crear = useCrearPieza();

  const tituloInvalido = titulo.trim() === '';
  const anioNumero = Number(anio);
  const anioInvalido = !Number.isInteger(anioNumero) || anioNumero < 1500 || anioNumero > 2100;
  const ubicacionInvalida = ubicacionId === '';
  const tipoInvalido = tipo === '';

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (crear.isPending || crear.isSuccess) return;
    setIntentado(true);
    if (tituloInvalido || anioInvalido || ubicacionInvalida || tipoInvalido) return;

    const datos: CrearPieza = {
      tipo,
      titulo: titulo.trim(),
      anio: anioNumero,
      ubicacionId,
    };
    crear.mutate(datos, {
      onSuccess: () => navegar('/panel/inventario?orden=recientes', { replace: true }),
    });
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Box>
        <Typography variant="h1" component="h2">
          Registrar pieza
        </Typography>
        <Typography variant="body1" color="text.secondary">
          La pieza quedará registrada con un código único y asociada a una caja.
        </Typography>
      </Box>

      <Paper component="form" onSubmit={enviar} noValidate sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            id="tipo-pieza"
            label="Tipo"
            select
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value as TipoPieza)}
            required
            error={intentado && tipoInvalido}
            helperText={intentado && tipoInvalido ? 'Selecciona el tipo de pieza.' : ' '}
          >
            {Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => (
              <MenuItem key={valor} value={valor}>
                {etiqueta}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="titulo-pieza"
            label="Título"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            required
            error={intentado && tituloInvalido}
            helperText={intentado && tituloInvalido ? 'El título es obligatorio.' : ' '}
          />

          <TextField
            id="anio-pieza"
            label="Año de la pieza"
            type="number"
            value={anio}
            onChange={(evento) => setAnio(evento.target.value)}
            required
            inputProps={{ min: 1500, max: 2100, step: 1 }}
            error={intentado && anioInvalido}
            helperText={intentado && anioInvalido ? 'Ingresa un año entre 1500 y 2100.' : ' '}
          />

          {ubicaciones.isError && (
            <MensajeError error={ubicaciones.error} titulo="No se pudieron cargar las cajas" />
          )}
          {ubicaciones.isSuccess && (
            <TextField
              id="ubicacion-pieza"
              label="Caja"
              select
              value={ubicacionId}
              onChange={(evento) => setUbicacionId(evento.target.value)}
              required
              error={intentado && ubicacionInvalida}
              helperText={
                intentado && ubicacionInvalida ? 'Selecciona la caja donde está la pieza.' : ' '
              }
            >
              {ubicaciones.data.datos.map((ubicacion) => (
                <MenuItem key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.etiqueta}
                </MenuItem>
              ))}
            </TextField>
          )}
          {ubicaciones.isSuccess && ubicaciones.data.datos.length === 0 && (
            <Alert severity="warning">Registra una ubicación antes de crear piezas.</Alert>
          )}
          {ubicaciones.isPending && <Alert severity="info">Cargando cajas disponibles…</Alert>}

          <Box aria-live="polite">
            {crear.isError && <MensajeError error={crear.error} titulo="No se pudo registrar" />}
            {crear.isSuccess && (
              <Alert severity="success">
                Pieza registrada con el código <strong>{crear.data.codigo}</strong>.
              </Alert>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={
              crear.isPending || crear.isSuccess || ubicaciones.isPending || ubicaciones.isError
            }
          >
            {crear.isPending ? 'Registrando…' : 'Registrar pieza'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
