import { useState, useEffect } from 'react';
import { Form, Input, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import useResponsive from '@/hooks/useResponsive';

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const { isMobile } = useResponsive();
  const money = useMoney();

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
    if (current) {
      const { items, invoice } = current;

      if (invoice) {
        const item = invoice[field.fieldKey];
        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      } else if (items) {
        const item = items[field.fieldKey];
        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
  }, [price, quantity]);

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[
            {
              required: true,
              message: 'Missing itemName name',
            },
            {
              pattern: /^(?!\s*$)[\s\S]+$/,
              message: 'Item Name must contain alphanumeric or special characters',
            },
          ]}
        >
          <Input placeholder="Item Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={7}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="description Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
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

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
