import React from 'react';
import { Form, Input, Select } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function OrderForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const validateEmptyString = (_, value) => {
    if (value && typeof value === 'string' && value.trim() === '') {
      return Promise.reject(new Error('Field cannot be empty'));
    }
    return Promise.resolve();
  };

  return (
    <>
      <Form.Item
        label={translate('Order ID')}
        name="orderId"
        rules={[
          { required: true },
          { validator: validateEmptyString },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={translate('Products')}
        name="products"
        rules={[
          { required: true },
          { validator: validateEmptyString },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={translate('Quantity')}
        name="quantity"
        rules={[{ required: true }]}
      >
        <Input inputMode="decimal" placeholder="0" autoComplete="off" />
      </Form.Item>

      <Form.Item
        label={translate('Price')}
        name="price"
        rules={[{ required: true }]}
      >
        <Input inputMode="decimal" placeholder="0.00" autoComplete="off" />
      </Form.Item>

      <Form.Item
        label={translate('status')}
        name="status"
        rules={[{ required: true }]}
      >
        <Select>
          <Select.Option value="pending">{translate('Pending')}</Select.Option>
          <Select.Option value="shipped">{translate('Shipped')}</Select.Option>
          <Select.Option value="delivered">{translate('Delivered')}</Select.Option>
          <Select.Option value="cancelled">{translate('Cancelled')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={translate('Note')}
        name="notes"
        rules={[{ validator: validateEmptyString }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
    </>
  );
}
