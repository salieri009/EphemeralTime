# Ephemeral Time: The Reservoir of Attention

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000) ![Version](https://img.shields.io/badge/Version-0.2.0-blue) ![GitHub stars](https://img.shields.io/github/stars/salieri009/EphemeralTime) ![GitHub issues](https://img.shields.io/github/issues/salieri009/EphemeralTime) ![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Here-brightgreen)

![p5.js](https://img.shields.io/badge/p5%20js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

[한국어](README.ko.md) | [English](README.en.md) | [日本語](README.ja.md)

A university project exploring **subjective, psychological time** through interactive visualization. The canvas is a "Reservoir of Attention" where your interaction directly shapes how time flows and appears.

## Core Concept

This visualization transforms time from an objective, mechanical constant into a **psychological experience**:

- **Calm State (Focused Mind)**: When you don't interact, the fluid flows smoothly, colors are vivid, and ink drops leave deep marks. Time feels slow and meaningful.
- **Turbulent State (Distracted Mind)**: When you drag your mouse rapidly, you inject chaos. The fluid becomes turbulent, colors desaturate, and drops fade quickly. Time feels fast and forgettable.

**Your interaction becomes a mirror of your own attention.**

## Key Features (v0.2)

### 1. The Sun Drop (Hourly Readability)
- A radiant drop appears at the start of each hour
- It drifts from left to right across the top of the screen over 60 minutes
- Creates a repulsion field, pushing other drops away
- Provides intuitive, non-numerical time reading

### 2. Chime Drops (Quarter-Hour Markers)
- Special drops appear at 15, 30, and 45 minutes past the hour
- Each creates a powerful ripple effect across the entire canvas
- A synthesized chime sound plays
- Provides rhythmic temporal anchors

### 3. The Turbulence System (Attention Feedback)
- Tracks your mouse velocity in real-time
- Fast, chaotic movements inject "turbulence" into the system
- Affects fluid dynamics, color saturation, and audio complexity
- Decays slowly when you stop interacting
- **This is the heart of the subjective time experience**

### 4. Generative Audio
- Synthesized drop sounds (pitch varies by minute)
- Ambient soundscape (modulated by turbulence)
- Quarter-hour chime sounds
- No audio files required; all sounds generated in real-time

## Project Structure

```
/EphemeralTime/
├── index.html        # entry point
├── style.css         # layout and canvas styles
├── sketch.js         # main p5.js sketch (setup, draw)
├── package.json      # npm scripts (dev server)
├── .gitignore
├── README.md         # original (Korean)
├── README_EN.md      # this file (English)
├── js/
│   ├── Clock.js      # time tracking and second/hour detection
│   ├── InkDrop.js    # ink drop class
│   ├── Fluid.js      # Perlin-noise fluid field
│   └── Audio.js      # audio manager (skeleton)
├── lib/              # p5.js libraries (local download)
└── sounds/           # sound files (left empty for now)
```

Key features

- Time-driven generation: a new ink drop is created each second (Clock.js).
- Ink drops are objects with position, size, color, opacity and lifespan (InkDrop.js).
- A Perlin-noise vector field drives drop motion and produces organic flow (Fluid.js).
- Three rendering layers (bg, history, active) are used to optimize performance.
- Audio support is scaffolded but currently left empty; audio files can be added to `sounds/` later.

This project is developed as part of a university assignment; the code and structure are organized for clarity and easy evaluation.

Development / Run (local)

```powershell
cd D:\UTS\p5j\EphemeralTime
npm run dev
```

## Installation

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Download p5.js libraries (optional, for offline use):
   ```bash
   cd lib
   # Download p5.js core
   curl -o p5.min.js https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js
   # Download p5.sound addon
   curl -o p5.sound.min.js https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/addons/p5.sound.min.js
   ```
4. Start dev server: `npm run dev`

Open http://localhost:8000 in your browser after starting the dev server.

Status

- [x] Project structure created
- [x] Core modules scaffolding (Clock, InkDrop, Fluid, Audio skeleton)
- [x] Sketch, HTML and styles scaffolded
- [ ] Further tuning and audio assets
- [ ] Time-wash behavior (hourly fade) — to be implemented by student

If you want the original README replaced instead of adding README_EN.md, tell me and I will overwrite `README.md`.