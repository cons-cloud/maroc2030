import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number | string;
  height?: number | string;
  onError?: () => void;
  onLoad?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = '/placeholder.jpg',
  width,
  height,
  onError,
  onLoad,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Si l'image est déjà chargée ou si l'API IntersectionObserver n'est pas disponible
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px',
      threshold: 0.01,
    });

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;
    const img = new Image();
    
    const handleLoad = () => {
      if (isMounted) {
        setImageSrc(src);
        setIsLoading(false);
        onLoad?.();
      }
    };

    const handleError = () => {
      if (isMounted) {
        setImageSrc(placeholder);
        setIsLoading(false);
        onError?.();
      }
    };

    img.src = src;
    img.onload = handleLoad;
    img.onerror = handleError;

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView, placeholder, onError, onLoad]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={({ currentTarget }) => {
        currentTarget.onerror = null; // Empêche la boucle d'erreur
        currentTarget.src = placeholder;
      }}
    />
  );
};

export default LazyImage;
