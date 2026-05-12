import { useState, useEffect } from 'react';
import { Divider, Button, Row, Col, Descriptions, Statistic, Tag, Space, Typography, Modal, message } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  StopOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { generate as uniqueId } from 'shortid';
import { selectCurrentItem } from '@/redux/erp/selectors';
import { useMoney, useDate } from '@/settings';
import { useNavigate, useParams } from 'react-router-dom';
import { request } from '@/request';
import dayjs from 'dayjs';

const { Text } = Typography;

// ── Status config ──────────────────────────────
const statusMap = {
  pending:   { color: 'orange',  icon: <ClockCircleOutlined />,  label: 'قيد الانتظار' },
  paid:      { color: 'blue',    icon: <DollarOutlined />,       label: 'تم الدفع' },
  shipped:   { color: 'cyan',    icon: <CarOutlined />,          label: 'تم الشحن' },
  delivered: { color: 'green',   icon: <CheckCircleOutlined />,  label: 'تم التوصيل' },
  cancelled: { color: 'red',     icon: <StopOutlined />,         label: 'ملغي' },
};

// ── Allowed transitions ────────────────────────
// Defines which status buttons appear based on current status
const transitions = {
  pending:   ['paid', 'shipped', 'cancelled'],
  paid:      ['shipped', 'cancelled'],
  shipped:   ['delivered'],
  delivered: [],       // final state
  cancelled: [],       // final state
};

const transitionLabels = {
  paid:      { label: '💰 تأكيد الدفع',   color: 'blue',    icon: <DollarOutlined /> },
  shipped:   { label: '🚚 تأكيد الشحن',   color: 'cyan',    icon: <CarOutlined /> },
  delivered: { label: '✅ تأكيد التوصيل',  color: 'green',   icon: <CheckCircleOutlined /> },
  cancelled: { label: '❌ إلغاء الطلب',    color: 'red',     icon: <StopOutlined /> },
};

// ── Single line-item row ───────────────────────
const OrderItemRow = ({ item, moneyFormatter }) => {
  const productName =
    typeof item.product === 'object' && item.product !== null
      ? item.product.name || item.product.sku || item.product._id
      : item.product || '—';

  return (
    <Row gutter={[12, 0]} key={item._id} style={{ padding: '8px 0' }}>
      <Col span={11}>
        <strong>{productName}</strong>
      </Col>
      <Col span={4} style={{ textAlign: 'right' }}>
        {moneyFormatter({ amount: item.price })}
      </Col>
      <Col span={4} style={{ textAlign: 'right' }}>
        {item.quantity}
      </Col>
      <Col span={5} style={{ textAlign: 'right', fontWeight: 700 }}>
        {moneyFormatter({ amount: item.total })}
      </Col>
      <Divider dashed style={{ marginTop: 0, marginBottom: 0 }} />
    </Row>
  );
};

