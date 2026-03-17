# Retroizer Mobile — iOS + Android (Capacitor)

## What this is
Native iOS + Android wrapper around the Retroizer web app using Capacitor 8.
Same audio engine, same presets, same aesthetic — native file picker and share sheet instead of drag-drop and download link.
Bundle ID: `com.retroizer.app` · Free on both stores.

## Owner / Style
**Ted Kocher** — KBD Trio, POUROVER, Back Pocket Music.
Same humor/aesthetic as web version. See web CLAUDE.md for full style guide.

## Stack
- React 19 + Vite 8 + Tone.js 15 (UMD build — aliased to avoid rolldown ESM issue)
- Capacitor 8 wrapping a WKWebView (iOS) / WebView (Android)
- GitHub: `github.com/pour-over/retroizer-mobile`
- NOT deployed to Netlify — this is a native app

## Critical Vite Config Note
`vite.config.js` aliases `tone` → `node_modules/tone/build/Tone.js` (UMD bundle).
Vite 8's rolldown bundler can't resolve Tone.js's internal ESM relative imports.
**Do not change this alias or remove it.**

Also: `base: './'` is required for Capacitor file:// serving. Do not change to `/`.

## Platform Detection
```js
const IS_NATIVE = Capacitor.isNativePlatform(); // true on iOS/Android
```
Used to gate: file picker vs hidden input, share sheet vs download link, drag-drop events.

## Capacitor Plugins (5 active)
- `@capawesome/capacitor-file-picker` — replaces drag-drop file input on mobile
- `@capacitor/filesystem` — writes exported WAV to Documents directory
- `@capacitor/share` — native share sheet for WAV export
- `@capacitor/status-bar` — dark status bar on amber background
- `@capacitor/haptics` — light haptic on Play and preset change

## Key Behavioral Differences from Web
| Feature | Web | Mobile |
|---------|-----|--------|
| File input | Drag-drop + hidden `<input>` | `FilePicker.pickFiles()` |
| Export | `<a>.download` WAV | `Filesystem.writeFile()` + `Share.share()` |
| Export button label | "⬇ Export WAV" | "⬆ Share WAV" |
| Drag-drop handlers | Active | `undefined` (stripped) |
| Demo track URLs | `/audio/crazy-good.mp3` | `./audio/crazy-good.mp3` (relative) |

## Audio Engine
Identical to web version. Tone.js Web Audio API runs fine in WKWebView and Android WebView.
`Tone.start()` is correctly deferred to first user gesture (play button).

## Build + Sync Workflow
```bash
npm run build       # Vite → dist/ (uses UMD Tone.js alias)
npx cap sync        # copies dist/ into ios/ and android/ native projects
npx cap open ios    # opens Xcode
npx cap open android # opens Android Studio
git add -A && git commit -m "..." && git push origin main
```

## iOS Config
- Deployment target: iOS 14.0
- Xcode project: `ios/App/App.xcodeproj`
- Bundle ID set in Xcode: `com.retroizer.app`
- `Info.plist`: NSPhotoLibraryUsageDescription, UIStatusBarStyleLightContent, NSAllowsLocalNetworking
- Status bar: light (white text on `#0A0804` background)
- Apple Developer account: needs enrollment at developer.apple.com ($99/year)

## Android Config
- `minSdkVersion 24` (Android 7.0, covers 97%+ of devices)
- `targetSdkVersion 36`
- `applicationId "com.retroizer.app"`
- Manifest: READ_MEDIA_AUDIO, READ_EXTERNAL_STORAGE (≤32), WRITE_EXTERNAL_STORAGE (≤28), hardwareAccelerated
- Google Play account: needs enrollment ($25 one-time)

## Mobile CSS Additions (end of App.css)
- `env(safe-area-inset-*)` padding on `.app` for notch/Dynamic Island/home bar
- 44px minimum tap targets on all interactive elements
- `:active` states on all buttons (mobile has no :hover)
- `@media (hover: none)` suppresses sticky hover on touch devices
- `touch-action: manipulation` on `*` prevents double-tap zoom
- `body { background: #0A0804 }` fills under iOS status bar

## Demo Tracks
Same 11 tracks as web. All KBD Trio → kbdtrio.com.
Files in `public/audio/` with clean kebab-case names.

## App Icon / Splash (TODO — user needs to provide artwork)
```bash
# Place these files first:
# resources/icon.png   — 1024×1024, no transparency, no rounded corners
# resources/splash.png — 2732×2732, #0A0804 bg, logo in 1200×1200 center safe zone

npx capacitor-assets generate \
  --iconBackgroundColor '#0A0804' \
  --splashBackgroundColor '#0A0804'
```

## Companion Web App
Web version lives at: `/Users/tedkocher/Desktop/ClaudeCode/Retro/retroizer`
Repo: `github.com/pour-over/retroizer`
Live: retroizer.com (Netlify, site ID `20b1d1ec-5673-4b7c-a8f7-f179f3ff196b`)
