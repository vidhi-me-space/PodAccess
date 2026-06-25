import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

async function diarizeSegments(segments, title, key) {
  if (segments.length === 0) return [];

  try {
    const segmentList = segments
      .map((s, i) => `${i + 1}. ${s.text}`)
      .join('\n')
      .substring(0, 5000);

    const prompt = `Based on the podcast title "${title}" and the following segments, identify the real names of the speakers if possible.
    If you can confidently identify them (e.g., CarryMinati, Samay Raina, Harkirat Singh), use their names.
    Otherwise, use "Speaker 1", "Speaker 2", etc.

    Return ONLY a JSON object with a "speakers" key containing an array of exactly ${segments.length} strings.

    Segments:
    ${segmentList}`;

    console.log(`🤖 [AI] Requesting smart diarization for ${segments.length} segments...`);

    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }, {
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 30000
    });

    const content = res.data.choices[0].message.content;
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;

    if (Array.isArray(parsed.speakers)) {
      console.log(`✅ [AI] Successfully identified ${parsed.speakers.length} speakers with names.`);
      return parsed.speakers;
    }
    return [];
  } catch (error) {
    console.error('⚠️ Smart diarization failed:', error.message);
    return [];
  }
}

export async function transcribeAudio(filePath, title, languagePreference = 'Original') {
  const GROQ_KEY = process.env.GROQ_API_KEY;

  try {
    // 1. Get Verbose JSON from Groq Whisper (gives us timestamps!)
    console.log(`🚀 [STEP 1] Transcribing audio with timestamps (Preference: ${languagePreference})...`);
    // ... rest of the code ...
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'verbose_json');

    // If the user specifically wants English, we can tell Whisper to prioritize it
    if (languagePreference.toLowerCase() === 'english') {
      formData.append('language', 'en');
    } else if (languagePreference.toLowerCase() === 'hindi') {
      formData.append('language', 'hi');
    }

    const groqRes = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
      headers: { ...formData.getHeaders(), 'Authorization': `Bearer ${GROQ_KEY}` }
    });

    const whisperSegments = groqRes.data.segments || [];
    const duration = groqRes.data.duration || 0;
    const fullTranscript = groqRes.data.text || "";

    // 2. Diarize using Llama (identifying who spoke when)
    console.log(`🚀 [STEP 2] Identifying speakers for ${whisperSegments.length} segments...`);
    const speakerLabels = await diarizeSegments(whisperSegments, title, GROQ_KEY);

    // 3. Map labels back to segments
    const segments = whisperSegments.map((s, i) => ({
      speaker: speakerLabels[i] || 'Speaker',
      text: s.text.trim(),
      start: Math.round(s.start),
      end: Math.round(s.end)
    }));

    // If Whisper failed to give segments (rare), fallback
    if (segments.length === 0 && fullTranscript) {
      segments.push({
        speaker: 'Speaker 1',
        text: fullTranscript,
        start: 0,
        end: Math.round(duration) || 10
      });
    }

    // Reconstruct a cleaner transcript string with speaker labels for the "Detailed Transcript" view
    let cleanTranscript = segments.map(s => `${s.speaker}: ${s.text}`).join('\n');

    return { transcript: cleanTranscript, segments, duration };
  } catch (error) {
    console.error('❌ Groq Transcription Error:', error.response?.data || error.message);
    throw new Error('Failed to process audio. Please try again.');
  }
}
