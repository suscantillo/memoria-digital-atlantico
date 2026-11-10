import PrintIcon from '@mui/icons-material/Print';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import GlobalStyles from '@mui/material/GlobalStyles';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { colores } from '../../../app/tema';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { soloLectores } from '../../../shared/componentes/TablaPanel';
import { useInventario } from '../../inventario/hooks';
import { useUbicaciones } from '../../ubicaciones/hooks';
import { EtiquetaQr } from '../componentes/EtiquetaQr';

const ID_HOJA = 'hoja-etiquetas';

const TAMANOS = {
  grande: { nombre: 'Grande', detalle: '2 × 4 por hoja, para cajas', columnas: 2, porHoja: 8 },
  pequena: {
    nombre: 'Pequeña',
    detalle: '3 × 8 por hoja, para carpetas',
    columnas: 3,
    porHoja: 24,
  },
} as const;

type Tamano = keyof typeof TAMANOS;

const tituloPaso = { fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 22 } as const;

export function PaginaEtiquetas() {
  const [ubicacionId, setUbicacionId] = useState('');
  const [elegidas, setElegidas] = useState<Record<string, boolean>>({});
  const [tamano, setTamano] = useState<Tamano>('grande');
  const ubicaciones = useUbicaciones({
    pagina: 1,
    limite: 50,
    orden: 'deposito',
    direccion: 'asc',
  });
  const piezas = useInventario(
    { pagina: 1, limite: 50, orden: 'codigo', direccion: 'asc', ubicacionId },
    ubicacionId !== '',
  );

  const lista = piezas.data?.datos ?? [];
  const seleccion = lista.filter((p) => elegidas[p.id]);
  const todasMarcadas = lista.length > 0 && lista.every((p) => elegidas[p.id]);
  const { columnas, porHoja } = TAMANOS[tamano];
  const hojas = Math.max(1, Math.ceil(seleccion.length / porHoja));

  return (
    <Stack spacing={3.5}>
      {/* al imprimir solo sale la hoja: el menú y los controles no van al papel */}
      <GlobalStyles
        styles={{
          '@media print': {
            '@page': { size: 'letter', margin: '10mm' },
            'body *': { visibility: 'hidden' },
            [`#${ID_HOJA}, #${ID_HOJA} *`]: { visibility: 'visible' },
            [`#${ID_HOJA}`]: {
              position: 'absolute',
              inset: 0,
              boxShadow: 'none !important',
              padding: '0 !important',
            },
          },
        }}
      />

      <EncabezadoPanel
        titulo="Etiquetas QR"
        descripcion="Imprime las etiquetas para pegar en carpetas y cajas. Cada QR abre la ficha pública de su pieza."
        accion={
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<PrintIcon />}
            disabled={seleccion.length === 0}
            onClick={() => window.print()}
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1.5,
              fontSize: 17,
              fontWeight: 800,
              boxShadow: `0 6px 0 ${colores.azulMarino}`,
            }}
          >
            Imprimir o guardar en PDF
          </Button>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 380px) minmax(0, 1fr)' },
          gap: 3.5,
          alignItems: 'start',
        }}
      >
        <Box
          component="section"
          aria-labelledby="titulo-elegir"
          sx={{
            p: { xs: 2.5, sm: 3 },
            bgcolor: colores.papel,
            borderTop: `8px solid ${colores.naranja}`,
            boxShadow: '8px 8px 0 #F5D79E',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography id="titulo-elegir" component="h2" sx={tituloPaso}>
            1. Elige las piezas
          </Typography>
          <TextField
            select
            id="caja-etiquetas"
            label="Caja"
            value={ubicacionId}
            onChange={(e) => {
              setUbicacionId(e.target.value);
              setElegidas({});
            }}
            helperText={ubicaciones.isError ? 'No se pudieron cargar las cajas.' : ' '}
            error={ubicaciones.isError}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF' } }}
          >
            <MenuItem value="" disabled>
              Elige una caja
            </MenuItem>
            {(ubicaciones.data?.datos ?? []).map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.etiqueta}
              </MenuItem>
            ))}
          </TextField>

          {piezas.isFetching && <CircularProgress size={28} aria-label="Cargando piezas" />}
          {piezas.isError && (
            <MensajeError error={piezas.error} titulo="No se pudieron cargar las piezas" />
          )}
          {piezas.isSuccess && lista.length === 0 && (
            <Typography sx={{ fontWeight: 700 }}>Esta caja no tiene piezas registradas.</Typography>
          )}

          {lista.length > 0 && (
            <>
              <Button
                variant="outlined"
                onClick={() =>
                  setElegidas(Object.fromEntries(lista.map((p) => [p.id, !todasMarcadas])))
                }
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 999,
                  borderWidth: 2,
                  fontWeight: 700,
                  '&:hover': { borderWidth: 2 },
                }}
              >
                {todasMarcadas ? 'Quitar toda la selección' : 'Seleccionar toda la caja'}
              </Button>
              <Box component="fieldset" sx={{ m: 0, p: 0, border: 0 }}>
                <Box component="legend" sx={soloLectores}>
                  Piezas de la caja
                </Box>
                <Stack spacing={1}>
                  {lista.map((p) => (
                    <FormControlLabel
                      key={p.id}
                      control={
                        <Checkbox
                          checked={!!elegidas[p.id]}
                          onChange={(e) => setElegidas((s) => ({ ...s, [p.id]: e.target.checked }))}
                          color="secondary"
                        />
                      }
                      label={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {p.titulo}
                          </Box>
                          <Box
                            component="span"
                            sx={{ fontFamily: FUENTE_FICHA, fontSize: 14, color: 'text.secondary' }}
                          >
                            {p.codigo}
                          </Box>
                        </Box>
                      }
                      sx={{
                        m: 0,
                        pr: 1.5,
                        py: 0.5,
                        border: '2px solid',
                        borderColor: elegidas[p.id] ? colores.naranja : '#E2CFA3',
                        borderRadius: 3.5,
                        bgcolor: elegidas[p.id] ? '#FFF0E8' : '#FFFFFF',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          <Typography id="titulo-tamano" component="h2" sx={{ ...tituloPaso, mt: 1 }}>
            2. Tamaño de la etiqueta
          </Typography>
          <RadioGroup
            aria-labelledby="titulo-tamano"
            value={tamano}
            onChange={(e) => setTamano(e.target.value as Tamano)}
            sx={{ gap: 1 }}
          >
            {(Object.keys(TAMANOS) as Tamano[]).map((clave) => (
              <FormControlLabel
                key={clave}
                value={clave}
                control={<Radio color="secondary" />}
                label={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box component="span" sx={{ fontWeight: 800 }}>
                      {TAMANOS[clave].nombre}
                    </Box>
                    <Box component="span" sx={{ fontSize: 14, color: 'text.secondary' }}>
                      {TAMANOS[clave].detalle}
                    </Box>
                  </Box>
                }
                sx={{
                  m: 0,
                  pr: 1.5,
                  py: 0.5,
                  border: '2px solid',
                  borderColor: tamano === clave ? colores.azulMarino : '#E2CFA3',
                  borderRadius: 3.5,
                  bgcolor: '#FFFFFF',
                }}
              />
            ))}
          </RadioGroup>
        </Box>

        <Box component="section" aria-labelledby="titulo-vista" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 1,
              mb: 1.5,
            }}
          >
            <Typography id="titulo-vista" component="h2" sx={tituloPaso}>
              3. Vista de la hoja
            </Typography>
            <Typography role="status" sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>
              {seleccion.length} {seleccion.length === 1 ? 'etiqueta' : 'etiquetas'} · {hojas}{' '}
              {hojas === 1 ? 'hoja' : 'hojas'}
            </Typography>
          </Box>
          <Box sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: colores.azulMarino, borderRadius: 6 }}>
            <Box
              id={ID_HOJA}
              sx={{
                mx: 'auto',
                maxWidth: 600,
                minHeight: 420,
                p: 2.5,
                bgcolor: '#FFFFFF',
                boxShadow: '0 24px 40px rgba(0, 0, 0, .4)',
                display: 'grid',
                gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
                alignContent: 'start',
                gap: 1.25,
              }}
            >
              {seleccion.map((p) => (
                <EtiquetaQr key={p.id} pieza={p} grande={tamano === 'grande'} />
              ))}
              {seleccion.length === 0 && (
                <Typography
                  sx={{
                    gridColumn: '1 / -1',
                    my: 6,
                    textAlign: 'center',
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  Elige una caja y marca las piezas para ver sus etiquetas.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
