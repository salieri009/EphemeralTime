# Ephemeral Time - p5.js Interactive Visualization

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000) ![Version](https://img.shields.io/badge/Version-0.1.0-blue) ![GitHub stars](https://img.shields.io/github/stars/salieri009/EphemeralTime) ![GitHub issues](https://img.shields.io/github/issues/salieri009/EphemeralTime) ![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Here-brightgreen)

![p5.js](https://img.shields.io/badge/p5%20js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![Visual Studio Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Made with p5.js](https://img.shields.io/badge/Made%20with-p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

[한국어](README.ko.md) | [English](README.en.md) | [日本語](README.ja.md)

An interactive art project that expresses the passage of time as ink spreading on paper.
A new ink drop is generated every second and spreads according to fluid flow. It implements an "ephemeral" effect that gradually fades over time.

---

## Project Structure

```
/EphemeralTime/
│
├── index.html           # Project entry point
├── style.css            # Canvas and overall layout styles
├── sketch.js            # p5.js main logic (setup(), draw())
├── .gitignore           # Git ignore file settings
├── README.md            # Project documentation
│
├── js/
│   ├── Clock.js         # Time tracking and "new second" detection
│   ├── InkDrop.js       # Individual ink drop class
│   ├── Fluid.js         # Perlin Noise based fluid simulation
│   └── Audio.js         # Audio effects management (future implementation)
│
├── lib/                 # External libraries
│   ├── p5.js            # p5.js library
│   └── p5.sound.js      # p5.sound library
│
└── sounds/              # Audio files (future addition)
    ├── drop.mp3
    └── ambience.mp3
```

---

## Core Features

### 1. **Time Management (Clock.js)**
- Current system time tracking
- "New second" detection → New ink drop creation
- "New hour" detection → Hour cleansing effect trigger
- Time progress (hourProgress) return (for visual/audio effects)

### 2. **Ink Drops (InkDrop.js)**
- Individual ink drop state management (position, size, color, opacity, lifespan)
- Movement influenced by fluid field
- Gradually becomes transparent over time

### 3. **Fluid Simulation (Fluid.js)**
- Perlin Noise based vector field generation
- Smooth base flow over time
- Mouse interaction creates vortex effects

### 4. **Audio (Audio.js - Future Implementation)**
- Sound effects when ink drops are created
- Ambient sounds by time period
- Effect modulation based on mouse speed

---

## Visual Layer Structure (Performance Optimization)

**Using 3 `p5.Graphics` layers to handle 3600 objects per hour:**

| Layer | Name | Role | Update Frequency |
|-------|------|------|-----------------|
| 1 | `bgLayer` | Background (paper texture) | setup() / every hour |
| 2 | `historyLayer` | Accumulated ink (past) | when ink drops "die" |
| 3 | `activeLayer` | Active ink (current) | every frame |

**Rendering Order:** bgLayer → historyLayer → activeLayer

---

## Time-based Color Palette

| Time Period | Primary Color | Secondary Color |
|-------------|---------------|-----------------|
| 00:00 ~ 06:00 (Midnight~Dawn) | Dark Navy (`#1a1a2e`) | Blue (`#0f3460`) |
| 06:00 ~ 12:00 (Morning~Noon) | Yellow (`#ffd93d`) | Orange (`#ff6b6b`) |
| 12:00 ~ 18:00 (Afternoon) | Green (`#6bcf7f`) | Cyan (`#4d96ff`) |
| 18:00 ~ 24:00 (Evening~Night) | Purple (`#a855f7`) | Pink (`#ec4899`) |

---

## Technology Stack

- **p5.js**: Canvas rendering and basic graphics
- **JavaScript (ES6+)**: All module development
- **Perlin Noise**: Fluid simulation
- **p5.sound**: Audio effects (future)

---

## Development Progress

- [x] Project structure design
- [ ] Clock.js implementation
- [ ] InkDrop.js implementation
- [ ] Fluid.js implementation
- [ ] sketch.js main logic implementation
- [ ] HTML & CSS writing
- [ ] Audio.js implementation and sound file addition
- [ ] Hour cleansing effect detail adjustment

---

## How to Run

1. Open project directory
2. Run local server (e.g., `python -m http.server 8000`)
3. Access `http://localhost:8000` in browser

---

## Notes

- All modules are designed to be testable independently
- Graphic layers separated for performance optimization
- Structure upgradeable to GLSL shaders in the future
