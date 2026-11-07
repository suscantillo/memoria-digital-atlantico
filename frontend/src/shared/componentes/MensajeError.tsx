import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { interpretarError } from '../api/errores';

interface Props {
  error: unknown;
  titulo?: string;
}

export function MensajeError({ error, titulo }: Props) {
  const { message, errors } = interpretarError(error);
  return (
    <Alert severity="error" role="alert">
      {titulo && <AlertTitle>{titulo}</AlertTitle>}
      {message}
      {errors.length > 0 && (
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          {errors.map((detalle) => (
            <li key={detalle}>{detalle}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
