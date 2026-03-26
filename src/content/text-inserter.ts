/**
 * Inserts text into LinkedIn's contenteditable / Quill-based editors.
 *
 * LinkedIn uses React + Quill.js, so simple textContent assignment doesn't work.
 * We try execCommand first (most reliable for contenteditable), then synthetic
 * paste, then direct DOM manipulation as a last resort.
 */
export function insertText(element: HTMLElement, text: string): boolean {
  element.focus();

  // Select all existing content to replace it
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);

  // Try execCommand first — most reliable for contenteditable
  if (tryExecCommand(text)) return true;

  // Fallback: synthetic paste
  if (tryPaste(element, text)) return true;

  // Last resort: direct DOM manipulation
  return tryDirectInsert(element, text);
}

/**
 * Appends text without replacing existing content.
 * Useful for streaming scenarios.
 */
export function appendText(element: HTMLElement, text: string): boolean {
  element.focus();

  // Move cursor to end
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);

  if (tryExecCommand(text)) return true;
  if (tryPaste(element, text)) return true;
  return tryDirectInsert(element, text, true);
}

function tryPaste(element: HTMLElement, text: string): boolean {
  try {
    const contentBefore = element.textContent ?? '';

    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData,
    });

    element.dispatchEvent(pasteEvent);

    // Check if content actually changed (handler consumed the event)
    const contentAfter = element.textContent ?? '';
    if (contentAfter !== contentBefore) {
      dispatchInputEvent(element);
      return true;
    }
  } catch {
    // Paste not supported in this context
  }
  return false;
}

function tryExecCommand(text: string): boolean {
  try {
    const result = document.execCommand('insertText', false, text);
    return result;
  } catch {
    return false;
  }
}

function tryDirectInsert(element: HTMLElement, text: string, append = false): boolean {
  try {
    if (append) {
      element.textContent = (element.textContent ?? '') + text;
    } else {
      element.textContent = text;
    }
    // Dispatch multiple events to ensure React/Quill picks up the change
    dispatchInputEvent(element);
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

function dispatchInputEvent(element: HTMLElement): void {
  element.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertFromPaste',
      data: null,
    }),
  );
}
