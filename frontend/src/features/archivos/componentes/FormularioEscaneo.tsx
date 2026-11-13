import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type DragEvent, type FormEvent } from 'react';
import { colores } from '../../../app/tema';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import {
  EXTENSIONES_ACEPTADAS,
  MAXIMO_BYTES,
  TIPOS_ACEPTADOS,
  tamanoLegible,
  type DatosEscaneo,
} from '../tipos';

const soloLectores = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
} as const;

function revisarArchivo(archivo: File): string | null {
  // el navegador a veces no conoce el tipo de un TIFF; el servidor revisa el contenido de todos modos
  const porNombre = /\.(jpe?g|png|webp|tiff?|pdf)$/i.test(archivo.name);
  if (!(TIPOS_ACEPTADOS as readonly string[]).includes(archivo.type) && !porNombre) {
    return 'Ese formato no se acepta. Usa JPG, PNG, WEBP, TIFF o PDF.';
  }
  if (archivo.size > MAXIMO_BYTES) {
    return `Pesa ${tamanoLegible(archivo.size)}; el máximo es 20 MB.`;
  }
  if (archivo.size === 0) return 'El archivo está vacío.';
  return null;
}

interface Props {
  codigo: string;
  inicial: DatosEscaneo | null;
  onCancelar: () => void;
  onContinuar: (datos: DatosEscaneo) => void;
}

/** Paso 1 de HU-09: el archivo y sus metadatos. Nada se sube hasta confirmar la vista previa. */
export function FormularioEscaneo({ codigo, inicial, onCancelar, onContinuar }: Props) {
  const [archivo, setArchivo] = useState<File | null>(inicial?.archivo ?? null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [tema, setTema] = useState(inicial?.tema ?? '');
  const [autor, setAutor] = useState(inicial?.autor ?? '');
  const [palabras, setPalabras] = useState<string[]>(inicial?.palabrasClave ?? []);
  const [encima, setEncima] = useState(false);
  const [intentado, setIntentado] = useState(false);

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
    onContinuar({ archivo, tema: tema.trim(), autor: autor.trim(), palabrasClave: palabras });
  };

  return (
    <Box
      component="form"
      onSubmit={enviar}
      noValidate
      aria-label={`Cargar el escaneo de ${codigo}`}
    >
      <Stack spacing={2.25}>
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
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '20px',
            border: `3px dashed ${
              (intentado && faltan.archivo) || errorArchivo ? '#A8320F' : colores.azulMarino
            }`,
            bgcolor: encima ? '#FFE7A8' : colores.papel,
            transition: 'background-color .15s, transform .15s',
            transform: encima ? 'scale(1.01)' : 'none',
            '&:focus-within': { outline: `3px solid ${colores.naranja}`, outlineOffset: 2 },
          }}
        >
          {archivo ? (
            <>
              <InsertDriveFileIcon
                aria-hidden
                sx={{ fontSize: 44, color: colores.turquesaOscuro }}
              />
              <Typography
                sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, overflowWrap: 'anywhere' }}
              >
                {archivo.name}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                {tamanoLegible(archivo.size)} · Toca para cambiarlo
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon aria-hidden sx={{ fontSize: 52, color: colores.naranja }} />
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                Arrastra el escaneo o elígelo
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                JPG, PNG, WEBP, TIFF o PDF · hasta 20 MB
              </Typography>
            </>
          )}
          <Box
            component="input"
            id="archivo-escaneo"
            type="file"
            accept={EXTENSIONES_ACEPTADAS}
            aria-describedby="ayuda-archivo"
            onChange={(e) => elegir(e.target.files?.[0])}
            sx={soloLectores}
          />
        </Box>
        <FormHelperText
          id="ayuda-archivo"
          error={Boolean(errorArchivo) || (intentado && faltan.archivo)}
          sx={{ mt: '4px !important' }}
        >
          {errorArchivo ?? (intentado && faltan.archivo ? 'Elige el archivo del escaneo.' : '')}
        </FormHelperText>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <TextField
            id="escaneo-tema"
            label="Tema"
            placeholder="Ej.: Carnaval, comercio portuario…"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            error={intentado && faltan.tema}
            helperText={intentado && faltan.tema ? 'Escribe el tema.' : undefined}
            inputProps={{ maxLength: 120 }}
            required
            fullWidth
          />
          <TextField
            id="escaneo-autor"
            label="Autor"
            placeholder="Persona, fotógrafo o periódico"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            error={intentado && faltan.autor}
            helperText={
              intentado && faltan.autor ? 'Escribe el autor.' : '«Desconocido» si no se sabe.'
            }
            inputProps={{ maxLength: 120 }}
            required
            fullWidth
          />
        </Box>
        <Autocomplete
          id="escaneo-palabras"
          multiple
          freeSolo
          // al salir del campo lo escrito se vuelve palabra clave; si no, se perdería al continuar
          autoSelect
          options={[]}
          value={palabras}
          onChange={(_, valor) =>
            setPalabras(
              [...new Set(valor.map((p) => p.trim().toLowerCase()).filter(Boolean))].slice(0, 15),
            )
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
                  : 'Pulsa Enter después de cada palabra. Hasta 15.'
              }
              required
            />
          )}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1.25 }}>
          <Button onClick={onCancelar} sx={{ borderRadius: 999, px: 2.5, fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 999,
              px: 3,
              fontWeight: 800,
              boxShadow: `0 5px 0 ${colores.azulMarino}`,
            }}
          >
            Continuar a la vista previa
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
