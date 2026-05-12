/**
 * context/crud/index.jsx
 *
 * WHAT CHANGED:
 *   The old single CrudContext held every piece of UI state in one object.
 *   Any state change (open modal, toggle panel, open edit box) caused ALL
 *   consumers to re-render – including DataTable.
 *
 *   NEW: Three isolated sub-contexts wrap around the legacy CrudContextProvider.
 *     - ModalContext      → isModalOpen
 *     - PanelContext      → isPanelClose, isBoxCollapsed
 *     - SidePanelContext  → isReadBoxOpen, isEditBoxOpen, isAdvancedBoxOpen
 *
 *   BACKWARD COMPAT: useCrudContext() still exists and still works.
 *   Existing consumers are NOT broken. Migrate them to the fine-grained
 *   hooks gradually (CrudModule already migrated below).
 */

import { useMemo, useReducer, createContext, useContext } from 'react';
import { initialState, contextReducer } from './reducer';
import contextActions from './actions';
import contextSelectors from './selectors';

import { ModalContextProvider,     useModalContext     } from './ModalContext';
import { PanelContextProvider,     usePanelContext     } from './PanelContext';
import { SidePanelContextProvider, useSidePanelContext } from './SidePanelContext';

// ─── Re-export fine-grained hooks for consumers ────────────────────────────
export { useModalContext, usePanelContext, useSidePanelContext };

// ─── Legacy unified context (kept intact for backward compat) ──────────────
const CrudContext = createContext();

function CrudContextProvider({ children }) {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const value = useMemo(() => [state, dispatch], [state]);
  return <CrudContext.Provider value={value}>{children}</CrudContext.Provider>;
}

function useCrudContext() {
  const context = useContext(CrudContext);
  if (context === undefined) {
    throw new Error('useCrudContext must be used within a CrudContextProvider');
  }
  const [state, dispatch] = context;
  const crudContextAction   = contextActions(dispatch);
  const crudContextSelector = contextSelectors(state);
  return { state, crudContextAction, crudContextSelector };
}

/**
 * AllCrudProviders
 *
 * Single wrapper that nests all four providers.
 * Use in CrudModule (and anywhere a full CRUD tree is mounted) instead of
 * the bare <CrudContextProvider>.
 */
function AllCrudProviders({ children }) {
  return (
    <CrudContextProvider>
      <ModalContextProvider>
        <PanelContextProvider>
          <SidePanelContextProvider>
            {children}
          </SidePanelContextProvider>
        </PanelContextProvider>
      </ModalContextProvider>
    </CrudContextProvider>
  );
}

export { CrudContextProvider, useCrudContext, AllCrudProviders };
