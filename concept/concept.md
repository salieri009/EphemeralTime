# Ephemeral Time: A Technical Concept Document

## 1. Project Vision & Core Metaphor

**Vision**: To create a clock that visualizes the *subjective* and *psychological* nature of time, moving beyond objective, mechanical representation. The artefact becomes a mirror of the user's own attention and focus.

**Core Metaphor**: Time is a **"Reservoir of Attention."** The canvas is not merely paper, but a fluid reservoir representing our mental state. Each moment is a drop of ink, but the way it behaves and the marks it leaves depend on the state of the reservoir—calm and focused, or turbulent and distracted. The clock reflects how we *spend* our time, our most valuable resource.

---

## 2. System Architecture: A Modular Approach

The system is designed with a clear separation of concerns, enabling modularity and scalability. Each component has a distinct responsibility:

- **`sketch.js` (Orchestrator)**: The main p5.js sketch that initializes all modules and manages the main render loop. It acts as the central hub connecting all other components.
- **`Clock.js` (The Timekeeper)**: Responsible for tracking system time and emitting events for seconds, minutes, hours, and quarter-hour "chimes." It decouples time logic from rendering.
- **`InkDrop.js` (The Actor)**: Represents a single drop of ink. It manages its own lifecycle, including its position, size, color, and fade-out behavior. It is a self-contained entity.
- **`SunDrop.js` (The Celestial Marker)**: A unique actor representing the hour. It moves independently of the fluid, providing a clear, non-numerical representation of the hour's progression.
- **`Fluid.js` (The Environment / State of Mind)**: Simulates the physics of the "attention reservoir." It generates a vector field that dictates the movement of `InkDrop` instances and whose properties (turbulence, viscosity) change based on user interaction, reflecting the user's state of focus.
- **`ColorManager.js` (The Artist)**: Manages the entire color palette. It provides colors for drops and modulates saturation based on the fluid's turbulence.
- **`Audio.js` (The Sound Designer)**: Manages generative audio. It creates sounds for drops and an evolving ambient soundscape that reflects the current state of the attention reservoir.
- **`config.js` (The Rulebook)**: A centralized configuration file for all magic numbers and tunable parameters.

---

## 3. Key Conceptual & Implementation Pillars

### 3.1. Pillar 1: The "Sun" Drop (Hourly Readability)
To make the clock intuitively readable without numbers, a special hourly marker provides a macro-level view of time's passage.

-   **Concept**: At the top of every hour, a single, bright "Sun" drop appears. It drifts slowly across the top of the screen over the course of the 60 minutes, mimicking the sun's journey across the sky.
-   **Implementation**: A new `SunDrop.js` class will manage this actor. Its `x` position will be directly mapped to the current minute, making it independent of the fluid simulation. It will have a unique radiant visual and will gently repel other drops, signifying its importance.
-   **UX Payoff**: Provides an immediate, glanceable way to gauge the approximate time within the hour (e.g., "the sun is halfway across, so it's about half-past").

### 3.2. Pillar 2: The "Chime" Drops (Rhythmic Anchors)
To punctuate the flow of time and add further structure, quarter-hour events create noticeable, rhythmic disturbances.

-   **Concept**: At 15, 30, and 45 minutes past the hour, a "Chime" drop appears. Its defining characteristic is the **ripple effect** it creates upon entering the reservoir.
-   **Implementation**: The `Clock.js` emits a `chime` event. The resulting drop is configured in `config.js` to trigger a radial force in `Fluid.js`, creating a visible wave that expands outwards.
-   **UX Payoff**: These periodic ripples act as temporal signposts, making the passage of time feel more structured and rhythmic. They are moments of punctuation in the otherwise continuous flow.

### 3.3. Pillar 3: The Fluid as "Attention" (Interactive Depth)
This is the core of the subjective experience. The fluid's behavior is a direct reflection of the user's interaction, representing their state of focus.

-   **Concept**:
    *   **Calm State (High Focus)**: With no user interaction, the fluid is slow and viscous. Drops move gracefully and leave clear, lasting stains. The audio is a simple, meditative tone. This represents a focused mind.
    *   **Turbulent State (Low Focus)**: When the user interacts by dragging the mouse, they introduce chaos. The fluid becomes faster and less viscous, and colors desaturate. Drops diffuse quickly, leaving fainter marks. The audio becomes more complex and dissonant. This represents a distracted mind where time feels faster and less memorable.
-   **Implementation**: User mouse velocity will be measured in `sketch.js`. This "turbulence" value will be passed to `Fluid.js` to modify its viscosity and diffusion parameters, and to `ColorManager.js` and `Audio.js` to modulate saturation and sound complexity.
-   **UX Payoff**: The interaction model is elevated from simple physics play to a meaningful feedback loop. The user sees a direct reflection of their own attentional state, creating a powerful, personal, and deeply engaging experience that fulfills the brief's highest ambitions.
