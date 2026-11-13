import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { useAuth } from '../../../shared/auth/useAuth';
import { EncabezadoPanel, FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { MensajeError } from '../../../shared/componentes/MensajeError';
import { NOMBRE_TIPO } from '../../inventario/tipos';
import { useEscaneos } from '../hooks';
import type { ArchivoEnRevision, EstadoArchivo } from '../tipos';

const LIMITE = 20;

const ESTADO: Record<
  EstadoArchivo,
  { texto: string; color: string; fondo: string; borde: string }
> = {
  EN_REVISION: {
    texto: 'EN REVISIÓN',
    color: '#6E4300',
    fondo: '#FFF1C9',
    borde: colores.amarillo,
  },
  APROBADO: { texto: 'APROBADO', color: '#005F6B', fondo: '#CFF4F7', borde: colores.turquesa },
  RECHAZADO: { texto: 'RECHAZADO', color: '#A8320F', fondo: '#FFDCCF', borde: colores.naranja },
};

const FILTROS: { valor: EstadoArchivo | null; texto: string }[] = [
  { valor: null, texto: 'Todos' },
  { valor: 'EN_REVISION', texto: 'En revisión' },
  { valor: 'APROBADO', texto: 'Aprobados' },
  { valor: 'RECHAZADO', texto: 'Rechazados' },
];

const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

function tamanoLegible(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function esEstado(valor: string | null): valor is EstadoArchivo {
  return valor === 'EN_REVISION' || valor === 'APROBADO' || valor === 'RECHAZADO';
}

/**
 * «Escaneos» para el ADMIN (todo lo que se ha cargado) y «Mis escaneos» para el PERSONAL (lo que
 * subió): en qué va cada archivo después de cargarlo, quién lo revisa y por qué lo rechazaron.
 */
export function PaginaEscaneos() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';
  const [parametros, setParametros] = useSearchParams();
  const estadoUrl = parametros.get('estado');
  const estado = esEstado(estadoUrl) ? estadoUrl : null;
  const pagina = Math.max(1, Number(parametros.get('pagina')) || 1);

  const consulta = useEscaneos({
    ...(estado ? { estado } : {}),
    ...(esAdmin ? {} : { subidoPor: 'yo' }),
    direccion: 'desc',
    pagina,
    limite: LIMITE,
  });

  const cambiar = (nuevoEstado: EstadoArchivo | null, nuevaPagina = 1) => {
    const siguientes = new URLSearchParams();
    if (nuevoEstado) siguientes.set('estado', nuevoEstado);
    if (nuevaPagina > 1) siguientes.set('pagina', String(nuevaPagina));
    setParametros(siguientes, { replace: true });
  };

  const meta = consulta.data?.meta;
  const archivos = consulta.data?.datos ?? [];

  return (
    <Stack spacing={3}>
      <EncabezadoPanel
        titulo={esAdmin ? 'Escaneos' : 'Mis escaneos'}
        descripcion={
          esAdmin
            ? 'Todo lo que se ha cargado: quién lo subió, quién lo revisa y en qué va.'
            : 'Lo que has cargado y en qué va cada archivo: en revisión, aprobado o rechazado.'
        }
        accion={
          <Button
            component={RouterLink}
            to="/panel/inventario?estado=REGISTRADA"
            variant="contained"
            color="secondary"
            startIcon={<UploadFileIcon />}
            sx={{ borderRadius: 999, px: 2.5, fontWeight: 800 }}
          >
            Cargar otro escaneo
          </Button>
        }
      />

      <Box
        role="group"
        aria-label="Filtrar por estado del escaneo"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
      >
        {FILTROS.map(({ valor, texto }) => {
          const activo = valor === estado;
          return (
            <Box
              key={texto}
              component="button"
              type="button"
              aria-pressed={activo}
              onClick={() => cambiar(valor)}
              sx={{
                minHeight: 44,
                px: 2,
                border: 0,
                borderRadius: 999,
                cursor: 'pointer',
                font: 'inherit',
                fontWeight: 800,
                bgcolor: activo ? colores.azulMarino : '#FFFFFF',
                color: activo ? '#FFFFFF' : colores.azulMarino,
                boxShadow: activo ? `0 4px 0 ${colores.naranja}` : '0 4px 0 #F5D79E',
              }}
            >
              {texto}
            </Box>
          );
        })}
      </Box>

      {consulta.isError && (
        <MensajeError error={consulta.error} titulo="No se pudo cargar la lista" />
      )}

      {consulta.isPending && (
        <Stack spacing={1.5} aria-hidden>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={128} sx={{ borderRadius: 4 }} />
          ))}
        </Stack>
      )}

      {consulta.isSuccess && archivos.length === 0 && (
        <Box
          sx={{
            p: 5,
            textAlign: 'center',
            bgcolor: colores.papel,
            borderRadius: 5,
            boxShadow: '0 8px 0 #F5D79E',
          }}
        >
          <Typography sx={{ fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 26 }}>
            {estado ? 'Nada con ese estado' : 'Todavía no hay escaneos'}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            {estado
              ? 'Prueba con otro filtro.'
              : esAdmin
                ? 'Cuando alguien cargue un escaneo desde el inventario, aparece aquí.'
                : 'Cuando cargues un escaneo desde el inventario, aquí verás en qué va.'}
          </Typography>
        </Box>
      )}

      {archivos.length > 0 && (
        <Box
          component="ul"
          aria-label={esAdmin ? 'Escaneos cargados' : 'Escaneos que cargaste'}
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            display: 'grid',
            gap: 2,
            opacity: consulta.isPlaceholderData ? 0.6 : 1,
            transition: 'opacity .2s',
          }}
        >
          {archivos.map((archivo) => (
            <FilaEscaneo
              key={archivo.id}
              archivo={archivo}
              esAdmin={esAdmin}
              usuarioId={usuario?.id}
            />
          ))}
        </Box>
      )}

      {meta && meta.totalPaginas > 1 && (
        <Box
          component="nav"
          aria-label="Páginas"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
        >
          <IconButton
            aria-label="Página anterior"
            disabled={meta.pagina <= 1}
            onClick={() => cambiar(estado, meta.pagina - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700 }}>
            Página {meta.pagina} de {meta.totalPaginas}
          </Typography>
          <IconButton
            aria-label="Página siguiente"
            disabled={meta.pagina >= meta.totalPaginas}
            onClick={() => cambiar(estado, meta.pagina + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Stack>
  );
}

interface PropsFila {
  archivo: ArchivoEnRevision;
  esAdmin: boolean;
  usuarioId: string | undefined;
}

function FilaEscaneo({ archivo, esAdmin, usuarioId }: PropsFila) {
  const e = ESTADO[archivo.estado];
  const { pieza } = archivo;
  const puedeRevisar =
    archivo.estado === 'EN_REVISION' && (esAdmin || archivo.revisor?.id === usuarioId);
  const puedeRecargar = archivo.estado === 'RECHAZADO' && pieza.estado === 'REGISTRADA';
  const enPortal = archivo.estado === 'APROBADO' && pieza.estado === 'PUBLICADA';
  // lo revisado se vuelve a ver en Control de calidad › Revisados (ADMIN o quien lo revisó)
  const verRevision =
    archivo.estado !== 'EN_REVISION' && (esAdmin || archivo.revisor?.id === usuarioId);

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        p: { xs: 2, sm: 2.5 },
        bgcolor: colores.papel,
        borderLeft: `8px solid ${e.borde}`,
        borderRadius: '0 18px 18px 0',
        boxShadow: '0 6px 0 #F5D79E',
      }}
    >
      <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: 14 }}>
            {pieza.codigo} · {NOMBRE_TIPO[pieza.tipo]}
          </Typography>
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: e.fondo,
              color: e.color,
              border: `2px solid ${e.borde}`,
              fontFamily: 'h1.fontFamily',
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: '.06em',
            }}
          >
            {e.texto}
          </Box>
        </Box>
        <Typography
          component="h2"
          sx={{ m: 0, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 19, lineHeight: 1.2 }}
        >
          {pieza.titulo}
        </Typography>
        <Typography
          sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary', overflowWrap: 'anywhere' }}
        >
          {archivo.nombreOriginal} · {tamanoLegible(archivo.tamanoBytes)}
        </Typography>

        <Box
          component="dl"
          sx={{
            m: '12px 0 0',
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            columnGap: 1.5,
            rowGap: 0.5,
            fontSize: 15,
            '& dt': { fontWeight: 800, color: colores.naranja },
            '& dd': { m: 0 },
          }}
        >
          <dt>Subido</dt>
          <dd>
            {fecha.format(new Date(archivo.creadoEn))}
            {esAdmin && ` por ${archivo.subidoPor.nombre}`}
          </dd>
          <dt>Revisor</dt>
          <dd>
            {archivo.revisor
              ? archivo.revisor.id === usuarioId
                ? 'Tú'
                : archivo.revisor.nombre
              : archivo.estado === 'EN_REVISION'
                ? 'Sin asignar todavía'
                : 'Administración'}
          </dd>
          {archivo.revisadoEn && (
            <>
              <dt>{archivo.estado === 'APROBADO' ? 'Aprobado' : 'Rechazado'}</dt>
              <dd>{fecha.format(new Date(archivo.revisadoEn))}</dd>
            </>
          )}
        </Box>

        {archivo.estado === 'RECHAZADO' && archivo.motivoRechazo && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 3,
              bgcolor: '#FFDCCF',
              color: '#7A2408',
              fontWeight: 600,
            }}
          >
            Motivo del rechazo: {archivo.motivoRechazo}
          </Box>
        )}
      </Box>

      {(puedeRevisar || puedeRecargar || enPortal || verRevision) && (
        <Box
          sx={{
            flex: '0 1 220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {puedeRevisar && (
            <Button
              component={RouterLink}
              to={`/panel/calidad?archivo=${archivo.id}`}
              variant="contained"
              startIcon={<FactCheckIcon />}
              sx={{ borderRadius: 999, fontWeight: 800 }}
            >
              Revisar
            </Button>
          )}
          {verRevision && (
            <Button
              component={RouterLink}
              to={`/panel/calidad?vista=revisados&archivo=${archivo.id}`}
              variant="contained"
              startIcon={<FactCheckIcon />}
              sx={{ borderRadius: 999, fontWeight: 800 }}
            >
              Ver revisión
            </Button>
          )}
          {puedeRecargar && (
            <Button
              component={RouterLink}
              to={`/panel/escaneo/${pieza.codigo}`}
              variant="contained"
              color="secondary"
              startIcon={<UploadFileIcon />}
              sx={{ borderRadius: 999, fontWeight: 800 }}
            >
              Cargar uno nuevo
            </Button>
          )}
          {enPortal && (
            <Button
              component={RouterLink}
              to={`/p/${pieza.codigo}`}
              target="_blank"
              variant="outlined"
              endIcon={<OpenInNewIcon />}
              sx={{
                borderRadius: 999,
                fontWeight: 800,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              Ver en el portal
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
