import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { colores } from '../../../app/tema';
import { BuscadorPanel } from '../../../shared/componentes/BuscadorPanel';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import { NOMBRE_TIPO } from '../../inventario/tipos';
import type { ArchivoDigital } from '../tipos';

const ID_TITULO = 'titulo-cola-revision';
const fecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });

interface Props {
  abierta: boolean;
  onCerrar: () => void;
  cola: ArchivoDigital[];
  /** Cuántos quedan en la API; puede ser más de los que se cargaron. */
  totalPendientes: number;
  actualId: string;
  resultados: Record<string, { aprobado: boolean }>;
  onElegir: (id: string) => void;
}

/** La cola completa en un panel lateral: con cientos de escaneos, una fila de fichas no cabe. */
export function ColaRevision({
  abierta,
  onCerrar,
  cola,
  totalPendientes,
  actualId,
  resultados,
  onElegir,
}: Props) {
  const [busqueda, setBusqueda] = useState('');
  const q = busqueda.trim().toLowerCase();
  const visibles = cola.filter(
    (a) => !q || `${a.pieza.codigo} ${a.pieza.titulo}`.toLowerCase().includes(q),
  );
  const cargados = cola.filter((a) => !resultados[a.id]).length;

  return (
    <Drawer
      anchor="right"
      open={abierta}
      onClose={onCerrar}
      PaperProps={{
        'aria-labelledby': ID_TITULO,
        sx: { width: { xs: '100%', sm: 420 }, bgcolor: colores.crema, p: 2.5, gap: 2 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          id={ID_TITULO}
          component="h2"
          sx={{ flex: 1, fontFamily: 'h1.fontFamily', fontWeight: 900, fontSize: 26 }}
        >
          Cola de revisión
        </Typography>
        <IconButton
          aria-label="Cerrar la cola"
          onClick={onCerrar}
          sx={{ color: colores.azulMarino }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography sx={{ color: 'text.secondary', mt: -1.5 }}>
        {totalPendientes} por revisar, del más antiguo al más reciente.
      </Typography>
      <BuscadorPanel
        id="buscar-cola"
        etiqueta="Buscar en la cola"
        placeholder="Código o título…"
        valor={busqueda}
        onCambiar={setBusqueda}
      />

      <List
        disablePadding
        sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}
      >
        {visibles.map((archivo) => {
          const resultado = resultados[archivo.id];
          const actual = archivo.id === actualId;
          return (
            <ListItemButton
              key={archivo.id}
              selected={actual}
              aria-current={actual ? 'step' : undefined}
              onClick={() => {
                onElegir(archivo.id);
                onCerrar();
              }}
              sx={{
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1.25,
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                borderLeft: `6px solid ${
                  resultado
                    ? resultado.aprobado
                      ? colores.turquesaOscuro
                      : colores.naranja
                    : colores.amarillo
                }`,
                opacity: resultado ? 0.7 : 1,
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: '#FFFFFF',
                  boxShadow: `0 0 0 3px ${colores.azulMarino}`,
                },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: 14 }}>
                  {archivo.pieza.codigo}
                </Typography>
                <Typography sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                  {archivo.pieza.titulo}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {NOMBRE_TIPO[archivo.pieza.tipo]} · {fecha.format(new Date(archivo.creadoEn))}
                </Typography>
              </Box>
              {resultado && (
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: 13,
                    fontWeight: 800,
                    color: resultado.aprobado ? '#005F6B' : '#A8320F',
                  }}
                >
                  {resultado.aprobado ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <CloseIcon fontSize="small" />
                  )}
                  {resultado.aprobado ? 'Aprobado' : 'Rechazado'}
                </Box>
              )}
            </ListItemButton>
          );
        })}
        {visibles.length === 0 && (
          <Typography sx={{ textAlign: 'center', fontWeight: 700, py: 3 }}>
            Ningún escaneo coincide.
          </Typography>
        )}
      </List>

      {totalPendientes > cargados && (
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Se muestran los {cargados} más antiguos. Al revisarlos llegan los siguientes.
        </Typography>
      )}
    </Drawer>
  );
}
