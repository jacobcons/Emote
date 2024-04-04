import emojiRegex from 'emoji-regex';
import Joi from 'joi';
export const emojiSchema = Joi.string().custom((value, helpers) => {
  const regex = emojiRegex();
  const strWithEmojisAndWhiteSpaceRemoved = value.replace(regex, '').trim();
  return strWithEmojisAndWhiteSpaceRemoved.length === 0
    ? value
    : helpers.message('{#label} must only contain emojis and whitespace');
});
