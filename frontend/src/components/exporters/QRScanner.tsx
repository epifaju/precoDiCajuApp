import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CameraOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { VerificationResult } from '../../types/exporter';

interface QRScannerProps {
  onResult: (result: VerificationResult) => void;
  onClose: () => void;
  className?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onResult,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      
      if (!hasCamera) {
        setError(t('qr_scanner.no_camera', 'Aucune caméra détectée'));
        setHasPermission(false);
        return;
      }

      // Vérifier les permissions
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permission.state === 'granted');
    } catch (err) {
      console.warn('Permission check failed:', err);
      setHasPermission(null);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Caméra arrière de préférence
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError(t('qr_scanner.camera_access_denied', 'Accès à la caméra refusé'));
      setHasPermission(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Simulation pour les tests - génère un token QR aléatoire
    const mockQRCodes = [
      'qr_bf_001_2024',
      'qr_bs_001_2024',
      'qr_ga_001_2024',
      'qr_ca_001_2024'
    ];
    
    const randomToken = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    
    // Simuler un délai de scan
    setTimeout(() => {
      // Ici, on ferait normalement l'appel API pour vérifier le token
      // Pour la démo, on simule une réponse positive
      const mockResult: VerificationResult = {
        success: true,
        message: t('qr_scanner.verification_success', 'Exportateur trouvé et valide'),
        result: 'SUCCESS',
        exportateurId: 'mock-id',
        nom: 'Exportateur de Test',
        numeroAgrement: 'EXP-TEST-001-2024',
        verificationTime: new Date().toISOString()
      };
      
      onResult(mockResult);
    }, 1000);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('qr_scanner.title', 'Scanner QR Code')}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-300">{error}</span>
            </div>
          )}

          {!isScanning && hasPermission !== false && (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('qr_scanner.instructions', 'Positionnez le QR code de l\'exportateur dans le cadre')}
              </p>
              <button
                onClick={startScanning}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('qr_scanner.start_scanning', 'Démarrer le scan')}
              </button>
            </div>
          )}

          {isScanning && (
            <div className="text-center">
              <div className="relative w-full h-64 bg-black rounded-lg mb-4 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-50" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('qr_scanner.scanning', 'Scan en cours...')}
              </p>
              <button
                onClick={stopScanning}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors mb-2"
              >
                <CameraOff className="w-4 h-4 inline mr-2" />
                {t('qr_scanner.stop_scanning', 'Arrêter le scan')}
              </button>
              
              {/* Bouton de simulation pour les tests */}
              <button
                onClick={simulateQRScan}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('qr_scanner.simulate_scan', 'Simuler un scan (Test)')}
              </button>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('qr_scanner.permission_denied', 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.')}
              </p>
              <button
                onClick={checkCameraPermission}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('qr_scanner.retry_permission', 'Réessayer')}
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
