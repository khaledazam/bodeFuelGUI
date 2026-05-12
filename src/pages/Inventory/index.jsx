import { useState } from 'react';
import { Button, Modal, Form, InputNumber, Select, message, Tag, Space, Typography, Badge } from 'antd';
import { 
  RetweetOutlined, 
  WarningOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import CrudModule from '@/modules/CrudModule/CrudModule';
import { crud } from '@/redux/crud/actions';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import InventoryFormElements from './InventoryFormElements';   // ← مهم

const { Text } = Typography;

export default function Inventory() {
  const dispatch = useDispatch();
  const translate = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAdjust = (record) => {
    setCurrentRecord(record);
    form.resetFields();
    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    if (!currentRecord) return;

    try {
      setIsLoading(true);

      // request.post() signature is { entity, jsonData } — NOT { url, data }
      // entity maps directly to the URL path after /api/
      const response = await request.post({
        entity: 'inventory/adjust',
        jsonData: {
          id: currentRecord._id,
          adjustment: Number(values.adjustment),
          reason: values.reason,
        },
      });

      if (response.success) {
        message.success('تم تعديل المخزون بنجاح');
        setIsModalOpen(false);
        form.resetFields();

        // تحديث الجدول
        dispatch(crud.list({ entity: 'inventory' }));
      } else {
        message.error(response.message || 'فشل في تعديل المخزون');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'حدث خطأ أثناء عملية التعديل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsLoading(true);
      const response = await request.get({ entity: 'inventory/sync-all' });
      if (response.success) {
        message.success(response.message);
        dispatch(crud.list({ entity: 'inventory' }));
      } else {
        message.error(response.message || 'فشل في مزامنة المنتجات');
      }
    } catch (error) {
      message.error('حدث خطأ أثناء المزامنة');
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    entity: 'inventory',
    panelTitle: 'المخزون والجرد',
    addButton: (
      <Button 
        type="primary" 
        icon={<RetweetOutlined />} 
        onClick={handleSyncAll}
        loading={isLoading}
      >
        مزامنة كافة المنتجات مع المخزن
      </Button>
    ),

    searchConfig: {
      displayLabels: ['product.name'],
      searchFields: ['product.name'],
      outputValue: '_id',
    },

    entityDisplayLabels: ['product.name'],
    deleteModalLabels: ['product.name'],
    deleteMessage: 'هل أنت متأكد من حذف سجل المخزون لهذا المنتج؟ سيتم حذف السجل فقط وليس المنتج نفسه.',
    modalTitle: 'تأكيد الحذف من المخزن',
    onExtraClick: (key, record) => {
      if (key === 'adjust') handleAdjust(record);
    },

    dataTableColumns: [
      {
        title: 'المكمل',
        key: 'product',
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <strong>{record.product?.name || <span style={{ color: '#999' }}>غير مرتبط</span>}</strong>
            {record.product?.sku && (
              <Text type="secondary" style={{ fontSize: '12px' }}>SKU: {record.product.sku}</Text>
            )}
          </Space>
        ),
      },
      {
        title: 'الكمية الحالية',
        key: 'currentStock',
        render: (_, record) => {
          const stock = record.currentStock ?? 0;
          const threshold = record.lowStockThreshold || 10;
          let color = 'green';
          let statusText = 'متوفر';
          let icon = <CheckCircleOutlined />;

          if (stock <= 0) {
            color = 'red';
            statusText = 'نفذ المخزون';
            icon = <WarningOutlined />;
          } else if (stock <= threshold) {
            color = 'orange';
            statusText = 'مخزون منخفض';
            icon = <ExclamationCircleOutlined />;
          }

          return (
            <Space direction="vertical" size={2}>
              <Tag color={color} icon={icon} style={{ padding: '6px 12px', fontSize: '14px' }}>
                {stock} وحدة
              </Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {statusText}
              </Text>
            </Space>
          );
        },
      },
      {
        title: 'المحجوز',
        key: 'reservedStock',
        align: 'center',
        render: (_, record) => {
          const reserved = record.reservedStock ?? 0;
          if (reserved === 0) {
            return <Text type="secondary">0</Text>;
          }
          return (
            <Tag color="volcano" style={{ fontSize: '13px' }}>
              {reserved} محجوز
            </Tag>
          );
        },
      },
      {
        title: 'المتاح',
        key: 'available',
        align: 'center',
        render: (_, record) => {
          const current = record.currentStock ?? 0;
          const reserved = record.reservedStock ?? 0;
          const available = current - reserved;
          let color = 'green';
          if (available <= 0) color = 'red';
          else if (available <= (record.lowStockThreshold || 10)) color = 'orange';

          return (
            <Tag color={color} style={{ fontSize: '14px', fontWeight: 700 }}>
              {available} متاح
            </Tag>
          );
        },
      },
      {
        title: 'الصلاحية',
        dataIndex: 'nextExpirationBatch',
        key: 'expiry',
        render: (date) => {
          if (!date) return <Tag color="default">غير محدد</Tag>;

          const diff = dayjs(date).diff(dayjs(), 'days');
          let color = 'blue';
          let label = `${diff} يوم`;

          if (diff < 0) {
            color = 'red';
            label = 'منتهي الصلاحية';
          } else if (diff < 15) {
            color = 'volcano';
            label = 'ينتهي قريباً';
          }

          return (
            <Space direction="vertical" size={2}>
              <Tag color={color}>{dayjs(date).format('DD/MM/YYYY')}</Tag>
              <Text type={diff < 0 ? 'danger' : 'secondary'} style={{ fontSize: '12px' }}>
                {label}
              </Text>
            </Space>
          );
        },
      },
    ],
  };

  const inventoryActions = [
    { label: 'تسوية المخزون', key: 'adjust', icon: <RetweetOutlined /> },
  ];

  return (
    <>
      <CrudModule 
        config={config}
        createForm={InventoryFormElements()}
        updateForm={InventoryFormElements()}
        extra={inventoryActions}
      />

      {/* Modal تعديل المخزون (احتفظنا به لأنه مفيد) */}
      <Modal
        title={
          <Space>
            <RetweetOutlined style={{ color: '#1890ff' }} />
            تسوية المخزون
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        {currentRecord && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px' 
          }}>
            <Text type="secondary">المنتج:</Text>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>
              {currentRecord.product?.name}
            </div>

            <div style={{ marginTop: 12 }}>
              <Text type="secondary">الرصيد الحالي: </Text>
              <Badge 
                count={currentRecord.currentStock || 0} 
                style={{ 
                  backgroundColor: currentRecord.currentStock > 0 ? '#52c41a' : '#f5222d' 
                }}
                showZero
              />
            </div>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="adjustment"
            label="كمية التسوية (+ إضافة - خصم)"
            rules={[{ required: true, message: 'الكمية مطلوبة' }]}
            tooltip="استخدم رقم موجب للإضافة ورقم سالب للخصم"
          >
            <InputNumber
              stringMode
              style={{ width: '100%' }}
              placeholder="10 أو -5"
              size="large"
              parser={(val) => val?.replace(',', '.')}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="سبب التسوية"
            rules={[{ required: true, message: 'يرجى اختيار السبب' }]}
          >
            <Select placeholder="اختر سبب التسوية" size="large">
              <Select.Option value="Restock">توريد جديد</Select.Option>
              <Select.Option value="Damage">تالف / تلف</Select.Option>
              <Select.Option value="Return">مرتجع من العميل</Select.Option>
              <Select.Option value="Correction">تصحيح خطأ حسابي</Select.Option>
              <Select.Option value="Expired">استبعاد منتهي الصلاحية</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={isLoading}
            >
              تأكيد التسوية وحفظ التغييرات
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}