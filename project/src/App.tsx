import React, { useState, useCallback, useEffect } from 'react';
import { Camera, Wifi, WifiOff } from 'lucide-react';
import { Results } from '@mediapipe/hands';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useGestureRecognition } from './hooks/useGestureRecognition';
import { DrawingCanvas } from './components/DrawingCanvas';
import { CameraFeed } from './components/CameraFeed';
import { GestureGuide } from './components/GestureGuide';
import { Gallery } from './components/Gallery';
import { ControlPanel } from './components/ControlPanel';

interface SavedImage {
  id: string;
  data: string;
  timestamp: number;
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [brushSize, setBrushSize] = useState(8);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [results, setResults] = useState<Results | null>(null);
  const [lastGestureTime, setLastGestureTime] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [clearCanvas, setClearCanvas] = useState(false);
  const [isCameraRunning, setIsCameraRunning] = useState(true);

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'];

  const { currentGesture, recognizeGesture } = useGestureRecognition();

  const onResults = useCallback((results: Results) => {
    if (!isCameraRunning) return;
    setResults(results);
    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
      recognizeGesture(results.multiHandLandmarks[0]);
    } else {
      recognizeGesture([]);
    }
  }, [recognizeGesture, isCameraRunning]);

  const { videoRef, isInitialized, error, stopCamera, startCamera } = useMediaPipe(onResults);
  useEffect(() => {
    if (!showWelcome) {
      startCamera();
    }
  }, [showWelcome, startCamera]);

  useEffect(() => {
    const now = Date.now();
    if (now - lastGestureTime < 1000) return;

    if (currentGesture.confidence > 0.7) {
      switch (currentGesture.gesture) {
        case 'peace':
          if (tool !== 'eraser') {
            setTool('eraser');
            setLastGestureTime(now);
          }
          break;
        case 'thumbs_up':
          const nextColorIndex = (colorIndex + 1) % colors.length;
          setBrushColor(colors[nextColorIndex]);
          setColorIndex(nextColorIndex);
          setLastGestureTime(now);
          break;
        case 'point':
          if (tool !== 'brush') {
            setTool('brush');
            setLastGestureTime(now);
          }
          break;
        case 'ok_sign':
          setClearCanvas(true);
          setTimeout(() => setClearCanvas(false), 100);
          setLastGestureTime(now);
          break;
      }
    }
  }, [currentGesture, tool, colorIndex, colors, lastGestureTime]);

  const isDrawing = currentGesture.gesture === 'point' && currentGesture.confidence > 0.6 && isCameraRunning;

  const handleSaveToGallery = (imageData: string) => {
    const newImage: SavedImage = {
      id: Date.now().toString(),
      data: imageData,
      timestamp: Date.now()
    };
    setSavedImages(prev => [newImage, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setSavedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleToggleCamera = async () => {
    if (isCameraRunning) {
      stopCamera();
      setIsCameraRunning(false);
    } else {
      await startCamera();
      setIsCameraRunning(true);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-md p-8 text-center border bg-red-500/10 border-red-500/20 rounded-xl">
          <WifiOff className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="mb-2 text-xl font-semibold text-white">Camera Access Required</h2>
          <p className="mb-4 text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">Welcome to Air Canvas!</h1>
          <p className="mb-6 text-lg text-gray-300">
            Draw in the air using your hand gestures, powered by AI.
          </p>
          <button
            className="px-6 py-3 text-lg text-white transition bg-blue-600 hover:bg-blue-700 rounded-xl"
            onClick={() => setShowWelcome(false)}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Air Canvas</h1>
          <p className="text-lg text-gray-300">Draw in the air with hand gestures powered by AI</p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            {isInitialized && isCameraRunning ? (
              <><Wifi className="text-green-400" size={20} /><span className="text-sm text-green-400">Connected</span></>
            ) : isCameraRunning ? (
              <><Camera className="text-yellow-400 animate-pulse" size={20} /><span className="text-sm text-yellow-400">Initializing camera...</span></>
            ) : (
              <><WifiOff className="text-gray-400" size={20} /><span className="text-sm text-gray-400">Camera stopped</span></>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 p-4 space-y-4 bg-white/5 rounded-2xl">
            <div className="overflow-hidden border aspect-video rounded-xl border-white/10">
              <CameraFeed videoRef={videoRef} results={isCameraRunning ? results : null} isRunning={isCameraRunning} />
            </div>
            <GestureGuide currentGesture={currentGesture.gesture} confidence={currentGesture.confidence} />
          </div>

          <div className="col-span-6 overflow-hidden bg-white/5 rounded-2xl">
            <DrawingCanvas
              isDrawing={isDrawing}
              brushSize={brushSize}
              brushColor={brushColor}
              tool={tool}
              position={currentGesture.position}
              onClear={() => {}}
              onToolChange={() => {}}
              onColorChange={() => {}}
              onBrushSizeChange={() => {}}
              onSaveToGallery={() => {}}
              clearCanvas={clearCanvas}
              hideControls={true} // This hides the buttons on the canvas sheet
            />
          </div>

          <div className="col-span-3 p-4 space-y-4 bg-white/5 rounded-2xl">
            <ControlPanel
              isRunning={isCameraRunning}
              onToggleCamera={handleToggleCamera}
              onOpenGallery={() => setIsGalleryOpen(true)}
              galleryCount={savedImages.length}
            />
            <div className="text-sm text-gray-300">
              <p>🖊️ Point finger to draw</p>
              <p>✌️ Peace sign to erase</p>
              <p>👍 Thumbs up to change color</p>
              <p>👌 OK sign to clear canvas</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-center text-gray-400">
          © 2025 Air Canvas • Gesture Drawing Powered by AI
        </div>

        <Gallery
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          images={savedImages}
          onDeleteImage={handleDeleteImage}
        />
      </div>
    </div>
  );
}

export default App;
