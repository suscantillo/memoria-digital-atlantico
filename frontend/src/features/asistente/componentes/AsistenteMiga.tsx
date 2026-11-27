import { useId, useRef, useState } from 'react';
import { useConversacionMiga } from '../hooks';
import { BotonMiga } from './BotonMiga';
import { ChatMiga } from './ChatMiga';

/**
 * Miga en todo el portal público: el botón flotante y su chat. La conversación sigue ahí si se
 * cierra el chat y se vuelve a abrir mientras se navega por el portal.
 */
export function AsistenteMiga() {
  const [abierto, setAbierto] = useState(false);
  const conversacion = useConversacionMiga();
  const boton = useRef<HTMLButtonElement>(null);
  const idPanel = `chat-miga-${useId().replace(/:/g, '')}`;

  const cerrar = () => {
    setAbierto(false);
    // el foco vuelve a Miga para seguir con el teclado donde se estaba
    requestAnimationFrame(() => boton.current?.focus());
  };

  return (
    <>
      <ChatMiga id={idPanel} abierto={abierto} onCerrar={cerrar} conversacion={conversacion} />
      <BotonMiga
        ref={boton}
        abierto={abierto}
        idPanel={idPanel}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      />
    </>
  );
}
