import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { asistenteApi } from './api';
import { LIMITE_PREGUNTA, type TurnoConversacion } from './tipos';

/**
 * La conversación con Miga vive solo en memoria: no se guarda en el servidor ni en el navegador,
 * así lo que alguien pregunta no queda en ningún lado.
 */
export function useConversacionMiga() {
  const [turnos, setTurnos] = useState<TurnoConversacion[]>([]);
  const siguienteId = useRef(1);

  const mutacion = useMutation({
    mutationFn: (pregunta: string) => asistenteApi.preguntar(pregunta),
    onSuccess: (respuesta, pregunta) => {
      const id = siguienteId.current++;
      setTurnos((anteriores) => [...anteriores, { id, pregunta, respuesta }]);
    },
  });

  const preguntar = useCallback(
    (texto: string) => {
      const pregunta = texto.trim().slice(0, LIMITE_PREGUNTA);
      if (!pregunta || mutacion.isPending) return;
      mutacion.mutate(pregunta);
    },
    [mutacion],
  );

  const reiniciar = useCallback(() => {
    setTurnos([]);
    mutacion.reset();
  }, [mutacion]);

  return {
    turnos,
    preguntar,
    reiniciar,
    pensando: mutacion.isPending,
    /** La pregunta que se está respondiendo, para mostrarla mientras Miga busca. */
    enCurso: mutacion.isPending ? mutacion.variables : null,
    error: mutacion.isError ? mutacion.error : null,
  };
}
