import React, { useEffect, useRef } from 'react';
import { Modal, Button, message } from 'antd';
import { CameraOutlined, ScanOutlined } from '@ant-design/icons';
import useQRScanner from '@/hooks/useQRScanner';

export default function QRScannerModal({ open, onCancel, onScanSuccess }) {
  const { startScanner, stopScanner, isScannerRunning } = useQRScanner();
  const scannerId = 'qr-reader';

  // Keep references to the latest callbacks to avoid closure issues
  const onScanSuccessRef = useRef(onScanSuccess);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (open) {
      // Start scanner when modal opens
      setTimeout(() => {
        startScanner(scannerId, (decodedText) => {
          message.success('تم مسح الرمز بنجاح: ' + decodedText);
          if (onScanSuccessRef.current) {
            onScanSuccessRef.current(decodedText);
          }
          if (onCancelRef.current) {
            onCancelRef.current();
          }
        });
      }, 500); // Small delay to ensure DIV is rendered
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

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
