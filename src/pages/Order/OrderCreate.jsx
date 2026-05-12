import CreateOrderModule from '@/modules/OrderModule/CreateOrderModule';

export default function OrderCreate() {
  const entity = 'order';
  const Labels = {
    PANEL_TITLE: 'Order',
    DATATABLE_TITLE: 'Order List',
    ADD_NEW_ENTITY: 'Create New Order',
    ENTITY_NAME: 'Order',
  };

  const configPage = { entity, ...Labels };
  return <CreateOrderModule config={configPage} />;
}
