import { useState, useEffect, useCallback } from 'react';

interface Position {
  top: number;
  left: number;
}

export function useWidgetPosition(inputElement: HTMLElement | null): Position {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!inputElement) return;
    const rect = inputElement.getBoundingClientRect();
    // Position at the right edge, vertically centered in the input
    const buttonSize = 28;
    setPosition({
      top: rect.top + (rect.height - buttonSize) / 2,
      left: rect.right - buttonSize - 8,
    });
  }, [inputElement]);

  useEffect(() => {
    if (!inputElement) return;

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(inputElement);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      resizeObserver.disconnect();
    };
  }, [inputElement, updatePosition]);

  return position;
}
