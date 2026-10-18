<p align="center">
  <img src="public/icons/reacut.png" width="96" height="96" alt="ReaCut icon" />
</p>
<h1 align="center">ReaCut</h1>
<p align="center"><strong>An independent, open-source offline desktop video editor suite reverse-engineered and rebuilt with <a href="https://github.com/morluto/rea">REA</a> methodologies.</strong><br />Clean-room implementation, no proprietary CapCut/Jianying code or copyrighted assets.</p>
<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-45d6c0" alt="License: MIT" /></a>
  <a href="https://github.com/xavierlayne"><img src="https://img.shields.io/badge/Maintained%20by-%40xavierlayne-blue" alt="Maintained by: @xavierlayne" /></a>
  <img src="https://img.shields.io/badge/Status-Active%20Development-orange" alt="Status: Active Development" />
</p>
<p align="center">
  <strong>English</strong> · <a href="README.tr.md">Türkçe</a> · <a href="README.zh.md">简体中文</a><br />
  <a href="#quick-start">Quick Start</a> · <a href="docs/USER_GUIDE.md">User Guide</a> · <a href="CHANGELOG.md">Changelog</a> · <a href="#contributing">Contributing</a>
</p>

![ReaCut Editor Workspace](docs/screenshots/ui-parity-editor.png)

ReaCut brings multitrack video/audio timeline editing, subtitle generation, media asset management, and hardware-accelerated video export into an intuitive desktop workspace. The core rendering engine runs completely offline and locally without account requirements or cloud dependencies.

Built independently with Electron, React, TypeScript, and FFmpeg.

---

## 🚀 Features & Enhancements

### 📌 Core Functionality
| Category | Capabilities |
| --- | --- |
| **Media & Source Preview** | Import video, audio, and images with waveforms and thumbnails; mark source in/out points with I/O shortcuts. |
| **Multitrack Editing** | Drag & drop, trim, split, duplicate, multiselect clips, magnetic snapping, track locking, and mute. |
| **Visuals & Audio Processing** | Scale, rotate, crop, color grading, Chroma Key (green screen removal), rectangular/elliptical masks, keyframing, and audio fades. |
| **Text & Subtitles** | SRT and WebVTT import/export, batch text replacement, timestamp shifting, and customizable typography styles. |
| **Local Project Engine** | Offline `.reacut` project format, auto-recovery, and relinking missing assets. |
| **Video Rendering & Export** | Hardware-accelerated H.264 / AAC video export to MP4 and MOV formats. |
| **AI Assistant Integration** | Integrated Google Gemini (3.8-flash) assistant for smart timeline automation. |

### ✨ Added by @xavierlayne
- **Dynamic Multilingual UI:** Language switcher supporting English, Turkish (Türkçe), and Simplified Chinese (简体中文).
- **Copyright-Safe Visual Identity:** Completely removed all proprietary third-party logos, watermarks, and brand names in favor of clean `ReaCut` assets.
- **Attribution & Badges:** Integrated developer credit badges linking directly to `@xavierlayne` across titlebars, status bars, and About dialogs.
- **Enhanced AI Panel:** Response timer counter, active platform display, and persistent thinking state across panel toggles.

---

## 🛠️ Quick Start

### Run from Source

Requirements:
- **Node.js 24+ or 26+** and npm
- **FFmpeg & FFprobe** (must be available in `PATH`)

```sh
# Install dependencies
npm ci

# Start in development mode
npm run dev
```

---

## 📄 License & Maintainers

ReaCut source code is released under the [MIT License](LICENSE).

- **Lead Developer & Maintainer:** [@xavierlayne](https://github.com/xavierlayne)
- **Contributors:** Open-source community
