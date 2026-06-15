import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, Button, Select, Divider, Row, Col, DatePicker, message, Spin, Tooltip } from 'antd';
import { PlusOutlined, ScanOutlined, LoadingOutlined } from '@ant-design/icons';
import OrderItemRow from './OrderItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import useResponsive from '@/hooks/useResponsive';
import CreatableCustomerSelect from './CreatableCustomerSelect';
import QRScannerModal from '@/components/QRScannerModal';
import request from '@/request/request';

export default function OrderForm({ subTotal = 0, current = null }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  if (last_invoice_number === undefined) {
    return <></>;
  }

  return <LoadOrderForm subTotal={subTotal} current={current} />;
}

function LoadOrderForm({ subTotal = 0, current = null }) {
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const { isMobile } = useResponsive();
  const form = Form.useFormInstance();

  // ── Scanner state ─────────────────────────────────────────────
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scannedProducts, setScannedProducts] = useState({}); // { fieldKey: productObj }
  const usbInputRef = useRef(null);
  const addFieldFn = useRef(null); // stores Form.List `add` fn
  // ─────────────────────────────────────────────────────────────

  const orderType = Form.useWatch('orderType');
  const deliveryFee = Form.useWatch('deliveryFee') || 0;

  const toNumber = (v) =>
    v === '' || v === null || v === undefined
      ? 0
      : Number(String(v).replace(',', '.'));

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
    }
  }, [current]);

  useEffect(() => {
    const fee = orderType === 'delivery' ? toNumber(deliveryFee) : 0;
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), calculate.add(subTotal, fee));
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate, deliveryFee, orderType]);

  const addField = useRef(false);

  useEffect(() => {
    if (addField.current) addField.current.click();
  }, []);

  // ── Handle scan result (camera OR USB scanner) ────────────────
  const handleScanSuccess = async (code) => {
    if (!code || isSearching) return;
    setIsSearching(true);
    setIsScannerOpen(false);

    try {
      const data = await request.search({
        entity: 'product',
        options: { q: code.trim(), fields: 'name,sku,barcode' },
      });

      if (!data?.success || !data?.result?.length) {
        message.error(`لم يتم العثور على منتج بالكود: ${code}`);
        return;
      }

      const product = data.result[0];

      // Check if already in the order → increment quantity
      const items = form.getFieldValue('items') || [];
      const existingIdx = items.findIndex(
        (item) => item?.product === product._id
      );

      if (existingIdx !== -1) {
        const currentQty = Number(items[existingIdx]?.quantity) || 0;
        form.setFields([
          { name: ['items', existingIdx, 'quantity'], value: currentQty + 1 },
        ]);
        message.success(`تمت إضافة وحدة إضافية لـ: ${product.name}`);
      } else {
        // Add new row with the scanned product
        if (addFieldFn.current) {
          addFieldFn.current();
          // Wait a tick for the new row to mount, then set its product
          setTimeout(() => {
            const newItems = form.getFieldValue('items') || [];
            const newIdx = newItems.length - 1;
            setScannedProducts((prev) => ({ ...prev, [newIdx]: product }));
            message.success(`تمت إضافة: ${product.name}`);
          }, 80);
        }
      }
    } catch (err) {
      message.error('حدث خطأ أثناء البحث');
    } finally {
      setIsSearching(false);
      if (usbInputRef.current) usbInputRef.current.value = '';
    }
  };

  // USB / Bluetooth scanner: fires when Enter is pressed
  const handleUsbInput = (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (val) handleScanSuccess(val);
    }
  };
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="customer"
            label="العميل"
            rules={[{ required: true, message: 'يرجى اختيار العميل أو إدخال إسم جديد' }]}
          >
            <CreatableCustomerSelect />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Form.Item
            label="رقم الطلب #"
            name="invoiceNumber"
            initialValue={`ORD-${lastNumber}`}
            rules={[{ required: true }]}
          >
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item
            label="نوع الطلب"
            name="orderType"
            rules={[{ required: true }]}
            initialValue={'store'}
          >
            <Select
              options={[
                { value: 'store', label: 'شراء من المحل (Store)' },
                { value: 'delivery', label: 'توصيل (Delivery)' },
              ]}
            ></Select>
          </Form.Item>
        </Col>

        {orderType === 'delivery' && (
          <Col xs={24} sm={12} md={3}>
            <Form.Item
              label="رسوم التوصيل"
              name="deliveryFee"
              rules={[{ required: true, message: 'مطلوب' }]}
              initialValue={0}
            >
              <MoneyInputFormItem />
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12} md={5}>
          <Form.Item
            label="طريقة الدفع"
            name="paymentMethod"
            rules={[{ required: true }]}
            initialValue={'cash'}
          >
            <Select
              options={[
                { value: 'cash', label: 'نقداً (Cash)' },
                { value: 'card', label: 'بطاقة (Card)' },
                { value: 'instapay', label: 'Instapay' },
                { value: 'vodafone', label: 'Vodafone Cash' },
              ]}
            ></Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={5}>
          <Form.Item
            label="حالة الطلب"
            name="orderStatus"
            rules={[{ required: true }]}
            initialValue={'pending'}
          >
            <Select
              placeholder="اختر الحالة"
              options={[
                { value: 'pending', label: 'قيد الانتظار' },
                { value: 'paid', label: 'تم الدفع' },
                { value: 'shipped', label: 'تم الشحن' },
                { value: 'delivered', label: 'تم التوصيل' },
                { value: 'cancelled', label: 'ملغي' },
              ]}
            ></Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={5}>
          <Form.Item
            label="المبلغ المدفوع (مقدماً)"
            name="credit"
            initialValue={0}
            tooltip="المبلغ الذي دفعه العميل فعلياً الآن (مثل رسوم الشحن عبر إنستا باي)"
          >
            <MoneyInputFormItem />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={5}>
          <Form.Item
            name="orderDate"
            label="تاريخ الطلب"
            rules={[{ required: true, type: 'object' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} placeholder="اختر التاريخ" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={10}>
          <Form.Item label="ملاحظات" name="notes">
            <Input placeholder="أضف ملاحظاتك هنا..." />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      {!isMobile && (
        <Row gutter={[12, 12]} style={{ position: 'relative' }}>
          <Col span={7}>
            <p>المكمل الغذائي</p>
          </Col>
          <Col span={3}>
            <p>الكمية</p>
          </Col>
          <Col span={4}>
            <p>السعر</p>
          </Col>
          <Col span={5}>
            <p>الإجمالي</p>
          </Col>
        </Row>
      )}
      {/* ── USB / Bluetooth Scanner Input ── */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tooltip title="اسكانر USB/Bluetooth: ضع المؤشر هنا واسكن المنتج مباشرة">
          <Input
            ref={usbInputRef}
            prefix={isSearching ? <Spin indicator={<LoadingOutlined spin />} size="small" /> : <ScanOutlined style={{ color: '#1677ff' }} />}
            placeholder="اسكن الباركود هنا (USB / Bluetooth)..."
            onKeyDown={handleUsbInput}
            style={{ maxWidth: 320 }}
            disabled={isSearching}
          />
        </Tooltip>
        <Button
          icon={<ScanOutlined />}
          type="default"
          onClick={() => setIsScannerOpen(true)}
          loading={isSearching}
        >
          {isMobile ? '' : 'كاميرا'}
        </Button>
      </div>

      <Form.List name="items">
        {(fields, { add, remove }) => {
          // Store `add` fn so handleScanSuccess can call it
          addFieldFn.current = add;
          return (
            <>
              {fields.map((field) => (
                <OrderItemRow
                  key={field.key}
                  remove={remove}
                  field={field}
                  current={current}
                  initialProduct={scannedProducts[field.name] || null}
                />
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  size="large"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  ref={addField}
                >
                  إضافة مكمل يدوياً
                </Button>
              </Form.Item>
            </>
          );
        }}
      </Form.List>

      {/* ── Camera Scanner Modal ── */}
      <QRScannerModal
        open={isScannerOpen}
        onCancel={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
      <Divider dashed />
      <div style={{ position: 'relative', width: ' 100%', display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-end' : 'flex-start' }}>
        <div style={{ width: isMobile ? '100%' : '200px', marginTop: isMobile ? '20px' : '0' }}>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" icon={<PlusOutlined />} block>
              حفظ الطلب
            </Button>
          </Form.Item>
        </div>
        
        <div style={{ width: isMobile ? '100%' : '50%' }}>
          <Row gutter={[12, -5]} align="middle">
            <Col xs={12} sm={12} md={16}>
              <p style={{ textAlign: 'left', fontWeight: 'bold' }}>الإجمالي الفرعي :</p>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <MoneyInputFormItem readOnly value={subTotal} />
            </Col>
          </Row>
          <Row gutter={[12, -5]} align="middle">
            <Col xs={12} sm={12} md={16}>
               <p style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '18px' }}>الإجمالي النهائي :</p>
            </Col>
            <Col xs={12} sm={12} md={8}>
              <MoneyInputFormItem readOnly value={total} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
