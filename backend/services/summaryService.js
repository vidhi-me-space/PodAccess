import axios from 'axios';

/**
 * Ensures a text block is split into paragraphs if it's too long and lacks them.
 * Supports Hindi punctuation (।).
 */
function formatParagraphs(text, targetParaCount = 4) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) return text;

  // If it already has double newlines, assume it's formatted
  if (text.includes('\n\n')) return text;

  // If it has single newlines, try to convert them to double
  if (text.includes('\n')) {
    return text.split('\n').filter(p => p.trim()).join('\n\n');
  }

  // Fallback: split by sentence count to create paragraphs
  // Added Hindi punctuation symbol । to the regex
  const sentences = text.match(/[^.!?।]+[.!?।]+/g) || [text];
  if (sentences.length <= 3) return text;

  const sentencesPerPara = Math.ceil(sentences.length / targetParaCount);
  const paragraphs = [];

  for (let i = 0; i < sentences.length; i += sentencesPerPara) {
    const para = sentences.slice(i, i + sentencesPerPara).join(' ').trim();
    if (para) paragraphs.push(para);
  }

  return paragraphs.join('\n\n');
}

export async function generateSummaries(transcript, title) {
  const GROQ_KEY = process.env.GROQ_API_KEY;

  // Use a much larger context for better analysis
  const prompt = `Based on this transcript: "${transcript.substring(0, 30000)}",
  generate a summary and extract keywords for the podcast titled "${title}".

  You MUST return ONLY a raw JSON object with these EXACT keys:
  "shortSummary": (A substantial summary of 120-150 words),
  "detailedSummary": (An exhaustive analysis of 350-400 words, split into 5-6 paragraphs using \\n\\n),
  "keyPoints": (Array of 5 strings),
  "keywords": (Array of 8-10 strings).

  CRITICAL:
  - Ensure "detailedSummary" is present and at least 350 words.
  - Use ONLY the specified keys.
  - Professional tone.`;

  try {
    console.log('🚀 [STEP 3] Generating high-fidelity summaries and keywords...');
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }, {
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      timeout: 60000
    });

    const content = res.data.choices[0].message.content;
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    // Apply formatting fallback and ensure fields are non-empty
    const detailed = formatParagraphs(parsed.detailedSummary || parsed.detailed_summary || "Detailed analysis complete.", 5);
    const short = formatParagraphs(parsed.shortSummary || parsed.short_summary || "Summary ready.", 1);

    return {
      shortSummary: short,
      detailedSummary: detailed,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : (Array.isArray(parsed.key_points) ? parsed.key_points : ["Topic analyzed"]),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
    };
  } catch (error) {
    console.error('❌ Summary error:', error.response?.data || error.message);
    return {
      shortSummary: "Summary is currently being processed. Please check the transcript tab for the full content.",
      detailedSummary: "The detailed analysis will appear here once the AI finishes analyzing the full conversation context.",
      keyPoints: ["Topic: " + title, "Analyzed using Groq AI"],
      keywords: ["Podcast", "Analysis"]
    };
  }
}
