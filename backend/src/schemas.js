import emojiRegex from 'emoji-regex';
import Joi from 'joi';

// ensure string contains at least 1 emoji, and only contains emojis and whitespace
export const emojiSchema = Joi.string().custom((value, helpers) => {
  const regex = emojiRegex();
  const isStrOnlyEmojisOrWhitespace = !value.replace(regex, '').trim().length;
  const isStrOnlyWhitespace = !value.trim().length;
  return isStrOnlyEmojisOrWhitespace && !isStrOnlyWhitespace
    ? value
    : helpers.message(
        '{#label} must contain at least one emoji, and only contain emojis and whitespace',
      );
});

export const paginateSchema = Joi.object({
  page: Joi.number().integer().positive(),
  limit: Joi.number().integer().positive(),
});
