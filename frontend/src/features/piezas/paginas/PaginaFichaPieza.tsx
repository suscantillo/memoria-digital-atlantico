import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/useAuth';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { PublicacionPieza } from '../componentes/PublicacionPieza';
import { useEditarPieza, useFichaPieza } from '../hooks';
import type { EditarPieza } from '../tipos';

export function PaginaFichaPieza() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const ficha = useFichaPieza(id);
  const editar = useEditarPieza(id ?? '');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!ficha.data) return;
    setTitulo(ficha.data.titulo);
    setDescripcion(ficha.data.descripcion ?? '');
  }, [ficha.data]);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentado(true);
    if (!titulo.trim()) return;

    const cambios: EditarPieza = {};
    if (titulo.trim() !== pieza.titulo) cambios.titulo = titulo.trim();
    if (descripcion.trim() !== (pieza.descripcion ?? '')) {
      cambios.descripcion = descripcion.trim();
    }
    if (Object.keys(cambios).length > 0) editar.mutate(cambios);
  };

  if (ficha.isPending) {
    return <Alert severity="info">Cargando ficha de la pieza…</Alert>;
  }
  if (ficha.isError) {
    return <MensajeError error={ficha.error} titulo="No se pudo cargar la ficha" />;
  }

  const pieza = ficha.data;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1" component="h2">
          Ficha de pieza
        </Typography>
        <Typography variant="h2" component="h3" color="text.secondary">
          {pieza.codigo}
        </Typography>
      </Box>

      <Paper component="section" aria-labelledby="datos-pieza" sx={{ p: 3 }}>
        <Typography id="datos-pieza" variant="h2" component="h3" gutterBottom>
          Datos de la pieza
        </Typography>
        <Stack spacing={1}>
          <Typography>
            <strong>Tipo:</strong> {pieza.tipo}
          </Typography>
          <Typography>
            <strong>Estado:</strong> {pieza.estado}
          </Typography>
          <Typography>
            <strong>Año:</strong> {pieza.anio}
          </Typography>
          <Typography>
            <strong>Ubicación:</strong> {pieza.ubicacion.deposito} / {pieza.ubicacion.estanteria} /{' '}
            {pieza.ubicacion.caja}
          </Typography>
        </Stack>
      </Paper>

      <Paper
        component="form"
        onSubmit={enviar}
        noValidate
        aria-labelledby="editar-datos-pieza"
        sx={{ p: 3, maxWidth: 720 }}
      >
        <Stack spacing={2}>
          <Typography id="editar-datos-pieza" variant="h2" component="h3">
            Editar ficha
          </Typography>
          <TextField
            id="titulo-pieza"
            label="Título"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            required
            error={intentado && !titulo.trim()}
            helperText={intentado && !titulo.trim() ? 'El título es obligatorio.' : ' '}
          />
          <TextField
            id="descripcion-pieza"
            label="Descripción"
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
            multiline
            minRows={3}
            inputProps={{ maxLength: 5000 }}
          />
          <Box aria-live="polite">
            {editar.isError && <MensajeError error={editar.error} titulo="No se pudo guardar" />}
            {editar.isSuccess && (
              <Alert severity="success">Cambios guardados y añadidos al historial.</Alert>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={
              editar.isPending ||
              (titulo.trim() === pieza.titulo && descripcion.trim() === (pieza.descripcion ?? ''))
            }
          >
            {editar.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </Stack>
      </Paper>

      {usuario?.rol === 'ADMIN' && <PublicacionPieza pieza={pieza} />}

      <Paper component="section" aria-labelledby="historial-pieza" sx={{ p: 3 }}>
        <Typography id="historial-pieza" variant="h2" component="h3" gutterBottom>
          Historial
        </Typography>
        {pieza.eventos.length === 0 ? (
          <Typography color="text.secondary">La pieza aún no tiene eventos.</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={2}>
            {pieza.eventos.map((evento) => (
              <Box key={evento.id}>
                <Typography variant="subtitle1">{evento.accion}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(evento.creadoEn).toLocaleString('es-CO')}
                  {evento.usuarioNombre ? ` · ${evento.usuarioNombre}` : ''}
                </Typography>
                {evento.detalle && <Typography variant="body1">{evento.detalle}</Typography>}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
