/**
 * Retroizer — Audio Signal Chain
 *
 * Each preset is a JSON config that hydrates this chain:
 *
 *   Input → EQ → Saturation → Compression → Modulation → Noise → Reverb → Output
 *
 * All nodes are Tone.js. The chain is built once per session and
 * reconfigured (not rebuilt) when switching presets or changing intensity.
 */

import * as Tone from 'tone';

export class RetroChain {
  constructor() {
    this.player = null;
    this.nodes = {};
    this.isBuilt = false;
    this._noiseLoop = null;
    this._wowLFO = null;
  }

  /**
   * Build the fixed node graph. Call once after Tone.start().
   */
  build() {
    if (this.isBuilt) return;

    // --- EQ / Tone shaping ---
    this.nodes.hiPass   = new Tone.Filter({ type: 'highpass', frequency: 80, Q: 0.7 });
    this.nodes.loPass   = new Tone.Filter({ type: 'lowpass',  frequency: 18000, Q: 0.5 });
    this.nodes.hiShelf  = new Tone.Filter({ type: 'highshelf', frequency: 8000, gain: 0 });
    this.nodes.loShelf  = new Tone.Filter({ type: 'lowshelf',  frequency: 250,  gain: 0 });
    this.nodes.midPeak  = new Tone.Filter({ type: 'peaking',   frequency: 1000, Q: 1, gain: 0 });

    // --- Saturation (waveshaper) ---
    this.nodes.saturator = new Tone.Chebyshev(1); // order 1 = mild, up to 50+ = fuzz
    this.nodes.saturator.wet.value = 0;

    // --- Compression ---
    this.nodes.compressor = new Tone.Compressor({
      threshold: -24, ratio: 4, attack: 0.003, release: 0.25,
    });

    // --- Chorus / Modulation ---
    this.nodes.chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.3 });
    this.nodes.chorus.wet.value = 0;
    this.nodes.chorus.start();

    // --- Phaser ---
    this.nodes.phaser = new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 1000 });
    this.nodes.phaser.wet.value = 0;

    // --- Tremolo ---
    this.nodes.tremolo = new Tone.Tremolo({ frequency: 5, depth: 0 }).start();
    this.nodes.tremolo.wet.value = 0;

    // --- Wow & flutter (pitch LFO via vibrato) ---
    this.nodes.vibrato = new Tone.Vibrato({ frequency: 0.5, depth: 0 });
    this.nodes.vibrato.wet.value = 0;

    // --- Noise layer (hiss, crackle) ---
    this.nodes.noise = new Tone.Noise('pink');
    this.nodes.noiseFilter = new Tone.Filter({ type: 'lowpass', frequency: 4000 });
    this.nodes.noiseGain = new Tone.Gain(0); // 0 = silent
    this.nodes.noise.connect(this.nodes.noiseFilter);
    this.nodes.noiseFilter.connect(this.nodes.noiseGain);

    // --- Reverb ---
    this.nodes.reverb = new Tone.Reverb({ decay: 2.8, preDelay: 0.02 });
    this.nodes.reverb.wet.value = 0;

    // --- Delay ---
    this.nodes.delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.2 });
    this.nodes.delay.wet.value = 0;

    // --- Air cut — fixed 10kHz ceiling, always on ---
    // Removes digital harshness, gives everything a slightly aged top end
    this.nodes.airCut = new Tone.Filter({ type: 'lowpass', frequency: 10000, Q: 0.6 });

    // --- Master output gain ---
    this.nodes.masterGain = new Tone.Gain(1.4); // +3dB headroom boost

    // Wire the main signal path
    // (player → chain is connected in applyPreset / play)
    this.chain = [
      this.nodes.hiPass,
      this.nodes.loPass,
      this.nodes.hiShelf,
      this.nodes.loShelf,
      this.nodes.midPeak,
      this.nodes.saturator,
      this.nodes.compressor,
      this.nodes.chorus,
      this.nodes.phaser,
      this.nodes.tremolo,
      this.nodes.vibrato,
      this.nodes.reverb,
      this.nodes.delay,
      this.nodes.airCut,
      this.nodes.masterGain,
    ];

    // Connect chain nodes in series
    for (let i = 0; i < this.chain.length - 1; i++) {
      this.chain[i].connect(this.chain[i + 1]);
    }

    // Noise injects directly into masterGain
    this.nodes.noiseGain.connect(this.nodes.masterGain);

    // Final output to speakers
    this.nodes.masterGain.toDestination();

    this.isBuilt = true;
  }

  /**
   * Apply a preset config, scaled by intensity (0–1).
   * Does NOT rebuild nodes — just updates parameters.
   */
  applyPreset(preset, intensity = 1.0) {
    if (!this.isBuilt) this.build();

    const p = preset;
    const i = Math.max(0, Math.min(1, intensity));

    // EQ — frequencies lerp from neutral toward preset extremes with intensity
    this.nodes.hiPass.frequency.rampTo(lerp(20,    p.hiPass  ?? 80,    i), 0.15);
    this.nodes.loPass.frequency.rampTo(lerp(20000, p.loPass  ?? 18000, i), 0.15);
    this.nodes.hiShelf.gain.rampTo((p.hiShelfGain ?? 0) * i, 0.1);
    this.nodes.loShelf.gain.rampTo((p.loShelfGain ?? 0) * i, 0.1);
    this.nodes.midPeak.frequency.rampTo(p.midFreq ?? 1000, 0.1);
    this.nodes.midPeak.gain.rampTo((p.midGain ?? 0) * i, 0.1);

    // Saturation — interpolate order and wet
    const satOrder = Math.round(lerp(1, p.satOrder ?? 1, i));
    this.nodes.saturator._order = satOrder; // Chebyshev order isn't hot-swappable,
    // so we use wet to scale it instead
    this.nodes.saturator.wet.rampTo((p.satWet ?? 0) * i, 0.1);

    // Compression
    this.nodes.compressor.threshold.rampTo(p.compThreshold ?? -24, 0.1);
    this.nodes.compressor.ratio.rampTo(lerp(1, p.compRatio ?? 4, i), 0.1);

    // Chorus
    this.nodes.chorus.wet.rampTo((p.chorusWet ?? 0) * i, 0.1);
    if (p.chorusFreq) this.nodes.chorus.frequency.value = p.chorusFreq;

    // Phaser
    this.nodes.phaser.wet.rampTo((p.phaserWet ?? 0) * i, 0.1);

    // Tremolo
    this.nodes.tremolo.depth.rampTo((p.tremoloDepth ?? 0) * i, 0.1);
    if (p.tremoloFreq) this.nodes.tremolo.frequency.value = p.tremoloFreq;

    // Wow & flutter
    this.nodes.vibrato.depth.rampTo((p.vibratoDepth ?? 0) * i, 0.1);
    if (p.vibratoFreq) this.nodes.vibrato.frequency.value = p.vibratoFreq;

    // Noise
    this.nodes.noiseGain.gain.rampTo((p.noiseLevel ?? 0) * i, 0.1);
    if (p.noiseFilterFreq) this.nodes.noiseFilter.frequency.rampTo(p.noiseFilterFreq, 0.1);

    // Reverb
    this.nodes.reverb.wet.rampTo((p.reverbWet ?? 0) * i, 0.1);
    // Note: reverb.decay can't be hot-set; it rebuilds the IR. Only set on load.

    // Delay
    this.nodes.delay.wet.rampTo((p.delayWet ?? 0) * i, 0.1);
    this.nodes.delay.feedback.rampTo((p.delayFeedback ?? 0.2) * i, 0.1);
  }

  /**
   * Connect a Tone.Player to the head of the chain.
   */
  connectPlayer(player) {
    player.connect(this.chain[0]);
  }

  /**
   * Start noise (call when playback begins).
   */
  startNoise() {
    try { this.nodes.noise.start(); } catch (_) { /* already started */ }
  }

  /**
   * Stop noise.
   */
  stopNoise() {
    try { this.nodes.noise.stop(); } catch (_) {}
  }

  dispose() {
    this.stopNoise();
    Object.values(this.nodes).forEach(n => {
      try { n.dispose(); } catch (_) {}
    });
    this.isBuilt = false;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
