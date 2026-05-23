import { body, param, ValidationChain } from 'express-validator';

const VALID_TONES = ['professional', 'friendly', 'casual', 'authoritative', 'enthusiastic'];
const VALID_CONTENT_TYPES = ['gmb_post', 'seo_description', 'faq', 'promotional', 'educational'];

// Detect prompt injection patterns
function isSafeInput(value: string): boolean {
  const dangerousPatterns = [
    /ignore previous instructions/i,
    /system prompt/i,
    /act as (an?\s)?(ai|gpt|claude|assistant)/i,
    /jailbreak/i,
    /\{\{.*\}\}/,
    /<script/i,
  ];
  return !dangerousPatterns.some((p) => p.test(value));
}

export const generateValidator: ValidationChain[] = [
  body('business_name')
    .trim()
    .notEmpty().withMessage('Business name is required.')
    .isLength({ max: 100 }).withMessage('Business name must be under 100 characters.')
    .custom(isSafeInput).withMessage('Business name contains invalid content.'),

  body('business_type')
    .trim()
    .notEmpty().withMessage('Business type is required.')
    .isLength({ max: 100 }).withMessage('Business type must be under 100 characters.')
    .custom(isSafeInput).withMessage('Business type contains invalid content.'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required.')
    .isLength({ max: 200 }).withMessage('Location must be under 200 characters.')
    .custom(isSafeInput).withMessage('Location contains invalid content.'),

  body('keywords')
    .isArray({ min: 1, max: 10 }).withMessage('Please provide 1–10 keywords.')
    .custom((arr: unknown[]) => {
      if (!arr.every((k) => typeof k === 'string' && k.trim().length > 0)) {
        throw new Error('All keywords must be non-empty strings.');
      }
      const unique = new Set(arr.map((k) => String(k).toLowerCase().trim()));
      if (unique.size !== arr.length) throw new Error('Duplicate keywords are not allowed.');
      return true;
    }),

  body('tone')
    .isIn(VALID_TONES)
    .withMessage(`Tone must be one of: ${VALID_TONES.join(', ')}.`),

  body('content_type')
    .isIn(VALID_CONTENT_TYPES)
    .withMessage(`Content type must be one of: ${VALID_CONTENT_TYPES.join(', ')}.`),
];

export const deleteContentValidator: ValidationChain[] = [
  param('id').isUUID().withMessage('Invalid content ID.'),
];
