import Link from '@mui/material/Link';

export const ID_CONTENIDO = 'contenido-principal';

export function EnlaceSaltar() {
  return (
    <Link
      href={`#${ID_CONTENIDO}`}
      sx={{
        position: 'absolute',
        left: 8,
        top: -64,
        zIndex: (t) => t.zIndex.tooltip,
        px: 2,
        py: 1,
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
        borderRadius: 1,
        fontWeight: 600,
        '&:focus-visible': { top: 8 },
      }}
    >
      Saltar al contenido principal
    </Link>
  );
}
