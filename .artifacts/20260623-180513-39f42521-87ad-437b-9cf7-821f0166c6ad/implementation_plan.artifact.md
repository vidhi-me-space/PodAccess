# Advanced Podcast Platform Features

This plan outlines the implementation of an integrated audio player, auto-scrolling transcript, speaker renaming, keyword extraction, multi-language translation, and progressive transcription.

## User Review Required

- **Audio File Serving**: Currently, uploaded files are deleted after processing. To support the audio player, I will keep the files in the `uploads` directory. **Does the user approve of storing these files?** (A cleanup script can be added later).
- **Translation Strategy**: One-click translation will use AI (Groq/Llama) to translate the transcript and summaries on demand.
- **Progressive Transcription**: Since the current backend is synchronous (using Groq Whisper), "real-time" will be simulated by showing steps in the UI and updating the transcript as chunks become available (or showing a "Streaming" feel if possible with the current API limitations).

## Proposed Changes

### Backend Enhancements

#### [podcastController.js](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/backend/controllers/podcastController.js)
- Modify `processPodcast` to keep audio files.
- Add `updateSpeakerNames` endpoint.
- Add `translatePodcast` endpoint.
- Serve static files from `uploads` folder.

#### [summaryService.js](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/backend/services/summaryService.js)
- Update prompt to ensure double newlines for paragraph separation.
- Add `extractKeywords` function to identify topics/tags.

#### [server.js](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/backend/server.js)
- Add `app.use('/uploads', express.static(...))` to serve audio files.

---

### Frontend Features

#### [AudioPlayer.jsx](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/frontend/src/components/AudioPlayer.jsx) [NEW]
- A sticky player with play/pause, progress bar, and volume.
- Syncs its current time with a global state (or prop).

#### [TranscriptTab.jsx](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/frontend/src/components/TranscriptTab.jsx)
- Add click-to-seek functionality on segments.
- Implement auto-scroll to the "active" segment.
- Add speaker renaming UI (click to edit).

#### [DashboardPage.jsx](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/frontend/src/pages/DashboardPage.jsx)
- Integrate the `AudioPlayer` at the bottom.
- Manage "currentTime" state to sync player and transcript.
- Add "Translate" and "Topics" UI elements.

#### [KeywordsTab.jsx](file:///C:/Users/vidse/OneDrive/Desktop/Podcast/frontend/src/components/KeywordsTab.jsx) [NEW]
- Display extracted topics and tags.

---

## Verification Plan

### Automated Tests
- No existing automated tests found. I will verify via manual integration testing.

### Manual Verification
1. **Audio Sync**: Upload a file, play it, and ensure the transcript highlights the correct segment. Click a segment and verify the player jumps to that time.
2. **Speaker Rename**: Edit a speaker name and refresh to ensure it persists.
3. **Translation**: Click "Translate to [Language]" and verify the UI updates with translated text.
4. **Paragraph Fix**: Verify the detailed summary is split into at least 3 paragraphs.
