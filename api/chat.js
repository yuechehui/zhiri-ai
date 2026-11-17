// Zhiri AI chat backend — Vercel serverless function.
// The frontend (index.html) POSTs { question, profile } to /api/chat.
// The API key is read from environment variables only and is NEVER
// stored in the repository. A TikBit relay key works here because it
// is OpenAI-compatible: set AI_API_URL to the relay base URL.
//
// Required environment variables (set in Vercel → Settings → Environment Variables):
//   AI_API_URL  e.g. https://api.openai.com  (or your relay base URL, no trailing /v1)
//   AI_API_KEY  your API key
// Optional:
//   AI_MODEL    e.g. gpt-4o-mini (default)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_API_URL || !AI_API_KEY) {
    return res.status(503).json({
      error: 'AI backend is not configured yet. Set AI_API_URL and AI_API_KEY in your deployment environment.'
    });
  }

  const body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return res.status(400).json({ error: 'Please enter a question.' });
  }

  const profile = body.profile || {};
  const profileLines = [];
  if (profile.name) profileLines.push('Name: ' + profile.name);
  if (profile.birthDate) {
    profileLines.push('Date of birth: ' + profile.birthDate + ' (' + (profile.birthType || 'Gregorian') + ' calendar)');
  }
  if (profile.birthTime) profileLines.push('Time of birth: ' + profile.birthTime);
  if (profile.birthPlace) profileLines.push('Place of birth: ' + profile.birthPlace);
  const profileText = profileLines.length
    ? 'The user has shared this profile context:\n' + profileLines.join('\n') + '\nUse it only when it is relevant to the question.'
    : 'No profile has been saved yet.';

  const systemPrompt =
    'You are Zhiri, a daily-life guide rooted in Eastern wisdom (the I Ching, ' +
    'Daoist balance, and Confucian practical ethics). Answer in clear, simple English. ' +
    'Be brief and practical: one clear insight, then two or three small actions the ' +
    'user can take today. Do not claim to predict the future, give medical or legal ' +
    'advice, or invent classical quotes. If a question is outside your scope, say so honestly.';

  const model = AI_MODEL || 'gpt-4o-mini';
  const baseUrl = AI_API_URL.replace(/\/$/, '');

  try {
    const r = await fetch(baseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + AI_API_KEY
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt + '\n\n' + profileText },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });
    if (!r.ok) {
      console.error('UP',r.status,await r.text());
      return res.status(502).json({ error: 'The AI service returned an error. Please try again later.' });
    }
    const data = await r.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;
    if (!reply) {
      return res.status(502).json({ error: 'The AI service returned no answer. Please try again.' });
    }
    return res.status(200).json({ reply: reply });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach the AI service. Please try again later.' });
  }
};
