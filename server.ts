import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import multer from 'multer';

const app = express();
export default app;

const PORT = 3000;
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/adjust-audio-speed', async (req, res) => {
  try {
    const { audioData, speed } = req.body;
    if (!audioData) return res.status(400).json({ error: 'Audio data is required' });

    const speedFactor = Math.min(2.5, Math.max(0.5, parseFloat(speed) || 1.25));
    if (Math.abs(speedFactor - 1.0) < 0.01) {
      return res.json({ wav: audioData, mp3: audioData, speed: 1.0 });
    }

    let base64 = audioData;
    if (base64.includes('base64,')) {
      base64 = base64.split('base64,')[1];
    }
    const buffer = Buffer.from(base64, 'base64');
    const tempId = `spd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const inputPath = path.join(os.tmpdir(), `${tempId}_in.wav`);
    const outputWav = path.join(os.tmpdir(), `${tempId}_out.wav`);
    const outputMp3 = path.join(os.tmpdir(), `${tempId}_out.mp3`);

    await fs.promises.writeFile(inputPath, buffer);

    let filter = `atempo=${speedFactor}`;
    if (speedFactor > 2.0) {
      filter = `atempo=2.0,atempo=${(speedFactor / 2.0).toFixed(2)}`;
    }

    const { exec } = await import('child_process');
    const execPromise = (cmd: string) => new Promise((resolve, reject) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) reject(err);
        else resolve({ stdout, stderr });
      });
    });

    await execPromise(`ffmpeg -y -i "${inputPath}" -filter:a "${filter}" -c:a pcm_s16le "${outputWav}"`);
    await execPromise(`ffmpeg -y -i "${outputWav}" -b:a 128k "${outputMp3}"`);

    const wavBuffer = await fs.promises.readFile(outputWav);
    const mp3Buffer = await fs.promises.readFile(outputMp3);

    fs.unlink(inputPath, () => {});
    fs.unlink(outputWav, () => {});
    fs.unlink(outputMp3, () => {});

    const wavDataUri = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
    const mp3DataUri = `data:audio/mp3;base64,${mp3Buffer.toString('base64')}`;

    return res.json({ wav: wavDataUri, mp3: mp3DataUri, speed: speedFactor });
  } catch (err: any) {
    console.error('Error in adjust-audio-speed:', err);
    res.status(500).json({ error: err.message || 'Failed to speed up audio' });
  }
});

app.post('/api/video-info', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'URL is required' });

      let downloads: any[] = [];
      let title = 'فيديو محمل';
      let thumbnail = '';

      // Strategy 0: btch-downloader
      try {
        console.log('Trying btch-downloader for:', url);
        const btch = await import("btch-downloader");
        if (url.includes('tiktok.com') || url.includes('vt.tiktok')) {
          const result: any = await btch.ttdl(url);
          if (result && result.status) {
             if (result.video && result.video.length > 0) {
               downloads.push({ quality: 'Video No Watermark', downloadUrl: result.video[0], type: 'video' });
             }
             if (result.audio && result.audio.length > 0) {
               downloads.push({ quality: 'Audio Only', downloadUrl: result.audio[0], type: 'audio' });
             }
             if (result.title) title = result.title;
             if (result.title_audio) title = result.title_audio;
             if (downloads.length > 0) {
                 return res.json({ title, thumbnail, downloads });
             }
          }
        } else if (url.includes('instagram.com')) {
          const result: any = await btch.igdl(url);
          if (result && result.status && result.result && result.result.length > 0) {
            result.result.forEach((item: any, idx: number) => {
              downloads.push({ quality: `Media ${idx + 1}`, downloadUrl: item.url, type: 'video' });
            });
            if (downloads.length > 0) {
               return res.json({ title: 'Instagram Media', thumbnail, downloads });
            }
          }
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
          const result: any = await btch.fbdown(url);
          if (result && result.status) {
            if (result.HD || result.HD_video || result.HD_Video) downloads.push({ quality: 'HD', downloadUrl: result.HD || result.HD_video || result.HD_Video, type: 'video' });
            if (result.Normal_video || result.Normal_Video) downloads.push({ quality: 'Normal', downloadUrl: result.Normal_video || result.Normal_Video, type: 'video' });
            if (result.audio) downloads.push({ quality: 'Audio', downloadUrl: result.audio, type: 'audio' });
            if (result.title) title = result.title;
             if (downloads.length > 0) {
                 return res.json({ title, thumbnail, downloads });
             }
          }
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
           const result: any = await btch.twitter(url);
           if (result && result.status && result.url && Array.isArray(result.url)) {
              if (result.title) title = result.title;
              result.url.forEach((m: any) => {
                 if (m.url || m.hd || m.sd) {
                    downloads.push({ quality: m.quality || 'Media', downloadUrl: m.hd || m.sd || m.url, type: 'video' });
                 }
              });
              if (downloads.length > 0) {
                 return res.json({ title, thumbnail, downloads });
              }
           }
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
           const result: any = await btch.youtube(url);
           if (result && result.status) {
             if (result.title) title = result.title;
             if (result.mp4) downloads.push({ quality: 'MP4', downloadUrl: result.mp4, type: 'video' });
             if (result.mp3) downloads.push({ quality: 'MP3', downloadUrl: result.mp3, type: 'audio' });
             if (downloads.length > 0) {
               return res.json({ title, thumbnail, downloads });
             }
           }
        }
      } catch (err: any) {
        console.error('btch-downloader strategy failed:', err.message);
      }

      // Strategy 1: Try snapsave-media-downloader
      try {
        console.log('Trying Snapsave strategy for:', url);
        const { snapsave } = await import('snapsave-media-downloader');
        const result = await (snapsave as any)(url);
        if (result && result.success && result.data && result.data.length > 0) {
          result.data.forEach((item: any) => {
            downloads.push({
              quality: item.resolution || 'HD',
              downloadUrl: item.url,
              type: 'video'
            });
          });
          console.log('Snapsave strategy succeeded');
          return res.json({ title, thumbnail, downloads });
        }
      } catch (snapsaveErr) {
        console.error('Snapsave strategy failed');
      }

      // Strategy 2: TikWM for TikTok
      if (url.includes('tiktok.com') || url.includes('vt.tiktok')) {
        try {
          console.log('Trying TikWM strategy for:', url);
          const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
          const tikData = await tikRes.json();
          if (tikData.code === 0 && tikData.data) {
            const getUrl = (path: string) => {
              if (path.startsWith('http')) return path;
              if (path.startsWith('//')) return `https:${path}`;
              if (path.startsWith('/')) return `https://www.tikwm.com${path}`;
              return `https://www.tikwm.com/${path}`;
            };
            downloads.push({
              quality: 'No Watermark',
              downloadUrl: getUrl(tikData.data.play),
              type: 'video'
            });
            downloads.push({
              quality: 'Audio Only',
              downloadUrl: getUrl(tikData.data.music),
              type: 'audio'
            });
            console.log('TikWM strategy succeeded');
            return res.json({
              title: tikData.data.title || title,
              thumbnail: getUrl(tikData.data.cover),
              downloads
            });
          }
        } catch (tikErr) {
          console.error('TikWM strategy failed');
        }
      }

      // Strategy 3: Cobalt fallback
      try {
        console.log('Trying Cobalt strategy for:', url);
        const cobaltUrl = process.env.COBALT_API_URL || 'https://api.cobalt.tools/';
        const response = await fetch(cobaltUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.url || data.picker) {
            if (data.url) downloads.push({ quality: data.videoQuality || 'Default Video', downloadUrl: data.url, type: 'video' });
            if (data.picker) {
              data.picker.forEach((item: any) => {
                downloads.push({
                  quality: item.videoQuality || item.type || 'Video',
                  downloadUrl: item.url,
                  type: item.type === 'audio' ? 'audio' : 'video'
                });
              });
            }
            if (data.audio) downloads.push({ quality: 'Audio MP3', downloadUrl: data.audio, type: 'audio' });
            console.log('Cobalt strategy succeeded');
            return res.json({ title: data.title || title, thumbnail: data.thumbnail || thumbnail, downloads });
          }
        }
      } catch (cobaltErr) {
        console.error('Cobalt strategy failed');
      }
      
      // Strategy 4: youtube-dl-exec fallback
      try {
        console.log('Trying youtube-dl-exec strategy for:', url);
        const youtubedl = (await import("youtube-dl-exec")).default;
        const result: any = await youtubedl(url, {
           dumpSingleJson: true,
           noWarnings: true,
           noCheckCertificates: true,
           addHeader: ['user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36']
        });
        
        if (result) {
            title = result.title || title;
            thumbnail = result.thumbnail || thumbnail;
            
            if (result.formats && Array.isArray(result.formats)) {
               // Only push best audio and best video or combined
               const combinedFormat = result.formats.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none').pop();
               if (combinedFormat && combinedFormat.url) {
                   downloads.push({ quality: 'Best Video (with Audio)', downloadUrl: combinedFormat.url, type: 'video' });
               }
               const audioFormat = result.formats.filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none').pop();
               if (audioFormat && audioFormat.url) {
                   downloads.push({ quality: 'Best Audio', downloadUrl: audioFormat.url, type: 'audio' });
               }
            } else if (result.url) {
               downloads.push({ quality: 'Best Quality', downloadUrl: result.url, type: 'video' });
            }
            
            if (downloads.length > 0) {
               console.log('youtube-dl-exec strategy succeeded');
               return res.json({ title, thumbnail, downloads });
            }
        }
      } catch (ytdlErr: any) {
        console.error('youtube-dl-exec strategy failed:', ytdlErr.message);
      }

      if (downloads.length === 0) {
        return res.status(400).json({ error: 'لم نتمكن من جلب روابط التحميل. قد يكون الرابط خاطئاً أو المحتوى خاصاً.' });
      }

    } catch (err: any) {
      console.error('/api/video-info error:', err);
      res.status(500).json({ error: 'حدث خطأ غير متوقع: ' + err.message });
    }
  });

  app.get('/api/proxy-media', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.status(400).send('URL required');
      
      const response = await fetch(targetUrl, {
          headers: {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0.4896.127 Safari/537.36'
          }
      });
      
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch media');
      }

      res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
      
      if (response.body) {
        const { Readable } = await import('stream');
        Readable.fromWeb(response.body as any).pipe(res);
      } else {
        res.status(500).send('No body');
      }

    } catch (err: any) {
      console.error('/api/proxy-media error:', err);
      res.status(500).send(err.message);
    }
  });

  // Extract transcript logic
  app.post("/api/extract", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "الرابط مطلوب" });

    try {
      console.log(`Extracting audio from: ${url}`);
      let targetUrlToDownload = url;
      let isDirectMedia = false;

      // Import libraries dynamically to manage dependencies better
      const btch = await import("btch-downloader");
      const youtubedl = (await import("youtube-dl-exec")).default;
      const ffmpeg = (await import('fluent-ffmpeg')).default;
      const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);

      const isTiktok = url.includes('tiktok.com') || url.includes('vt.tiktok');
      const isInstagram = url.includes('instagram.com');
      const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

      try {
        if (isInstagram) {
          const result: any = await btch.igdl(url);
          if (result && result.status && result.result && result.result.length > 0) {
            targetUrlToDownload = result.result[0].url;
            isDirectMedia = true;
          }
        } else if (isTiktok) {
          const result: any = await btch.ttdl(url);
          if (result && result.status) {
            if (result.audio && result.audio.length > 0) {
              targetUrlToDownload = result.audio[0];
              isDirectMedia = true;
            } else if (result.video && result.video.length > 0) {
              targetUrlToDownload = result.video[0];
              isDirectMedia = true;
            }
          }
        } else if (isFacebook) {
          const result: any = await btch.fbdown(url);
          if (result && result.status) {
            targetUrlToDownload = result.audio || result.Normal_video || result.Normal_Video || result.HD || result.HD_Video;
            isDirectMedia = true;
          }
        } else if (isYoutube) {
          const result: any = await btch.youtube(url);
          if (result && result.status) {
            targetUrlToDownload = result.mp3 || result.mp4;
            isDirectMedia = true;
          }
        }
      } catch (e) {
        console.warn("Fast scrape failed for extract:", e);
      }

      const tempFile = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);

      if (isDirectMedia && targetUrlToDownload) {
        const tempMediaFile = path.join(os.tmpdir(), `media-${Date.now()}.tmp`);
        const response = await axios({
          method: 'get',
          url: targetUrlToDownload,
          responseType: 'stream'
        });
        const writer = fs.createWriteStream(tempMediaFile);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', () => resolve(null));
          writer.on('error', reject);
        });

        await new Promise((resolve, reject) => {
          ffmpeg(tempMediaFile)
            .toFormat('mp3')
            .on('end', resolve)
            .on('error', reject)
            .save(tempFile);
        });
        if (fs.existsSync(tempMediaFile)) fs.unlinkSync(tempMediaFile);
      } else {
        await youtubedl(url, {
          extractAudio: true,
          audioFormat: 'mp3',
          output: tempFile,
          noCheckCertificates: true,
          noWarnings: true,
          addHeader: ['user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36']
        });
      }

      if (!fs.existsSync(tempFile)) {
        throw new Error("فشل تحميل الملف الصوتي");
      }

      const audioData = fs.readFileSync(tempFile);
      const base64Audio = audioData.toString("base64");
      fs.unlinkSync(tempFile);

      res.json({ audioBase64: base64Audio, mimeType: "audio/mp3" });
    } catch (error: any) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "فشل استخراج الصوت. تأكد من صحة الرابط وأن الفيديو عام." });
    }
  });

  app.post("/api/upload-extract", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const filePath = req.file.path;
      const tempMp3File = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);
      
      const ffmpeg = (await import('fluent-ffmpeg')).default;
      const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);

      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .toFormat("mp3")
          .on("end", resolve)
          .on("error", reject)
          .save(tempMp3File);
      });

      const audioData = fs.readFileSync(tempMp3File);
      const base64Audio = audioData.toString("base64");

      fs.unlinkSync(filePath);
      fs.unlinkSync(tempMp3File);

      res.json({ audioBase64: base64Audio, mimeType: "audio/mp3" });
    } catch (error: any) {
      console.error("File extraction error:", error);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "فشل معالجة الملف المرفوع" });
    }
  });

  app.post("/api/convert-pcm-to-mp3", async (req, res) => {
    const { pcmBase64, sampleRate = 24000 } = req.body;
    if (!pcmBase64) return res.status(400).json({ error: "pcmBase64 is required" });

    try {
      const pcmBuffer = Buffer.from(pcmBase64, 'base64');
      const tempPcmFile = path.join(os.tmpdir(), `tts-${Date.now()}.pcm`);
      const tempMp3File = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
      
      fs.writeFileSync(tempPcmFile, pcmBuffer);

      const ffmpeg = (await import('fluent-ffmpeg')).default;
      const ffmpegInstaller = (await import('@ffmpeg-installer/ffmpeg')).default;
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
      
      await new Promise((resolve, reject) => {
        ffmpeg(tempPcmFile)
          .inputOptions([
            '-f s16le',
            `-ar ${sampleRate}`,
            '-ac 1'
          ])
          .toFormat('mp3')
          .on('end', resolve)
          .on('error', reject)
          .save(tempMp3File);
      });

      const mp3Buffer = fs.readFileSync(tempMp3File);
      const mp3Base64 = mp3Buffer.toString('base64');

      if (fs.existsSync(tempPcmFile)) fs.unlinkSync(tempPcmFile);
      if (fs.existsSync(tempMp3File)) fs.unlinkSync(tempMp3File);

      res.json({ mp3Base64 });
    } catch (error: any) {
      console.error("PCM to MP3 error:", error);
      res.status(500).json({ error: "Failed to convert audio" });
    }
  });

  // ========== SETTINGS APIs (Mock DB) ==========
  
  // Middleware to mock authentication
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Mock user for session
    req.user = { id: 'user_123', email: 'elashory7@gmail.com' };
    next();
  };

  // Mock DB State
  const db = {
    user: {
      id: 'user_123',
      name: 'Mohamed Elashory',
      email: 'elashory7@gmail.com',
      language: 'ar',
      plan: 'Pro',
      tokens_balance: 1500,
      profile_image: ''
    },
    billingHistory: [
      { id: 'inv_1', date: '2026-04-01', amount: 49.99, status: 'Paid' },
      { id: 'inv_2', date: '2026-05-01', amount: 49.99, status: 'Paid' }
    ],
    paymentMethods: [
      { id: 'pm_1', last4: '4242', brand: 'visa', isDefault: true }
    ],
    brandKits: [
      { id: 'bk_1', user_id: 'user_123', name: 'Main Brand', colors: ['#0B1E3F', '#7B3FF2'], tone: 'Professional', style: 'Modern', active: true }
    ],
    integrations: [
      { id: 'int_1', platform: 'meta', account_id: 'act_12345', status: 'Connected' },
      { id: 'int_2', platform: 'tiktok', account_id: '', status: 'Not Connected' }
    ],
    team: [
      { id: 'tm_1', user_id: 'user_123', email: 'elashory7@gmail.com', role: 'Owner' }
    ]
  };

  // 1. ACCOUNT APIs
  app.get('/api/user', requireAuth, (req, res) => {
    res.json(db.user);
  });

  app.put('/api/user', requireAuth, (req, res) => {
    const { name, language, profile_image } = req.body;
    if (name) db.user.name = name;
    if (language) db.user.language = language;
    if (profile_image !== undefined) db.user.profile_image = profile_image;
    res.json(db.user);
  });

  // 2. BILLING APIs
  app.get('/api/billing', requireAuth, (req, res) => {
    res.json({
      current_plan: db.user.plan,
      tokens_balance: db.user.tokens_balance,
      usage_breakdown: { images: 200, videos: 50, copy: 250 }
    });
  });

  app.post('/api/billing/upgrade', requireAuth, (req, res) => {
    const { plan } = req.body;
    db.user.plan = plan;
    res.json({ success: true, plan: db.user.plan });
  });

  app.post('/api/billing/recharge', requireAuth, (req, res) => {
    const { tokens } = req.body;
    db.user.tokens_balance += tokens;
    res.json({ success: true, new_balance: db.user.tokens_balance });
  });

  app.get('/api/billing/history', requireAuth, (req, res) => {
    res.json(db.billingHistory);
  });

  // 3. PAYMENT METHODS
  app.get('/api/payment-methods', requireAuth, (req, res) => {
    res.json(db.paymentMethods);
  });

  app.post('/api/payment-methods', requireAuth, (req, res) => {
    const newPm = { id: `pm_${Date.now()}`, last4: '1234', brand: 'mastercard', isDefault: db.paymentMethods.length === 0 };
    db.paymentMethods.push(newPm);
    res.json(newPm);
  });

  app.delete('/api/payment-methods/:id', requireAuth, (req, res) => {
    db.paymentMethods = db.paymentMethods.filter(pm => pm.id !== req.params.id);
    res.json({ success: true });
  });

  // 4. BRAND KITS APIs
  app.get('/api/brand-kits', requireAuth, (req, res) => {
    res.json(db.brandKits);
  });

  app.post('/api/brand-kits', requireAuth, (req, res) => {
    const { name, colors, tone, style } = req.body;
    const isFirst = db.brandKits.length === 0;
    const newKit = { id: `bk_${Date.now()}`, user_id: 'user_123', name, colors, tone, style, active: isFirst };
    db.brandKits.push(newKit);
    res.json(newKit);
  });

  app.put('/api/brand-kits/:id', requireAuth, (req, res) => {
    const { name, colors, tone, style } = req.body;
    const kit = db.brandKits.find(k => k.id === req.params.id);
    if (!kit) return res.status(404).json({ error: 'Not found' });
    if (name) kit.name = name;
    if (colors) kit.colors = colors;
    if (tone) kit.tone = tone;
    if (style) kit.style = style;
    res.json(kit);
  });

  app.delete('/api/brand-kits/:id', requireAuth, (req, res) => {
    db.brandKits = db.brandKits.filter(k => k.id !== req.params.id);
    res.json({ success: true });
  });

  app.post('/api/brand-kits/:id/apply', requireAuth, (req, res) => {
    db.brandKits.forEach(k => { k.active = k.id === req.params.id; });
    res.json({ success: true, active_id: req.params.id });
  });

  // 5. INTEGRATIONS APIs
  app.get('/api/integrations', requireAuth, (req, res) => {
    res.json(db.integrations);
  });

  app.post('/api/integrations/:platform/connect', requireAuth, (req, res) => {
    const int = db.integrations.find(i => i.platform === req.params.platform);
    if (int) {
      int.status = 'Connected';
      int.account_id = `act_${Date.now().toString().slice(-6)}`;
      res.json(int);
    } else {
      res.status(404).json({ error: 'Platform not found' });
    }
  });

  app.post('/api/integrations/:platform/disconnect', requireAuth, (req, res) => {
    const int = db.integrations.find(i => i.platform === req.params.platform);
    if (int) {
      int.status = 'Not Connected';
      int.account_id = '';
      res.json(int);
    } else {
      res.status(404).json({ error: 'Platform not found' });
    }
  });

  // 6. TEAM APIs
  app.get('/api/team', requireAuth, (req, res) => {
    res.json(db.team);
  });

  app.post('/api/team/invite', requireAuth, (req, res) => {
    const { email, role } = req.body;
    const newMember = { id: `tm_${Date.now()}`, user_id: 'user_new', email, role };
    db.team.push(newMember);
    res.json(newMember);
  });

  app.put('/api/team/:id/role', requireAuth, (req, res) => {
    const { role } = req.body;
    const member = db.team.find(m => m.id === req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    member.role = role;
    res.json(member);
  });

  app.delete('/api/team/:id', requireAuth, (req, res) => {
    db.team = db.team.filter(m => m.id !== req.params.id);
    res.json({ success: true });
  });
  // =============================================


// Vite middleware and server startup
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  import('vite').then(async ({ createServer: createViteServer }) => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch(console.error);
} else if (!process.env.VERCEL) {
  // Production standalone mode (not Vercel)
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on http://localhost:${PORT}`);
  });
}
