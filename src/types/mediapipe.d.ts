declare module '@mediapipe/hands' {
  export interface Results {
    multiHandLandmarks?: Array<Array<{x: number; y: number; z: number}>>;
    multiHandedness?: Array<{
      index: number;
      score: number;
      label: string;
    }>;
  }

  export class Hands {
    constructor(config: {
      locateFile: (path: string) => string;
    });
    
    setOptions(options: {
      maxNumHands?: number;
      modelComplexity?: number;
      minDetectionConfidence?: number;
      minTrackingConfidence?: number;
    }): void;
    
    onResults(callback: (results: Results) => void): void;
    send(data: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement }): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, config: {
      onFrame: () => Promise<void>;
      width: number;
      height: number;
    });
    
    start(): Promise<void>;
    stop(): void;
  }
}

declare module '@mediapipe/drawing_utils' {
  export const HAND_CONNECTIONS: Array<[number, number]>;
  
  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{x: number; y: number; z: number}>,
    connections: Array<[number, number]>,
    options?: {
      color?: string;
      lineWidth?: number;
    }
  ): void;
  
  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: Array<{x: number; y: number; z: number}>,
    options?: {
      color?: string;
      lineWidth?: number;
      radius?: number;
    }
  ): void;
}