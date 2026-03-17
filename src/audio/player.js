/**
 * Retroizer — Audio Player
 *
 * Wraps Tone.Player for:
 *   - Loading audio from a File object
 *   - Play / pause / stop
 *   - Offline render (export) through the chain
 */

import * as Tone from 'tone';
import { RetroChain } from './chain.js';
import { getPreset } from './presets.js';

export class RetroPlayer {
  constructor() {
    this.chain = new RetroChain();
    this.player = null;
    this.audioBuffer = null;    // raw decoded AudioBuffer
    this.objectUrl = null;
    this.state = 'idle';        // idle | playing | paused
    this.currentPresetId = null;
    this.intensity = 1.0;
    this._onStateChange = null;
  }

  onStateChange(cb) {
    this._onStateChange = cb;
  }

  _setState(s) {
    this.state = s;
    this._onStateChange?.(s);
  }

  /**
   * Load from a URL (demo tracks). Fetches, wraps as File, delegates to load().
   */
  async loadUrl(url, displayName) {
    const res  = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], displayName, { type: blob.type || 'audio/mpeg' });
    return this.load(file);
  }

  /**
   * Load a File. Resolves with duration in seconds.
   */
  async load(file) {
    // Tone.start() (AudioContext resume) lives in play() — not here.
    // This lets us preload on mount before any user gesture.
    this.chain.build();

    // Revoke previous object URL
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    if (this.player) {
      this.player.stop();
      this.player.dispose();
    }

    this.objectUrl = URL.createObjectURL(file);

    // Decode to AudioBuffer for offline rendering later
    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

    // Build Tone.Player
    this.player = new Tone.Player({
      url: this.objectUrl,
      onload: () => {},
    });

    await Tone.loaded();

    this.chain.connectPlayer(this.player);

    // Auto-apply last preset or default
    const presetId = this.currentPresetId ?? 'broken-cassette';
    this.applyPreset(presetId, this.intensity);

    this._setState('idle');
    return this.audioBuffer.duration;
  }

  setVolume(db) {
    Tone.getDestination().volume.rampTo(db, 0.05);
  }

  applyPreset(presetId, intensity = 1.0) {
    this.currentPresetId = presetId;
    this.intensity = intensity;
    const preset = getPreset(presetId);
    this.chain.applyPreset(preset, intensity);
  }

  async play() {
    if (!this.player) return;
    await Tone.start();
    this.chain.startNoise();

    if (this.state === 'paused') {
      // Tone.Player doesn't natively support pause/resume — restart from offset
      // For MVP, we restart. A seek mechanism can be added later.
      this.player.start();
    } else {
      this.player.start();
    }

    this._setState('playing');

    // Listen for natural end
    this.player.onstop = () => {
      this.chain.stopNoise();
      this._setState('idle');
    };
  }

  stop() {
    if (!this.player) return;
    this.player.stop();
    this.chain.stopNoise();
    this._setState('idle');
  }

  /**
   * Export: render the chain offline and return a Blob (WAV).
   *
   * We use Tone.Offline to render into a fresh offline context.
   * The signal chain is rebuilt offline — the live chain stays untouched.
   */
  async export(presetId, intensity = 1.0) {
    if (!this.audioBuffer) throw new Error('No audio loaded');

    const preset = getPreset(presetId);
    const duration = this.audioBuffer.duration + 2; // +2s for reverb tail

    const renderedBuffer = await Tone.Offline(async (offlineContext) => {
      // Build an isolated chain in the offline context
      const offlineChain = new RetroChain();
      offlineChain.build();
      offlineChain.applyPreset(preset, intensity);

      // Create a player from the already-decoded buffer
      const src = offlineContext.rawContext.createBufferSource();
      src.buffer = this.audioBuffer;

      // Connect source → chain head → offline destination
      // We need a Tone.ToneAudioNode wrapper to bridge raw AudioNode and Tone
      const inputGain = new Tone.Gain(1);
      src.connect(inputGain.input);
      offlineChain.connectPlayer(inputGain);

      offlineChain.startNoise();
      src.start(0);
    }, duration, 2, Tone.getContext().sampleRate);

    // Convert AudioBuffer to WAV Blob
    return audioBufferToWav(renderedBuffer.get());
  }

  dispose() {
    this.stop();
    this.chain.dispose();
    if (this.player) this.player.dispose();
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}

// ---------------------------------------------------------------------------
// WAV encoder (no external dep)
// ---------------------------------------------------------------------------

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const samples = interleave(buffer);
  const dataLength = samples.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function interleave(buffer) {
  const channels = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }
  const length = channels[0].length * buffer.numberOfChannels;
  const result = new Float32Array(length);
  let index = 0;
  for (let i = 0; i < channels[0].length; i++) {
    for (let c = 0; c < channels.length; c++) {
      result[index++] = channels[c][i];
    }
  }
  return result;
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
