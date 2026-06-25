import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ytdl from '@distube/ytdl-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function downloadAudioFromUrl(url) {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const isYouTube = ytdl.validateURL(url);

  if (isYouTube) {
    // [URL-VERSION 3.0 - MULTI-SERVICE TEST]
    console.log('🚀 [URL-VERSION 3.0] YouTube detected. Starting download...');
    try {
      const info = await ytdl.getBasicInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        }
      });

      const title = info.videoDetails?.title || 'YouTube Audio';
      const filename = `yt-${Date.now()}.mp3`;
      const filePath = path.join(uploadsDir, filename);

      return new Promise((resolve, reject) => {
        // Simplified: removing 'quality' entirely to let the library pick the best available stream
        const stream = ytdl(url, {
          filter: 'audioonly'
        });

        const fileStream = fs.createWriteStream(filePath);
        stream.pipe(fileStream);

        stream.on('error', (err) => {
          console.error('❌ YTDL Error:', err.message);
          reject(new Error(`YouTube download error: ${err.message}`));
        });

        fileStream.on('finish', () => {
          console.log('✅ [URL-VERSION 2.0] Download complete.');
          resolve({ filePath, title, audioUrl: url });
        });
      });
    } catch (error) {
      console.error('❌ YouTube Error:', error.message);
      throw new Error(`YouTube Error: ${error.message}`);
    }
  }

  // Fallback for direct links
  const filename = `url-${Date.now()}.mp3`;
  const filePath = path.join(uploadsDir, filename);
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
  fs.writeFileSync(filePath, response.data);
  return { filePath, title: 'Podcast from URL', audioUrl: url };
}
