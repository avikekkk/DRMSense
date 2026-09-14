# DRMSense

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-61DAFB.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg) ![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)

**DRMSense** is a modern, high-precision web utility designed to analyze and visualize your browser's Digital Rights Management (DRM) capabilities and media support. Built with a focus on aesthetics and performance, it provides developers and streaming enthusiasts with detailed insights into what their current environment can handle.

## Features

### DRM System Analysis
Probes 10 key systems across 5 DRM families, on every platform:
- **Google Widevine** — full robustness ladder, so L1 / L2 / L3 are distinguished
- **Microsoft PlayReady** — walks `.recommendation.3000`, `.hardware`, `.recommendation` and base strings to detect SL3000 hardware DRM
- **Apple FairPlay** — both modern (`com.apple.fps`) and legacy (`fps.1_0`) key systems on macOS, iOS and iPadOS
- **Huawei WisePlay** and **W3C ClearKey**
- **Encryption schemes** (`cenc`, `cbcs`, `cbcs-1-9`), **HDCP level**, **persistent license** and **distinctive identifier** support
- **Encrypted playback** — which codecs decode *under* each key system and how far up the resolution ladder they reach, via `decodingInfo` with a `keySystemConfiguration`

Built against [Encrypted Media Extensions v2](https://www.w3.org/TR/encrypted-media-2/).

### Deep Media Inspection
Uses the [Media Capabilities API](https://www.w3.org/TR/media-capabilities/) alongside MSE, `canPlayType`, MediaRecorder and WebCodecs:
- **Containers**: MP4/CMAF, WebM, Matroska, MPEG-TS, Ogg, HLS, DASH, and more — each checked separately for streaming (MSE), direct playback, and recording
- **Video Codecs**: 49 codec strings across 10 families — H.264/AVC (profiles Baseline through High 4:4:4), HEVC/H.265, VP8, VP9, AV1, Dolby Vision (profiles 5, 8.1, 8.4, 9, 10), VVC/H.266, Theora, MPEG-4 Visual, MPEG-2 — reported per family with playback mode, hardware efficiency, and alpha channel support
- **Audio Codecs**: 41 codec strings across 12 families — AAC (LC, HE-AAC v1/v2, LD, ELD, xHE-AAC), Dolby (AC-3, E-AC-3, AC-4, TrueHD), DTS (Core, Express, HD-HR, HD-MA, DTS:X), MPEG-H 3D Audio, Opus, Vorbis, FLAC, ALAC, MP3/MP2, PCM, IAMF — with surround layouts and spatial audio (Atmos)
- **HDR Capabilities**: Dolby Vision, HDR10, HLG, plus HDR metadata formats and transfer functions
- **Resolution ladder**: highest resolution each codec decodes, and highest it decodes *smoothly* (480p → 8K)


### Modern Experience
- **Premium UI**: Clean, glassmorphic design with smooth micro-animations.
- **Dark Mode**: Fully supported system-aware dark/light theming.
- **Privacy Focused**: All checks are performed locally in your browser. No data is sent to external servers.
- **Data Export**: One-click export of all technical data to JSON for debugging or sharing.

## Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Bootstrap set)
- **Fonts**: Google Sans Flex

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avikekk/DRMSense.git
   cd DRMSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Development

```bash
npm test         # unit tests (Vitest)
npm run lint     # ESLint
npm run typecheck
```

Detection logic is covered by tests that stub the browser globals — including
regression tests for the FairPlay `initDataType` requirement and the Widevine
L1/L2/L3 robustness mapping, which are easy to break and impossible to notice
without an Apple or hardware-DRM device to hand.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
