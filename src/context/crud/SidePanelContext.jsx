/**
 * SidePanelContext.jsx
 *
 * Owns the read/edit/advanced box states in the side panel.
 * This is the hottest context in the app – toggling "Edit" or "Read"
 * previously caused DataTable to re-render. Now it's isolated.
 */
import { createContext, useContext, useReducer, useMemo } from 'react';

const initialState = {
  isReadBoxOpen:     false,
  isEditBoxOpen:     false,
  isAdvancedBoxOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_READ_BOX':
      return { isReadBoxOpen: true,  isEditBoxOpen: false, isAdvancedBoxOpen: false };
    case 'CLOSE_READ_BOX':
      return { ...state, isReadBoxOpen: false };
    case 'COLLAPSE_READ_BOX':
      return { ...state, isReadBoxOpen: !state.isReadBoxOpen };
    case 'OPEN_EDIT_BOX':
      return { isReadBoxOpen: false, isEditBoxOpen: true,  isAdvancedBoxOpen: false };
    case 'CLOSE_EDIT_BOX':
      return { ...state, isEditBoxOpen: false };
    case 'OPEN_ADVANCED_BOX':
      return { isReadBoxOpen: false, isEditBoxOpen: false, isAdvancedBoxOpen: true };
    case 'CLOSE_ADVANCED_BOX':
      return { ...state, isAdvancedBoxOpen: false };
    default:
      return state;
  }
}

const SidePanelContext = createContext(undefined);

export function SidePanelContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      readBox: {
        open:     () => dispatch({ type: 'OPEN_READ_BOX' }),
        close:    () => dispatch({ type: 'CLOSE_READ_BOX' }),
        collapse: () => dispatch({ type: 'COLLAPSE_READ_BOX' }),
      },
      editBox: {
        open:  () => dispatch({ type: 'OPEN_EDIT_BOX' }),
        close: () => dispatch({ type: 'CLOSE_EDIT_BOX' }),
      },
      advancedBox: {
        open:  () => dispatch({ type: 'OPEN_ADVANCED_BOX' }),
        close: () => dispatch({ type: 'CLOSE_ADVANCED_BOX' }),
      },
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <SidePanelContext.Provider value={value}>{children}</SidePanelContext.Provider>;
}

export function useSidePanelContext() {
  const ctx = useContext(SidePanelContext);
  if (!ctx) throw new Error('useSidePanelContext must be used inside SidePanelContextProvider');
  return ctx;
}
