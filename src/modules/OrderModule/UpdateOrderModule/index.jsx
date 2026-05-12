import OrderForm from '../Forms/OrderForm';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';

export default function UpdateOrderModule({ config }) {
  return (
    <UpdateItem config={config} UpdateForm={OrderForm} />
  );
}
