import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string | undefined;
  alt: string;
  fallbackSrc: string;
  className?: string;
  showCount?: number;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  showCount,
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [error, setError] = useState<boolean>(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={error || !imgSrc ? fallbackSrc : imgSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleError}
      />
      {showCount !== undefined && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {showCount} {showCount > 1 ? 'images' : 'image'}
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
