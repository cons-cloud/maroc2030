import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Download } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  onDelete?: (index: number) => void;
  canDelete?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  onDelete,
  canDelete = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(currentIndex);
      if (currentIndex >= images.length - 1) {
        setCurrentIndex(Math.max(0, images.length - 2));
      }
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fadeIn">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="flex gap-2">
          {canDelete && onDelete && (
            <button
              onClick={handleDelete}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
              title="Supprimer"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
            title="Télécharger"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-20">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-sm"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition backdrop-blur-sm"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-black/50 rounded-xl backdrop-blur-sm max-w-[90vw] overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                index === currentIndex
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Keyboard navigation hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        Utilisez ← → pour naviguer
      </div>
    </div>
  );
};

export default ImageGallery;
