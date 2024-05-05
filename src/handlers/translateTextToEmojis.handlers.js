import OpenAi from 'openai';

const openai = new OpenAi();

export async function translateTextToEmojis(req, res) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Translate text into 100% emojis for social media site',
      },
      { role: 'user', content: req.query.text },
    ],
    model: 'gpt-3.5-turbo',
  });
  const emojis = completion.choices[0].message.content;
  res.json({ emojis });
}
