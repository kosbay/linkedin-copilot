export type LinkedInInputType = 'comment' | 'message' | 'post' | 'unknown';

export interface LinkedInContext {
  inputType: LinkedInInputType;
  inputElement: HTMLElement;
  postText?: string;
  postAuthor?: string;
  postAuthorHeadline?: string;
  recipientName?: string;
  recipientHeadline?: string;
  conversationHistory?: string[];
  userPrompt?: string;
}
