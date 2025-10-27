Ephemeral Time — p5.js Interactive Visualization (University Project)

This repository contains a university project implemented with p5.js. The visualization expresses the passage of time as ink spreading on a surface: a new ink drop is generated every second and spreads according to a Perlin-noise-based fluid field. The visual behavior is intentionally ephemeral.

Project structure (concise)

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