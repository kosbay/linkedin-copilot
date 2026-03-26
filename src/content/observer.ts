import type { LinkedInInputType } from '@/types/linkedin';
import { detectLinkedInInputs } from './detector';

export function observeLinkedInInputs(
  onInputAppear: (element: HTMLElement, type: LinkedInInputType) => void,
  onInputDisappear: (element: HTMLElement) => void,
): () => void {
  const trackedInputs = new Set<HTMLElement>();

  function scanNode(node: HTMLElement) {
    const inputs = detectLinkedInInputs(node);
    for (const { element, type } of inputs) {
      if (!trackedInputs.has(element)) {
        trackedInputs.add(element);
        onInputAppear(element, type);
      }
    }
  }

  function removeNode(node: HTMLElement) {
    if (trackedInputs.has(node)) {
      trackedInputs.delete(node);
      onInputDisappear(node);
    }
    // Also check if any tracked inputs were children of the removed node
    for (const tracked of trackedInputs) {
      if (node.contains(tracked)) {
        trackedInputs.delete(tracked);
        onInputDisappear(tracked);
      }
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Handle added/removed nodes
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          scanNode(node);
        }
      }
      for (const node of mutation.removedNodes) {
        if (node instanceof HTMLElement) {
          removeNode(node);
        }
      }
      // Handle attribute changes (e.g. contenteditable being set)
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
        scanNode(mutation.target);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['contenteditable', 'data-placeholder', 'role'],
  });

  // Initial scan for already-present inputs
  scanNode(document.body);

  // Periodic re-scan to catch inputs loaded by LinkedIn's SPA navigation
  const intervalId = setInterval(() => {
    // Clean up tracked inputs that are no longer in the DOM
    for (const tracked of trackedInputs) {
      if (!tracked.isConnected) {
        trackedInputs.delete(tracked);
        onInputDisappear(tracked);
      }
    }
    // Re-scan for new inputs
    scanNode(document.body);
  }, 2000);

  return () => {
    observer.disconnect();
    clearInterval(intervalId);
    trackedInputs.clear();
  };
}
