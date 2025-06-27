import React, { useRef, useEffect, useState } from 'react';
import { Brush, Eraser, Palette, RotateCcw, Download, Save } from 'lucide-react';

interface DrawingCanvasProps {
  isDrawing: boolean;
  brushSize: number;
  brushColor: string;
  tool: 'brush' | 'eraser';
  position: { x: number; y: number } | null;
  onClear: () => void;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onSaveToGallery: (imageData: string) => void;
  clearCanvas: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isDrawing,
  brushSize,
  brushColor,
  tool,
  position,
  onClear,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onSaveToGallery,
  clearCanvas
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const [paths, setPaths] = useState<Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    size: number;
    tool: 'brush' | 'eraser';
  }>>([]);

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'];

  // Clear canvas when clearCanvas prop changes
  useEffect(() => {
    if (clearCanvas) {
      setPaths([]);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = path.size;

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
      }

      ctx.moveTo(path.points[0].x * canvas.width, path.points[0].y * canvas.height);
      
      for (let i = 1; i < path.points.length; i++) {
        const point = path.points[i];
        ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
      }
      
      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [paths]);

  useEffect(() => {
    if (!position || !isDrawing) {
      setLastPosition(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentPos = {
      x: position.x,
      y: position.y
    };

    if (lastPosition) {
      // Add to current path or create new one
      setPaths(prev => {
        const newPaths = [...prev];
        if (newPaths.length === 0 || 
            newPaths[newPaths.length - 1].tool !== tool ||
            newPaths[newPaths.length - 1].color !== brushColor ||
            newPaths[newPaths.length - 1].size !== brushSize) {
          // Start new path
          newPaths.push({
            points: [lastPosition, currentPos],
            color: brushColor,
            size: brushSize,
            tool
          });
        } else {
          // Continue current path
          newPaths[newPaths.length - 1].points.push(currentPos);
        }
        return newPaths;
      });
    }

    setLastPosition(currentPos);
  }, [position, isDrawing, tool, brushColor, brushSize, lastPosition]);

  const handleClear = () => {
    setPaths([]);
    onClear();
  };

  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    onSaveToGallery(imageData);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `air-canvas-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-white shadow-lg rounded-xl">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Tool Panel */}
      <div className="absolute p-4 space-y-4 rounded-lg top-4 right-4 bg-white/10 backdrop-blur-md">
        {/* Tools */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onToolChange('brush')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              tool === 'brush'
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'bg-white/20 text-gray-700 hover:bg-white/30'
            }`}
            title="Brush Tool"
          >
            <Brush size={20} />
          </button>
          <button
            onClick={() => onToolChange('eraser')}
            className={`p-3 rounded-lg transition-all duration-200 ${
              tool === 'eraser'
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'bg-white/20 text-gray-700 hover:bg-white/30'
            }`}
            title="Eraser Tool"
          >
            <Eraser size={20} />
          </button>
          <button
            onClick={handleClear}
            className="p-3 text-red-600 transition-all duration-200 rounded-lg bg-red-500/20 hover:bg-red-500/30"
            title="Clear Canvas"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleSaveToGallery}
            className="p-3 text-green-600 transition-all duration-200 rounded-lg bg-green-500/20 hover:bg-green-500/30"
            title="Save to Gallery"
          >
            <Save size={20} />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 text-blue-600 transition-all duration-200 rounded-lg bg-blue-500/20 hover:bg-blue-500/30"
            title="Download Image"
          >
            <Download size={20} />
          </button>
        </div>

        {/* Brush Size */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">Size</div>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-center text-gray-500">{brushSize}px</div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600">Colors</div>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                  brushColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drawing indicator */}
      {isDrawing && position && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div
            className={`rounded-full border-2 border-white shadow-lg ${
              tool === 'eraser' ? 'bg-red-500/50' : 'bg-current'
            }`}
            style={{
              width: brushSize + 'px',
              height: brushSize + 'px',
              color: tool === 'eraser' ? '#ef4444' : brushColor
            }}
          />
        </div>
      )}
    </div>
  );
};