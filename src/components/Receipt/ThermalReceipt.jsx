import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Divider, Input, Space, Row, Col, QRCode } from 'antd';
import { PrinterOutlined, CloseOutlined, FacebookOutlined, InstagramOutlined, WhatsAppOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '@/style/thermalPrint.css';

// Import logo if possible or use public path
import logoIcon from '@/style/images/finallLogo.svg';

export default function ThermalReceipt({ open, onCancel, orderData }) {
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (orderData?.customer?.name) {
      setCustomerName(orderData.customer.name);
    }
  }, [orderData]);

  useEffect(() => {
    if (open && orderData) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [open, orderData]);

  if (!orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: 'م',
      dataIndex: 'index',
      key: 'index',
      width: 30,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'الصنف',
      dataIndex: ['product', 'name'],
      key: 'name',
      render: (text) => <span style={{ fontSize: '11px', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      align: 'left',
      render: (val) => (val || 0).toFixed(2),
    },
    {
      title: 'الإجمالي',
      dataIndex: 'total',
      key: 'total',
      align: 'left',
      render: (val) => (val || 0).toFixed(2),
    },
  ];

  const subTotal = (orderData.totalAmount || 0) - (orderData.deliveryFee || 0);

  return (
    <Modal
      title="معاينة الطباعة"
      open={open}
      onCancel={onCancel}
      width={450}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onCancel}>
          إغلاق
        </Button>,
        <Button 
          key="print" 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={handlePrint}
          className="no-print"
        >
          طباعة الآن
        </Button>,
      ]}
      centered
      destroyOnClose
    >
      <div id="thermal-receipt" className="receipt-container">
        {/* ── Logo & Header ──────────────── */}
        <div className="receipt-header">
          <img src={logoIcon} alt="Logo" style={{ width: 100, marginBottom: 5 }} />
          <h2 style={{ fontWeight: 900, fontSize: 24, letterSpacing: 1, margin: 0 }}>BODYFUEL</h2>
          <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>SUPPLEMENTS STORE</p>
        </div>

        <Divider dashed style={{ margin: '10px 0' }} />

        {/* ── Order Info ─────────────────── */}
        <div className="receipt-info-grid">
          <Row>
            <Col span={10} className="label">رقم الفاتورة :</Col>
            <Col span={14} className="value">{orderData.invoiceNumber}</Col>
          </Row>
          <Row>
            <Col span={10} className="label">التاريخ :</Col>
            <Col span={14} className="value">
              {dayjs(orderData.orderDate || orderData.created).format('DD/MM/YYYY hh:mm A')}
            </Col>
          </Row>
          <Row>
            <Col span={10} className="label">الكاشير :</Col>
            <Col span={14} className="value">{orderData.cashier?.name || 'كاشير 1'}</Col>
          </Row>
          <Row className="no-print">
            <Col span={10} className="label">العميل :</Col>
            <Col span={14}>
              <Input 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                variant="borderless"
                size="small"
                style={{ padding: 0, fontWeight: 'bold' }}
              />
            </Col>
          </Row>
          <Row style={{ display: 'none' }} className="print-only">
             <Col span={10} className="label">العميل :</Col>
             <Col span={14} className="value">{customerName}</Col>
          </Row>
        </div>

        <Divider dashed style={{ margin: '10px 0' }} />

        {/* ── Items Table ────────────────── */}
        <Table
          columns={columns}
          dataSource={orderData.items}
          pagination={false}
          size="small"
          className="receipt-table-v2"
          rowKey={(record, index) => index}
        />

        <Divider dashed style={{ margin: '10px 0' }} />

        {/* ── Totals ──────────────────────── */}
        <div className="receipt-totals-v2">
          <Row>
            <Col span={16} className="label">الإجمالي الفرعي :</Col>
            <Col span={8} className="value">{subTotal.toFixed(2)}</Col>
          </Row>
          {orderData.discount > 0 && (
            <Row>
              <Col span={16} className="label">خصم :</Col>
              <Col span={8} className="value">{orderData.discount.toFixed(2)}</Col>
            </Row>
          )}
          {orderData.deliveryFee > 0 && (
            <Row>
              <Col span={16} className="label">رسوم الشحن :</Col>
              <Col span={8} className="value">{orderData.deliveryFee.toFixed(2)}</Col>
            </Row>
          )}
          
          <Row className="grand-total-row">
            <Col span={16} className="label">الإجمالي الكلي :</Col>
            <Col span={8} className="value">{(orderData.totalAmount || 0).toFixed(2)}</Col>
          </Row>

          <div style={{ marginTop: 10 }}>
             <Row>
               <Col span={16} className="label">طريقة الدفع :</Col>
               <Col span={8} className="value">{orderData.paymentMethod || 'نقداً'}</Col>
             </Row>
             <Row>
               <Col span={16} className="label">تم الدفع :</Col>
               <Col span={8} className="value">{(orderData.credit || 0).toFixed(2)}</Col>
             </Row>
             <Row>
               <Col span={16} className="label">المتبقي :</Col>
               <Col span={8} className="value">
                 {Math.max(0, (orderData.totalAmount || 0) - (orderData.credit || 0)).toFixed(2)}
               </Col>
             </Row>
          </div>
        </div>

        <Divider dashed style={{ margin: '20px 0 10px 0' }} />

        {/* ── Footer ─────────────────────── */}
        <div className="receipt-footer-v2">
          <Row align="middle" gutter={10}>
            <Col span={8}>
              <QRCode value={orderData.invoiceNumber} size={70} bordered={false} />
            </Col>
            <Col span={16}>
              <p style={{ fontWeight: 700, margin: '0 0 5px 0' }}>شكراً لثقتك بنا</p>
              <p style={{ fontSize: 10, margin: 0 }}>نتمنى لك يوماً رياضياً سعيداً ❤️</p>
            </Col>
          </Row>
          
          <div className="social-icons">
             <Space size="large" style={{ marginTop: 15, fontSize: 16 }}>
               <WhatsAppOutlined />
               <InstagramOutlined />
               <FacebookOutlined />
             </Space>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            .print-only {
              display: flex !important;
              visibility: visible !important;
            }
          }
        `}
      </style>
    </Modal>
  );
}
