import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { colores } from '../../../app/tema';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useCargarEscaneo } from '../hooks';
import { tamanoLegible, type DatosEscaneo, type EscaneoCargado } from '../tipos';

interface Props {
  piezaId: string;
  codigo: string;
  datos: DatosEscaneo;
  onCambiar: () => void;
  onCargado: (escaneo: EscaneoCargado) => void;
}

/** Paso 2 de HU-09: se mira el archivo antes de mandarlo a control de calidad. */
export function VistaPreviaEscaneo({ piezaId, codigo, datos, onCambiar, onCargado }: Props) {
  const [progreso, setProgreso] = useState(0);
  const [revisado, setRevisado] = useState([false, false, false]);
  const cargar = useCargarEscaneo(piezaId, setProgreso);
  const url = useMemo(() => URL.createObjectURL(datos.archivo), [datos.archivo]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const esPdf = datos.archivo.type === 'application/pdf' || /\.pdf$/i.test(datos.archivo.name);
  // los navegadores no muestran TIFF; se ve la ficha del archivo en su lugar
  const esImagenVisible = /^image\/(jpeg|png|webp)$/.test(datos.archivo.type);
  const criterios = [
    'Se ven todas las páginas, completas y derechas',
    'El texto se lee sin hacer zoom',
    `Corresponde a esta pieza (${codigo})`,
  ];
  const listo = revisado.every(Boolean);
  const yaEspera = cargar.error instanceof AxiosError && cargar.error.response?.status === 409;

  const enviar = () => {
    setProgreso(0);
    cargar.mutate(datos, { onSuccess: onCargado });
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.5fr) minmax(0, 1fr)' },
        alignItems: 'start',
      }}
    >
      <Box
        sx={{
          bgcolor: colores.azulMarino,
          borderRadius: '20px',
          p: 2.5,
          display: 'grid',
          gap: 1.5,
          boxShadow: `0 8px 0 ${colores.amarillo}`,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#FFFFFF', minWidth: 0 }}
        >
          <Box
            component="span"
            sx={{
              fontFamily: FUENTE_FICHA,
              fontWeight: 700,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {datos.archivo.name}
          </Box>
          <Box component="span" sx={{ fontSize: 14, color: '#DDE3EE', flex: 'none' }}>
            {tamanoLegible(datos.archivo.size)}
          </Box>
        </Box>
        <Box
          sx={{
            height: { xs: 360, md: 560 },
            bgcolor: '#26334A',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {esImagenVisible ? (
            <Box
              component="img"
              src={url}
              alt={`Vista previa del escaneo de ${codigo}`}
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : esPdf ? (
            <Box
              component="object"
              data={url}
              type="application/pdf"
              aria-label={`Vista previa del PDF de ${codigo}`}
              sx={{ width: '100%', height: '100%', border: 0 }}
            >
              <Typography sx={{ color: '#FFFFFF', p: 3 }}>
                Este navegador no muestra el PDF aquí. Revísalo en tu computador antes de enviarlo.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', color: '#FFFFFF', p: 3 }}>
              <InsertDriveFileIcon aria-hidden sx={{ fontSize: 64, color: colores.amarillo }} />
              <Typography sx={{ mt: 1 }}>
                El navegador no puede mostrar archivos TIFF. Revisa el archivo en tu computador.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '20px',
          p: 3,
          display: 'grid',
          gap: 2,
          boxShadow: '0 8px 0 #F5D79E',
        }}
      >
        <Typography variant="h2" sx={{ m: 0, fontSize: 26 }}>
          Vista previa
        </Typography>
        <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.25 }}>
          {[
            ['Tema', datos.tema],
            ['Autor', datos.autor],
            ['Palabras clave', datos.palabrasClave.join(', ')],
          ].map(([etiqueta, valor]) => (
            <Box key={etiqueta}>
              <Box
                component="dt"
                sx={{
                  fontFamily: FUENTE_FICHA,
                  fontSize: 13,
                  fontWeight: 700,
                  color: colores.naranja,
                }}
              >
                {etiqueta}
              </Box>
              <Box component="dd" sx={{ m: 0, fontWeight: 700, overflowWrap: 'anywhere' }}>
                {valor}
              </Box>
            </Box>
          ))}
        </Box>

        <Box component="fieldset" sx={{ m: 0, p: 0, border: 0, display: 'grid', gap: 0.25 }}>
          <Box component="legend" sx={{ fontWeight: 800, mb: 1 }}>
            Antes de enviar, revisa
          </Box>
          {criterios.map((texto, i) => (
            <FormControlLabel
              key={texto}
              control={
                <Checkbox
                  checked={revisado[i]}
                  onChange={(e) =>
                    setRevisado((anterior) =>
                      anterior.map((v, j) => (j === i ? e.target.checked : v)),
                    )
                  }
                  sx={{ color: colores.naranja, '&.Mui-checked': { color: colores.naranja } }}
                />
              }
              label={texto}
            />
          ))}
        </Box>

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
            <Alert severity="warning">
              {codigo} ya tiene un escaneo esperando revisión. Cuando lo aprueben o lo rechacen
              podrás cargar otro.
            </Alert>
          ) : (
            cargar.isError && <MensajeError error={cargar.error} titulo="No se cargó el escaneo" />
          )}
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<CloudUploadIcon />}
          onClick={enviar}
          disabled={!listo || cargar.isPending}
          sx={{
            borderRadius: 999,
            py: 1.4,
            fontWeight: 800,
            boxShadow: `0 5px 0 ${colores.azulMarino}`,
          }}
        >
          {cargar.isPending ? 'Enviando…' : 'Enviar a control de calidad'}
        </Button>
        {!listo && (
          <Typography sx={{ m: 0, fontSize: 14, color: 'text.secondary', textAlign: 'center' }}>
            Marca las tres revisiones para poder enviarlo.
          </Typography>
        )}
        <Button
          variant="outlined"
          onClick={onCambiar}
          disabled={cargar.isPending}
          sx={{ borderRadius: 999, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
        >
          Cambiar el archivo o los datos
        </Button>
      </Box>
    </Box>
  );
}
