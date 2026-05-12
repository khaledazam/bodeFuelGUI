import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, Button, Select, Divider, Row, Col, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import OrderItemRow from './OrderItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import useResponsive from '@/hooks/useResponsive';
import CreatableCustomerSelect from './CreatableCustomerSelect';

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

  const handelTaxChange = (value) => {
    setTaxRate(value / 100);
  };

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), subTotal);
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate]);

  const addField = useRef(false);

  useEffect(() => {
    if (addField.current) addField.current.click();
  }, []);

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

        <Col xs={24} sm={12} md={8}>
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
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <OrderItemRow key={field.key} remove={remove} field={field} current={current}></OrderItemRow>
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
                إضافة مكمل جديد
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
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
