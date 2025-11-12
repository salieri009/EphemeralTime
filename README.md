<div align="center">

# Ephemeral Time: The Reservoir of Attention

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000) ![Version](https://img.shields.io/badge/Version-0.2.0-blue) ![GitHub stars](https://img.shields.io/github/stars/salieri009/EphemeralTime) ![GitHub issues](https://img.shields.io/github/issues/salieri009/EphemeralTime) ![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Here-brightgreen)

![p5.js](https://img.shields.io/badge/p5%20js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![Visual Studio Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Made with p5.js](https://img.shields.io/badge/Made%20with-p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

[한국어](README.ko.md) | [English](README.en.md) | [日本語](README.ja.md)

</div>

---

<div align="center">

An interactive art project that explores the subjective nature of time through a fluid, generative visualization. Time is represented as a **"Reservoir of Attention"** where your interaction directly shapes how time flows and appears.

**New in v0.2:** The Sun Drop (hourly marker), Chime Drops (quarter-hour markers), and the Turbulence System (attention feedback).

</div>

---

## Core Concept

### From Objective Time to Subjective Time

This project visualizes time not as a mechanical constant, but as a **psychological experience**. The canvas is a reservoir that reflects your state of mind:

- **Calm State (Focused)**: When you don't interact, the fluid flows smoothly, colors are rich and saturated, and ink drops leave deep, lasting marks. Time feels slow and meaningful.
- **Turbulent State (Distracted)**: When you drag your mouse rapidly, you inject chaos into the system. The fluid becomes turbulent, colors desaturate, and drops fade quickly. Time feels fast and forgettable.

<div align="center">

This creates a feedback loop: **your interaction changes the visualization, and the visualization reflects your attention**.

</div>

---

## Project Structure

```
/EphemeralTime/
│
├── index.html           # Project entry point
├── style.css            # Canvas and overall layout styles
├── sketch.js            # p5.js main application (setup(), draw(), Application class)
├── .gitignore           # Git ignore file settings
├── README.md            # Project documentation
│
├── js/
│   ├── config.js        # Central configuration for all parameters
│   ├── sketch.js        # Legacy p5.js sketch (alternative implementation)
│   │
│   ├── Clock.js         # Time tracking and event emission (seconds, minutes, hours, chimes)
│   ├── ColorManager.js  # Time-based color gradients with turbulence modulation
│   ├── Audio.js         # Generative audio synthesis (drop sounds, ambient, chimes)
│   │
│   ├── Fluid.js         # Perlin Noise fluid simulation with turbulence system
│   ├── CymaticPattern.js # Visual representation of sound waves (chime ripples)
│   │
│   ├── InkDrop.js       # Individual ink drop class (extends Particle)
│   ├── InkDrip.js       # Dripping ink trails from larger drops (extends Particle)
│   ├── SunDrop.js       # Special hourly marker that drifts across the screen
│   │
│   ├── core/            # Core architecture components
│   │   ├── Container.js      # Dependency Injection Container (IoC)
│   │   ├── ObjectPool.js     # Object pooling for performance optimization
│   │   ├── Particle.js       # Base class for all movable entities
│   │   ├── ParticleFactory.js # Factory for creating particles with DI
│   │   └── Renderable.js     # Interface for drawable objects
│   │
│   └── rendering/       # Rendering strategy implementations
│       ├── StampRenderer.js    # Oriental brush stamp rendering
│       └── SplatterRenderer.js # Splatter particle rendering
│
├── lib/                 # External libraries
│   ├── p5.min.js        # p5.js library (minified)
│   └── p5.sound.min.js  # p5.sound library (minified)
│
├── sounds/              # Audio files (currently unused, generative synthesis used)
│
└── concept/             # Technical concept documentation
    └── concept.md       # Detailed architectural breakdown
```

---

## Core Features

### 1. **The Sun Drop (Hourly Readability)**
- A bright, radiant drop appears at the top of every hour
- It drifts slowly from left to right over 60 minutes, mimicking the sun's journey
- Creates a "repulsion field" that pushes other drops away
- Provides an intuitive, non-numerical way to read the approximate time

### 2. **Chime Drops (Quarter-Hour Markers)**
- Special drops appear at 15, 30, and 45 minutes past the hour
- Each chime creates a powerful **ripple effect** that visibly disturbs the entire canvas
- A distinct, bell-like synthesized sound plays
- Provides rhythmic anchors within the hour

### 3. **The Turbulence System (Attention Feedback)**
- Mouse velocity is tracked in real-time
- Fast, chaotic movements inject "turbulence" into the fluid
- Turbulence affects:
  - **Fluid dynamics**: Less viscous, faster flow
  - **Color**: Desaturation (vivid → gray)
  - **Audio**: More complex, dissonant ambient soundscape
- Turbulence decays slowly when you stop interacting
- **This is the heart of the subjective time experience**

### 4. **Time Management (Clock.js)**
- System time tracking
- Event emission for seconds, minutes, hours, and quarter-hour chimes
- Decoupled from rendering for modularity

### 5. **Ink Drops (InkDrop.js)**
- Individual ink drops with state management (position, size, color, opacity, lifespan)
- Movement influenced by the fluid field
- Gradually fade and transition to "stains" on the history layer

### 6. **Fluid Simulation (Fluid.js)**
- Perlin Noise based vector field
- Mouse interaction creates vortex effects
- Turbulence system modulates flow properties
- Repulsion forces from the Sun Drop

### 7. **Generative Audio (Audio.js)**
- Synthesized drop sounds (pitch varies by minute)
- Ambient soundscape (filter modulated by turbulence)
- Chime sounds for quarter-hour events
- No audio files required; all sounds are generated in real-time

### 8. **Cymatic Patterns (CymaticPattern.js)**
- Visual representation of sound waves from chime events
- Creates expanding ripple rings that physically interact with the fluid
- Ring count corresponds to time significance: 15min (3 rings), 30min (6 rings), 45min (9 rings)
- Synesthetic experience where sound becomes a visible, tangible force

### 9. **Object Pooling (ObjectPool.js)**
- Performance optimization pattern for particle management
- Reduces GC pressure by 50-70% through object reuse
- Pre-allocates particle instances for smoother frame rates
- Automatic cleanup of dead particles

### 10. **Dependency Injection Container (Container.js)**
- Enterprise-grade modularity with IoC pattern
- Single source of truth for all service dependencies
- Lazy initialization of services
- Easy testing and mocking capabilities
- Eliminates global variables (except container itself)

### 11. **Rendering Strategies (StampRenderer.js, SplatterRenderer.js)**
- Strategy Pattern for flexible rendering algorithms
- **StampRenderer**: Oriental brush stamp effect with fiber texture for permanent marks
- **SplatterRenderer**: Dynamic splatter particles with velocity-based distribution
- Swappable rendering strategies for different visual effects

### 12. **Ink Drips (InkDrip.js)**
- Trailing ink drops from larger particles
- Gravity + fluid flow physics simulation
- Gradual fade-in stamp effect on history layer
- Represents the "bleeding" of time moments

---

## Visual Layer Structure (Performance Optimization)

**Using 3 `p5.Graphics` layers to efficiently handle thousands of objects:**

| Layer | Name | Role | Update Frequency |
|-------|------|------|-----------------|
| 1 | `bgLayer` | Background (paper texture) | setup() / every hour |
| 2 | `historyLayer` | Accumulated ink stains (past) | when ink drops "die" |
| 3 | `activeLayer` | Active drops and Sun Drop (current) | every frame |

**Rendering Order:** bgLayer → historyLayer → activeLayer

---

## How to Experience It

### Reading the Time
- **The Sun**: Look at the position of the bright, radiant drop at the top. Left = early in the hour, middle = half-past, right = approaching the next hour.
- **Chime Drops**: Every quarter-hour (15, 30, 45), you'll see a golden drop create a ripple and hear a chime sound.
- **Color**: The hue of second drops changes gradually over each minute, cycling through the 60-step gradient.

### Interacting with Your Attention
- **Don't Touch**: Watch the calm, focused state. Colors are vivid, movements are graceful.
- **Drag Slowly**: Create gentle vortices in the fluid.
- **Drag Rapidly**: Inject turbulence. Watch colors desaturate, drops fade faster, and the ambient sound become more complex.
- **Stop**: Observe how the turbulence slowly decays, and the system returns to a calm state.

<div align="center">

**The visualization becomes a mirror of your own attentional state.**

</div>

---

## Time-based Color Palette

The color of each second drop is determined by the current minute (0-59), following a smooth gradient:

| Time Period | Approximate Color Range |
|-------------|------------------------|
| 00:00-14:59 | Blue → Cyan |
| 15:00-29:59 | Cyan → Green → Yellow |
| 30:00-44:59 | Yellow → Orange |
| 45:00-59:59 | Orange → Red |

**Turbulence Effect**: Colors desaturate (become grayer) as turbulence increases, representing the "fading" of memorable moments during distraction.
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
- [x] Clock.js implementation
- [x] InkDrop.js implementation
- [x] InkDrip.js implementation
- [x] Fluid.js implementation
- [x] sketch.js main logic implementation
- [x] HTML & CSS writing
- [x] Audio.js implementation
- [x] Core architecture (Container, ObjectPool, Particle, ParticleFactory)
- [x] Rendering strategies (StampRenderer, SplatterRenderer)
- [x] CymaticPattern.js implementation
- [x] ColorManager.js implementation
- [x] SunDrop.js implementation
- [ ] Hour cleansing effect detail adjustment
- [ ] Performance optimization and profiling

---

## How to Run

1. Open project directory
2. Run local server (e.g., `python -m http.server 8000`)
3. Access `http://localhost:8000` in browser

---

## Architecture Highlights

### Design Patterns Used

- **Dependency Injection (IoC Container)**: All services managed through Container.js
- **Object Pool Pattern**: Particle reuse for performance (50-70% GC reduction)
- **Factory Pattern**: Centralized particle creation via ParticleFactory
- **Strategy Pattern**: Swappable rendering algorithms (Stamp/Splatter)
- **Template Method Pattern**: Particle base class with hook methods
- **Observer Pattern**: Clock events for time-based triggers

### Performance Optimizations

- **3-Layer Graphics System**: Separates static (bg), semi-static (history), and dynamic (active) rendering
- **Object Pooling**: Reuses particle instances instead of constant allocation/deallocation
- **Lazy Initialization**: Services created only when needed
- **Shared Renderers**: Single instance of renderers shared across all particles

## Notes

- All modules are designed to be testable independently
- Graphic layers separated for performance optimization
- Structure upgradeable to GLSL shaders in the future
- Enterprise-grade architecture with clear separation of concerns
- Zero global variables (except Container singleton)
