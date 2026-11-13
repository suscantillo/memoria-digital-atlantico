import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { useInventario } from '../../inventario/hooks';
import {
  ESTADOS_PIEZA,
  NOMBRE_TIPO,
  type EstadoPieza,
  type PiezaInventario,
} from '../../inventario/tipos';
import { FormularioEscaneo } from '../componentes/FormularioEscaneo';
import { VistaPreviaEscaneo } from '../componentes/VistaPreviaEscaneo';
import { tamanoLegible, type DatosEscaneo, type EscaneoCargado } from '../tipos';

const entra = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
`;
const sinMovimiento = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;
const tarjeta = {
  bgcolor: '#FFFFFF',
  borderRadius: '20px',
  p: { xs: 2.5, md: 3.5 },
  boxShadow: '0 8px 0 #F5D79E',
  animation: `${entra} .5s cubic-bezier(.2, .8, .2, 1) both`,
  ...sinMovimiento,
} as const;

/** Recorrido de la pieza: REGISTRADA → ESCANEADA → REVISADA → PUBLICADA. */
function Recorrido({ estado }: { estado: EstadoPieza }) {
  const actual = ESTADOS_PIEZA.indexOf(estado);
  return (
    <Box
      component="ol"
      aria-label="Recorrido de la pieza"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', gap: 0, overflowX: 'auto' }}
    >
      {ESTADOS_PIEZA.map((paso, i) => {
        const hecho = i < actual;
        const es = i === actual;
        return (
          <Box
            component="li"
            key={paso}
            aria-current={es ? 'step' : undefined}
            sx={{
              flex: '1 1 0',
              minWidth: 76,
              position: 'relative',
              display: 'grid',
              justifyItems: 'center',
              gap: 0.75,
              textAlign: 'center',
              '&::before':
                i === 0
                  ? undefined
                  : {
                      content: '""',
                      position: 'absolute',
                      top: 17,
                      right: '50%',
                      width: '100%',
                      height: 4,
                      bgcolor: i <= actual ? colores.turquesaOscuro : '#EBD9B0',
                    },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                // por encima de la línea que une los pasos
                zIndex: 1,
                width: 38,
                height: 38,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: hecho ? colores.turquesaOscuro : es ? colores.naranja : '#FFFFFF',
                color: hecho || es ? '#FFFFFF' : 'text.secondary',
                border: hecho || es ? 0 : '3px solid #EBD9B0',
                boxShadow: es ? '0 0 0 6px rgba(204, 63, 20, .18)' : 'none',
                fontFamily: 'h1.fontFamily',
                fontWeight: 900,
              }}
            >
              {hecho ? <CheckIcon fontSize="small" /> : i + 1}
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: FUENTE_FICHA,
                fontSize: 13,
                fontWeight: es ? 700 : 600,
                color: hecho || es ? colores.azulMarino : 'text.secondary',
              }}
            >
              {paso}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function Cabecera({ pieza, estado }: { pieza: PiezaInventario; estado: EstadoPieza }) {
  const { deposito, estanteria, caja } = pieza.ubicacion;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1.25 }}>
      <Box
        component="nav"
        aria-label="Ruta"
        sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: 15 }}
      >
        <Box component={RouterLink} to="/panel/inventario" sx={{ color: colores.azulMarino }}>
          Inventario
        </Box>{' '}
        › {pieza.codigo}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Box
          component="span"
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: colores.azulMarino,
            color: '#FFFFFF',
            fontFamily: FUENTE_FICHA,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {pieza.codigo}
        </Box>
        <Box
          component="span"
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: colores.naranja,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {NOMBRE_TIPO[pieza.tipo]}
          {pieza.anio !== null && ` · ${pieza.anio}`}
        </Box>
        <Box component="span" sx={{ alignSelf: 'center', fontFamily: FUENTE_FICHA, fontSize: 14 }}>
          {deposito} · {estanteria} · {caja}
        </Box>
      </Box>
      <Typography
        variant="h1"
        sx={{ m: 0, fontSize: { xs: 32, md: 44 }, lineHeight: 1, letterSpacing: '-0.03em' }}
      >
        {pieza.titulo}
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <Recorrido estado={estado} />
      </Box>
    </Box>
  );
}

function EnRevision({ escaneo }: { escaneo: EscaneoCargado | null }) {
  const { usuario } = useAuth();
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box
        role="status"
        sx={{
          ...tarjeta,
          bgcolor: '#FFE7A8',
          boxShadow: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2.25,
        }}
      >
        <Box
          sx={{
            flex: 'none',
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HourglassTopIcon aria-hidden sx={{ color: '#6E4300', fontSize: 30 }} />
        </Box>
        <Box sx={{ flex: '1 1 300px' }}>
          <Typography
            component="h2"
            sx={{ m: 0, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 22 }}
          >
            {escaneo ? 'Listo: quedó esperando control de calidad' : 'Esperando control de calidad'}
          </Typography>
          <Typography sx={{ m: '4px 0 0' }}>
            El escaneo está EN_REVISION y la pieza pasó a ESCANEADA. Cuando lo aprueben o lo
            rechacen podrás seguir.
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.4fr) minmax(0, 1fr)' },
          alignItems: 'start',
        }}
      >
        {escaneo && (
          <Box sx={tarjeta}>
            <Typography variant="h2" sx={{ m: 0, mb: 1.5, fontSize: 24 }}>
              Escaneo en revisión
            </Typography>
            <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1 }}>
              {[
                ['Archivo', `${escaneo.nombreOriginal} · ${tamanoLegible(escaneo.tamanoBytes)}`],
                ['Tema', escaneo.tema],
                ['Autor', escaneo.autor],
                ['Palabras clave', escaneo.palabrasClave.join(', ')],
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
          </Box>
        )}
        <Box sx={{ ...tarjeta, display: 'grid', gap: 1.5 }}>
          <Typography variant="h2" sx={{ m: 0, fontSize: 24 }}>
            Cargar otro escaneo
          </Typography>
          <Button variant="contained" disabled sx={{ borderRadius: 999, justifySelf: 'start' }}>
            Cargar escaneo
          </Button>
          <Typography sx={{ m: 0, fontSize: 15, color: 'text.secondary' }}>
            No se puede mientras este espera revisión. Si lo rechazan, podrás cargar uno nuevo.
          </Typography>
          <Button
            component={RouterLink}
            to="/panel/escaneos"
            variant="contained"
            startIcon={<UploadFileIcon />}
            sx={{ justifySelf: 'start', borderRadius: 999, fontWeight: 800 }}
          >
            Ver en qué va en {usuario?.rol === 'ADMIN' ? 'Escaneos' : 'Mis escaneos'}
          </Button>
          <Button
            component={RouterLink}
            to="/panel/inventario"
            startIcon={<ArrowBackIcon />}
            sx={{ justifySelf: 'start', borderRadius: 999, fontWeight: 700 }}
          >
            Volver al inventario
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/** HU-09: cargar el escaneo de una pieza REGISTRADA (/panel/escaneo/:codigo). */
export function PaginaCargarEscaneo() {
  const { codigo = '' } = useParams();
  const navegar = useNavigate();
  const consulta = useInventario({
    pagina: 1,
    limite: 5,
    orden: 'codigo',
    direccion: 'asc',
    busqueda: codigo,
  });
  const [datos, setDatos] = useState<DatosEscaneo | null>(null);
  const [paso, setPaso] = useState<'formulario' | 'vista'>('formulario');
  const [cargado, setCargado] = useState<EscaneoCargado | null>(null);

  if (consulta.isPending) {
    return (
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Skeleton width={220} />
        <Skeleton variant="rounded" height={60} />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: '20px' }} />
      </Box>
    );
  }
  if (consulta.isError) {
    return (
      <Alert severity="error">
        No pudimos abrir la pieza. Revisa tu conexión e intenta otra vez.
      </Alert>
    );
  }

  const pieza = consulta.data.datos.find((p) => p.codigo === codigo.toUpperCase());
  if (!pieza) {
    return (
      <Box sx={{ ...tarjeta, display: 'grid', gap: 2, justifyItems: 'start' }}>
        <Typography variant="h1" sx={{ m: 0, fontSize: 32 }}>
          No encontramos esa pieza
        </Typography>
        <Typography>No hay una pieza con el código {codigo} en el inventario.</Typography>
        <Button
          component={RouterLink}
          to="/panel/inventario"
          variant="contained"
          sx={{ borderRadius: 999 }}
        >
          Volver al inventario
        </Button>
      </Box>
    );
  }

  const estado: EstadoPieza = cargado ? 'ESCANEADA' : pieza.estado;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 3.5 }}>
      <Cabecera pieza={pieza} estado={estado} />

      {estado === 'ESCANEADA' && <EnRevision escaneo={cargado} />}

      {(estado === 'REVISADA' || estado === 'PUBLICADA') && (
        <Alert severity="info">
          {pieza.codigo} ya pasó control de calidad y está {estado}. Solo se carga el escaneo de una
          pieza REGISTRADA.
        </Alert>
      )}

      {estado === 'REGISTRADA' && paso === 'formulario' && (
        <Box sx={{ ...tarjeta, maxWidth: 960 }}>
          <Typography variant="h2" sx={{ m: 0, fontSize: 26 }}>
            Cargar el escaneo
          </Typography>
          <Typography sx={{ m: '6px 0 22px', color: 'text.secondary' }}>
            Sube una sola copia por pieza. Pasará a control de calidad antes de publicarse.
          </Typography>
          <FormularioEscaneo
            codigo={pieza.codigo}
            inicial={datos}
            onCancelar={() => void navegar('/panel/inventario')}
            onContinuar={(nuevos) => {
              setDatos(nuevos);
              setPaso('vista');
            }}
          />
        </Box>
      )}

      {estado === 'REGISTRADA' && paso === 'vista' && datos && (
        <VistaPreviaEscaneo
          piezaId={pieza.id}
          codigo={pieza.codigo}
          datos={datos}
          onCambiar={() => setPaso('formulario')}
          onCargado={setCargado}
        />
      )}
    </Box>
  );
}
