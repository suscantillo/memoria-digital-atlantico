import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';
import { useState, type DragEvent, type FormEvent } from 'react';
import { colores } from '../../../app/tema';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { soloLectores } from '../../../shared/componentes/TablaPanel';
import { useCargarArchivo } from '../hooks';

const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
const EXTENSIONES = '.jpg,.jpeg,.png,.webp,.tif,.tiff,.pdf';
const MAXIMO_BYTES = 20 * 1024 * 1024;

const tamano = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function revisarArchivo(archivo: File): string | null {
  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    return 'Ese formato no se acepta. Usa JPG, PNG, WEBP, TIFF o PDF.';
  }
  if (archivo.size > MAXIMO_BYTES) {
    return `Pesa ${tamano(archivo.size)}; el máximo es 20 MB.`;
  }
  return null;
}

interface Props {
  piezaId: string;
  codigo: string;
  onCargado: () => void;
}

/** Subir el escaneo con sus metadatos (HU-09); queda EN_REVISION para control de calidad. */
export function CargaEscaneo({ piezaId, codigo, onCargado }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [tema, setTema] = useState('');
  const [autor, setAutor] = useState('');
  const [palabras, setPalabras] = useState<string[]>([]);
  const [encima, setEncima] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const cargar = useCargarArchivo(piezaId, setProgreso);

  const elegir = (elegido: File | undefined) => {
    if (!elegido) return;
    const problema = revisarArchivo(elegido);
    setErrorArchivo(problema);
    setArchivo(problema ? null : elegido);
  };

  const soltar = (evento: DragEvent<HTMLLabelElement>) => {
    evento.preventDefault();
    setEncima(false);
    elegir(evento.dataTransfer.files[0]);
  };

  const faltan = {
    archivo: !archivo,
    tema: !tema.trim(),
    autor: !autor.trim(),
    palabras: palabras.length === 0,
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentado(true);
    if (!archivo || faltan.tema || faltan.autor || faltan.palabras) return;
    setProgreso(0);
    cargar.mutate(
      { archivo, tema: tema.trim(), autor: autor.trim(), palabrasClave: palabras },
      { onSuccess: onCargado },
    );
  };

  const yaEspera = cargar.error instanceof AxiosError && cargar.error.response?.status === 409;

  return (
    <Box
      component="form"
      onSubmit={enviar}
      noValidate
      aria-label={`Cargar el escaneo de ${codigo}`}
    >
      <Stack spacing={2}>
        <Box
          component="label"
          htmlFor="archivo-escaneo"
          onDragOver={(e: DragEvent<HTMLLabelElement>) => {
            e.preventDefault();
            setEncima(true);
          }}
          onDragLeave={() => setEncima(false)}
          onDrop={soltar}
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: 4,
            border: `3px dashed ${
              (intentado && faltan.archivo) || errorArchivo ? '#A8320F' : colores.azulMarino
            }`,
            bgcolor: encima ? '#FFE7A8' : '#FFFFFF',
            transition: 'background-color .15s',
            '&:focus-within': { outline: `3px solid ${colores.naranja}`, outlineOffset: 2 },
          }}
        >
          {archivo ? (
            <>
              <InsertDriveFileIcon
                aria-hidden
                sx={{ fontSize: 40, color: colores.turquesaOscuro }}
              />
              <Typography
                sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, overflowWrap: 'anywhere' }}
              >
                {archivo.name}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                {tamano(archivo.size)} · Toca para cambiarlo
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon aria-hidden sx={{ fontSize: 44, color: colores.naranja }} />
              <Typography sx={{ fontWeight: 800 }}>Arrastra el escaneo o elígelo</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                JPG, PNG, WEBP, TIFF o PDF · hasta 20 MB
              </Typography>
            </>
          )}
          <Box
            component="input"
            id="archivo-escaneo"
            type="file"
            accept={EXTENSIONES}
            aria-describedby="ayuda-archivo"
            onChange={(e) => elegir(e.target.files?.[0])}
            sx={soloLectores}
          />
        </Box>
        <FormHelperText
          id="ayuda-archivo"
          error={Boolean(errorArchivo) || (intentado && faltan.archivo)}
        >
          {errorArchivo ?? (intentado && faltan.archivo ? 'Elige el archivo del escaneo.' : '')}
        </FormHelperText>

        <TextField
          id="escaneo-tema"
          label="Tema"
          placeholder="Ej.: Carnaval, comercio portuario…"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          error={intentado && faltan.tema}
          helperText={intentado && faltan.tema ? 'Escribe el tema.' : undefined}
          required
          fullWidth
        />
        <TextField
          id="escaneo-autor"
          label="Autor"
          placeholder="Persona, fotógrafo o periódico; «Desconocido» si no se sabe"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          error={intentado && faltan.autor}
          helperText={intentado && faltan.autor ? 'Escribe el autor.' : undefined}
          required
          fullWidth
        />
        <Autocomplete
          id="escaneo-palabras"
          multiple
          freeSolo
          // al salir del campo lo escrito se vuelve palabra clave; si no, se perdería al guardar
          autoSelect
          options={[]}
          value={palabras}
          onChange={(_, valor) =>
            setPalabras([...new Set(valor.map((p) => p.trim().toLowerCase()).filter(Boolean))])
          }
          renderTags={(valor, propsEtiqueta) =>
            valor.map((palabra, i) => {
              const { key, ...resto } = propsEtiqueta({ index: i });
              return <Chip key={key} label={palabra} {...resto} />;
            })
          }
          renderInput={(parametros) => (
            <TextField
              {...parametros}
              label="Palabras clave"
              placeholder={palabras.length ? '' : 'Escribe una y pulsa Enter'}
              error={intentado && faltan.palabras}
              helperText={
                intentado && faltan.palabras
                  ? 'Agrega al menos una palabra clave.'
                  : 'Pulsa Enter después de cada palabra.'
              }
              required
            />
          )}
        />

        {cargar.isPending && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progreso}
              aria-label="Subiendo el escaneo"
            />
            <Typography sx={{ mt: 0.5, fontSize: 14 }}>Subiendo… {progreso} %</Typography>
          </Box>
        )}
        <Box aria-live="assertive">
          {yaEspera ? (
            <MensajeError
              error={cargar.error}
              titulo="Esta pieza ya tiene un escaneo esperando revisión"
            />
          ) : (
            cargar.isError && <MensajeError error={cargar.error} titulo="No se cargó el escaneo" />
          )}
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          startIcon={<CloudUploadIcon />}
          disabled={cargar.isPending}
          sx={{ alignSelf: 'flex-start', borderRadius: 999, px: 3, fontWeight: 800 }}
        >
          {cargar.isPending ? 'Cargando…' : 'Cargar y enviar a revisión'}
        </Button>
      </Stack>
    </Box>
  );
}
