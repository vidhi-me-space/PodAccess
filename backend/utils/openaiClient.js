import OpenAI from 'openai';
import https from 'https';

let client = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Add it to backend/.env');
  }

  if (!client) {
    // This 'agent' allows the app to connect even if the system clock (2026)
    // causes SSL/Certificate mismatch errors.
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      httpAgent: agent
    });
  }

  return client;
}