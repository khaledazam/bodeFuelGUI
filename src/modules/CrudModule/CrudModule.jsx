/**
 * CrudModule.jsx
 *
 * WHAT CHANGED:
 *   OLD: CrudContextProvider (single big context) → every child re-renders on
 *        any state change (modal open, panel toggle, edit box open…).
 *
 *   NEW: AllCrudProviders wraps the tree. SidePanelTopContent now consumes
 *        useSidePanelContext + useModalContext (fine-grained) instead of the
 *        monolithic useCrudContext. DataTable only re-renders when Redux data
 *        changes, not when a modal button is clicked.
 *
 *   FixHeaderPanel uses usePanelContext so toggling the create-form collapse
 *   no longer touches SidePanel or Modal state.
 */

import { useLayoutEffect, useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import CreateForm  from '@/components/CreateForm';
import UpdateForm  from '@/components/UpdateForm';
import DeleteModal from '@/components/DeleteModal';
import ReadItem    from '@/components/ReadItem';
import SearchItem  from '@/components/SearchItem';
import DataTable   from '@/components/DataTable/DataTable';

import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';
import { crud } from '@/redux/crud/actions';

// ─── Contexts ─────────────────────────────────────────────────────────────────
import {
  AllCrudProviders,
  useSidePanelContext,
  useModalContext,
  usePanelContext,
  useCrudContext,           // kept for components not yet migrated
} from '@/context/crud';

import { CrudLayout } from '@/layout';

// ─────────────────────────────────────────────────────────────────────────────
// SidePanelTopContent
// Uses useSidePanelContext + useModalContext (fine-grained).
// Opening "Edit" or "Delete" no longer triggers DataTable re-render.
// ─────────────────────────────────────────────────────────────────────────────
function SidePanelTopContent({ config, formElements, withUpload }) {
  const translate = useLanguage();
  const { deleteModalLabels } = config;

  // Fine-grained contexts
  const { state: sidePanelState, actions: sidePanelActions } = useSidePanelContext();
  const { actions: modalActions }                            = useModalContext();

  const { isReadBoxOpen, isEditBoxOpen } = sidePanelState;
  const { result: currentItem }          = useSelector(selectCurrentItem);
  const currentAdmin = useSelector((state) => state.auth.current);
  const dispatch                         = useDispatch();

  const [labels, setLabels] = useState('');

  useEffect(() => {
    if (currentItem) {
      setLabels(deleteModalLabels.map((x) => currentItem[x]).join(' '));
    }
  }, [currentItem, deleteModalLabels]);

  const removeItem = () => {
    dispatch(crud.currentAction({ actionType: 'delete', data: currentItem }));
    modalActions.open();
  };

  const editItem = () => {
    dispatch(crud.currentAction({ actionType: 'update', data: currentItem }));
    sidePanelActions.editBox.open();
  };

  const show = isReadBoxOpen || isEditBoxOpen ? { opacity: 1 } : { opacity: 0 };

  return (
    <>
      <Row style={show} gutter={(24, 24)}>
        <Col span={10}>
          <p style={{ marginBottom: '10px' }}>{labels}</p>
        </Col>
        <Col span={14}>
          {currentAdmin?.role !== 'cashier' && (
            <Button
              onClick={removeItem}
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              style={{ float: 'right', marginLeft: '5px', marginTop: '10px' }}
            >
              {translate('remove')}
            </Button>
          )}
          <Button
            onClick={editItem}
            type="text"
            icon={<EditOutlined />}
            size="small"
            style={{ float: 'right', marginLeft: '0px', marginTop: '10px' }}
          >
            {translate('edit')}
          </Button>
        </Col>
        <Col span={24}>
          <div className="line"></div>
        </Col>
        <div className="space10"></div>
      </Row>
      <ReadItem   config={config} />
      <UpdateForm config={config} formElements={formElements} withUpload={withUpload} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FixHeaderPanel
// Uses usePanelContext so toggling the create-form box is isolated.
// ─────────────────────────────────────────────────────────────────────────────
function FixHeaderPanel({ config }) {
  const { actions } = usePanelContext();

  const addNewItem = () => {
    actions.collapsedBox.close();
  };

  return (
    <Row gutter={8}>
      <Col className="gutter-row" span={21}>
        <SearchItem config={config} />
      </Col>
      <Col className="gutter-row" span={3}>
        <Button onClick={addNewItem} block={true} icon={<PlusOutlined />} />
      </Col>
    </Row>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CrudModule (root)
// Wraps with AllCrudProviders instead of the old bare CrudContextProvider.
// ─────────────────────────────────────────────────────────────────────────────
function CrudModule({ config, createForm, updateForm, extra = [], withUpload = false }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    <AllCrudProviders>
      <CrudLayout
        config={config}
        fixHeaderPanel={<FixHeaderPanel config={config} />}
        sidePanelBottomContent={
          <CreateForm config={config} formElements={createForm} withUpload={withUpload} />
        }
        sidePanelTopContent={
          <SidePanelTopContent config={config} formElements={updateForm} withUpload={withUpload} />
        }
      >
        <DataTable config={config} extra={extra} />
        <DeleteModal config={config} />
      </CrudLayout>
    </AllCrudProviders>
  );
}

export default CrudModule;
