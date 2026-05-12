import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import CrudModule from '@/modules/CrudModule/CrudModule';
import ProductForm from './ProductForm';
import { fields as initialFields } from './config';

export default function Product() {
  const entity = 'product';
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isCashier = currentAdmin?.role === 'cashier';

  // Filter fields if the user is a cashier to hide wholesale price
  const fields = isCashier 
    ? Object.keys(initialFields).reduce((acc, key) => {
        if (key !== 'costPrice') acc[key] = initialFields[key];
        return acc;
      }, {})
    : initialFields;

  const searchConfig = {
    displayLabels: ['name', 'sku'],
    searchFields: 'name,sku',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: 'المكملات الغذائية',
    DATATABLE_TITLE: 'قائمة المكملات الغذائية',
    ADD_NEW_ENTITY: 'إضافة جديد',
    ENTITY_NAME: 'مكمل غذائي',
  };
  
  const configPage = {
    entity,
    ...Labels,
  };
  
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };
  
  return (
    <CrudModule
      createForm={!isCashier ? <ProductForm /> : null} // Prevent cashier from creating if they can't see cost
      updateForm={<ProductForm isUpdateForm={true} />}
      config={config}
      disableAdd={isCashier} // Disable adding new supplements for cashier
    />
  );
}
