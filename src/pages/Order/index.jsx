import dayjs from 'dayjs';
import { Tag } from 'antd';
import { useMoney, useDate } from '@/settings';
import OrderDataTableModule from '@/modules/OrderModule/OrderDataTableModule';

export default function Order() {
  const { dateFormat } = useDate();
  const entity = 'order';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'order',
    displayLabels: ['invoiceNumber'],
    searchFields: 'invoiceNumber',
  };
  const deleteModalLabels = ['invoiceNumber', 'customer.name'];
  const dataTableColumns = [
    {
      title: 'رقم الطلب',
      dataIndex: 'invoiceNumber',
    },
    {
      title: 'العملاء',
      dataIndex: ['customer', 'name'],
    },
    {
      title: 'تاريخ الطلب',
      dataIndex: 'orderDate',
      render: (date) => dayjs(date).format(dateFormat),
    },
    {
      title: 'الإجمالي',
      dataIndex: 'totalAmount',
      onCell: () => ({
        style: { textAlign: 'right', whiteSpace: 'nowrap', direction: 'ltr' },
      }),
      render: (total) => moneyFormatter({ amount: total }),
    },
    {
      title: 'نوع الطلب',
      dataIndex: 'orderType',
      render: (type) => {
        let color = type === 'delivery' ? 'magenta' : 'cyan';
        let label = type === 'delivery' ? 'توصيل' : 'استلام محل';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'حالة الطلب',
      dataIndex: 'orderStatus',
      render: (status) => {
        let color = 'blue';
        let label = 'قيد الانتظار';
        if (status === 'shipped') { color = 'orange'; label = 'تم الشحن'; }
        if (status === 'delivered') { color = 'green'; label = 'تم التوصيل'; }
        if (status === 'cancelled') { color = 'red'; label = 'ملغي'; }
        if (status === 'paid') { color = 'green'; label = 'مدفوع'; }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'حالة الدفع',
      dataIndex: 'paymentStatus',
      render: (status) => {
        let color = 'default';
        let label = 'غير مدفوع';
        if (status === 'paid') { color = 'green'; label = 'مدفوع'; }
        if (status === 'partially') { color = 'orange'; label = 'مدفوع جزئياً'; }
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: 'الطلبات والمبيعات',
    DATATABLE_TITLE: 'إدارة الطلبات',
    ADD_NEW_ENTITY: 'إضافة جديد',
    ENTITY_NAME: 'الطلب',
  };

  const configPage = { entity, ...Labels };
  const config = { ...configPage, dataTableColumns, searchConfig, deleteModalLabels };

  return <OrderDataTableModule config={config} />;
}
