import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CameraOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { VerificationResult } from '../../types/exporter';
import jsQR from 'jsqr';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkCameraPermission();
    
    // Polling pour vérifier les changements de permissions (plus compatible)
    let permissionCheckInterval: NodeJS.Timeout | null = null;
    
    if ('permissions' in navigator) {
      permissionCheckInterval = setInterval(async () => {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permission.state === 'granted' && hasPermission === false) {
            // Permission accordée, on peut réessayer
            setHasPermission(true);
            setError(null);
          } else if (permission.state === 'denied' && hasPermission !== false) {
            // Permission refusée
            setHasPermission(false);
            setError(t('qr_scanner.permission_denied', 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.'));
          }
        } catch (err) {
          console.warn('Permission check error:', err);
        }
      }, 2000); // Vérifier toutes les 2 secondes
    }
    
    return () => {
      stopScanning();
      if (permissionCheckInterval) {
        clearInterval(permissionCheckInterval);
      }
    };
  }, [hasPermission, t]);

  const checkCameraPermission = async () => {
    try {
      // Vérifier si l'API getUserMedia est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('qr_scanner.no_camera_support', 'Votre navigateur ne supporte pas l\'accès à la caméra'));
        setHasPermission(false);
        return;
      }

      // Vérifier les appareils disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      
      if (!hasCamera) {
        setError(t('qr_scanner.no_camera', 'Aucune caméra détectée'));
        setHasPermission(false);
        return;
      }

      // Vérifier les permissions si l'API est disponible
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          const permissionState = permission.state;
          
          if (permissionState === 'granted') {
            setHasPermission(true);
            setError(null);
          } else if (permissionState === 'denied') {
            setHasPermission(false);
            setError(t('qr_scanner.permission_denied', 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.'));
          } else {
            // Permission 'prompt' - on ne sait pas encore
            setHasPermission(null);
            setError(null);
          }
        } else {
          // API permissions non supportée - on essaiera directement
          setHasPermission(null);
          setError(null);
        }
      } catch (permErr) {
        console.warn('Permission check failed:', permErr);
        // En cas d'erreur de vérification des permissions, on essaiera quand même
        setHasPermission(null);
        setError(null);
      }
    } catch (err) {
      console.warn('Camera permission check failed:', err);
      setHasPermission(false);
      setError(t('qr_scanner.permission_error', 'Erreur lors de la vérification des permissions'));
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Timeout de sécurité pour éviter le loader infini
      const timeoutId = setTimeout(() => {
        if (isProcessing) {
          console.warn('Camera access timeout, stopping processing');
          setIsProcessing(false);
          setError(t('qr_scanner.camera_timeout', 'Timeout d\'accès à la caméra. Veuillez réessayer.'));
        }
      }, 10000); // 10 secondes de timeout
      
      // Vérifier d'abord si getUserMedia est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        clearTimeout(timeoutId);
        throw new Error('getUserMedia not supported');
      }
      
      // Essayer d'abord avec la caméra arrière, puis fallback sur n'importe quelle caméra
      let stream: MediaStream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Caméra arrière de préférence
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (envError) {
        console.warn('Back camera failed, trying any camera:', envError);
        // Fallback sur n'importe quelle caméra disponible
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }

      // Attendre que l'élément vidéo soit disponible
      let attempts = 0;
      const maxAttempts = 10;
      
      const waitForVideoElement = () => {
        return new Promise<void>((resolve, reject) => {
          const checkVideo = () => {
            attempts++;
            if (videoRef.current) {
              resolve();
            } else if (attempts >= maxAttempts) {
              reject(new Error('Video element not available after multiple attempts'));
            } else {
              setTimeout(checkVideo, 100); // Attendre 100ms et réessayer
            }
          };
          checkVideo();
        });
      };
      
      try {
        await waitForVideoElement();
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsScanning(true);
          setHasPermission(true);
          setIsProcessing(false);
          clearTimeout(timeoutId); // Nettoyer le timeout
          
          // Démarrer le scan des QR codes
          startQRCodeScanning();
        } else {
          throw new Error('Video element still not available');
        }
      } catch (videoError) {
        clearTimeout(timeoutId);
        setIsProcessing(false);
        console.error('Video element error:', videoError);
        setError(t('qr_scanner.video_element_error', 'Erreur d\'initialisation de la vidéo'));
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      clearTimeout(timeoutId);
      setIsProcessing(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError(t('qr_scanner.camera_access_denied', 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.'));
        } else if (err.name === 'NotFoundError') {
          setError(t('qr_scanner.no_camera', 'Aucune caméra détectée'));
        } else if (err.name === 'NotSupportedError') {
          setError(t('qr_scanner.no_camera_support', 'Votre navigateur ne supporte pas l\'accès à la caméra'));
        } else if (err.name === 'NotReadableError') {
          setError(t('qr_scanner.camera_in_use', 'La caméra est utilisée par une autre application'));
        } else if (err.name === 'OverconstrainedError') {
          setError(t('qr_scanner.camera_constraints', 'Les contraintes de caméra ne peuvent pas être satisfaites'));
        } else if (err.message === 'getUserMedia not supported') {
          setError(t('qr_scanner.no_camera_support', 'Votre navigateur ne supporte pas l\'accès à la caméra'));
        } else {
          setError(t('qr_scanner.camera_error', 'Erreur d\'accès à la caméra: ') + err.message);
        }
      } else {
        setError(t('qr_scanner.camera_access_denied', 'Accès à la caméra refusé'));
      }
      setHasPermission(false);
    }
  };

  const stopScanning = () => {
    // Arrêter l'intervalle de scan
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Arrêter le stream de la caméra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsScanning(false);
  };

  const startQRCodeScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          console.log('QR Code détecté:', code.data);
          stopScanning();
          processQRCode(code.data);
        }
      }

      if (isScanning) {
        scanIntervalRef.current = setTimeout(scanFrame, 100); // Scan toutes les 100ms
      }
    };

    scanFrame();
  };

  const processQRCode = async (qrData: string) => {
    try {
      setIsProcessing(true);
      
      // Validation du format QR code
      if (!qrData || qrData.trim().length === 0) {
        throw new Error('QR code vide ou invalide');
      }
      
      // Validation du format de token QR (plus flexible)
      // Accepte les formats: qr_[uuid8]_[timestamp]_[random8] ou qr_[region]_[code]_[year]
      if (!qrData.match(/^qr_[a-zA-Z0-9_]+$/)) {
        throw new Error('Format de token QR invalide');
      }
      
      // Validation plus spécifique pour les formats connus
      const isValidFormat = qrData.match(/^qr_[a-f0-9]{8}_\d+_[a-zA-Z0-9]{8}$/) || // Format standard
                           qrData.match(/^qr_[a-z]{2}_[0-9]{3}_[0-9]{4}$/) ||    // Format simulation
                           qrData.match(/^qr_[a-zA-Z0-9_]+$/);                    // Format flexible
      
      if (!isValidFormat) {
        throw new Error('Format de token QR invalide');
      }
      
      // Appel API réel pour vérifier l'exportateur
      const response = await fetch(`/api/v1/exportateurs/verify/${encodeURIComponent(qrData)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Exportateur non trouvé');
        } else if (response.status === 400) {
          throw new Error('Token QR invalide');
        } else {
          throw new Error(`Erreur serveur: ${response.status}`);
        }
      }
      
      const result: VerificationResult = await response.json();
      
      // Traduire le message selon la langue
      if (result.success) {
        result.message = t('qr_scanner.verification_success', 'Exportateur trouvé et valide');
      } else {
        switch (result.result) {
          case 'NOT_FOUND':
            result.message = t('qr_scanner.not_found_message', 'Aucun exportateur trouvé avec ce code QR.');
            break;
          case 'EXPIRED':
            result.message = t('qr_scanner.expired_message', 'Ce certificat d\'exportateur a expiré.');
            break;
          case 'SUSPENDED':
            result.message = t('qr_scanner.suspended_message', 'Ce certificat d\'exportateur a été suspendu.');
            break;
          case 'INVALID_TOKEN':
            result.message = t('qr_scanner.invalid_token_message', 'Token QR code invalide.');
            break;
          default:
            result.message = t('qr_scanner.processing_error', 'Erreur lors du traitement du QR code');
        }
      }
      
      onResult(result);
    } catch (err) {
      console.error('Erreur lors du traitement du QR code:', err);
      const errorResult: VerificationResult = {
        success: false,
        message: err instanceof Error ? err.message : t('qr_scanner.processing_error', 'Erreur lors du traitement du QR code'),
        result: 'ERROR',
        verificationTime: new Date().toISOString()
      };
      onResult(errorResult);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateQRScan = () => {
    // Option pour tester avec l'API réelle ou la simulation
    const useRealAPI = false; // Changez à true pour tester l'API réelle
    
    if (useRealAPI) {
      // Test avec l'API réelle - utilise de vrais tokens QR
      const realQRTokens = [
        'qr_a1b2c3d4_1703123456_x9y8z7w6', // Exportateur Test Bissau - ACTIF
        'qr_e5f6g7h8_1703123457_m1n2o3p4', // Exportateur Test Gabú - ACTIF
        'qr_i9j0k1l2_1703123458_q5r6s7t8', // Exportateur Test Cacheu - EXPIRE
        'qr_u3v4w5x6_1703123459_y9z0a1b2', // Exportateur Test Oio - SUSPENDU
        'qr_c7d8e9f0_1703123460_z1a2b3c4'  // Exportateur Test Quinara - ACTIF
      ];
      
      const randomToken = realQRTokens[Math.floor(Math.random() * realQRTokens.length)];
      processQRCode(randomToken);
      return;
    }
    
    // Simulation pour les tests - génère un résultat de vérification fictif
    const mockResults = [
      {
        success: true,
        message: t('qr_scanner.verification_success', 'Exportateur trouvé et valide'),
        result: 'SUCCESS',
        exportateurId: 'test-001',
        nom: 'Exportateur Test Bissau',
        numeroAgrement: 'EXP-BF-001-2024',
        type: 'EXPORTATEUR',
        regionCode: 'BF',
        regionName: 'Bissau',
        telephone: '+245 123 456 789',
        email: 'test@exportateur.gw',
        dateCertification: '2024-01-01',
        dateExpiration: '2025-01-01',
        statut: 'ACTIF',
        actif: true,
        expire: false,
        suspendu: false,
        verificationTime: new Date().toISOString()
      },
      {
        success: true,
        message: t('qr_scanner.verification_success', 'Exportateur trouvé et valide'),
        result: 'SUCCESS',
        exportateurId: 'test-002',
        nom: 'Exportateur Test Gabú',
        numeroAgrement: 'EXP-GA-002-2024',
        type: 'ACHETEUR_LOCAL',
        regionCode: 'GA',
        regionName: 'Gabú',
        telephone: '+245 987 654 321',
        email: 'test2@exportateur.gw',
        dateCertification: '2024-02-01',
        dateExpiration: '2025-02-01',
        statut: 'ACTIF',
        actif: true,
        expire: false,
        suspendu: false,
        verificationTime: new Date().toISOString()
      },
      {
        success: false,
        message: t('qr_scanner.expired_message', 'Ce certificat d\'exportateur a expiré.'),
        result: 'EXPIRED',
        exportateurId: 'test-003',
        nom: 'Exportateur Expiré',
        numeroAgrement: 'EXP-CA-003-2023',
        type: 'EXPORTATEUR',
        regionCode: 'CA',
        regionName: 'Cacheu',
        telephone: '+245 555 123 456',
        email: 'expired@exportateur.gw',
        dateCertification: '2023-01-01',
        dateExpiration: '2023-12-31',
        statut: 'EXPIRE',
        actif: false,
        expire: true,
        suspendu: false,
        verificationTime: new Date().toISOString()
      }
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    // Simuler un délai de traitement
    setTimeout(() => {
      onResult(randomResult);
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

          {!isScanning && hasPermission !== false && !isProcessing && (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('qr_scanner.instructions', 'Positionnez le QR code de l\'exportateur dans le cadre')}
              </p>
              <button
                onClick={startScanning}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('qr_scanner.starting', 'Démarrage...') : t('qr_scanner.start_scanning', 'Démarrer le scan')}
              </button>
            </div>
          )}

          {isProcessing && !isScanning && (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('qr_scanner.processing', 'Traitement en cours...')}
              </p>
              <button
                onClick={() => {
                  setIsProcessing(false);
                  setError(t('qr_scanner.cancelled', 'Opération annulée'));
                }}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('qr_scanner.cancel', 'Annuler')}
              </button>
            </div>
          )}

          {/* Élément vidéo toujours présent mais caché quand pas en cours de scan */}
          <div className={`text-center ${!isScanning ? 'hidden' : ''}`}>
            <div className="relative w-full h-64 bg-black rounded-lg mb-4 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-50">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                </div>
              </div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">{t('qr_scanner.processing', 'Traitement...')}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('qr_scanner.scanning', 'Positionnez le QR code dans le cadre. Le scan se fait automatiquement.')}
            </p>
            <button
              onClick={stopScanning}
              disabled={isProcessing}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CameraOff className="w-4 h-4 inline mr-2" />
              {t('qr_scanner.stop_scanning', 'Arrêter le scan')}
            </button>
            
            {/* Bouton de simulation pour les tests */}
            <button
              onClick={simulateQRScan}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('qr_scanner.simulate_scan', 'Simuler un scan (Test)')}
            </button>
          </div>

          {hasPermission === false && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('qr_scanner.permission_denied', 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.')}
              </p>
              
              {/* Instructions pour autoriser l'accès */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 text-left">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Comment autoriser l'accès à la caméra :
                </h4>
                <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>1. Cliquez sur l'icône de caméra dans la barre d'adresse</li>
                  <li>2. Sélectionnez "Autoriser" pour l'accès à la caméra</li>
                  <li>3. Actualisez la page et réessayez</li>
                </ol>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={checkCameraPermission}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('qr_scanner.retry_permission', 'Réessayer')}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Actualiser la page
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
