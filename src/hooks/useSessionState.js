import { useEffect, useState } from "react";

// Prefijo común para todas las claves de la sesión en localStorage.
// Usamos localStorage (no sessionStorage) para que la info sobreviva
// recargas y cierres de pestaña, y solo se borre cuando el usuario
// decida "Terminar Sesión".
const PREFIX = "wgsession:";

export function usePersistentState(key, initialValue) {
  const storageKey = PREFIX + key;

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Si falla (modo privado, cuota llena, etc.) la app sigue funcionando.
    }
  }, [storageKey, state]);

  return [state, setState];
}

// Borra toda la sesión guardada. Quien la llame debería recargar la página
// para reiniciar también el estado en memoria de los componentes.
export function clearSession() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignorar
  }
}
