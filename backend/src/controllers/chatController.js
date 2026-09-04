const { generateAdvisoryResponse } = require('../services/chatService');

async function handleChatMessage(req, res) {
  try {
    const { userId } = req.params;
    const { message, lang = 'en', history = [], clientContext = {} } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = await generateAdvisoryResponse(userId, message.trim(), lang, history, clientContext);

    const reply = typeof result === 'string' ? result : (result.reply || '');
    const thoughts = typeof result === 'object' ? (result.thoughts || null) : null;
    const engine = typeof result === 'object' ? (result.engine || 'gemini-thinking') : 'gemini-thinking';

    return res.json({
      success: true,
      userId,
      reply,
      thoughts,
      engine,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in handleChatMessage:', err);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: err.message,
    });
  }
}

module.exports = {
  handleChatMessage,
};
