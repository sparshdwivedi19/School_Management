const OpenAI = require('openai');

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

module.exports = { getOpenAIClient };
