export const LINKEDIN_SELECTORS = {
  // Comment inputs (both collapsed placeholder and active editor)
  COMMENT_EDITOR: '.ql-editor[data-placeholder]',
  COMMENT_FORM: '.comments-comment-texteditor',
  COMMENT_BOX: '.comments-comment-box',
  COMMENT_PLACEHOLDER: '.comments-comment-box__form',

  // Messaging inputs
  MESSAGE_EDITOR: '.msg-form__contenteditable',
  MESSAGE_FORM: '.msg-form',

  // Post creation modal
  POST_EDITOR: '.ql-editor[role="textbox"]',
  POST_MODAL: '.share-creation-state__text-editor',
  SHARE_BOX: '.share-box',

  // Generic contenteditable fallback
  CONTENTEDITABLE: '[contenteditable="true"][role="textbox"]',

  // Context extraction - Posts
  POST_CONTAINER: '.feed-shared-update-v2',
  POST_TEXT: '.feed-shared-update-v2__description-wrapper',
  POST_AUTHOR: '.update-components-actor__name',
  POST_AUTHOR_HEADLINE: '.update-components-actor__description',

  // Context extraction - Messaging
  MESSAGE_RECIPIENT: '.msg-entity-lockup__entity-title',
  MESSAGE_RECIPIENT_HEADLINE: '.msg-entity-lockup__entity-subtitle',
  CONVERSATION_MESSAGES: '.msg-s-event-listitem__body',
} as const;
