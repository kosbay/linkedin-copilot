import { LINKEDIN_SELECTORS } from '@/constants/linkedin-selectors';
import type { LinkedInInputType } from '@/types/linkedin';

export interface DetectedInput {
  element: HTMLElement;
  type: LinkedInInputType;
}

export function detectInputType(element: HTMLElement): LinkedInInputType {
  if (element.closest(LINKEDIN_SELECTORS.COMMENT_FORM) || element.closest(LINKEDIN_SELECTORS.COMMENT_BOX)) return 'comment';
  if (element.closest(LINKEDIN_SELECTORS.MESSAGE_FORM)) return 'message';
  if (element.closest(LINKEDIN_SELECTORS.POST_MODAL)) return 'post';
  if (element.closest(LINKEDIN_SELECTORS.SHARE_BOX)) return 'post';
  return 'unknown';
}

export function detectLinkedInInputs(root: HTMLElement): DetectedInput[] {
  const results: DetectedInput[] = [];
  const seen = new Set<HTMLElement>();

  const selectors = [
    LINKEDIN_SELECTORS.COMMENT_EDITOR,
    LINKEDIN_SELECTORS.MESSAGE_EDITOR,
    LINKEDIN_SELECTORS.POST_EDITOR,
    LINKEDIN_SELECTORS.CONTENTEDITABLE,
    // Also detect active contenteditable elements without role
    '[contenteditable="true"]',
  ];

  function addIfLinkedIn(el: HTMLElement) {
    if (seen.has(el)) return;
    // Skip our own elements
    if (el.closest('#linkedin-copilot-root')) return;
    // Must be inside a LinkedIn form context or be contenteditable
    const type = detectInputType(el);
    if (type === 'unknown' && el.getAttribute('contenteditable') !== 'true') return;
    seen.add(el);
    results.push({ element: el, type });
  }

  for (const selector of selectors) {
    // Check the root element itself
    if (root.matches?.(selector)) {
      addIfLinkedIn(root);
    }
    // Check descendants
    const elements = root.querySelectorAll<HTMLElement>(selector);
    for (const el of elements) {
      addIfLinkedIn(el);
    }
  }

  return results;
}
