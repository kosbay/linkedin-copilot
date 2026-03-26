import { useCallback } from 'react';
import type { LinkedInInputType, LinkedInContext } from '@/types/linkedin';
import { extractContext } from '../context-extractor';

/**
 * Returns a function that extracts fresh LinkedIn context on demand.
 * Context is NOT memoized because the DOM can change between when the
 * widget appears and when the user clicks Generate.
 */
export function useLinkedInContext(
  inputElement: HTMLElement | null,
  inputType: LinkedInInputType,
): () => LinkedInContext | null {
  return useCallback(() => {
    if (!inputElement) return null;
    return extractContext(inputElement, inputType);
  }, [inputElement, inputType]);
}
