/**
 * PanelContext.jsx
 *
 * Owns the side-panel open/close and the create-form collapse box state.
 * Toggling the panel does NOT re-render the modal or the side-panel edit boxes.
 */
import { createContext, useContext, useReducer, useMemo } from 'react';

const initialState = {
  isPanelClose:    true,
  isBoxCollapsed:  false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_PANEL':    return { ...state, isPanelClose: false };
    case 'CLOSE_PANEL':   return { ...state, isPanelClose: true };
    case 'COLLAPSE_PANEL':return { ...state, isPanelClose: !state.isPanelClose };
    case 'OPEN_BOX':      return { ...state, isBoxCollapsed: true };
    case 'CLOSE_BOX':     return { ...state, isBoxCollapsed: false };
    case 'COLLAPSE_BOX':  return { ...state, isBoxCollapsed: !state.isBoxCollapsed };
    default: return state;
  }
}

const PanelContext = createContext(undefined);

export function PanelContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      panel: {
        open:     () => dispatch({ type: 'OPEN_PANEL' }),
        close:    () => dispatch({ type: 'CLOSE_PANEL' }),
        collapse: () => dispatch({ type: 'COLLAPSE_PANEL' }),
      },
      collapsedBox: {
        open:     () => dispatch({ type: 'OPEN_BOX' }),
        close:    () => dispatch({ type: 'CLOSE_BOX' }),
        collapse: () => dispatch({ type: 'COLLAPSE_BOX' }),
      },
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanelContext() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error('usePanelContext must be used inside PanelContextProvider');
  return ctx;
}
