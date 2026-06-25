import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Podcast from '../models/Podcast.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { generateSummaries } from '../services/summaryService.js';
import { downloadAudioFromUrl } from '../services/urlService.js';
import { generateTranscriptPDF } from '../utils/pdfGenerator.js';

// DEMO MODE CONFIG
const USE_DEMO_MODE = false;

/**
 * Utility to ensure paragraph breaks exist in AI output.
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

async function processPodcast(podcastId, filePath, title, targetLanguage = 'Original') {
  try {
    let transcript, segments, summaries;

    if (USE_DEMO_MODE) {
      // Demo logic...
    } else {
      console.log(`Starting transcription for podcast ${podcastId}...`);
      const result = await transcribeAudio(filePath, title, targetLanguage);
      transcript = result.transcript;
      segments = result.segments;

      console.log(`Transcription complete. Generating summaries...`);
      summaries = await generateSummaries(transcript, title);
    }

    // NEW: Handle initial language translation if requested
    if (targetLanguage !== 'Original') {
      console.log(`Translating initial result to ${targetLanguage}...`);
      const GROQ_KEY = process.env.GROQ_API_KEY;

      const translationPrompt = `You are a professional translator and content creator. Translate and expand the following podcast content into ${targetLanguage}.

      IMPORTANT RULES:
      1. Output MUST be in ${targetLanguage}.
      2. FORMATTING: You MUST use exactly two newline characters (\\n\\n) between paragraphs.
      3. TRANSCRIPT: Translate the ENTIRE transcript provided below verbatim. Do not summarize.
      4. SUMMARY LENGTHS:
         - shortSummary: ~120-150 words.
         - detailedSummary: At least 350-400 words, split into 5-6 paragraphs with \\n\\n.
      5. Return ONLY a valid JSON object with keys: transcript, shortSummary, detailedSummary.

      Source Content:
      Transcript: ${transcript.substring(0, 30000)}
      Short Summary: ${summaries.shortSummary}
      Detailed Summary: ${summaries.detailedSummary}`;

      try {
        const aiRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: translationPrompt }],
          response_format: { type: 'json_object' }
        }, { headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' }, timeout: 60000 });

        const translated = JSON.parse(aiRes.data.choices[0].message.content);
        transcript = formatParagraphs(translated.transcript || transcript, 8);
        summaries.shortSummary = formatParagraphs(translated.shortSummary || translated.short_summary || summaries.shortSummary, 1);
        summaries.detailedSummary = formatParagraphs(translated.detailedSummary || translated.detailed_summary || summaries.detailedSummary, 5);
      } catch (err) {
        console.error('Initial translation failed:', err.message);
      }
    }

    await Podcast.findByIdAndUpdate(podcastId, {
      transcript,
      segments,
      shortSummary: summaries.shortSummary,
      detailedSummary: summaries.detailedSummary,
      keyPoints: summaries.keyPoints,
      keywords: summaries.keywords,
      audioUrl: `/uploads/${path.basename(filePath)}`,
      initialLanguage: targetLanguage,
      status: 'completed',
    });

    console.log(`✅ ${title} processed successfully!`);
  } catch (error) {
    console.error('❌ Processing error:', error);
    await Podcast.findByIdAndUpdate(podcastId, { status: 'failed', errorMessage: error.message });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export const uploadPodcast = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    const title = req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname));
    const language = req.body.language || 'Original';
    const podcast = await Podcast.create({ title, transcript: 'Processing...', sourceType: 'upload', originalFilename: req.file.originalname, status: 'processing' });
    processPodcast(podcast._id, req.file.path, title, language);
    res.status(202).json({ message: 'Upload received. Processing started.', podcastId: podcast._id, status: 'processing' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const processUrl = async (req, res) => {
  try {
    const { url, title: customTitle, language: reqLanguage } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const { filePath, title: extractedTitle } = await downloadAudioFromUrl(url);
    const title = customTitle || extractedTitle;
    const language = reqLanguage || 'Original';
    const podcast = await Podcast.create({ title, transcript: 'Processing...', sourceType: 'url', sourceUrl: url, status: 'processing' });
    processPodcast(podcast._id, filePath, title, language);
    res.status(202).json({ message: 'URL received. Processing started.', podcastId: podcast._id, status: 'processing' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    res.json(podcast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchPodcasts = async (req, res) => {
  try {
    const { q, podcastId } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query (q) is required' });
    const query = { $or: [{ title: { $regex: q, $options: 'i' } }, { transcript: { $regex: q, $options: 'i' } }] };
    if (podcastId) query._id = podcastId;
    const podcasts = await Podcast.find(query).limit(20);
    const results = podcasts.map((p) => ({ podcastId: p._id, title: p.title, status: p.status, uploadDate: p.uploadDate, matchCount: 1, matches: [{ excerpt: p.transcript.substring(0, 100) + '...', highlightStart: 0, highlightEnd: 0 }] }));
    res.json({ query: q, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadTranscriptPDF = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    if (podcast.status !== 'completed' && podcast.status !== 'failed') return res.status(404).json({ error: 'Podcast is still processing' });
    const options = { includeTranscript: req.query.transcript === 'true', includeShortSummary: req.query.shortSummary === 'true', includeDetailedSummary: req.query.detailedSummary === 'true', includeKeyPoints: req.query.keyPoints === 'true', includeTopics: req.query.topics === 'true' };
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${podcast.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    await generateTranscriptPDF(podcast, options, res);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
};

export const listPodcasts = async (_req, res) => {
  try {
    const podcasts = await Podcast.find().limit(50);
    res.json(Array.isArray(podcasts) ? podcasts : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSpeakerNames = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldName, newName } = req.body;
    const podcast = await Podcast.findById(id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });
    const updatedSegments = podcast.segments.map(s => ({ ...s, speaker: s.speaker === oldName ? newName : s.speaker }));
    const updatedTranscript = podcast.transcript.replace(new RegExp(`^${oldName}:`, 'gm'), `${newName}:`);
    await Podcast.findByIdAndUpdate(id, { segments: updatedSegments, transcript: updatedTranscript });
    res.json({ message: 'Speakers updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const translatePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetLanguage } = req.body;
    const podcast = await Podcast.findById(id);
    if (!podcast) return res.status(404).json({ error: 'Podcast not found' });

    console.log(`🌍 Translating podcast ${id} to ${targetLanguage}...`);

    if (targetLanguage.toLowerCase() === 'english' || targetLanguage.toLowerCase() === 'original' || targetLanguage.toLowerCase() === 'same as audio') {
      return res.json({ transcript: podcast.transcript, shortSummary: podcast.shortSummary, detailedSummary: podcast.detailedSummary, keyPoints: podcast.keyPoints, keywords: podcast.keywords, language: 'Original' });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;
    const prompt = `You are a professional translator and content creator. Translate and expand the following podcast content into ${targetLanguage}.

    IMPORTANT RULES:
    1. Output MUST be in ${targetLanguage}.
    2. FORMATTING: You MUST use exactly two newline characters (\\n\\n) between paragraphs.
    3. TRANSCRIPT: Translate the ENTIRE transcript provided below verbatim. Do not summarize.
    4. SUMMARY LENGTHS:
       - shortSummary: ~120-150 words.
       - detailedSummary: At least 350-400 words, split into 5-6 paragraphs with \\n\\n.
    5. Return ONLY a valid JSON object.

    Source Content:
    Transcript: ${podcast.transcript.substring(0, 30000)}
    Short Summary: ${podcast.shortSummary}
    Detailed Summary: ${podcast.detailedSummary}
    Key Points: ${Array.isArray(podcast.keyPoints) ? podcast.keyPoints.join(' | ') : ''}
    Keywords: ${Array.isArray(podcast.keywords) ? podcast.keywords.join(' | ') : ''}

    Return ONLY this JSON structure:
    {
      "transcript": "...",
      "shortSummary": "...",
      "detailedSummary": "...",
      "keyPoints": ["...", "..."],
      "keywords": ["...", "..."]
    }`;

    const aiRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }, { headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' }, timeout: 60000 });

    const translated = JSON.parse(aiRes.data.choices[0].message.content);

    // Formatting fallback and resilient key checking
    const response = {
      transcript: formatParagraphs(translated.transcript || podcast.transcript, 8),
      shortSummary: formatParagraphs(translated.shortSummary || translated.short_summary || podcast.shortSummary, 1),
      detailedSummary: formatParagraphs(translated.detailedSummary || translated.detailed_summary || podcast.detailedSummary, 5),
      keyPoints: Array.isArray(translated.keyPoints) ? translated.keyPoints : (Array.isArray(translated.key_points) ? translated.key_points : (Array.isArray(podcast.keyPoints) ? podcast.keyPoints : [])),
      keywords: Array.isArray(translated.keywords) ? translated.keywords : (Array.isArray(translated.keywords_list) ? translated.keywords_list : (Array.isArray(podcast.keywords) ? podcast.keywords : [])),
      language: targetLanguage,
      segments: []
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Translation error:', error.response?.data || error.message);
    if (USE_DEMO_MODE) {
      return res.json({ transcript: `[DEMO MODE] Simulated translation into ${targetLanguage}.`, shortSummary: `[DEMO MODE] Short summary.`, detailedSummary: `[DEMO MODE] Detailed analysis.`, keyPoints: [`Point 1`, `Point 2`], keywords: ["Demo"], language: targetLanguage, segments: [] });
    }
    res.status(500).json({ error: 'Translation failed', details: error.response?.data?.error?.message || error.message });
  }
};
