<div align="center">

![header](https://capsule-render.vercel.app/api?type=wave&color=0:4d96ff,50:00d4ff,100:a855f7&height=200&section=header&text=Ephemeral%20Time&fontSize=80&fontColor=ffffff&desc=The%20Reservoir%20of%20Attention&descSize=24&descAlignY=65&animation=fadeIn)

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Version](https://img.shields.io/badge/Version-0.2.0-blue)

[한국어](README.ko.md) | [English](README.en.md) | [日本語](README.ja.md)

</div>

---

## Overview

Interactive art project visualizing time as a fluid, generative experience. User interaction shapes time flow: calm state = slow, meaningful; turbulent state = fast, forgettable.

**Core Concept**: Time is represented as a "Reservoir of Attention" where mouse velocity creates turbulence, affecting fluid dynamics, color saturation, and audio complexity.

---

## Quick Start

```bash
# Run local server
python -m http.server 8000
# or
npx http-server

# Open http://localhost:8000
```

---

## Architecture

### Core Components

- **Clock.js**: Time tracking, event emission (second/minute/hour/chime)
- **Fluid.js**: Perlin Noise vector field with turbulence system
- **InkDrop.js**: Particle system with physics (extends `Particle`)
- **ColorManager.js**: Time-based gradients with turbulence modulation
- **Audio.js**: Generative synthesis (no audio files)

### Design Patterns

- **IoC Container**: Dependency injection, zero globals
- **Object Pool**: 50-70% GC reduction via particle reuse
- **Strategy Pattern**: Swappable renderers (Stamp/Splatter)
- **Factory Pattern**: Centralized particle creation

### Performance

- **3-Layer Graphics**: `bgLayer` (static) → `historyLayer` (semi-static) → `activeLayer` (dynamic)
- **Object Pooling**: Pre-allocated particles, automatic cleanup
- **Lazy Initialization**: Services created on-demand

---

## Project Structure

```
/EphemeralTime/
├── sketch.js              # Main application (p5.js setup/draw)
├── index.html
├── js/
│   ├── config.js          # Central configuration
│   ├── Clock.js           # Time management
│   ├── Fluid.js           # Fluid simulation
│   ├── InkDrop.js         # Particle system
│   ├── ColorManager.js    # Color gradients
│   ├── Audio.js           # Generative audio
│   ├── CymaticPattern.js # Visual sound waves
│   ├── SunDrop.js         # Hourly marker
│   ├── InkDrip.js         # Ink trails
│   ├── core/              # Architecture
│   │   ├── Container.js
│   │   ├── ObjectPool.js
│   │   ├── Particle.js
│   │   ├── ParticleFactory.js
│   │   └── Renderable.js
│   └── rendering/         # Rendering strategies
│       ├── StampRenderer.js
│       └── SplatterRenderer.js
└── lib/                    # p5.js, p5.sound
```

---

## Key Features

1. **Sun Drop**: Hourly marker drifts left→right over 60 minutes
2. **Chime Drops**: Quarter-hour markers (15/30/45) with ripple effects
3. **Turbulence System**: Mouse velocity affects fluid, color, audio
4. **Generative Audio**: Real-time synthesis, no audio files
5. **Cymatic Patterns**: Visual sound waves (3/6/9 rings by time)

---

## Tech Stack

- **p5.js**: Canvas rendering
- **JavaScript (ES6+)**: Modular architecture
- **Perlin Noise**: Fluid simulation

---

## License

MIT
