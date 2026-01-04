import { useState, useRef, useCallback, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50
}: SwipeConfig) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping) return;
    touchEndX.current = e.touches[0].clientX;
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    
    const distance = touchStartX.current - touchEndX.current;
    
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0 && onSwipeLeft) {
        // Swiped left (next)
        onSwipeLeft();
      } else if (distance < 0 && onSwipeRight) {
        // Swiped right (previous)
        onSwipeRight();
      }
    }
    
    setIsSwiping(false);
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [isSwiping, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    isSwiping
  };
};
