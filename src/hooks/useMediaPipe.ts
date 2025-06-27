import { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export const useMediaPipe = (onResults: (results: Results) => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeMediaPipe = async () => {
    try {
      if (!videoRef.current) return;

      // Initialize MediaPipe Hands
      handsRef.current = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      handsRef.current.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      handsRef.current.onResults(onResults);

      // Initialize camera
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      await cameraRef.current.start();
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
      setError('Failed to initialize camera or MediaPipe. Please check your camera permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    setIsInitialized(false);
  };

  const startCamera = async () => {
    if (cameraRef.current) {
      await cameraRef.current.start();
      setIsInitialized(true);
    } else {
      await initializeMediaPipe();
    }
  };

  useEffect(() => {
    initializeMediaPipe();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [onResults]);

  return { videoRef, isInitialized, error, stopCamera, startCamera };
};