import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

import useLanguage from '@/locale/useLanguage';

export default function Expense() {
  const translate = useLanguage();
  const entity = 'expense';
  
  const currentAdmin = useSelector(selectCurrentAdmin);

  let activeFields = { ...fields };
  if (currentAdmin?.role === 'cashier') {
    activeFields.user = {
      ...fields.user,
      disableForForm: true,
      disableForUpdate: true,
    };
  }
  
  const searchConfig = {
    displayLabels: ['name', 'expenseCategory', 'amount'],
    searchFields: 'name,expenseCategory',
  };
  const deleteModalLabels = ['name', 'amount'];

  const Labels = {
    PANEL_TITLE: 'المصروفات والمسحوبات',
    DATATABLE_TITLE: 'قائمة المصروفات',
    ADD_NEW_ENTITY: 'إضافة مصروف جديد',
    ENTITY_NAME: 'مصروف',
  };

  const configPage = {
    entity,
    ...Labels,
  };
  
  const config = {
    ...configPage,
    fields: activeFields,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={activeFields} />}
      updateForm={<DynamicForm fields={activeFields} isUpdateForm={true} />}
      config={config}
    />
  );
}
