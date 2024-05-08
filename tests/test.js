import { emojiSchema } from '../src/schemas.js';

describe('emojiSchema', () => {
  it.each(['😀', '😀 👨‍👩‍👦', '😂  \n🧨'])('should be valid: %s', (str) => {
    expect(emojiSchema.validate(str).error).toBeUndefined();
  });
  it.each(['😀 hey', '   ', 'heyo'])('should be invalid: %s', (str) => {
    expect(emojiSchema.validate(str).error).toBeDefined();
  });
});
