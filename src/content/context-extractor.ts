import { LINKEDIN_SELECTORS } from '@/constants/linkedin-selectors';
import type { LinkedInInputType, LinkedInContext } from '@/types/linkedin';

/**
 * Walk up the DOM from the input element to find the parent post container.
 * LinkedIn's DOM structure varies, so we try multiple strategies.
 */
function findPostContainer(element: HTMLElement): HTMLElement | null {
  // Strategy 1: direct ancestor match
  const direct = element.closest(LINKEDIN_SELECTORS.POST_CONTAINER);
  if (direct) return direct as HTMLElement;

  // Strategy 2: walk up to the comment box, then look for a sibling/parent post container
  const commentBox = element.closest(LINKEDIN_SELECTORS.COMMENT_BOX)
    || element.closest(LINKEDIN_SELECTORS.COMMENT_FORM);
  if (commentBox) {
    // The comment box might be a sibling of the post container, or share a common parent
    let node = commentBox.parentElement;
    for (let i = 0; i < 8 && node; i++) {
      // Check if this ancestor IS a post container
      if (node.matches(LINKEDIN_SELECTORS.POST_CONTAINER)) return node;
      // Check if a post container is a child/descendant of this ancestor
      const found = node.querySelector(LINKEDIN_SELECTORS.POST_CONTAINER);
      if (found) return found as HTMLElement;
      node = node.parentElement;
    }
  }

  // Strategy 3: walk up from the element itself looking for common feed item wrappers
  let node = element.parentElement;
  for (let i = 0; i < 12 && node; i++) {
    if (node.matches(LINKEDIN_SELECTORS.POST_CONTAINER)) return node;
    // Also check for data-urn attribute which LinkedIn uses on feed items
    if (node.hasAttribute('data-urn')) return node;
    node = node.parentElement;
  }

  return null;
}

/**
 * Extract post text from a container, trying multiple selector strategies.
 */
function extractPostText(container: HTMLElement): string | undefined {
  // Strategy 1: specific post text selector
  const descWrapper = container.querySelector(LINKEDIN_SELECTORS.POST_TEXT);
  if (descWrapper?.textContent?.trim()) {
    return descWrapper.textContent.trim();
  }

  // Strategy 2: look for span[dir="ltr"] inside the post (common LinkedIn pattern)
  const spanDir = container.querySelector('.feed-shared-text span[dir="ltr"]')
    || container.querySelector('.update-components-text span[dir="ltr"]');
  if (spanDir?.textContent?.trim()) {
    return spanDir.textContent.trim();
  }

  // Strategy 3: broader text content selectors
  const altSelectors = [
    '.feed-shared-text',
    '.update-components-text',
    '.feed-shared-update-v2__description',
    '.feed-shared-inline-show-more-text',
  ];
  for (const sel of altSelectors) {
    const el = container.querySelector(sel);
    if (el?.textContent?.trim()) {
      return el.textContent.trim();
    }
  }

  return undefined;
}

export function extractContext(
  element: HTMLElement,
  inputType: LinkedInInputType,
): LinkedInContext {
  const ctx: LinkedInContext = { inputType, inputElement: element };

  // For comments (and unknown type that's near a post), extract post context
  if (inputType === 'comment' || inputType === 'unknown') {
    const postContainer = findPostContainer(element);
    if (postContainer) {
      ctx.postText = extractPostText(postContainer);

      ctx.postAuthor = postContainer
        .querySelector(LINKEDIN_SELECTORS.POST_AUTHOR)
        ?.textContent?.trim();

      // Fallback author selectors
      if (!ctx.postAuthor) {
        const altAuthor = postContainer.querySelector(
          '.update-components-actor__title span[dir="ltr"] span[aria-hidden="true"]'
        ) || postContainer.querySelector('.update-components-actor__title');
        ctx.postAuthor = altAuthor?.textContent?.trim();
      }

      ctx.postAuthorHeadline = postContainer
        .querySelector(LINKEDIN_SELECTORS.POST_AUTHOR_HEADLINE)
        ?.textContent?.trim();

      if (!ctx.postAuthorHeadline) {
        const altHeadline = postContainer.querySelector(
          '.update-components-actor__subtitle'
        );
        ctx.postAuthorHeadline = altHeadline?.textContent?.trim();
      }
    }
  }

  if (inputType === 'message') {
    ctx.recipientName = document
      .querySelector(LINKEDIN_SELECTORS.MESSAGE_RECIPIENT)
      ?.textContent?.trim();
    ctx.recipientHeadline = document
      .querySelector(LINKEDIN_SELECTORS.MESSAGE_RECIPIENT_HEADLINE)
      ?.textContent?.trim();

    const messages = document.querySelectorAll(LINKEDIN_SELECTORS.CONVERSATION_MESSAGES);
    ctx.conversationHistory = Array.from(messages)
      .slice(-5)
      .map((m) => m.textContent?.trim() ?? '');
  }

  return ctx;
}
