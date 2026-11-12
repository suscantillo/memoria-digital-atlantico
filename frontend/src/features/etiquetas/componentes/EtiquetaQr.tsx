import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useEffect, useState } from 'react';
import { FUENTE_FICHA } from '../../../shared/componentes/EncabezadoPanel';
import type { PiezaInventario } from '../../inventario/tipos';
import { useQrPieza } from '../hooks';

interface Props {
  pieza: PiezaInventario;
  grande: boolean;
}

export function EtiquetaQr({ pieza, grande }: Props) {
  const qr = useQrPieza(pieza.id);
  const [url, setUrl] = useState<string | null>(null);
  const lado = grande ? 84 : 56;
  const { deposito, estanteria, caja } = pieza.ubicacion;

  useEffect(() => {
    if (!qr.data) return;
    const creada = URL.createObjectURL(qr.data);
    setUrl(creada);
    return () => URL.revokeObjectURL(creada);
  }, [qr.data]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        p: 1,
        border: '1px dashed #9AA4B8',
        borderRadius: 1.5,
        breakInside: 'avoid',
        color: '#0E2D6B',
      }}
    >
      {url ? (
        <Box component="img" src={url} alt="" sx={{ width: lado, height: lado, flex: 'none' }} />
      ) : (
        <Skeleton variant="rectangular" width={lado} height={lado} sx={{ flex: 'none' }} />
      )}
      <Box sx={{ minWidth: 0, lineHeight: 1.2 }}>
        <Box sx={{ fontFamily: FUENTE_FICHA, fontWeight: 700, fontSize: grande ? 15 : 11 }}>
          {pieza.codigo}
        </Box>
        <Box
          sx={{
            fontSize: grande ? 12 : 10,
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pieza.titulo}
        </Box>
        <Box sx={{ fontSize: grande ? 12 : 10 }}>
          {deposito} · {estanteria} · {caja}
        </Box>
      </Box>
    </Box>
  );
}
