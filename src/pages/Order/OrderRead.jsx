import ReadOrderModule from '@/modules/OrderModule/ReadOrderModule';

export default function OrderRead() {
  const entity = 'order';
  const Labels = {
    PANEL_TITLE: 'Order',
    DATATABLE_TITLE: 'Order List',
    ADD_NEW_ENTITY: 'Create New Order',
    ENTITY_NAME: 'Order',
  };

  const configPage = { entity, ...Labels };
  return <ReadOrderModule config={configPage} />;
}
