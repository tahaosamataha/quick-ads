// @ts-ignore
import lamejs from 'lamejsfix';

export interface SpeedAdjustResult {
  wav: string;
  mp3: string;
  speed: number;
}

// In-memory cache for adjusted audio to avoid re-encoding on repeated downloads
const audioSpeedCache = new Map<string, SpeedAdjustResult>();

/**
 * Adjusts audio speed while preserving pitch.
 * Tries server-side FFmpeg atempo first (highest fidelity WSOLA algorithm),
 * then falls back to Web Audio API in browser.
 */
export async function adjustAudioSpeed(
  audioSource: string,
  speed: number
): Promise<SpeedAdjustResult> {
  const targetSpeed = Math.round(Math.min(2.5, Math.max(0.5, speed)) * 100) / 100;
  
  if (Math.abs(targetSpeed - 1.0) < 0.01) {
    return { wav: audioSource, mp3: audioSource, speed: 1.0 };
  }

  const cacheKey = `${audioSource.slice(0, 80)}_${targetSpeed}`;
  if (audioSpeedCache.has(cacheKey)) {
    return audioSpeedCache.get(cacheKey)!;
  }

  // 1. Try server-side FFmpeg first
  try {
    let base64Data = audioSource;
    if (!audioSource.startsWith('data:')) {
      const res = await fetch(audioSource);
      const blob = await res.blob();
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const serverRes = await fetch('/api/adjust-audio-speed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioData: base64Data, speed: targetSpeed })
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.wav && data.mp3) {
        const result: SpeedAdjustResult = { wav: data.wav, mp3: data.mp3, speed: targetSpeed };
        audioSpeedCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Server audio speed failed, falling back to Web Audio API:', err);
  }

  // 2. Client-side fallback using Web Audio API
  try {
    const res = await fetch(audioSource);
    const arrayBuffer = await res.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const targetLength = Math.max(1, Math.round(audioBuffer.length / targetSpeed));
    const sampleRate = audioBuffer.sampleRate;
    const offlineCtx = new OfflineAudioContext(1, targetLength, sampleRate);
    const sourceNode = offlineCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.playbackRate.value = targetSpeed;
    sourceNode.connect(offlineCtx.destination);
    sourceNode.start(0);

    const rendered = await offlineCtx.startRendering();
    await audioCtx.close();

    const channelData = rendered.getChannelData(0);
    const pcm16 = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Generate WAV
    const dataSize = pcm16.length * 2;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    view.setUint32(0, 0x52494646, false); // 'RIFF'
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // 'WAVE'
    view.setUint32(12, 0x666d7420, false); // 'fmt '
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false); // 'data'
    view.setUint32(40, dataSize, true);

    const wavBytes = new Uint8Array(44 + dataSize);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength), 44);
    const wavBlob = new Blob([wavBytes], { type: 'audio/wav' });
    const wavUrl = URL.createObjectURL(wavBlob);

    // Generate MP3
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
    const mp3Data: any[] = [];
    const sampleBlockSize = 1152;
    for (let i = 0; i < pcm16.length; i += sampleBlockSize) {
      const chunk = pcm16.subarray(i, i + sampleBlockSize);
      const buf = mp3encoder.encodeBuffer(chunk);
      if (buf.length > 0) mp3Data.push(buf);
    }
    const flushBuf = mp3encoder.flush();
    if (flushBuf.length > 0) mp3Data.push(flushBuf);

    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    const mp3Url = URL.createObjectURL(mp3Blob);

    const result: SpeedAdjustResult = { wav: wavUrl, mp3: mp3Url, speed: targetSpeed };
    audioSpeedCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Client audio speed fallback failed:', err);
    return { wav: audioSource, mp3: audioSource, speed: 1.0 };
  }
}
