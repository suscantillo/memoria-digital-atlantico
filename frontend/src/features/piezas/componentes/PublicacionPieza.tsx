import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useCambiarPublicacion } from '../hooks';
import type { FichaPieza } from '../tipos';

/**
 * Solo ADMIN. Una pieza PUBLICADA se retira del portal con motivo (no se borra: vuelve a
 * REVISADA y conserva su escaneo); una REVISADA se publica otra vez.
 */
export function PublicacionPieza({ pieza }: { pieza: FichaPieza }) {
  const cambiar = useCambiarPublicacion(pieza.id);
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [intentado, setIntentado] = useState(false);

  if (pieza.estado !== 'PUBLICADA' && pieza.estado !== 'REVISADA') return null;
  const publicada = pieza.estado === 'PUBLICADA';

  const confirmarRetiro = () => {
    setIntentado(true);
    if (!motivo.trim()) return;
    cambiar.mutate(
      { tipo: 'retirar', motivo: motivo.trim() },
      {
        onSuccess: () => {
          setAbierto(false);
          setMotivo('');
          setIntentado(false);
        },
      },
    );
  };

  return (
    <Paper component="section" aria-labelledby="publicacion-pieza" sx={{ p: 3, maxWidth: 720 }}>
      <Typography id="publicacion-pieza" variant="h2" component="h3" gutterBottom>
        Publicación en el portal
      </Typography>
      <Typography sx={{ mb: 2 }}>
        {publicada
          ? 'Esta pieza se ve en el portal. Si tiene un error, retírala mientras se corrige: no se borra nada y queda en el historial.'
          : 'Esta pieza no está en el portal. Si su escaneo está aprobado, puedes publicarla otra vez.'}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {publicada ? (
          <>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PublicOffIcon />}
              onClick={() => {
                cambiar.reset();
                setAbierto(true);
              }}
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              Retirar del portal
            </Button>
            <Button
              component={RouterLink}
              to={`/p/${pieza.codigo}`}
              target="_blank"
              sx={{ borderRadius: 999, fontWeight: 700 }}
            >
              Ver en el portal
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<PublicIcon />}
            disabled={cambiar.isPending}
            onClick={() => cambiar.mutate({ tipo: 'publicar' })}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {cambiar.isPending ? 'Publicando…' : 'Volver a publicar'}
          </Button>
        )}
      </Box>
      <Box aria-live="polite" sx={{ mt: 2 }}>
        {cambiar.isSuccess && (
          <Alert severity="success">
            {publicada
              ? 'Publicada otra vez: ya se ve en el portal.'
              : 'Retirada del portal. El motivo quedó en el historial.'}
          </Alert>
        )}
        {cambiar.isError && !abierto && (
          <MensajeError error={cambiar.error} titulo="No se pudo cambiar la publicación" />
        )}
      </Box>

      <Dialog
        open={abierto}
        onClose={() => !cambiar.isPending && setAbierto(false)}
        aria-labelledby="titulo-retirar"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="titulo-retirar">Retirar {pieza.codigo} del portal</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Deja de verse en el portal y vuelve a REVISADA. Su escaneo aprobado se conserva para
            publicarla de nuevo.
          </Typography>
          <TextField
            id="motivo-retiro"
            label="¿Por qué la retiras?"
            placeholder="Ej.: la fecha está mal, falta confirmar los derechos…"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            required
            error={intentado && !motivo.trim()}
            helperText={
              intentado && !motivo.trim()
                ? 'Escribe el motivo: queda en el historial de la pieza.'
                : 'Queda en el historial de la pieza.'
            }
            inputProps={{ maxLength: 500 }}
          />
          {cambiar.isError && (
            <Box sx={{ mt: 2 }}>
              <MensajeError error={cambiar.error} titulo="No se pudo retirar" />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAbierto(false)} disabled={cambiar.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={confirmarRetiro}
            disabled={cambiar.isPending}
            sx={{ borderRadius: 999, fontWeight: 800 }}
          >
            {cambiar.isPending ? 'Retirando…' : 'Retirar del portal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
