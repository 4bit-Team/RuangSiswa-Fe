'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (qrData: string) => void;
  onError?: (error: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  const safeStop = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (_) {
        // ignore error
      }
    }
    setIsScanning(false);
  };

  const handleClose = async () => {
    await safeStop();
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          async (decodedText: string) => {
            if (cancelled) return;

            await safeStop();
            onSuccess(decodedText);
            onClose(); // auto close setelah scan
          },
          () => {}
        );

        if (!cancelled) {
          setError(null);
          setIsScanning(true);
        }
      } catch (err: any) {
        const errorMsg = err?.message || 'Gagal mengakses kamera';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    };

    initScanner();

    return () => {
      cancelled = true;
      safeStop();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Scan QR Code</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 font-medium mb-2">Terjadi Kesalahan</p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Tutup
              </button>
            </div>
          ) : (
            <div>
              <div
                id="qr-reader"
                className="rounded-lg overflow-hidden border-2 border-gray-300"
                style={{ width: '100%', minHeight: '300px' }}
              />

              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  {isScanning ? '📱 Arahkan kamera ke QR Code' : 'Menginisialisasi kamera...'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
