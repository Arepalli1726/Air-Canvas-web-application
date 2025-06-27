import { useState, useCallback } from 'react';

export type GestureType = 'none' | 'point' | 'peace' | 'fist' | 'thumbs_up' | 'open_palm' | 'ok_sign';

export interface GestureResult {
  gesture: GestureType;
  confidence: number;
  position: { x: number; y: number } | null;
}

export const useGestureRecognition = () => {
  const [currentGesture, setCurrentGesture] = useState<GestureResult>({
    gesture: 'none',
    confidence: 0,
    position: null
  });

  const recognizeGesture = useCallback((landmarks: Array<{x: number; y: number; z: number}>) => {
    if (!landmarks || landmarks.length !== 21) {
      setCurrentGesture({ gesture: 'none', confidence: 0, position: null });
      return;
    }

    // Key landmarks for gesture recognition
    const thumb_tip = landmarks[4];
    const thumb_ip = landmarks[3];
    const thumb_mcp = landmarks[2];
    const index_tip = landmarks[8];
    const index_pip = landmarks[6];
    const index_mcp = landmarks[5];
    const middle_tip = landmarks[12];
    const middle_pip = landmarks[10];
    const ring_tip = landmarks[16];
    const ring_pip = landmarks[14];
    const pinky_tip = landmarks[20];
    const pinky_pip = landmarks[18];
    const wrist = landmarks[0];

    // Calculate if fingers are extended (improved logic)
    const isThumbUp = thumb_tip.y < thumb_ip.y && thumb_tip.y < thumb_mcp.y;
    const isIndexUp = index_tip.y < index_pip.y && index_tip.y < index_mcp.y;
    const isMiddleUp = middle_tip.y < middle_pip.y;
    const isRingUp = ring_tip.y < ring_pip.y;
    const isPinkyUp = pinky_tip.y < pinky_pip.y;

    const fingersUp = [isThumbUp, isIndexUp, isMiddleUp, isRingUp, isPinkyUp];
    const totalFingers = fingersUp.filter(Boolean).length;

    // Calculate distances for OK sign detection
    const thumbIndexDistance = Math.sqrt(
      Math.pow(thumb_tip.x - index_tip.x, 2) + 
      Math.pow(thumb_tip.y - index_tip.y, 2)
    );

    let gesture: GestureType = 'none';
    let confidence = 0;

    // Gesture recognition logic
    if (totalFingers === 1 && isIndexUp && !isThumbUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
      gesture = 'point';
      confidence = 0.9;
    } else if (totalFingers === 2 && isIndexUp && isMiddleUp && !isThumbUp && !isRingUp && !isPinkyUp) {
      gesture = 'peace';
      confidence = 0.85;
    } else if (totalFingers === 0) {
      gesture = 'fist';
      confidence = 0.8;
    } else if (totalFingers === 1 && isThumbUp && !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
      gesture = 'thumbs_up';
      confidence = 0.8;
    } else if (totalFingers === 5) {
      gesture = 'open_palm';
      confidence = 0.7;
    } else if (thumbIndexDistance < 0.05 && isMiddleUp && isRingUp && isPinkyUp) {
      // OK sign: thumb and index finger touching, other fingers up
      gesture = 'ok_sign';
      confidence = 0.8;
    }

    // Get index finger tip position for drawing (flip X coordinate to fix mirroring)
    const position = gesture === 'point' ? { 
      x: 1 - index_tip.x, // Flip horizontally to fix mirroring
      y: index_tip.y 
    } : null;

    setCurrentGesture({ gesture, confidence, position });
  }, []);

  return { currentGesture, recognizeGesture };
};