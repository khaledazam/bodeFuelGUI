import { useEffect, useState } from 'react';
import { Modal } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useAppContext } from '@/context/appContext';
import { useModalContext, usePanelContext, useSidePanelContext } from '@/context/crud';
import { selectDeletedItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';

import useLanguage from '@/locale/useLanguage';

export default function DeleteModal({ config }) {
  const translate = useLanguage();
  let {
    entity,
    deleteModalLabels,
    deleteMessage = translate('are_you_sure_you_want_to_delete'),
    modalTitle = translate('delete_confirmation'),
  } = config;
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { appContextAction } = useAppContext();
  const { state, actions: modalActions } = useModalContext();
  const { actions: panelActions } = usePanelContext();
  const { actions: sidePanelActions } = useSidePanelContext();
  const { navMenu } = appContextAction;
  const { isModalOpen } = state;
  const [displayItem, setDisplayItem] = useState('');

  useEffect(() => {
    if (isSuccess) {
      modalActions.close();
      dispatch(crud.list({ entity }));
    }

    if (current) {
      const labels = (deleteModalLabels || []).map((x) => valueByString(current, x)).filter(Boolean).join(' ');
      setDisplayItem(labels || current._id || '');
    }
  }, [current, deleteModalLabels, dispatch, entity, isSuccess, modalActions]);

  const handleOk = () => {
    const id = current._id;
    dispatch(crud.delete({ entity, id }));
    sidePanelActions.readBox.close();
    modalActions.close();
    panelActions.panel.close();
    navMenu.collapse();
  };

  const handleCancel = () => {
    if (!isLoading) modalActions.close();
  };

  return (
    <Modal
      title={modalTitle}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      <p>
        {deleteMessage}
        {displayItem}
      </p>
    </Modal>
  );
}
