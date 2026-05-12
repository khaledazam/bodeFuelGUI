import React from 'react';
import { Form, Input } from 'antd';

export default function InventoryForm() {
  return (
    <>
      <Form.Item
        label="Product"
        name="product"
        rules={[
          {
            required: true,
            message: 'Please input Product name!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Quantity"
        name="quantity"
        rules={[
          {
            required: true,
            message: 'Please input Quantity!',
          },
        ]}
      >
        <Input inputMode="decimal" placeholder="0" autoComplete="off" />
      </Form.Item>

      <Form.Item
        label="Unit Price"
        name="unitPrice"
        rules={[
          {
            required: true,
            message: 'Please input Unit Price!',
          },
        ]}
      >
        <Input inputMode="decimal" placeholder="0.00" autoComplete="off" />
      </Form.Item>
    </>
  );
}
