/**
 * Retroizer — Preset Definitions
 *
 * Values represent 100% intensity. The chain lerps toward neutral at lower
 * intensities — sweet spot is 20–40%. 100% is a warning label.
 *
 * Noise levels are calibrated for normal sources. Soft material will still
 * get buried at high intensity — that's the point.
 */

export const presets = [

  // ── ROW 1 ────────────────────────────────────────────────────────────────

  {
    id: 'broken-cassette',
    name: 'Broken Cassette',
    emoji: '📼',
    description: 'Warped tape, eaten highs, hiss you can feel. Like a mix left in a hot car all August. At 100%: the car was on fire.',

    hiPass: 110,
    loPass: 5500,
    hiShelfGain: -22,
    loShelfGain: 4,
    midFreq: 900,
    midGain: -3,

    satWet: 0.94,
    satOrder: 10,

    compThreshold: -16,
    compRatio: 8,

    chorusWet: 0.70,
    chorusFreq: 0.7,

    vibratoDepth: 0.48,
    vibratoFreq: 0.55,

    noiseLevel: 0.09,        // pulled back — was 0.15
    noiseFilterFreq: 3500,

    reverbWet: 0.55,
    delayWet: 0,
  },

  {
    id: 'vinyl-room',
    name: 'Vinyl Room',
    emoji: '🎵',
    description: 'Warm pressing, surface crackle, the smell of a record store at 2pm on a Tuesday. At 100%: you found this at an estate sale. It was under a radiator.',

    hiPass: 35,
    loPass: 12000,
    hiShelfGain: -16,
    loShelfGain: 5,
    midFreq: 3000,
    midGain: -2,

    satWet: 0.55,
    satOrder: 3,

    compThreshold: -20,
    compRatio: 4,

    phaserWet: 0.45,

    noiseLevel: 0.15,        // pulled back — was 0.26, still crackly
    noiseFilterFreq: 700,    // crackle texture lives here

    reverbWet: 0.82,
    delayWet: 0.09,          // skip artifacts
    delayFeedback: 0.08,
    chorusWet: 0,
    vibratoDepth: 0,
  },

  {
    id: 'am-radio',
    name: 'AM Radio',
    emoji: '📻',
    description: 'Brutal bandpass, nasal mids, transistor grit. Sounds like a dashboard. At 100%: sounds like a dashboard in 1974, driving through a tunnel, in a lightning storm.',

    hiPass: 560,
    loPass: 3200,
    hiShelfGain: -30,
    loShelfGain: -16,
    midFreq: 1400,
    midGain: 20,

    satWet: 0.96,
    satOrder: 14,

    compThreshold: -6,
    compRatio: 20,

    tremoloDepth: 0.18,
    tremoloFreq: 60,

    noiseLevel: 0.06,        // pulled back — was 0.09
    noiseFilterFreq: 5000,

    reverbWet: 0.06,
    delayWet: 0,
    chorusWet: 0,
    vibratoDepth: 0,
  },

  {
    id: 'reel-to-reel',
    name: 'Reel to Reel',
    emoji: '🎞️',
    description: "Old tape machine left in a storage unit since 1978. The heads need cleaning. The capstan is slipping. It sounds like it's thinking about quitting.",

    hiPass: 60,
    loPass: 11000,
    hiShelfGain: -14,
    loShelfGain: 2,
    midFreq: 500,
    midGain: 2,

    satWet: 0.62,
    satOrder: 4,

    compThreshold: -24,
    compRatio: 5,

    chorusWet: 0.78,
    chorusFreq: 0.55,

    vibratoDepth: 0.38,
    vibratoFreq: 0.38,

    phaserWet: 0.68,         // mono-ish phase collapse

    noiseLevel: 0.07,        // pulled back — was 0.11
    noiseFilterFreq: 6000,

    reverbWet: 0.88,
    delayWet: 0,
    tremoloDepth: 0,
  },

  // ── ROW 2 ────────────────────────────────────────────────────────────────

  {
    id: 'datsun-6x9',
    name: '1988 Datsun',
    emoji: '🚗',
    description: "Rusted floorboards. One working window. A blown driver's side 6x9 held in with a bungee cord since '91. Engine doing its thing underneath. This is your commute. This is your life.",

    hiPass: 160,
    loPass: 3200,
    hiShelfGain: -24,
    loShelfGain: -4,
    midFreq: 1800,
    midGain: 11,

    satWet: 0.92,
    satOrder: 16,

    compThreshold: -10,
    compRatio: 14,

    vibratoDepth: 0.42,
    vibratoFreq: 0.35,

    chorusWet: 0.72,
    chorusFreq: 1.1,

    noiseLevel: 0.18,        // pulled back — was 0.28, but engine rumble stays
    noiseFilterFreq: 120,    // engine. just engine.

    reverbWet: 0.42,
    delayWet: 0,
  },

  {
    id: 'drive-in',
    name: 'Drive-In Speaker',
    emoji: '🎬',
    description: '1963 parking lot speaker hanging on your car window. Volume knob broke off in 1967. Someone spraypainted SOUND on the pole. Works great.',

    hiPass: 750,             // nothing below 700Hz. nothing.
    loPass: 3800,
    hiShelfGain: -22,
    loShelfGain: -12,
    midFreq: 1500,
    midGain: 10,

    satWet: 0.72,
    satOrder: 8,

    compThreshold: -14,
    compRatio: 12,

    tremoloDepth: 0.16,
    tremoloFreq: 0.25,

    noiseLevel: 0.08,        // pulled back — was 0.12
    noiseFilterFreq: 3200,

    reverbWet: 0.50,
    delayWet: 0,
    chorusWet: 0,
    vibratoDepth: 0,
  },

  {
    id: 'voicemail-90s',
    name: '90s Voicemail',
    emoji: '📞',
    description: 'You have. Forty-three. New messages. [three second silence] [click]. Recorded at 8kHz over a phone line that also handled fax. Your band sounds like a fax now.',

    hiPass: 400,             // POTS band starts here
    loPass: 4000,            // POTS band ends here
    hiShelfGain: -32,
    loShelfGain: -20,
    midFreq: 1800,
    midGain: 14,             // the honk. this is the honk.

    satWet: 0.82,
    satOrder: 12,

    compThreshold: -8,
    compRatio: 24,

    noiseLevel: 0.04,        // pulled back — was 0.06
    noiseFilterFreq: 4500,

    reverbWet: 0.10,
    delayWet: 0.15,
    delayFeedback: 0.12,
    chorusWet: 0,
    vibratoDepth: 0,
    tremoloDepth: 0,
  },

  {
    id: 'vhs-camcorder',
    name: 'VHS Camcorder',
    emoji: '📹',
    description: "Dad's birthday party, 1993. Panasonic PV-18. Dead battery indicator. Heads cleaning tape that made things worse. The zoom is stuck. Nobody is looking at the camera.",

    hiPass: 65,
    loPass: 7500,
    hiShelfGain: -13,
    loShelfGain: 3,
    midFreq: 2500,
    midGain: 3,

    satWet: 0.72,
    satOrder: 7,

    compThreshold: -18,
    compRatio: 8,

    chorusWet: 0.75,
    chorusFreq: 5.2,         // head-switching flutter

    vibratoDepth: 0.42,
    vibratoFreq: 0.45,       // slow transport wow — not 28Hz flutter

    noiseLevel: 0.11,        // pulled back — was 0.18
    noiseFilterFreq: 6000,

    reverbWet: 0.62,
    delayWet: 0,
    phaserWet: 0,            // stays stereo, unlike reel-to-reel
    tremoloDepth: 0,
  },

  // ── ROW 3 — The Old Timey Wing ────────────────────────────────────────────

  {
    id: 'victrola',
    name: 'Victrola',
    emoji: '🎺',
    description: "1923. A hand-cranked Victrola in somebody's parlor. The horn is pointing at the ceiling. Half the musicians are standing too far back. All of them are wearing hats.",

    // Acoustic recording bandwidth — roughly 200Hz to 3.5kHz through a horn
    hiPass: 200,
    loPass: 3500,
    hiShelfGain: -30,
    loShelfGain: -8,
    midFreq: 1400,           // horn resonance peak
    midGain: 14,

    satWet: 0.88,
    satOrder: 9,

    compThreshold: -22,
    compRatio: 5,

    chorusWet: 0.50,
    chorusFreq: 0.3,

    vibratoDepth: 0.38,      // hand-cranked speed variation
    vibratoFreq: 0.18,       // slow and inconsistent — someone's arm getting tired

    phaserWet: 0.78,         // mono horn

    noiseLevel: 0.20,        // heavy shellac surface noise
    noiseFilterFreq: 2000,

    reverbWet: 0.85,         // parlor room resonance — long and boxy
    delayWet: 0,
    tremoloDepth: 0,
  },

  {
    id: 'wax-cylinder',
    name: 'Wax Cylinder',
    emoji: '🥫',
    description: "1903. Edison. A wax cylinder recording of a man saying his name into a horn in a room that no longer exists. The cylinder has been in a box for 121 years. You can tell.",

    // Pre-electric acoustic recording — brutally limited
    hiPass: 380,
    loPass: 2200,
    hiShelfGain: -38,
    loShelfGain: -18,
    midFreq: 1000,           // tiny horn resonance
    midGain: 18,

    satWet: 0.96,
    satOrder: 18,            // maximum harmonic destruction

    compThreshold: -28,
    compRatio: 3,            // no dynamics control — this is just physics

    chorusWet: 0.62,
    chorusFreq: 0.2,

    vibratoDepth: 0.58,      // wax cylinder speed variation is brutal
    vibratoFreq: 0.12,       // very slow — the spring is running down

    phaserWet: 0.90,         // total mono collapse

    noiseLevel: 0.30,        // the cylinder IS noise at this point
    noiseFilterFreq: 1500,

    reverbWet: 0.72,         // small recording room, boxy horn resonance
    delayWet: 0,
    tremoloDepth: 0,
  },

  {
    id: 'wartime-broadcast',
    name: 'Wartime Radio',
    emoji: '📡',
    description: "1944 Armed Forces Radio. Shortwave from somewhere in the Pacific. Atmospheric interference, signal drift, a trumpet playing something that cuts to static. Then back.",

    hiPass: 180,
    loPass: 6500,
    hiShelfGain: -22,
    loShelfGain: -6,
    midFreq: 1200,
    midGain: 9,

    satWet: 0.68,
    satOrder: 7,

    compThreshold: -18,
    compRatio: 9,

    chorusWet: 0.30,
    chorusFreq: 0.9,

    vibratoDepth: 0.18,      // shortwave signal drift
    vibratoFreq: 0.7,

    tremoloDepth: 0.22,      // signal fading in and out
    tremoloFreq: 0.8,        // slow, atmospheric

    noiseLevel: 0.14,        // static and interference
    noiseFilterFreq: 4000,

    reverbWet: 0.80,         // metal-walled broadcast room + ionospheric reverb
    delayWet: 0,
    phaserWet: 0.40,
  },

  {
    id: 'crystal-set',
    name: 'Crystal Set',
    emoji: '⚡',
    description: "1922. A galena crystal, a coil of wire, and a pair of headphones pressed hard against one ear. Your neighbor's kid built this. It almost works. You can hear something. Probably music.",

    // Crystal radio has almost no low end and a narrow high-mids window
    hiPass: 820,
    loPass: 2800,
    hiShelfGain: -34,
    loShelfGain: -22,
    midFreq: 1600,
    midGain: 16,

    satWet: 0.92,
    satOrder: 14,

    compThreshold: -8,
    compRatio: 18,

    vibratoDepth: 0.22,      // signal drift from the galena crystal
    vibratoFreq: 0.28,

    tremoloDepth: 0.30,      // the signal fades in and out constantly
    tremoloFreq: 0.45,       // slow amplitude wavering

    chorusWet: 0.35,
    chorusFreq: 0.5,

    phaserWet: 0.60,

    noiseLevel: 0.18,        // RF interference is constant company
    noiseFilterFreq: 3000,

    reverbWet: 0.70,         // long — through ether, not air
    delayWet: 0,
  },

];

export function getPreset(id) {
  return presets.find(p => p.id === id) ?? presets[0];
}
