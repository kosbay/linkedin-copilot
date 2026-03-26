import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LinkedInInputType } from '@/types/linkedin';
import { useLinkedInContext } from '../hooks/useLinkedInContext';
import { useWidgetPosition } from '../hooks/useWidgetPosition';
import { useGenerate } from '../hooks/useGenerate';
import { FloatingButton } from './FloatingButton';
import { WidgetPanel } from './WidgetPanel';

interface WidgetContainerProps {
  inputElement: HTMLElement;
  inputType: LinkedInInputType;
  onRemove: () => void;
}

type WidgetState = 'trigger' | 'expanded';

export function WidgetContainer({ inputElement, inputType, onRemove }: WidgetContainerProps) {
  const [state, setState] = useState<WidgetState>('trigger');
  const widgetRef = useRef<HTMLDivElement>(null);
  const position = useWidgetPosition(inputElement);
  const getContext = useLinkedInContext(inputElement, inputType);
  // Generation state lives here so it persists across open/close
  const generation = useGenerate();

  // Close on click outside - use composedPath() to handle Shadow DOM
  useEffect(() => {
    if (state !== 'expanded') return;

    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      const clickedInsideWidget = widgetRef.current && path.includes(widgetRef.current);
      const clickedInsideInput = path.includes(inputElement);

      if (!clickedInsideWidget && !clickedInsideInput) {
        setState('trigger');
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [state, inputElement]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state === 'expanded') {
        setState('trigger');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  // Watch for input removal
  useEffect(() => {
    if (!inputElement.isConnected) {
      onRemove();
    }

    const observer = new MutationObserver(() => {
      if (!inputElement.isConnected) {
        onRemove();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [inputElement, onRemove]);

  const handleClose = useCallback(() => {
    setState('trigger');
  }, []);

  const hasResult = generation.status === 'complete' && !!generation.text;

  // Decide whether panel opens above or below the button
  const panelHeight = 350; // approximate panel height
  const spaceBelow = window.innerHeight - position.top - 36;
  const openAbove = spaceBelow < panelHeight && position.top > panelHeight;

  return (
    <div
      ref={widgetRef}
      className="lc-widget"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 2147483647,
      }}
    >
      {state === 'trigger' && (
        <FloatingButton onClick={() => setState('expanded')} hasResult={hasResult} />
      )}

      {state === 'expanded' && (
        <div style={{
          position: 'absolute',
          right: 0,
          ...(openAbove
            ? { bottom: 36 }
            : { top: 36 }),
        }}>
          <WidgetPanel
            inputElement={inputElement}
            inputType={inputType}
            getContext={getContext}
            generation={generation}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}
