import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { keyframes } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { descargarQrPieza } from '../../piezas/qr';
import { useUbicaciones } from '../../ubicaciones/hooks';
import {
  aParametrosApi,
  escribirFiltros,
  leerFiltros,
  ORDENES,
  type ClaveOrden,
  type FiltrosInventario,
} from '../filtros';
import { useInventario } from '../hooks';
import {
  ESTADOS_PIEZA,
  NOMBRE_TIPO,
  TIPOS_PIEZA,
  type EstadoPieza,
  type PiezaInventario,
  type TipoPieza,
} from '../tipos';

const MAQUINA = '"Courier Prime", "Courier New", Courier, monospace';
const curva = 'cubic-bezier(.2, .8, .2, 1)';
const sinMovimiento = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;

const entra = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
`;

const ESTADO: Record<EstadoPieza, { ayuda: string; fondo: string; texto: string; borde: string }> =
  {
    REGISTRADA: {
      ayuda: 'Esperan su escaneo',
      fondo: colores.papel,
      texto: colores.azulMarino,
      borde: `2px dashed ${colores.azulMarino}`,
    },
    ESCANEADA: {
      ayuda: 'Esperan control de calidad',
      fondo: colores.amarillo,
      texto: colores.azulMarino,
      borde: `2px solid ${colores.amarillo}`,
    },
    REVISADA: {
      ayuda: 'Aprobadas, sin publicar',
      fondo: '#D7F0F2',
      texto: '#005F6B',
      borde: `2px solid ${colores.turquesa}`,
    },
    PUBLICADA: {
      ayuda: 'Visibles en el portal',
      fondo: colores.turquesaOscuro,
      texto: '#FFFFFF',
      borde: `2px solid ${colores.turquesaOscuro}`,
    },
  };

const COLOR_TIPO: Record<TipoPieza, string> = {
  DOCUMENTO: '#F5D79E',
  FOTOGRAFIA: colores.amarillo,
  PERIODICO: '#5FD4E0',
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** «11 nov 2026»: corto y sin «de», para que la columna no se parta. */
function fechaCorta(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

const estiloSelector = {
  minHeight: 48,
  px: 1.75,
  border: `2px solid ${colores.azulMarino}`,
  borderRadius: 999,
  bgcolor: '#FFFFFF',
  color: colores.azulMarino,
  fontFamily: 'inherit',
  fontSize: 16,
  fontWeight: 600,
  maxWidth: '100%',
  minWidth: 0,
  flex: '0 1 auto',
} as const;

function Selector({
  etiqueta,
  valor,
  onCambio,
  children,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontWeight: 700,
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <label htmlFor={id}>{etiqueta}</label>
      <Box
        component="select"
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        sx={estiloSelector}
      >
        {children}
      </Box>
    </Box>
  );
}

function SelloEstado({ estado }: { estado: EstadoPieza }) {
  const e = ESTADO[estado];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.25,
        py: 0.5,
        borderRadius: '8px',
        border: e.borde,
        bgcolor: e.fondo,
        color: e.texto,
        fontFamily: 'h1.fontFamily',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: '.06em',
      }}
    >
      {estado}
    </Box>
  );
}

function BotonQr({ pieza }: { pieza: PiezaInventario }) {
  const [estado, setEstado] = useState<'libre' | 'bajando' | 'error'>('libre');
  const descargar = async () => {
    setEstado('bajando');
    try {
      await descargarQrPieza(pieza.id);
      setEstado('libre');
    } catch {
      setEstado('error');
    }
  };
  const texto =
    estado === 'error'
      ? `No se pudo bajar el QR de ${pieza.codigo}`
      : `Descargar el QR de ${pieza.codigo}`;
  return (
    <Tooltip title={texto}>
      <Box
        component="button"
        type="button"
        aria-label={texto}
        onClick={descargar}
        disabled={estado === 'bajando'}
        sx={{
          width: 42,
          height: 42,
          border: 0,
          borderRadius: '12px',
          bgcolor: estado === 'error' ? colores.naranja : colores.azulMarino,
          color: colores.amarillo,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform .15s',
          '&:hover': { transform: 'translateY(-2px)' },
          '&:disabled': { opacity: 0.6, cursor: 'progress' },
        }}
      >
        <QrCode2Icon fontSize="small" />
      </Box>
    </Tooltip>
  );
}

function FilaPieza({ pieza, indice }: { pieza: PiezaInventario; indice: number }) {
  const { deposito, estanteria, caja } = pieza.ubicacion;
  return (
    <Box
      component="tr"
      sx={{
        borderTop: '1px dashed #EBD9B0',
        animation: `${entra} .45s ${curva} ${Math.min(indice, 10) * 0.03}s both`,
        ...sinMovimiento,
        '&:hover': { bgcolor: '#FFFBF2' },
      }}
    >
      <Box component="td" sx={{ p: '12px 18px', minWidth: 250 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            aria-hidden
            sx={{
              flex: 'none',
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: COLOR_TIPO[pieza.tipo],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'h1.fontFamily',
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            {NOMBRE_TIPO[pieza.tipo][0]}
          </Box>
          <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
            {/* el título lleva a la ficha interna: ver historial, editar y publicar */}
            <Box
              component={RouterLink}
              to={`/panel/piezas/${pieza.id}`}
              sx={{
                fontWeight: 700,
                fontSize: 17,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {pieza.titulo}
            </Box>
            <Box
              component="span"
              sx={{ fontFamily: MAQUINA, fontSize: 14, color: 'text.secondary' }}
            >
              {pieza.codigo} · {NOMBRE_TIPO[pieza.tipo]}
              {pieza.anio !== null && ` · ${pieza.anio}`}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        component="td"
        sx={{
          p: '12px 18px',
          fontFamily: MAQUINA,
          fontSize: 14,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          lineHeight: 1.5,
        }}
      >
        {deposito}
        <br />
        {estanteria} · {caja}
      </Box>
      <Box component="td" sx={{ p: '12px 18px', whiteSpace: 'nowrap' }}>
        <SelloEstado estado={pieza.estado} />
        {pieza.restringida && (
          <Box
            component="span"
            sx={{
              display: 'block',
              width: 'fit-content',
              mt: 0.75,
              px: 1,
              py: 0.4,
              borderRadius: 999,
              bgcolor: colores.azulMarino,
              color: colores.amarillo,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            RESTRINGIDA
          </Box>
        )}
      </Box>
      <Box
        component="td"
        sx={{ p: '12px 18px', fontSize: 15, color: 'text.secondary', whiteSpace: 'nowrap' }}
      >
        {fechaCorta(pieza.actualizadoEn)}
      </Box>
      <Box component="td" sx={{ p: '8px 18px', whiteSpace: 'nowrap', textAlign: 'right' }}>
        {pieza.estado === 'REGISTRADA' && (
          <Tooltip title={`Cargar el escaneo de ${pieza.codigo}`}>
            <Box
              component={RouterLink}
              to={`/panel/escaneo/${pieza.codigo}`}
              aria-label={`Cargar el escaneo de ${pieza.codigo}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                mr: 0.75,
                borderRadius: '12px',
                bgcolor: colores.naranja,
                color: '#FFFFFF',
                verticalAlign: 'middle',
                transition: 'transform .15s',
                '&:hover': { transform: 'translateY(-2px)' },
              }}
            >
              <UploadFileIcon fontSize="small" />
            </Box>
          </Tooltip>
        )}
        {pieza.estado === 'PUBLICADA' && (
          <Box
            component={RouterLink}
            to={`/p/${pieza.codigo}`}
            target="_blank"
            aria-label={`Ver ${pieza.codigo} en el portal (se abre en otra pestaña)`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 42,
              px: 1.75,
              mr: 0.5,
              borderRadius: 999,
              fontWeight: 800,
              color: colores.azulMarino,
            }}
          >
            Ver
          </Box>
        )}
        <Tooltip title={`Ver y editar la ficha de ${pieza.codigo}`}>
          <Box
            component={RouterLink}
            to={`/panel/piezas/${pieza.id}`}
            aria-label={`Ver y editar la ficha de ${pieza.codigo}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              mr: 0.75,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              color: colores.azulMarino,
              border: `2px solid ${colores.azulMarino}`,
              verticalAlign: 'middle',
              transition: 'transform .15s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </Box>
        </Tooltip>
        <BotonQr pieza={pieza} />
      </Box>
    </Box>
  );
}

/** Inventario del panel (HU-07): todas las piezas, con filtros que quedan en la dirección. */
export function PaginaInventario() {
  const [params, setParams] = useSearchParams();
  const filtros = leerFiltros(params);
  const consulta = useInventario(aParametrosApi(filtros));
  const cajas = useUbicaciones({ pagina: 1, limite: 100, orden: 'deposito', direccion: 'asc' });
  const [texto, setTexto] = useState(filtros.busqueda);
  const hayFiltro = Boolean(
    filtros.busqueda || filtros.tipo || filtros.estado || filtros.ubicacionId,
  );

  // cada filtro vuelve a la página 1; la búsqueda reemplaza la entrada del historial mientras se escribe
  const cambiar = (cambios: Partial<FiltrosInventario>, reemplazar = false) =>
    setParams(escribirFiltros({ ...filtros, pagina: 1, ...cambios }), { replace: reemplazar });

  useEffect(() => setTexto(filtros.busqueda), [filtros.busqueda]);
  useEffect(() => {
    if (texto.trim() === filtros.busqueda) return;
    const espera = window.setTimeout(() => cambiar({ busqueda: texto.trim() }, true), 350);
    return () => window.clearTimeout(espera);
    // solo debe reaccionar a lo que se escribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const datos = consulta.data;
  const meta = datos?.meta;
  const desde = meta && meta.total > 0 ? (meta.pagina - 1) * meta.limite + 1 : 0;
  const hasta = meta ? Math.min(meta.pagina * meta.limite, meta.total) : 0;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          animation: `${entra} .5s ${curva} both`,
          ...sinMovimiento,
        }}
      >
        <Box>
          <Typography
            component="p"
            sx={{
              m: 0,
              fontFamily: MAQUINA,
              fontWeight: 700,
              fontSize: 15,
              color: colores.naranja,
            }}
          >
            PANEL DEL PERSONAL
          </Typography>
          <Typography
            variant="h1"
            sx={{ m: 0, fontSize: { xs: 42, md: 56 }, lineHeight: 0.95, letterSpacing: '-0.035em' }}
          >
            Inventario
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/panel/piezas/nueva"
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 999,
            px: 3,
            py: 1.5,
            fontSize: 17,
            fontWeight: 800,
            boxShadow: `0 6px 0 ${colores.azulMarino}`,
          }}
        >
          Añadir pieza
        </Button>
      </Box>

      <Box
        role="group"
        aria-label="Filtrar por estado"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {ESTADOS_PIEZA.map((estado, i) => {
          const activo = filtros.estado === estado;
          const e = ESTADO[estado];
          return (
            <Box
              key={estado}
              component="button"
              type="button"
              aria-pressed={activo}
              onClick={() => cambiar({ estado: activo ? undefined : estado })}
              sx={{
                textAlign: 'left',
                p: '18px 18px 16px',
                border: 0,
                borderRadius: '16px',
                bgcolor: activo ? colores.azulMarino : '#FFFFFF',
                color: activo ? '#FFFFFF' : colores.azulMarino,
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: activo ? `0 6px 0 ${colores.naranja}` : '0 6px 0 #F5D79E',
                transition: 'transform .2s, box-shadow .2s, background-color .2s',
                '&:hover': { transform: 'translateY(-3px)' },
                animation: `${entra} .5s ${curva} ${0.05 + i * 0.06}s both`,
                ...sinMovimiento,
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: e.fondo,
                  color: e.texto,
                  border: e.borde,
                  fontFamily: MAQUINA,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '.06em',
                }}
              >
                {estado}
              </Box>
              <Box component="span" sx={{ display: 'block', mt: 1, fontSize: 15, fontWeight: 600 }}>
                {e.ayuda}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <Box
          sx={{
            flex: '1 1 300px',
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2.25,
            bgcolor: '#FFFFFF',
            borderRadius: 999,
            boxShadow: '0 6px 0 #F5D79E',
            '&:focus-within': { outline: `3px solid ${colores.azulMarino}`, outlineOffset: 2 },
          }}
        >
          <SearchIcon aria-hidden />
          <Box
            component="label"
            htmlFor="buscar-piezas"
            sx={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          >
            Buscar por código, título o descripción
          </Box>
          <Box
            component="input"
            id="buscar-piezas"
            type="search"
            value={texto}
            maxLength={100}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por código o título…"
            sx={{
              flex: 1,
              minWidth: 0,
              height: 52,
              border: 0,
              bgcolor: 'transparent',
              fontSize: 17,
              fontFamily: 'inherit',
              color: colores.azulMarino,
              outline: 'none',
            }}
          />
        </Box>
        <Selector
          etiqueta="Tipo"
          valor={filtros.tipo ?? ''}
          onCambio={(v) => cambiar({ tipo: (v || undefined) as TipoPieza | undefined })}
        >
          <option value="">Todos</option>
          {TIPOS_PIEZA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {NOMBRE_TIPO[tipo]}
            </option>
          ))}
        </Selector>
        <Selector
          etiqueta="Caja"
          valor={filtros.ubicacionId ?? ''}
          onCambio={(v) => cambiar({ ubicacionId: v || undefined })}
        >
          <option value="">Todas</option>
          {cajas.data?.datos.map((u) => (
            <option key={u.id} value={u.id}>
              {u.deposito} · {u.estanteria} · {u.caja}
            </option>
          ))}
        </Selector>
        <Selector
          etiqueta="Ordenar"
          valor={filtros.orden}
          onCambio={(v) => cambiar({ orden: v as ClaveOrden })}
        >
          {Object.entries(ORDENES).map(([clave, { etiqueta }]) => (
            <option key={clave} value={clave}>
              {etiqueta}
            </option>
          ))}
        </Selector>
        {hayFiltro && (
          <Button
            variant="contained"
            onClick={() =>
              setParams(escribirFiltros({ busqueda: '', orden: filtros.orden, pagina: 1 }))
            }
            sx={{ minHeight: 48, borderRadius: 999, px: 2.25 }}
          >
            Ver todas ✕
          </Button>
        )}
      </Box>

      {consulta.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => consulta.refetch()}>
              Reintentar
            </Button>
          }
        >
          No pudimos cargar el inventario. Revisa tu conexión e intenta otra vez.
        </Alert>
      )}

      {!consulta.isError && (
        <Box
          sx={{
            // relativo: así el texto oculto de «Acciones» no escapa del desplazamiento horizontal
            position: 'relative',
            overflowX: 'auto',
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 8px 0 #F5D79E',
          }}
        >
          <Box
            component="table"
            aria-busy={consulta.isFetching}
            sx={{
              width: '100%',
              minWidth: 820,
              borderCollapse: 'collapse',
              fontSize: 16,
              opacity: consulta.isPlaceholderData ? 0.55 : 1,
              transition: 'opacity .2s',
            }}
          >
            <Box
              component="caption"
              aria-live="polite"
              sx={{
                captionSide: 'top',
                textAlign: 'left',
                p: '14px 18px 0',
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              {meta
                ? meta.total === 0
                  ? 'Sin piezas para mostrar'
                  : `Mostrando ${desde}–${hasta} de ${meta.total} ${meta.total === 1 ? 'pieza' : 'piezas'}`
                : 'Cargando el inventario…'}
            </Box>
            <thead>
              <Box
                component="tr"
                sx={{
                  textAlign: 'left',
                  fontFamily: MAQUINA,
                  fontSize: 14,
                  letterSpacing: '.06em',
                }}
              >
                {['PIEZA', 'UBICACIÓN', 'ESTADO', 'ÚLTIMO CAMBIO'].map((titulo) => (
                  <Box
                    key={titulo}
                    component="th"
                    scope="col"
                    sx={{ p: '14px 18px', borderBottom: '2px dashed #EBD9B0' }}
                  >
                    {titulo}
                  </Box>
                ))}
                <Box
                  component="th"
                  scope="col"
                  sx={{ p: '14px 18px', borderBottom: '2px dashed #EBD9B0' }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                    }}
                  >
                    Acciones
                  </Box>
                </Box>
              </Box>
            </thead>
            <tbody>
              {consulta.isPending
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <Box component="td" colSpan={5} sx={{ p: '10px 18px' }}>
                        <Skeleton height={44} />
                      </Box>
                    </tr>
                  ))
                : datos?.datos.map((pieza, i) => (
                    <FilaPieza key={pieza.id} pieza={pieza} indice={i} />
                  ))}
            </tbody>
          </Box>

          {meta && meta.total === 0 && (
            <Box
              sx={{
                p: '28px 18px',
                textAlign: 'center',
                display: 'grid',
                gap: 1.5,
                justifyItems: 'center',
              }}
            >
              <Typography sx={{ m: 0, fontWeight: 700 }}>
                {hayFiltro
                  ? 'Ninguna pieza coincide con la búsqueda.'
                  : 'Todavía no hay piezas en el inventario.'}
              </Typography>
              {hayFiltro && (
                <Button
                  variant="outlined"
                  onClick={() =>
                    setParams(escribirFiltros({ busqueda: '', orden: filtros.orden, pagina: 1 }))
                  }
                  sx={{ borderRadius: 999 }}
                >
                  Ver todas
                </Button>
              )}
            </Box>
          )}

          {meta && meta.totalPaginas > 1 && (
            <Box
              component="nav"
              aria-label="Páginas del inventario"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1.5,
                p: '12px 18px',
                borderTop: '1px dashed #EBD9B0',
                fontSize: 15,
              }}
            >
              <span>
                Página {meta.pagina} de {meta.totalPaginas}
              </span>
              <Button
                variant="outlined"
                disabled={meta.pagina <= 1}
                onClick={() => setParams(escribirFiltros({ ...filtros, pagina: meta.pagina - 1 }))}
                sx={{ borderRadius: 999, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                ← Anterior
              </Button>
              <Button
                variant="contained"
                disabled={meta.pagina >= meta.totalPaginas}
                onClick={() => setParams(escribirFiltros({ ...filtros, pagina: meta.pagina + 1 }))}
                sx={{ borderRadius: 999 }}
              >
                Siguiente →
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
