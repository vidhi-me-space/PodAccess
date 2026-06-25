import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { handleUpload } from '../middleware/handleUpload.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  uploadPodcast,
  processUrl,
  getPodcast,
  searchPodcasts,
  downloadTranscriptPDF,
  listPodcasts,
  updateSpeakerNames,
  translatePodcast
} from '../controllers/podcastController.js';

const router = Router();

router.post('/upload', handleUpload(upload.single('audio')), uploadPodcast);
router.post('/process-url', processUrl);
router.get('/search', searchPodcasts);
router.get('/podcasts', listPodcasts);
router.get('/podcast/:id/pdf', validateObjectId(), downloadTranscriptPDF);
router.get('/podcast/:id', validateObjectId(), getPodcast);
router.put('/podcast/:id/speakers', validateObjectId(), updateSpeakerNames);
router.post('/podcast/:id/translate', validateObjectId(), translatePodcast);

router.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default router;
