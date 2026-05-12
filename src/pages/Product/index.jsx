import CrudModule from '@/modules/CrudModule/CrudModule';
import ProductForm from './ProductForm';
import { fields } from './config';

export default function Product() {
  const entity = 'product';
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
      createForm={<ProductForm />}
      updateForm={<ProductForm isUpdateForm={true} />}
      config={config}
    />
  );
}
