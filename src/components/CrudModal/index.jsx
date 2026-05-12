import { useEffect } from 'react';
import { Modal } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { crud } from '@/redux/crud/actions';
import { useModalContext } from '@/context/crud';
import { selectDeletedItem } from '@/redux/crud/selectors';

import useLanguage from '@/locale/useLanguage';

export default function DeleteModal({ config, children }) {
  const translate = useLanguage();
  let { entity, modalTitle = translate('delete_confirmation') } = config;
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, actions } = useModalContext();
  const { isModalOpen } = state;

  useEffect(() => {
    if (isSuccess) {
      actions.close();
      dispatch(crud.list({ entity }));
    }
  }, [isSuccess]);

  const handleOk = () => {
    const id = current._id;
    dispatch(crud.delete({ entity, id }));
  };
  const handleCancel = () => {
    if (!isLoading) actions.close();
  };
  return (
    <Modal
      title={modalTitle}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      {children}
    </Modal>
  );
}
