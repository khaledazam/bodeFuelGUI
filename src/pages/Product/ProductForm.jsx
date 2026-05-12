import { useState } from 'react';
import { Form, Input, Button, Row, Col, Divider, Upload, Space, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, ScanOutlined } from '@ant-design/icons';
import SelectAsync from '@/components/SelectAsync';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import QRScannerModal from '@/components/QRScannerModal';

import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

export default function ProductForm({ isUpdateForm = false }) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const form = Form.useFormInstance();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isCashier = currentAdmin?.role === 'cashier';

  const handleScanSuccess = (decodedText) => {
    if (form) {
      form.setFieldsValue({ sku: decodedText });
    }
  };

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={12}>
          <Form.Item name="name" label="اسم المكمل" rules={[{ required: true, message: 'مطلوب إدخال الاسم' }]}>
             <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="sku" label="الرقم التسلسلي" rules={[{ required: true, message: 'مطلوب الرقم التسلسلي' }]}>
            <Input 
              suffix={
                <Button 
                  type="text" 
                  size="small" 
                  icon={<ScanOutlined />} 
                  onClick={() => setIsScannerOpen(true)}
                  title="مسح QR Code"
                />
              } 
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="barcode" label="الباركود">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="category" label="التصنيف" rules={[{ required: true }]}>
            <SelectAsync entity="category" displayLabels={['name']} placeholder="اختر التصنيف" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="brand" label="الماركة" rules={[{ required: true }]}>
            <SelectAsync entity="brand" displayLabels={['name']} placeholder="اختر الماركة" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="weight" label="الوزن">
            <Input placeholder="الوزن" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        {!isCashier && (
          <Col xs={24} sm={12} md={12}>
            <Form.Item name="costPrice" label="سعر التكلفة (سعر الجملة)" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                size="large"
                parser={(val) => val?.replace(',', '.')}
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} sm={12} md={!isCashier ? 12 : 24}>
          <Form.Item name="sellPrice" label="سعر البيع" rules={[{ required: true }]}>
             <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              size="large"
              parser={(val) => val?.replace(',', '.')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item label="صور المكمل">
            <Upload listType="picture-card" multiple action="/api/app/setting/upload">
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>رفع صورة</div>
              </div>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">تفاصيل المكمل</Divider>
      
      <p>المكونات</p>
      <Form.List name="ingredients">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name]}
                  rules={[{ required: true, message: 'حقل المكون مطلوب' }]}
                >
                  <Input placeholder="اسم المكون" />
                </Form.Item>
                <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة مكون
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <p>الفوائد الرئيسية</p>
      <Form.List name="benefits">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name]}
                  rules={[{ required: true, message: 'حقل الفائدة مطلوب' }]}
                >
                  <Input placeholder="مثال الفائدة" />
                </Form.Item>
                <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                إضافة فائدة
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item name="dosageInstructions" label="إرشادات الجرعة">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" style={{ width: '100%', maxWidth: '200px' }}>
          {isUpdateForm ? 'تعديل' : 'حفظ'}
        </Button>
      </Form.Item>

      <QRScannerModal 
        open={isScannerOpen} 
        onCancel={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}

