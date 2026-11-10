import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent, type HTMLAttributes } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { useUbicaciones } from '../../ubicaciones/hooks';
import type { Ubicacion } from '../../ubicaciones/tipos';
import { useCrearPieza } from '../hooks';
import { ANIO_MAXIMO, ANIO_MINIMO, NOMBRE_TIPO, type TipoPieza } from '../tipos';

const TIPOS: { tipo: TipoPieza; Icono: typeof ArticleIcon; ejemplo: string }[] = [
  { tipo: 'DOCUMENTO', Icono: ArticleIcon, ejemplo: 'Cartas, actas, planos' },
  { tipo: 'FOTOGRAFIA', Icono: PhotoCameraIcon, ejemplo: 'Copias en papel, negativos' },
  { tipo: 'PERIODICO', Icono: NewspaperIcon, ejemplo: 'Ediciones y recortes' },
];

// MUI pasa key dentro de las props de cada opción, y React no acepta key dentro de un spread
function separarClave({ key, ...resto }: HTMLAttributes<HTMLLIElement> & { key: unknown }) {
  return { clave: String(key), resto };
}

/** Registro de una pieza nueva (HU-06): al guardarla la API le asigna su código MDA-AAAA-NNNN. */
export function PaginaNuevaPieza() {
  const navegar = useNavigate();
  const crear = useCrearPieza();
  const [tipo, setTipo] = useState<TipoPieza | null>(null);
  const [titulo, setTitulo] = useState('');
  const [anio, setAnio] = useState('');
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [textoCaja, setTextoCaja] = useState('');
  const [escrito, setEscrito] = useState('');
  const [busquedaCaja, setBusquedaCaja] = useState('');
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setBusquedaCaja(escrito), 300);
    return () => clearTimeout(temporizador);
  }, [escrito]);

  const cajas = useUbicaciones({
    pagina: 1,
    limite: 20,
    orden: 'deposito',
    direccion: 'asc',
    busqueda: busquedaCaja || undefined,
  });

  const numeroAnio = Number(anio);
  const errores = {
    tipo: !tipo,
    titulo: titulo.trim() === '',
    anio: !Number.isInteger(numeroAnio) || numeroAnio < ANIO_MINIMO || numeroAnio > ANIO_MAXIMO,
    ubicacion: !ubicacion,
  };
  const mostrar = (campo: keyof typeof errores) => intentado && errores[campo];

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIntentado(true);
    if (!tipo || !ubicacion || errores.titulo || errores.anio) return;
    crear.mutate(
      { tipo, titulo: titulo.trim(), anio: numeroAnio, ubicacionId: ubicacion.id },
      {
        onSuccess: (pieza) =>
          navegar(`/panel/piezas/${pieza.id}`, { replace: true, state: { creada: true } }),
      },
    );
  };

  return (
    <Stack spacing={3}>
      <Link
        component={RouterLink}
        to="/panel/inventario"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: 700,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowBackIcon fontSize="small" aria-hidden />
        Inventario
      </Link>
      <EncabezadoPanel
        titulo="Nueva pieza"
        descripcion="El código MDA-AAAA-NNNN se asigna solo al guardar. Después podrás imprimir su QR y cargar el escaneo."
      />

      <Box
        component="form"
        onSubmit={enviar}
        noValidate
        sx={{
          maxWidth: 760,
          p: { xs: 2.5, md: 4 },
          bgcolor: '#FFFFFF',
          borderRadius: 5,
          boxShadow: '0 6px 0 #F5D79E',
        }}
      >
        <Stack spacing={3}>
          <Box component="fieldset" sx={{ m: 0, p: 0, border: 0, minWidth: 0 }}>
            <Typography component="legend" sx={{ fontWeight: 800, mb: 1.25 }}>
              Tipo de pieza
            </Typography>
            <Box
              role="radiogroup"
              aria-describedby={mostrar('tipo') ? 'error-tipo' : undefined}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              {TIPOS.map(({ tipo: opcion, Icono, ejemplo }) => {
                const elegido = tipo === opcion;
                return (
                  <Box
                    key={opcion}
                    component="label"
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.75,
                      cursor: 'pointer',
                      borderRadius: 4,
                      border: `3px solid ${elegido ? colores.azulMarino : mostrar('tipo') ? '#A8320F' : '#E2CFA3'}`,
                      bgcolor: elegido ? colores.crema : '#FFFFFF',
                      '&:focus-within': {
                        outline: `3px solid ${colores.naranja}`,
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={opcion}
                      checked={elegido}
                      onChange={() => setTipo(opcion)}
                      style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                    />
                    <Box
                      aria-hidden
                      sx={{
                        flex: 'none',
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: elegido ? colores.azulMarino : colores.crema,
                        color: elegido ? colores.amarillo : colores.azulMarino,
                      }}
                    >
                      <Icono />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800 }}>{NOMBRE_TIPO[opcion]}</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {ejemplo}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            {mostrar('tipo') && (
              <FormHelperText id="error-tipo" error>
                Elige el tipo de pieza.
              </FormHelperText>
            )}
          </Box>

          <TextField
            id="pieza-titulo"
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            error={mostrar('titulo')}
            helperText={
              mostrar('titulo')
                ? 'Escribe el título de la pieza.'
                : 'Como aparece en el documento o como lo describe el archivo.'
            }
            required
            fullWidth
          />

          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, gap: 2 }}
          >
            <TextField
              id="pieza-anio"
              label="Año"
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              error={mostrar('anio')}
              helperText={`Entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}.`}
              slotProps={{
                htmlInput: { min: ANIO_MINIMO, max: ANIO_MAXIMO, inputMode: 'numeric' },
              }}
              required
              sx={{ '& input': { fontFamily: FUENTE_FICHA, fontWeight: 700 } }}
            />
            <Autocomplete
              id="pieza-caja"
              options={cajas.data?.datos ?? []}
              value={ubicacion}
              onChange={(_, valor) => setUbicacion(valor)}
              inputValue={textoCaja}
              onInputChange={(_, valor, razon) => {
                setTextoCaja(valor);
                // al elegir una caja el campo muestra su etiqueta; eso no es una búsqueda nueva
                if (razon === 'input') setEscrito(valor);
              }}
              // la API ya filtra por lo escrito; MUI no debe volver a filtrar
              filterOptions={(opciones) => opciones}
              getOptionLabel={(u) => u.etiqueta}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              loading={cajas.isFetching}
              loadingText="Buscando cajas…"
              noOptionsText={
                <>
                  No hay cajas con ese nombre.{' '}
                  <Link component={RouterLink} to="/panel/ubicaciones">
                    Registrar una ubicación
                  </Link>
                </>
              }
              renderOption={(props, u) => {
                const { clave, resto } = separarClave(props);
                return (
                  <Box
                    component="li"
                    key={clave}
                    {...resto}
                    sx={{ flexDirection: 'column', alignItems: 'flex-start !important' }}
                  >
                    <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700 }}>
                      {u.etiqueta}
                    </Typography>
                    {u.descripcion && (
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {u.descripcion}
                      </Typography>
                    )}
                  </Box>
                );
              }}
              renderInput={(parametros) => (
                <TextField
                  {...parametros}
                  label="Caja"
                  placeholder="Busca por depósito, estantería o caja"
                  error={mostrar('ubicacion')}
                  helperText={
                    mostrar('ubicacion')
                      ? 'Elige la caja donde se guarda.'
                      : 'Donde se guarda el original.'
                  }
                  required
                />
              )}
            />
          </Box>

          {crear.isError && <MensajeError error={crear.error} titulo="No se registró la pieza" />}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              disabled={crear.isPending}
              sx={{ borderRadius: 999, px: 4, fontWeight: 800, boxShadow: '0 5px 0 #8F2A0C' }}
            >
              {crear.isPending ? 'Registrando…' : 'Registrar pieza'}
            </Button>
            <Button
              component={RouterLink}
              to="/panel/inventario"
              sx={{ borderRadius: 999, fontWeight: 700 }}
            >
              Cancelar
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
