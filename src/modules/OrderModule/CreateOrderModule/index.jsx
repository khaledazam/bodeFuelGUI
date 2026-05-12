import OrderForm from '../Forms/OrderForm';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';

import useLanguage from '@/locale/useLanguage';

export default function CreateOrderModule({ config }) {
  return (
    <CreateItem config={config} CreateForm={OrderForm} />
  );
}
