import React from 'react';
import { Download, Trash2, X, Image as ImageIcon } from 'lucide-react';

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ id: string; data: string; timestamp: number }>;
  onDeleteImage: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ isOpen, onClose, images, onDeleteImage }) => {
  const handleDownload = (imageData: string, id: string) => {
    const link = document.createElement('a');
    link.download = `air-canvas-${id}.png`;
    link.href = imageData;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <ImageIcon className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Gallery</h2>
            <span className="text-sm text-gray-400">({images.length} images)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-400 text-lg">No images saved yet</p>
              <p className="text-gray-500 text-sm mt-2">Create some artwork and save it to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
                >
                  <img
                    src={image.data}
                    alt={`Artwork ${image.id}`}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleDownload(image.data, image.id)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteImage(image.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Timestamp */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {new Date(image.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};