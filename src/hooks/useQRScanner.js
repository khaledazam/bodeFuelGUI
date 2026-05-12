import { useState, useCallback, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function useQRScanner() {
  const [scannerResult, setScannerResult] = useState(null);
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = useCallback(async (elementId, onScanSuccess) => {
    if (scannerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;
      setIsScannerRunning(true);

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          setScannerResult(decodedText);
          onScanSuccess(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // console.warn('QR Code scan error:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Unable to start scanner:', err);
      setIsScannerRunning(false);
      scannerRef.current = null;
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScannerRunning(false);
      } catch (err) {
        console.error('Unable to stop scanner:', err);
      }
    }
  }, []);

  return {
    startScanner,
    stopScanner,
    scannerResult,
    isScannerRunning,
    setScannerResult,
  };
}
