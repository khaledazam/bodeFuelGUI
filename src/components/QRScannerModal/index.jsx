import React, { useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { CameraOutlined, ScanOutlined } from '@ant-design/icons';
import useQRScanner from '@/hooks/useQRScanner';

export default function QRScannerModal({ open, onCancel, onScanSuccess }) {
  const { startScanner, stopScanner, isScannerRunning } = useQRScanner();
  const scannerId = 'qr-reader';

  useEffect(() => {
    if (open) {
      // Start scanner when modal opens
      setTimeout(() => {
        startScanner(scannerId, (decodedText) => {
          message.success('تم مسح الرمز بنجاح: ' + decodedText);
          onScanSuccess(decodedText);
          onCancel(); // Close modal on success
        });
      }, 500); // Small delay to ensure DIV is rendered
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open, startScanner, stopScanner, onScanSuccess, onCancel]);

  return (
    <Modal
      title={
        <span>
          <ScanOutlined style={{ marginLeft: 8 }} />
          ماسح رموز QR Code
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          إغلاق
        </Button>,
      ]}
      width={400}
      destroyOnClose
      centered
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: 16, color: '#666' }}>
          ضع رمز QR داخل المربع للمسح التلقائي
        </p>
        <div 
          id={scannerId} 
          style={{ 
            width: '100%', 
            minHeight: '300px',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
          }} 
        />
        {!isScannerRunning && open && (
          <div style={{ marginTop: 20 }}>
            <CameraOutlined style={{ fontSize: 24, color: '#ccc' }} />
            <p>جاري تشغيل الكاميرا...</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
