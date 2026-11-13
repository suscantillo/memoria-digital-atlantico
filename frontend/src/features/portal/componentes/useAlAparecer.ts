import { useEffect, useRef, useState } from 'react';

/** true cuando el elemento entra en pantalla; sirve para arrancar una animación una sola vez. */
export function useAlAparecer<T extends Element>(umbral = 0.35) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    // sin IntersectionObserver (navegadores viejos, pruebas) se muestra de una vez
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: umbral },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [umbral, visible]);

  return { ref, visible };
}
