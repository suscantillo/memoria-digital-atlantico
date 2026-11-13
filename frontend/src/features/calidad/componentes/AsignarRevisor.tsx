import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { colores } from '../../../app/tema';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useAsignarRevisor, useRevisores } from '../hooks';
import type { ArchivoEnRevision } from '../tipos';

interface Props {
  archivo: ArchivoEnRevision;
  /** Para que la pantalla muestre el revisor nuevo sin esperar a que vuelva la cola. */
  onAsignado: (archivo: ArchivoEnRevision) => void;
}

/**
 * HU-23: el ADMIN elige qué cuenta PERSONAL revisa este escaneo. Quien lo subió no puede
 * revisarlo; se ve en la lista, deshabilitado y con el porqué.
 */
export function AsignarRevisor({ archivo, onAsignado }: Props) {
  const revisores = useRevisores(true);
  const asignar = useAsignarRevisor();
  const [elegido, setElegido] = useState(archivo.revisor?.id ?? '');
  const id = `revisor-${archivo.id}`;
  const cambio = elegido !== '' && elegido !== archivo.revisor?.id;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!cambio) return;
        asignar.mutate(
          { id: archivo.id, revisorId: elegido },
          { onSuccess: (actualizado) => onAsignado(actualizado) },
        );
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1.5,
        borderRadius: 3,
        bgcolor: archivo.revisor ? '#FFFFFF' : '#FFF1C9',
        border: `2px dashed ${archivo.revisor ? '#EBD9B0' : colores.amarillo}`,
      }}
    >
      <Typography id={`${id}-titulo`} sx={{ fontWeight: 800 }}>
        {archivo.revisor ? 'Revisor asignado' : 'Sin revisor asignado'}
      </Typography>
      <TextField
        id={id}
        select
        size="small"
        value={elegido}
        onChange={(e) => {
          setElegido(e.target.value);
          asignar.reset();
        }}
        disabled={revisores.isPending || asignar.isPending}
        helperText={
          revisores.isError
            ? 'No se pudo cargar la lista del personal.'
            : 'Nadie revisa su propio escaneo.'
        }
        error={revisores.isError}
        SelectProps={{ displayEmpty: true, labelId: `${id}-titulo` }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF', borderRadius: 2 } }}
      >
        <MenuItem value="" disabled>
          {revisores.isPending ? 'Cargando personal…' : 'Elige a alguien del personal'}
        </MenuItem>
        {(revisores.data ?? []).map((persona) => {
          const subio = persona.id === archivo.subidoPor.id;
          return (
            <MenuItem key={persona.id} value={persona.id} disabled={subio}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{persona.nombre}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {subio ? 'Subió este escaneo' : persona.correo}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </TextField>
      {cambio && (
        <Button
          type="submit"
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          disabled={asignar.isPending}
          sx={{ alignSelf: 'flex-start', borderRadius: 999, fontWeight: 800 }}
        >
          {asignar.isPending
            ? 'Asignando…'
            : archivo.revisor
              ? 'Cambiar revisor'
              : 'Asignar revisor'}
        </Button>
      )}
      {asignar.isSuccess && !cambio && (
        <Typography role="status" sx={{ fontSize: 14, fontWeight: 700, color: '#005F6B' }}>
          Listo: ahora aparece en la cola de {archivo.revisor?.nombre}. Quedó en el historial de la
          pieza.
        </Typography>
      )}
      {asignar.isError && <MensajeError error={asignar.error} titulo="No se asignó" />}
    </Box>
  );
}
