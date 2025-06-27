import React from 'react';
import { Hand, Paintbrush, Eraser, RotateCcw, Palette, Pause, Trash2 } from 'lucide-react';
import { GestureType } from '../hooks/useGestureRecognition';

interface GestureGuideProps {
  currentGesture: GestureType;
  confidence: number;
}

export const GestureGuide: React.FC<GestureGuideProps> = ({ currentGesture, confidence }) => {
  const gestures = [
    {
      name: 'Point',
      icon: <Paintbrush size={20} />,
      gesture: 'point' as GestureType,
      description: 'Index finger up to draw',
      color: 'bg-green-500'
    },
    {
      name: 'Peace',
      icon: <Eraser size={20} />,
      gesture: 'peace' as GestureType,
      description: 'Two fingers for eraser mode',
      color: 'bg-orange-500'
    },
    {
      name: 'Fist',
      icon: <RotateCcw size={20} />,
      gesture: 'fist' as GestureType,
      description: 'Closed fist to clear canvas',
      color: 'bg-red-500'
    },
    {
      name: 'Thumbs Up',
      icon: <Palette size={20} />,
      gesture: 'thumbs_up' as GestureType,
      description: 'Thumb up to cycle colors',
      color: 'bg-blue-500'
    },
    {
      name: 'OK Sign',
      icon: <Trash2 size={20} />,
      gesture: 'ok_sign' as GestureType,
      description: 'OK sign to clear entire drawing',
      color: 'bg-purple-500'
    },
    {
      name: 'Open Palm',
      icon: <Pause size={20} />,
      gesture: 'open_palm' as GestureType,
      description: 'Open palm to pause drawing',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Hand className="text-indigo-400" size={24} />
        <h3 className="text-lg font-semibold text-white">Gesture Control</h3>
      </div>

      {/* Current Gesture Status */}
      <div className="bg-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Current Gesture</span>
          <span className="text-sm text-gray-400">
            {confidence > 0 ? `${Math.round(confidence * 100)}%` : 'None'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            currentGesture !== 'none' ? 'bg-green-400' : 'bg-gray-400'
          }`} />
          <span className="text-white capitalize">
            {currentGesture === 'none' ? 'No gesture detected' : currentGesture.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Gesture Guide */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Available Gestures</h4>
        {gestures.map((gesture) => (
          <div
            key={gesture.name}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              currentGesture === gesture.gesture
                ? 'bg-white/20 border border-white/30'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`p-2 rounded-lg ${gesture.color}/20`}>
              <div className={`text-white`}>
                {gesture.icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{gesture.name}</div>
              <div className="text-xs text-gray-400">{gesture.description}</div>
            </div>
            {currentGesture === gesture.gesture && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};