// ── Main component ─────────────────────────────
export default function ReadOrderModule({ config }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const [statusLoading, setStatusLoading] = useState(false);

  const { result: currentResult } = useSelector(selectCurrentItem);

  // Fetch order on mount or when id changes
  useEffect(() => {
    if (id) {
      dispatch(erp.read({ entity, id }));
    }
  }, [id]);

  const order = currentResult || {};
  const items = order.items || [];
  const currentStatus = order.orderStatus || 'pending';

  const customerName =
    typeof order.customer === 'object' && order.customer !== null
      ? order.customer.name || order.customer._id
      : order.customer || '—';

  const status = statusMap[currentStatus] || statusMap.pending;
  const allowedTransitions = transitions[currentStatus] || [];

  // ── Change order status via API ──────────────
  const handleStatusChange = (newStatus) => {
    const info = transitionLabels[newStatus];
    const isDestructive = newStatus === 'cancelled';
    const isDeduction = newStatus === 'shipped' || newStatus === 'delivered';

    Modal.confirm({
      title: `${info.label}`,
      icon: <ExclamationCircleOutlined />,
      content: isDeduction
        ? 'سيتم خصم الكميات من المخزون الفعلي. هل أنت متأكد؟'
        : isDestructive
          ? 'سيتم تحرير المخزون المحجوز وإلغاء الطلب. هل أنت متأكد؟'
          : 'هل أنت متأكد من تغيير حالة الطلب؟',
      okText: 'نعم، تأكيد',
      cancelText: 'لا، إلغاء',
      okButtonProps: { danger: isDestructive },
      async onOk() {
        setStatusLoading(true);
        try {
          const response = await request.update({
            entity,
            id: order._id,
            jsonData: { orderStatus: newStatus },
          });

          if (response.success) {
            message.success(
              isDeduction
                ? '✅ تم تغيير الحالة وتم خصم الكميات من المخزون'
                : '✅ تم تغيير حالة الطلب بنجاح'
            );
            // Refresh order data
            dispatch(erp.read({ entity, id: order._id }));
          } else {
            message.error(response.message || 'حدث خطأ أثناء تحديث الحالة');
          }
        } catch (err) {
          message.error('حدث خطأ أثناء تحديث الحالة');
        } finally {
          setStatusLoading(false);
        }
      },
    });
  };

  return (
    <>
      <PageHeader
        onBack={() => navigate(`/${entity.toLowerCase()}`)}
        title={`${ENTITY_NAME || 'طلب'} # ${order.invoiceNumber || '—'}`}
        ghost={false}
        tags={[
          <Tag key="status" color={status.color} icon={status.icon} style={{ fontSize: '14px', padding: '4px 12px' }}>
            {status.label}
          </Tag>,
          order.paymentStatus && (
            <Tag key="payment" color={order.paymentStatus === 'paid' ? 'green' : 'default'}>
              {translate(order.paymentStatus)}
            </Tag>
          ),
        ]}
        extra={[
          <Button
            key="close"
            onClick={() => navigate(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Close')}
          </Button>,
          <Button
            key="edit"
            onClick={() => {
              dispatch(erp.currentAction({ actionType: 'update', data: order }));
              navigate(`/${entity.toLowerCase()}/update/${order._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
          <Button
            key="print"
            onClick={() => window.print()}
            icon={<PrinterOutlined />}
          >
            {translate('Print')}
          </Button>,
        ]}
        style={{ padding: '20px 0px' }}
      >
        <Row gutter={[32, 16]}>
          <Statistic title="الحالة" value={status.label} />
          <Statistic
            title="التاريخ"
            value={order.orderDate ? dayjs(order.orderDate).format(dateFormat || 'DD/MM/YYYY') : '—'}
            style={{ margin: '0 32px' }}
          />
          <Statistic
            title="الإجمالي"
            value={moneyFormatter({ amount: order.totalAmount || 0 })}
            style={{ margin: '0 32px' }}
          />
        </Row>
      </PageHeader>

      {/* ── Quick Status Action Buttons ─────────── */}
      {allowedTransitions.length > 0 && (
        <>
          <Divider orientation="right" orientationMargin={0} style={{ marginTop: 12, marginBottom: 12 }}>
            تغيير حالة الطلب
          </Divider>
          <Space wrap size="middle" style={{ marginBottom: 16 }}>
            {allowedTransitions.map((nextStatus) => {
              const info = transitionLabels[nextStatus];
              return (
                <Button
                  key={nextStatus}
                  size="large"
                  type={nextStatus === 'shipped' || nextStatus === 'delivered' ? 'primary' : 'default'}
                  danger={nextStatus === 'cancelled'}
                  icon={info.icon}
                  loading={statusLoading}
                  onClick={() => handleStatusChange(nextStatus)}
                  style={{
                    minWidth: 160,
                    height: 48,
                    fontSize: '15px',
                    fontWeight: 600,
                    borderRadius: 8,
                  }}
                >
                  {info.label}
                </Button>
              );
            })}
          </Space>
        </>
      )}

      {/* Terminal state message */}
      {allowedTransitions.length === 0 && currentStatus !== 'pending' && (
        <div style={{ margin: '16px 0', padding: '12px 16px', background: currentStatus === 'delivered' ? '#f6ffed' : '#fff2f0', borderRadius: 8 }}>
          <Text strong style={{ color: currentStatus === 'delivered' ? '#52c41a' : '#ff4d4f', fontSize: '15px' }}>
            {currentStatus === 'delivered' ? '✅ تم التوصيل — الطلب مكتمل والمخزون تم خصمه' : '❌ تم إلغاء الطلب'}
          </Text>
        </div>
      )}

      <Divider dashed />

      {/* ── Customer info ─────────────────────── */}
      <Descriptions title={`العميل: ${customerName}`}>
        {typeof order.customer === 'object' && order.customer !== null && (
          <>
            {order.customer.email && (
              <Descriptions.Item label="البريد">{order.customer.email}</Descriptions.Item>
            )}
            {order.customer.phone && (
              <Descriptions.Item label="الهاتف">{order.customer.phone}</Descriptions.Item>
            )}
            {order.customer.address && (
              <Descriptions.Item label="العنوان">{order.customer.address}</Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>

      {order.notes && (
        <>
          <Divider dashed />
          <Text type="secondary">ملاحظات: {order.notes}</Text>
        </>
      )}

      <Divider />

      {/* ── Items table header ────────────────── */}
      <Row gutter={[12, 0]}>
        <Col span={11}><strong>المنتج</strong></Col>
        <Col span={4} style={{ textAlign: 'right' }}><strong>السعر</strong></Col>
        <Col span={4} style={{ textAlign: 'right' }}><strong>الكمية</strong></Col>
        <Col span={5} style={{ textAlign: 'right' }}><strong>الإجمالي</strong></Col>
      </Row>
      <Divider style={{ marginTop: 8, marginBottom: 8 }} />

      {/* ── Items list ────────────────────────── */}
      {items.length > 0 ? (
        items.map((item, idx) => (
          <OrderItemRow key={item._id || idx} item={item} moneyFormatter={moneyFormatter} />
        ))
      ) : (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 24 }}>
          لا توجد عناصر في هذا الطلب
        </Text>
      )}

      {/* ── Totals ────────────────────────────── */}
      <div style={{ width: 300, float: 'right', textAlign: 'right', fontWeight: 700, marginTop: 16 }}>
        <Row gutter={[12, -5]}>
          <Col span={12}><p>الإجمالي :</p></Col>
          <Col span={12}>
            <p>{moneyFormatter({ amount: order.totalAmount || 0 })}</p>
          </Col>
        </Row>
      </div>
      <div style={{ clear: 'both' }} />
    </>
  );
}
