import { useEffect, useRef, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { RetroPlayer } from './audio/player.js';
import { presets } from './audio/presets.js';
import './App.css';

const player = new RetroPlayer();

// true on iOS/Android device, false in web browser
const IS_NATIVE = Capacitor.isNativePlatform();

const DEMO_TRACKS = [
  { id: 'crazy-good',          label: 'Crazy Good',                      artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/crazy-good.mp3',         default: true },
  { id: 'funk49',              label: 'The One From That Night',          artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/funk49.mp3' },
  { id: 'oh-snap',             label: 'Load-Bearing Groove',             artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/oh-snap.mp3' },
  { id: 'tk3-04-remix',        label: 'Version Four Is Actually Better', artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/tk3-04-remix.mp3' },
  { id: 'frunk',               label: 'Confidence At 130% Capacity',     artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/frunk.mp3' },
  { id: 'track-04',            label: 'Still Going',                     artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/track-04.mp3' },
  { id: 'track-03',            label: 'The Third Thing',                 artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/track-03.mp3' },
  { id: 'counter-operation',   label: 'Unsolicited Expert Opinion',      artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/counter-operation.mp3' },
  { id: 'tk3-01-remix',        label: 'They Sent Notes, We Sent This',   artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/tk3-01-remix.mp3' },
  { id: 'oh-shit',             label: 'Wrong Room, Right Energy',        artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/oh-shit.mp3' },
  { id: 'something-different', label: 'Different In All The Right Ways', artist: 'KBD Trio', artistUrl: 'https://kbdtrio.com', url: './audio/something-different.mp3' },
];

// Montgomery Ward catalog item numbers
const CAT_NOS = {
  'broken-cassette':   'Cat. 84-1137',
  'vinyl-room':        'Cat. 84-2291',
  'am-radio':          'Cat. 74-4403',
  'reel-to-reel':      'Cat. 84-6618',
  'datsun-6x9':        'Cat. 88-7743',
  'drive-in':          'Cat. 63-0019',
  'voicemail-90s':     'Cat. 93-5512',
  'vhs-camcorder':     'Cat. 93-8801',
  'victrola':          'Cat. 23-0011',
  'wax-cylinder':      'Cat. 03-0001',
  'wartime-broadcast': 'Cat. 44-7788',
  'crystal-set':       'Cat. 22-0003',
};

export default function App() {
  const [loaded,       setLoaded]      = useState(false);
  const [fileName,     setFileName]    = useState('');
  const [duration,     setDuration]    = useState(0);
  const [playState,    setPlayState]   = useState('idle');
  const [presetId,     setPresetId]    = useState('broken-cassette');
  const [intensity,    setIntensity]   = useState(0.5);
  const [exporting,    setExporting]   = useState(false);
  const [dragging,     setDragging]    = useState(false);
  const [statusText,   setStatusText]  = useState('awaiting source file...');
  const [statusState,  setStatusState] = useState('idle');
  const [activeDemoId, setActiveDemoId] = useState(null);
  const [volume,       setVolume]       = useState(0); // dB, -30 to +6

  const fileInputRef = useRef(null);

  // Stable refs for callback closures
  const fileNameRef = useRef(fileName);
  const durationRef = useRef(duration);
  const presetIdRef = useRef(presetId);
  const loadedRef   = useRef(loaded);
  fileNameRef.current = fileName;
  durationRef.current = duration;
  presetIdRef.current = presetId;
  loadedRef.current   = loaded;

  // Preload Crazy Good on mount — Tone.start() is deferred to play(),
  // so this works before any user gesture.
  useEffect(() => {
    const cg = DEMO_TRACKS.find(t => t.default);
    setActiveDemoId(cg.id);
    setFileName(cg.label);
    setStatusText(`loading · ${cg.label}`);
    setStatusState('active');
    player.loadUrl(cg.url, cg.label).then(dur => {
      player.applyPreset('broken-cassette', 0.5);
      setDuration(dur);
      setLoaded(true);
      setStatusText(`ready · ${formatDuration(dur)} · ${cg.label}`);
      setStatusState('active');
    }).catch(() => {
      setActiveDemoId(null);
      setStatusText('awaiting source file...');
      setStatusState('idle');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    player.onStateChange((state) => {
      setPlayState(state);
      if (state === 'playing') {
        setStatusText(`transmitting · ${fileNameRef.current || 'source'}`);
        setStatusState('active');
      } else if (state === 'idle' && loadedRef.current) {
        setStatusText(
          `ready · ${formatDuration(durationRef.current)} · ${presetIdRef.current.replace(/-/g, ' ')}`
        );
        setStatusState('active');
      }
    });
    return () => player.dispose();
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setActiveDemoId(null);
    setFileName(file.name);
    setLoaded(false);
    setStatusText(`decoding · ${file.name}`);
    setStatusState('active');
    try {
      const dur = await player.load(file);
      player.applyPreset(presetId, intensity);
      setDuration(dur);
      setLoaded(true);
      setStatusText(`ready · ${formatDuration(dur)} · ${file.name}`);
      setStatusState('active');
    } catch (e) {
      console.error(e);
      setStatusText('error decoding file — try wav or mp3');
      setStatusState('error');
    }
  }, [presetId, intensity]);

  // Unified file picker — native FilePicker on device, hidden input on web
  const handlePickFile = useCallback(async () => {
    if (IS_NATIVE) {
      try {
        const result = await FilePicker.pickFiles({
          types: ['audio/*'],
          multiple: false,
          readData: true, // returns base64 data
        });
        if (!result.files.length) return;
        const picked = result.files[0];
        // Decode base64 → File object for compatibility with handleFile()
        const byteString = atob(picked.data);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: picked.mimeType || 'audio/mpeg' });
        const file = new File([blob], picked.name, { type: picked.mimeType || 'audio/mpeg' });
        handleFile(file);
      } catch (e) {
        if (e?.message !== 'pickFiles canceled') {
          console.error('File pick error:', e);
          setStatusText('error opening file picker');
          setStatusState('error');
        }
      }
    } else {
      fileInputRef.current?.click();
    }
  }, [handleFile]);

  const handleDemoTrack = useCallback(async (track) => {
    setActiveDemoId(track.id);
    setFileName(track.label);
    setLoaded(false);
    setStatusText(`loading · ${track.label}`);
    setStatusState('active');
    try {
      const dur = await player.loadUrl(track.url, track.label);
      player.applyPreset(presetId, intensity);
      setDuration(dur);
      setLoaded(true);
      setStatusText(`ready · ${formatDuration(dur)} · ${track.label}`);
      setStatusState('active');
    } catch (e) {
      console.error(e);
      setActiveDemoId(null);
      setStatusText('error loading demo track');
      setStatusState('error');
    }
  }, [presetId, intensity]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePreset = async (id) => {
    setPresetId(id);
    player.applyPreset(id, intensity);
    if (loaded) {
      setStatusText(`preset: ${id.replace(/-/g, ' ')} · intensity ${Math.round(intensity * 100)}`);
    }
    if (IS_NATIVE) {
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) {}
    }
  };

  const handleIntensity = (val) => {
    setIntensity(val);
    player.applyPreset(presetId, val);
  };

  const handleVolume = (db) => {
    setVolume(db);
    player.setVolume(db);
  };

  const handlePlay = async () => {
    if (IS_NATIVE) {
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) {}
    }
    if (playState === 'playing') {
      player.stop();
      setStatusText(`stopped · ${formatDuration(duration)} · ${presetId.replace(/-/g, ' ')}`);
      setStatusState('active');
    } else {
      player.play();
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setStatusText('rendering to disc...');
    setStatusState('active');
    try {
      const blob   = await player.export(presetId, intensity);
      const base   = fileName.replace(/\.[^.]+$/, '');
      const preset = presets.find(p => p.id === presetId);
      const outName = `${base}_${preset.id}.wav`;

      if (IS_NATIVE) {
        // Convert blob → base64
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        bytes.forEach(b => (binary += String.fromCharCode(b)));
        const base64 = btoa(binary);

        // Write to device Documents directory
        const fileResult = await Filesystem.writeFile({
          path: outName,
          data: base64,
          directory: Directory.Documents,
        });

        // Open native share sheet (AirDrop, Files app, email, etc.)
        await Share.share({
          title: `Retroizer Export: ${outName}`,
          url: fileResult.uri,
          dialogTitle: 'Save or share your aged audio',
        });
        setStatusText('export complete · shared via Files');
      } else {
        // Web: standard download link
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = outName;
        a.click();
        URL.revokeObjectURL(url);
        setStatusText('export complete · wav written to disc');
      }
    } catch (e) {
      console.error(e);
      setStatusText('export error');
      setStatusState('error');
    }
    setExporting(false);
  };

  const activePreset = presets.find(p => p.id === presetId);

  // Intensity readout label — changes with value for personality
  const intensityLabel = () => {
    const pct = Math.round(intensity * 100);
    if (pct <= 10)  return 'Barely';
    if (pct <= 25)  return 'Subtle';
    if (pct <= 45)  return 'Vintage';
    if (pct <= 65)  return 'Wrecked';
    if (pct <= 80)  return 'Destroyed';
    if (pct <= 95)  return 'Unlistenable';
    return 'Why';
  };

  return (
    <div className="app" data-preset={presetId}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="app-header">
        <div className="ward-banner">Montgomery Ward Electronics Division</div>
        <h1 className="logo">RETROIZER</h1>
        <p className="tagline">▸ audio aging engine ◂</p>
        <div className="model-plate">
          <span className="model-plate-item">Cat. No. <span>RZ-1951</span></span>
          <span className="model-plate-item">Model <span>AE-51</span></span>
          <span className="model-plate-item">Mfd. <span>1951</span></span>
        </div>
      </header>

      <main className="app-main">

        {/* ── SOURCE INPUT ─────────────────────────────── */}
        <div className="panel">
          <div className="panel-label">
            <span>◈ Source Input</span>
            <span className="panel-cat">Pg. 847</span>
          </div>
          <div
            className={`dropzone${!IS_NATIVE && dragging ? ' dragging' : ''}${loaded ? ' has-file' : ''}`}
            onDragOver={IS_NATIVE ? undefined : (e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={IS_NATIVE ? undefined : () => setDragging(false)}
            onDrop={IS_NATIVE ? undefined : handleDrop}
            onClick={handlePickFile}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handlePickFile()}
          >
            {/* Hidden file input — web only */}
            {!IS_NATIVE && (
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
            )}
            <div className="drop-prompt">
              <span className="drop-icon">◎</span>
              <span className="drop-main-text">Insert Recording</span>
              <span className="drop-sub-text">
                {IS_NATIVE ? 'Tap to browse audio files' : 'Drop audio file here or click to browse'}
              </span>
              <span className="drop-hint">WAV · MP3 · FLAC · OGG</span>
            </div>
            {loaded && (
              <div className="file-info">
                <span className="file-name">{fileName}</span>
                <span className="file-duration">{formatDuration(duration)} · loaded</span>
              </div>
            )}
          </div>
        </div>

          <div className="demo-tracks">
            <span className="demo-tracks-label">— or try a demo —</span>
            <div className="demo-track-btns">
              {DEMO_TRACKS.map(t => (
                <div key={t.id} className="demo-track-item">
                  <button
                    className={`demo-track-btn${activeDemoId === t.id ? ' active' : ''}${t.default && !activeDemoId && !loaded ? ' suggested' : ''}`}
                    onClick={() => handleDemoTrack(t)}
                  >
                    {t.label}
                  </button>
                  <a
                    className="demo-track-artist"
                    href={t.artistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    {t.artist}
                  </a>
                </div>
              ))}
            </div>
          </div>

        {/* ── AGING PRESET ─────────────────────────────── */}
        <div className="panel">
          <div className="panel-label">
            <span>◈ Aging Preset</span>
            <span className="panel-cat">Select One</span>
          </div>
          <div className="preset-grid">
            {presets.map(p => (
              <button
                key={p.id}
                className={`preset-card${presetId === p.id ? ' active' : ''}`}
                onClick={() => handlePreset(p.id)}
              >
                <span className="preset-cat-no">{CAT_NOS[p.id]}</span>
                <span className="preset-emoji">{p.emoji}</span>
                <span className="preset-name">{p.name}</span>
              </button>
            ))}
          </div>
          {activePreset && (
            <p className="preset-description">{activePreset.description}</p>
          )}
        </div>

        {/* ── WIRED REMOTE CONTROL ─────────────────────── */}
        <div className="panel">
          <div className="panel-label">
            <span>◈ Remote Control (Wired)</span>
            <span className="panel-cat">Model RW-51</span>
          </div>
          <div className="remote-panel">
            <div className="remote-row-label">Aging Intensity</div>
            <div className="intensity-row">
              <span className="intensity-label">MIN</span>
              <div className="slider-wrap">
                <div className="slider-wire" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={intensity}
                  onChange={e => handleIntensity(parseFloat(e.target.value))}
                  className="intensity-slider"
                />
              </div>
              <span className="intensity-label intensity-label-right">MAX</span>
              <span className="intensity-value">{Math.round(intensity * 100)}</span>
            </div>
            <div className="remote-footer">
              <span className="remote-desc">sweet spot: 20–40% · 100% is a warning</span>
              <span className="intensity-word">{intensityLabel()}</span>
            </div>

            <div className="remote-divider" />

            <div className="remote-row-label">Monitor Volume</div>
            <div className="intensity-row">
              <span className="intensity-label">−30</span>
              <div className="slider-wrap">
                <div className="slider-wire" />
                <input
                  type="range"
                  min={-30}
                  max={6}
                  step={1}
                  value={volume}
                  onChange={e => handleVolume(parseFloat(e.target.value))}
                  className="intensity-slider volume-slider"
                />
              </div>
              <span className="intensity-label intensity-label-right">+6</span>
              <span className="intensity-value">{volume > 0 ? `+${volume}` : volume} dB</span>
            </div>
            <div className="remote-footer clipping-warning">
              <span>⚠ Clipping and static artifacts are normal at high intensity.</span>
              <span className="headphone-alert">🎧 Lower volume before previewing.</span>
            </div>
          </div>
        </div>

        {/* ── PLAYBACK / EXPORT ────────────────────────── */}
        <div className="panel">
          <div className="panel-label">
            <span>◈ Playback / Export</span>
            <span className="panel-cat">§ 14.2</span>
          </div>
          <div className="controls">
            <button
              className={`btn-play${playState === 'playing' ? ' playing' : ''}`}
              onClick={handlePlay}
              disabled={!loaded}
            >
              {playState === 'playing' ? '■ Stop' : '▶ Preview'}
            </button>
            <button
              className="btn-export"
              onClick={handleExport}
              disabled={!loaded || exporting}
            >
              {exporting ? 'Rendering...' : IS_NATIVE ? '⬆ Share WAV' : '⬇ Export WAV'}
            </button>
          </div>
          <div className="status-bar">
            <div className={`status-dot${statusState === 'active' ? ' active' : statusState === 'error' ? ' error' : ''}`} />
            <span>{statusText}</span>
          </div>
        </div>

      </main>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="app-footer">
        <div className="footer-guarantee">Satisfaction Guaranteed · Since 1872</div>
        <div className="footer-copy">Retroizer · Back Pocket Music © 2025 · retroizer.com</div>
      </footer>

    </div>
  );
}

function formatDuration(s) {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
