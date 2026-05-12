import React from 'react';
import { Form, Input, Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function TaxForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        label={translate('name')}
        name="taxName"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={translate('Value')}
        name="taxValue"
        rules={[
          {
            required: true,
            message: 'Please input tax value!',
          },
        ]}
      >
        <Input inputMode="decimal" placeholder="0" suffix="%" autoComplete="off" />
      </Form.Item>

      <Form.Item
        label={translate('enabled')}
        name="enabled"
        style={{
          display: 'inline-block',
          width: 'calc(50%)',
          paddingRight: '5px',
        }}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
      <Form.Item
        label={translate('Default')}
        name="isDefault"
        style={{
          display: 'inline-block',
          width: 'calc(50%)',
          paddingLeft: '5px',
        }}
        valuePropName="checked"
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
    </>
  );
}
