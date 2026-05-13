import { Tag, Space, Typography } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  SyncOutlined,
  ShoppingOutlined,
  RollbackOutlined,
  DeleteOutlined,
  SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CrudModule from '@/modules/CrudModule/CrudModule';
import useLanguage from '@/locale/useLanguage';

const { Text } = Typography;

export default function InventoryLog() {
  const translate = useLanguage();

  const typeConfig = {
    IN:       { color: 'green',  label: 'إدخال مخزن', icon: <ArrowUpOutlined /> },
    OUT:      { color: 'volcano', label: 'إخراج مخزن', icon: <ArrowDownOutlined /> },
    ADJUST:   { color: 'blue',   label: 'تعديل يدوي', icon: <SyncOutlined /> },
    SALE:     { color: 'cyan',   label: 'عملية بيع', icon: <ShoppingOutlined /> },
    PURCHASE: { color: 'purple', label: 'شراء بضاعة', icon: <ShoppingOutlined /> },
    RETURN:   { color: 'orange', label: 'مرتجع', icon: <RollbackOutlined /> },
    DAMAGE:   { color: 'red',    label: 'تالف', icon: <DeleteOutlined /> },
  };

  const config = {
    entity: 'inventorylog',
    panelTitle: 'سجل حركات المخزن (Audit Log)',
    entityDisplayLabels: ['product.name'],
    
    // Disable create/update/delete from this screen (Read Only Audit Log)
    disableAdd: true,
    disableEdit: true,
    disableDelete: true,

    searchConfig: {
      displayLabels: ['product.name', 'reason'],
      searchFields: ['product.name', 'reason', 'type'],
      outputValue: '_id',
    },

    dataTableColumns: [
      {
        title: 'التاريخ',
        dataIndex: 'created',
        key: 'created',
        sorter: true,
        render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      },
      {
        title: 'المكمل / المنتج',
        key: 'product',
        render: (_, record) => (
          <Text strong>{record.product?.name || '—'}</Text>
        ),
      },
      {
        title: 'نوع الحركة',
        dataIndex: 'type',
        key: 'type',
        render: (type) => {
          const config = typeConfig[type] || { color: 'default', label: type, icon: <SettingOutlined /> };
          return (
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
          );
        },
      },
      {
        title: 'التغيير',
        dataIndex: 'change',
        key: 'change',
        render: (change) => {
          const isPositive = change > 0;
          return (
            <Text type={isPositive ? 'success' : 'danger'} strong>
              {isPositive ? '+' : ''}{change}
            </Text>
          );
        },
      },
      {
        title: 'المخزون (قبل / بعد)',
        key: 'stock_range',
        render: (_, record) => (
          <Space>
            <Text type="secondary">{record.previousStock}</Text>
            <ArrowUpOutlined style={{ fontSize: '10px' }} />
            <Text strong>{record.newStock}</Text>
          </Space>
        ),
      },
      {
        title: 'السبب',
        dataIndex: 'reason',
        key: 'reason',
        render: (reason) => <Text style={{ fontSize: '12px' }}>{reason || '—'}</Text>,
      },
      {
        title: 'بواسطة',
        key: 'user',
        render: (_, record) => (
          <Tag icon={<SettingOutlined />} color="blue">
            {record.user?.name || record.user?.email || 'System'}
          </Tag>
        ),
      },
    ],
  };

  return (
    <CrudModule 
      config={config}
    />
  );
}
