# Ephemeral Time: A Technical & Philosophical Concept (v2.0)

## 1. Project Vision & Core Metaphor

**Vision**: To create a clock that visualizes the *subjective* and *psychological* nature of time, moving beyond objective, mechanical representation. The artefact becomes a mirror of the user's own attention and focus.

**Core Metaphor**: Time is a **"Reservoir of Attention."** The canvas is not merely paper, but a fluid reservoir representing our mental state. Each moment is a drop of ink, but the way it behaves and the marks it leaves depend on the state of the reservoir—calm and focused, or turbulent and distracted. The clock reflects how we *spend* our time, our most valuable resource.

---

## 2. System Architecture: Enterprise-Grade Modularity (v2.0)

The system is designed with an **Inversion of Control (IoC) Container**, promoting extreme modularity and scalability. Each component has a distinct responsibility and receives its dependencies from the container.

- **`Container.js` (The Single Source of Truth)**: Manages the lifecycle and dependencies of all services. Eliminates global variables and provides a clear architectural overview.
- **`sketch.js` (The Orchestrator)**: Initializes the container and runs the main application loop. It requests services from the container and coordinates their interactions.
- **`Clock.js` (The Objective Timekeeper)**: Emits objective time events (second, minute, hour, chime). It represents the universal, unchanging flow of time.
- **`ParticleFactory.js` (The Creator)**: A centralized factory for creating all particle types (`InkDrop`, `InkDrip`, `SunDrop`). It injects all necessary dependencies into the particles it creates.
- **`Particle.js` (The Abstract Actor)**: A base class providing core physics, lifecycle management, and hooks for extension.
- **`InkDrop.js` (The Subjective Trace)**: Represents a single moment (a drop of ink). Its behavior (movement, trail, lifespan) is a product of its interaction with the environment (the fluid).
- **`SunDrop.js` (The Celestial Marker)**: A unique particle representing the hour's progression, independent of the fluid. It repels other drops, creating a "sacred space" for objective time.
- **`Fluid.js` (The Environment / State of Mind)**: Simulates the "attention reservoir." Its turbulence and viscosity are direct reflections of the user's focus.
- **`ColorManager.js` (The Alchemist)**: Manages the color palette, simulating fountain pen ink chemistry. It translates time and turbulence into color.
- **`Audio.js` (The Sound Designer)**: Generates real-time audio to sonify time, making it perceivable without looking.
- **`config.js` (The Rulebook)**: Centralized configuration for all tunable parameters.

---

## 3. Key Conceptual & Implementation Pillars (v2.0)

### 3.1. Pillar 1: The "Sun" Drop & Repulsion (Objective vs. Subjective)
-   **Concept**: The Sun Drop moves predictably, representing objective time. It actively repels ink drops, symbolizing how our subjective experiences ("ink drops") can't alter the relentless march of objective time.
-   **Implementation**: `SunDrop.js` has a `getRepulsionForce()` method. `InkDrop.js` calls this within its physics update, creating a dynamic interaction.
-   **UX Payoff**: Provides a clear, non-numerical way to gauge the hour while reinforcing the core theme.

### 3.2. Pillar 2: Cymatics & Chimes (Seeing the Sound of Time)
-   **Concept**: At 15, 30, and 45 minutes, a "Chime" event occurs. This doesn't just create a sound; it creates a *visible sound wave* (Cymatics) that physically interacts with the fluid.
-   **Implementation**: `CymaticPattern.js` generates expanding rings. Its `update()` method returns the active wave fronts, which are passed to `Fluid.applyCircularForce()` to create a tangible ripple in the ink.
-   **UX Payoff**: A profound synesthetic experience where time is not just heard, but seen and felt as a physical force.

### 3.3. Pillar 3: The Fluid as "Attention" (Interactive Depth & Inertia)
-   **Concept**: The fluid's behavior is a direct reflection of the user's focus.
    *   **Calm State (High Focus)**: With no interaction, the fluid is viscous. Drops leave clear, lasting stains. The audio is meditative.
    *   **Turbulent State (Low Focus)**: Mouse interaction introduces chaos. The fluid becomes less viscous, colors desaturate, and drops diffuse quickly. The audio becomes more complex.
-   **Implementation**: User mouse velocity updates a `targetTurbulence` value in `Fluid.js`. The actual `turbulence` smoothly interpolates towards the target, creating a natural **"attention inertia."** This value is then used to modulate viscosity, color, and audio.
-   **UX Payoff**: A meaningful feedback loop that reflects the user's mental state. The inertia makes the interaction feel more natural and less twitchy.

### 3.4. Pillar 4: Zen & Debug Modes (User Experience)
-   **Concept**: Allow the user to control their experience.
-   **Implementation**:
    -   **Zen Mode (`Z` key)**: Hides the numerical time display, encouraging the user to perceive time through the visualization alone.
    -   **Debug Mode (`D` key)**: Displays an overlay with performance metrics (FPS, particle counts, turbulence), aiding in development and optimization.
-   **UX Payoff**: Empowers the user, providing both a pure, immersive experience and a transparent, technical one.
