const { GoogleGenAI } = require('@google/genai');

// Controller for handling AI chat interactions via Gemini
exports.chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found in environment variables.");
      return res.status(503).json({ 
        success: false, 
        message: 'AI Service is currently unavailable. Please add GEMINI_API_KEY to your backend .env file.' 
      });
    }

    // Initialize genai client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format chat history for Gemini API
    // Gemini expects an array of { role: 'user' | 'model', parts: [{ text: '...' }] }
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'bot' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Add current user message
    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const systemInstruction = `
You are the "UniConnect Assistant", a friendly, energetic, and professional AI embedded into the UniConnect platform. 
UniConnect is a platform that helps university students find groups, collaborate on projects, manage tasks, match based on skills (React, Node.js, Python etc.), and send join requests/invitations.
You provide very concise, helpful, and supportive answers. Use emojis occasionally. 
Format your responses using Markdown. Keep responses brief (under 3-4 short paragraphs maximum) so they fit nicely in a small chat window.
If a user asks about what they can do on the platform, tell them they can: Create Groups, Find Skill Matches, Send Requests, and Manage Tasks.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const aiMessage = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({
      success: true,
      data: {
        text: aiMessage,
      }
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to communicate with AI model.',
      error: error.message
    });
  }
};
