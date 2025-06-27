import React from 'react';
import { Play, Pause, Camera, CameraOff, Image as ImageIcon } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleCamera: () => void;
  onOpenGallery: () => void;
  galleryCount: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleCamera,
  onOpenGallery,
  galleryCount
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <button
        onClick={onToggleCamera}
        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
          isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
        }`}
      >
        {isRunning ? (
          <>
            <Pause size={20} />
            <span>Stop Camera</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>Start Camera</span>
          </>
        )}
      </button>

      <button
        onClick={onOpenGallery}
        className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-all duration-200 shadow-lg"
      >
        <ImageIcon size={20} />
        <span>Gallery</span>
        {galleryCount > 0 && (
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
            {galleryCount}
          </span>
        )}
      </button>
    </div>
  );
};