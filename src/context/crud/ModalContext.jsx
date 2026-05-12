/**
 * ModalContext.jsx
 *
 * Owns ONLY the delete-confirmation modal state (isModalOpen).
 * Components that render the DataTable do NOT consume this context,
 * so clicking "delete" no longer triggers a DataTable re-render.
 */
import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

// ─── State & Reducer ─────────────────────────────────────────────────────────
const initialState = { isModalOpen: false };

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_MODAL':  return { isModalOpen: true };
    case 'CLOSE_MODAL': return { isModalOpen: false };
    default: return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ModalContext = createContext(undefined);

export function ModalContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Memoize actions so referential equality is stable across renders
  const actions = useMemo(
    () => ({
      open:  () => dispatch({ type: 'OPEN_MODAL' }),
      close: () => dispatch({ type: 'CLOSE_MODAL' }),
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModalContext must be used inside ModalContextProvider');
  return ctx;
}
