import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Divider, Input, Space } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '@/style/thermalPrint.css';

export default function ThermalReceipt({ open, onCancel, orderData }) {
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (orderData?.customer?.name) {
      setCustomerName(orderData.customer.name);
    }
  }, [orderData]);

  // Auto-trigger print when modal opens
  useEffect(() => {
    if (open && orderData) {
      const timer = setTimeout(() => {
        window.print();
      }, 800); // Small delay to ensure content is rendered
      return () => clearTimeout(timer);
    }
  }, [open, orderData]);

  if (!orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title="فاتورة حرارية (80mm)"
      open={open}
      onCancel={onCancel}
      width={400}
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
          طباعة الفاتورة
        </Button>,
      ]}
      centered
      destroyOnClose
    >
      <div id="thermal-receipt" className="receipt-container">
        <div className="receipt-header">
          <h2>مكملاتك الغذائية - Supplements Shop</h2>
          <p>أفضل جودة.. لأفضل أداء</p>
          <p>تاريخ الطلب: {dayjs(orderData.orderDate || orderData.created).format('YYYY-MM-DD HH:mm')}</p>
        </div>

        <Divider dashed />

        <div className="receipt-info">
          <p><strong>رقم الفاتورة:</strong> {orderData.invoiceNumber}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span><strong>العميل:</strong></span>
            <Input 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              variant="borderless"
              className="no-print"
              style={{ width: 'fit-content', padding: 0, fontWeight: 'bold' }}
            />
            {/* Display static name for printing */}
            <span style={{ display: 'none', visibility: 'visible' }} className="print-only">
               {customerName}
            </span>
          </div>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>الصنف</th>
              <th style={{ textAlign: 'center' }}>كمية</th>
              <th style={{ textAlign: 'left' }}>إجمالي</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items?.map((item, index) => (
              <tr key={index}>
                <td style={{ fontSize: '11px' }}>{item.product?.name || 'منتج غير معروف'}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'left' }}>{(item.total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-total">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>إجمالي الطلب:</span>
            <span>{(orderData.totalAmount || 0).toFixed(2)} ج.م</span>
          </div>
          {orderData.credit > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>تم دفعه (مقدماً):</span>
              <span>-{(orderData.credit || 0).toFixed(2)} ج.م</span>
            </div>
          )}
          <Divider style={{ margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
            <span>المطلوب تحصيله:</span>
            <span>{((orderData.totalAmount || 0) - (orderData.credit || 0)).toFixed(2)} ج.م</span>
          </div>
        </div>

        <div className="receipt-footer">
          <p>شكراً لزيارتكم!</p>
          <p>يرجى الاحتفاظ بالفاتورة للاستبدال</p>
        </div>
      </div>

      <style>
        {`
          @media print {
            .print-only {
              display: inline !important;
              visibility: visible !important;
            }
          }
        `}
      </style>
    </Modal>
  );
}
