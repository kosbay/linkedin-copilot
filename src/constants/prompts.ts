import type { FeatureType } from '@/types/ai';
import type { LinkedInProfile } from '@/types/storage';

const HUMAN_WRITING_RULES = `
- Write like a real human, not an AI. Use plain, natural language
- Never use em dashes (—), en dashes (–), or special Unicode characters like bullet symbols (•), arrows (→), or fancy quotes (" ")
- Use regular hyphens (-), regular quotes (" '), and simple punctuation only
- Avoid overly polished or corporate-sounding phrases
- Don't use filler words like "leverage", "synergy", "game-changer", "dive into", "unpack"
- Keep sentence structure varied and natural, not formulaic`;

export const SYSTEM_PROMPTS: Record<FeatureType, string> = {
  comment: `You are a LinkedIn comment writer. You will be given a LinkedIn post and must write a thoughtful, engaging comment that adds value to the conversation.

Rules:
- Keep it short - 1-2 sentences by default unless the user's direction asks for more
- Be authentic and add genuine insight
- Don't be generic or sycophantic
- Match the tone specified by the user
- Don't use hashtags in comments
- Don't start with "Great post!" or similar generic openers${HUMAN_WRITING_RULES}`,

  'cold-dm': `You are a LinkedIn cold outreach message writer. You will be given information about a recipient and must craft a personalized, non-spammy direct message.

Rules:
- Personalize based on the recipient's profile
- Be concise (3-5 sentences)
- Have a clear but soft call-to-action
- Don't be pushy or salesy
- Reference something specific about their work
- Match the tone specified by the user${HUMAN_WRITING_RULES}`,

  post: `You are a LinkedIn post writer. You will create engaging posts based on the user's topic or prompt.

Rules:
- Write in first person
- Use line breaks for readability
- Include a hook in the first line
- Keep it under 1300 characters unless asked otherwise
- Match the tone specified by the user
- Don't overuse emojis
- Don't use hashtags unless specifically requested${HUMAN_WRITING_RULES}`,
};

export function buildSystemPrompt(
  feature: FeatureType,
  tonePrompt: string,
  customInstructions: string,
  userProfile?: LinkedInProfile | null,
): string {
  let prompt = SYSTEM_PROMPTS[feature];

  if (userProfile) {
    prompt += `\n\nAbout the user writing this (use for personalization and context, but do not simply copy their profile):`;
    prompt += `\nName: ${userProfile.name}`;
    if (userProfile.headline) prompt += `\nHeadline: ${userProfile.headline}`;
    if (userProfile.location) prompt += `\nLocation: ${userProfile.location}`;
    if (userProfile.about) prompt += `\nAbout: ${userProfile.about}`;
    if (userProfile.experience.length > 0) {
      prompt += `\nCurrent/Recent roles: ${userProfile.experience.slice(0, 3).map((e) => `${e.title} at ${e.company}`).join(', ')}`;
    }
    if (userProfile.skills.length > 0) {
      prompt += `\nKey skills: ${userProfile.skills.slice(0, 10).join(', ')}`;
    }
  }

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
