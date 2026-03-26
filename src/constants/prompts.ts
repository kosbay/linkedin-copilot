import type { FeatureType } from '@/types/ai';

export const SYSTEM_PROMPTS: Record<FeatureType, string> = {
  comment: `You are a LinkedIn comment writer. You will be given a LinkedIn post and must write a thoughtful, engaging comment that adds value to the conversation.

Rules:
- Keep it concise (2-4 sentences typically)
- Be authentic and add genuine insight
- Don't be generic or sycophantic
- Match the tone specified by the user
- Don't use hashtags in comments
- Don't start with "Great post!" or similar generic openers`,

  'cold-dm': `You are a LinkedIn cold outreach message writer. You will be given information about a recipient and must craft a personalized, non-spammy direct message.

Rules:
- Personalize based on the recipient's profile
- Be concise (3-5 sentences)
- Have a clear but soft call-to-action
- Don't be pushy or salesy
- Reference something specific about their work
- Match the tone specified by the user`,

  post: `You are a LinkedIn post writer. You will create engaging posts based on the user's topic or prompt.

Rules:
- Write in first person
- Use line breaks for readability
- Include a hook in the first line
- Keep it under 1300 characters unless asked otherwise
- Match the tone specified by the user
- Don't overuse emojis
- Don't use hashtags unless specifically requested`,
};

export function buildSystemPrompt(
  feature: FeatureType,
  tonePrompt: string,
  customInstructions: string,
): string {
  let prompt = SYSTEM_PROMPTS[feature];

  if (tonePrompt) {
    prompt += `\n\nTone: ${tonePrompt}`;
  }

  if (customInstructions) {
    prompt += `\n\nAdditional instructions from the user: ${customInstructions}`;
  }

  return prompt;
}

export function buildUserPrompt(
  feature: FeatureType,
  context: {
    postText?: string;
    postAuthor?: string;
    postAuthorHeadline?: string;
    recipientName?: string;
    recipientHeadline?: string;
    conversationHistory?: string[];
    userPrompt?: string;
  },
): string {
  switch (feature) {
    case 'comment': {
      let prompt = '';
      if (context.postAuthor) {
        prompt += `Post author: ${context.postAuthor}`;
        if (context.postAuthorHeadline) {
          prompt += ` (${context.postAuthorHeadline})`;
        }
        prompt += '\n\n';
      }
      if (context.postText) {
        prompt += `Post content:\n${context.postText}`;
      }
      if (context.userPrompt) {
        prompt += `\n\nUser's direction: ${context.userPrompt}`;
      }
      return prompt || 'Write a general engaging comment.';
    }

    case 'cold-dm': {
      let prompt = '';
      if (context.recipientName) {
        prompt += `Recipient: ${context.recipientName}`;
        if (context.recipientHeadline) {
          prompt += `\nHeadline: ${context.recipientHeadline}`;
        }
        prompt += '\n\n';
      }
      if (context.conversationHistory?.length) {
        prompt += `Recent messages in conversation:\n${context.conversationHistory.join('\n')}\n\n`;
      }
      if (context.userPrompt) {
        prompt += `User's direction: ${context.userPrompt}`;
      }
      return prompt || 'Write a general cold outreach message.';
    }

    case 'post': {
      return context.userPrompt || 'Write an engaging LinkedIn post about a professional insight.';
    }
  }
}
