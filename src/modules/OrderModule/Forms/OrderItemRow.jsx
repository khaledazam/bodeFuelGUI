import { useState, useEffect } from 'react';
import { Form, Input, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import useResponsive from '@/hooks/useResponsive';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';

export default function OrderItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const money = useMoney();
  const form = Form.useFormInstance();
  const { isMobile } = useResponsive();

  const handleProductChange = (value, option) => {
    if (option) {
      // Use sellPrice as the default, fallback to old price if sellPrice is not set
      const defaultPrice = option.sellPrice || option.price || 0;
      const costPriceVal = option.costPrice || 0;
      setPrice(defaultPrice);
      // Update form fields so parent onValuesChange is triggered
      const items = form.getFieldValue('items') || [];
      const newItems = [...items];
      if (!newItems[field.name]) {
        newItems[field.name] = {};
      }
      // Update form context using setFields for precise targeting in Form.List
      form.setFields([
        { name: ['items', field.name, 'price'], value: defaultPrice },
        { name: ['items', field.name, 'costPrice'], value: costPriceVal },
      ]);
    }
  };

  const toNumber = (v) =>
    v === '' || v === null || v === undefined
      ? 0
      : Number(String(v).replace(',', '.'));

  const updateQt = (e) => {
    const val = e.target.value;
    setQuantity(toNumber(val));
  };
  const updatePrice = (val) => {
    setPrice(toNumber(val));
  };

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
  }, [price, quantity]);

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative', marginBottom: isMobile ? '20px' : '0', padding: isMobile ? '10px' : '0', border: isMobile ? '1px dashed #d9d9d9' : 'none' }}>
      <Col xs={24} sm={12} md={7}>
        <Form.Item
          name={[field.name, 'product']}
          rules={[{ required: true, message: 'مطلوب' }]}
          label={isMobile ? "المكمل الغذائي" : null}
        >
          <AutoCompleteAsync
            entity={'product'}
            displayLabels={['name', 'sku']}
            searchFields={'name,sku'}
            onUpdateOption={handleProductChange}
            placeholder="اختر المكمل"
          />
        </Form.Item>
        <Form.Item name={[field.name, 'costPrice']} hidden>
          <Input />
        </Form.Item>
      </Col>
      <Col xs={8} sm={4} md={3}>
        <Form.Item
          name={[field.name, 'quantity']}
          rules={[{ required: true }]}
          initialValue={1}
          label={isMobile ? "الكمية" : null}
        >
          <Input 
            inputMode="decimal" 
            placeholder="0" 
            autoComplete="off" 
            onChange={updateQt} 
          />
        </Form.Item>
      </Col>
      <Col xs={8} sm={4} md={4}>
        <Form.Item
          name={[field.name, 'price']}
          rules={[{ required: true }]}
          label={isMobile ? "السعر" : null}
        >
          <MoneyInputFormItem
            onChange={(e) => {
              const val = e.target.value;
              updatePrice(val);
            }}
          />
        </Form.Item>
      </Col>
      <Col xs={8} sm={4} md={5}>
        <Form.Item
          name={[field.name, 'total']}
          label={isMobile ? "الإجمالي" : null}
        >
          <MoneyInputFormItem
            readOnly
            value={totalState}
          />
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: isMobile ? 'auto' : '-20px', left: isMobile ? '5px' : 'auto', top: isMobile ? '5px' : '5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} style={{ color: 'red', fontSize: isMobile ? '18px' : '14px', cursor: 'pointer' }} />
      </div>
    </Row>
  );
}
