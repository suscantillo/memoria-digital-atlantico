import QrCode2Icon from '@mui/icons-material/QrCode2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { colores } from '../../../app/tema';
import { VisorQr } from '../componentes/VisorQr';
import { extraerCodigo, rutaPieza } from '../codigo';

const ID_AYUDA = 'ayuda-codigo';

export function PaginaEscanear() {
  const navegar = useNavigate();
  const [escrito, setEscrito] = useState('');
  const [invalido, setInvalido] = useState(false);

  // una pausa corta deja ver el destello de "encontrada" antes de cambiar de página
  const abrir = (codigo: string) => window.setTimeout(() => navegar(rutaPieza(codigo)), 600);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const codigo = extraerCodigo(escrito);
    setInvalido(!codigo);
    if (codigo) navegar(rutaPieza(codigo));
  };

  return (
    <Box
      component="section"
      aria-labelledby="titulo-escanear"
      sx={{ maxWidth: 560, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          component="p"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            m: 0,
            mb: 1.5,
            px: 2,
            py: 0.75,
            borderRadius: 999,
            bgcolor: colores.naranja,
            color: '#FFFFFF',
            fontFamily: 'h1.fontFamily',
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            rotate: '-2deg',
          }}
        >
          <QrCode2Icon aria-hidden fontSize="small" />
          Escáner del archivo
        </Box>
        <Typography
          id="titulo-escanear"
          variant="h1"
          sx={{
            m: 0,
            fontSize: 'clamp(34px, 8vw, 52px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          }}
        >
          Escanea una pieza
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 17 }}>
          Apunta la cámara al código QR pegado en la caja o en la ficha de la pieza.
        </Typography>
      </Box>

      <VisorQr onCodigo={abrir} />

      <Box
        component="form"
        onSubmit={enviar}
        noValidate
        sx={{ p: 2.5, borderRadius: 5, bgcolor: 'background.paper', boxShadow: '0 6px 0 #F5D79E' }}
      >
        <Typography component="label" htmlFor="codigo-pieza" sx={{ fontWeight: 800, fontSize: 17 }}>
          ¿El QR no se lee? Escribe el código
        </Typography>
        <Typography
          id={ID_AYUDA}
          sx={{ fontSize: 15, mt: 0.5, color: invalido ? colores.naranja : 'text.secondary' }}
        >
          {invalido
            ? 'Ese código no tiene el formato MDA-AAAA-NNNN, por ejemplo MDA-2026-0001.'
            : 'Va debajo del QR, con la forma MDA-AAAA-NNNN.'}
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            gap: 1,
            p: '5px 5px 5px 16px',
            borderRadius: 999,
            border: `2px solid ${invalido ? colores.naranja : '#E2CFA3'}`,
            '&:focus-within': { outline: `3px solid ${colores.naranja}`, outlineOffset: 2 },
          }}
        >
          <InputBase
            id="codigo-pieza"
            value={escrito}
            onChange={(e) => setEscrito(e.target.value)}
            placeholder="MDA-2026-0001"
            autoComplete="off"
            inputProps={{
              'aria-describedby': ID_AYUDA,
              'aria-invalid': invalido,
              autoCapitalize: 'characters',
              spellCheck: false,
            }}
            sx={{ flex: 1, minWidth: 0, fontSize: 17, fontFamily: 'monospace' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 999, px: 2.5, flex: 'none' }}
          >
            Abrir pieza
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
