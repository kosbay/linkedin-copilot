import React, { useState, useCallback, useEffect } from 'react';
import type { LinkedInInputType } from '@/types/linkedin';
import { observeLinkedInInputs } from '../observer';
import { WidgetContainer } from './WidgetContainer';

interface WidgetInstance {
  element: HTMLElement;
  type: LinkedInInputType;
}

export function WidgetRoot() {
  const [widgets, setWidgets] = useState<Map<HTMLElement, WidgetInstance>>(new Map());

  const handleInputAppear = useCallback((element: HTMLElement, type: LinkedInInputType) => {
    setWidgets((prev) => {
      if (prev.has(element)) return prev;
      const next = new Map(prev);
      next.set(element, { element, type });
      return next;
    });
  }, []);

  const handleInputDisappear = useCallback((element: HTMLElement) => {
    setWidgets((prev) => {
      if (!prev.has(element)) return prev;
      const next = new Map(prev);
      next.delete(element);
      return next;
    });
  }, []);

  useEffect(() => {
    const cleanup = observeLinkedInInputs(handleInputAppear, handleInputDisappear);
    return cleanup;
  }, [handleInputAppear, handleInputDisappear]);

  return (
    <>
      {Array.from(widgets.values()).map((widget) => (
        <WidgetContainer
          key={`lc-${widget.element.getAttribute('data-lc-id') ?? Math.random()}`}
          inputElement={widget.element}
          inputType={widget.type}
          onRemove={() => handleInputDisappear(widget.element)}
        />
      ))}
    </>
  );
}
