import React, { useEffect, useRef } from 'react';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { Results } from '@mediapipe/hands';
import { CameraOff } from 'lucide-react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  results: Results | null;
  isRunning: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, results, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || !isRunning) {
      if (canvas && !isRunning) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw flipped video
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results?.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        const flipped = landmarks.map(landmark => ({
          ...landmark,
          x: 1 - landmark.x
        }));

        // Draw white lines between connections
        HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
          const start = flipped[startIdx];
          const end = flipped[endIdx];
          ctx.beginPath();
          ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
          ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // Draw red circles for landmarks
        flipped.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ff0000';
          ctx.fill();
        });
      }
    }
  }, [results, videoRef, isRunning]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-xl">
      <video
        ref={videoRef}
        className="absolute inset-0 object-cover w-full h-full opacity-0"
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 object-cover w-full h-full"
      />
      {!isRunning && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <CameraOff className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-400">Camera stopped</p>
          </div>
        </div>
      )}
    </div>
  );
};
