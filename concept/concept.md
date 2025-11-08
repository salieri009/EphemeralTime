# Ephemeral Time: A Technical Concept Document

## 1. Project Vision & Core Metaphor

**Vision**: To transform the abstract, intangible concept of time into a tangible, interactive, and aesthetically pleasing experience.

**Core Metaphor**: Time is visualized as ink drops falling onto a paper-like canvas. Each moment is a drop, and the passage of time is represented by the accumulation and diffusion of these drops, leaving behind a history of what has passed.

---

## 2. System Architecture: A Modular Approach

The system is designed with a clear separation of concerns, enabling modularity and scalability. Each component has a distinct responsibility:

- **`sketch.js` (Orchestrator)**: The main p5.js sketch that initializes all modules and manages the main render loop. It acts as the central hub connecting all other components.
- **`Clock.js` (The Timekeeper)**: Responsible for tracking system time and emitting events for seconds, minutes, and hours. It decouples time logic from rendering.
- **`InkDrop.js` (The Actor)**: Represents a single drop of ink. It manages its own lifecycle, including its position, size, color, and fade-out behavior. It is a self-contained entity.
- **`Fluid.js` (The Environment)**: Simulates the physics of the canvas. It generates a Perlin noise-based vector field that dictates the movement of all `InkDrop` instances, creating an organic, fluid-like motion.
- **`ColorManager.js` (The Artist)**: Manages the entire color palette of the visualization. It provides colors for drops based on the current time (e.g., the 60-step gradient for minutes).
- **`Audio.js` (The Sound Designer)**: Manages generative audio synthesis. It creates sound effects for drop creation and an evolving ambient soundscape based on the state of the canvas.
- **`config.js` (The Rulebook)**: A centralized configuration file for all magic numbers and tunable parameters, from drop sizes to color values and physics constants.

---

## 3. Key Technical & Conceptual Pillars

### 3.1. Temporal Hierarchy System
Time is not linear but hierarchical. This is represented through three scales of `InkDrop` instances:

- **Seconds**: The base unit. Small, frequent drops that create a constant rhythm.
- **Minutes**: A significant event. A medium-sized drop (e.g., 6x larger) that introduces a more noticeable change.
- **Hours**: A major reset. A very large drop (e.g., 36x larger) that washes over a large portion of the canvas, signifying a major temporal shift.

### 3.2. Ephemeral Stains (The Residue System)
A core concept is that the past is never truly gone.
- **Implementation**: Instead of fading to full transparency, an `InkDrop` transitions to a low-opacity "stain" state at the end of its primary lifecycle.
- **Performance**: To avoid re-rendering hundreds of faded stains every frame, these stains are "stamped" onto a persistent `historyLayer` (a `p5.Graphics` object). The active drops are rendered on a separate `activeLayer`. The final image is a composite of `backgroundLayer`, `historyLayer`, and `activeLayer`.

### 3.3. Interactive Fluid Dynamics
The canvas is not a static background but a dynamic fluid field.
- **Simulation**: `Fluid.js` uses Perlin noise to generate a 2D vector field. Each frame, the time dimension of the noise function is incremented, causing the field to evolve organically.
- **User Interaction**: When the user drags their mouse, a force is applied to the fluid field at the mouse's position. This creates vortices and disturbances that `InkDrop` instances realistically react to, allowing the user to "play" with the flow of time.

### 3.4. Generative Color System
Color is a primary carrier of temporal information.
- **Minute Gradient**: The `ColorManager` generates a 60-step color gradient (e.g., Blue → Yellow → Red). The color of each "second" drop is determined by the current minute, providing an intuitive, non-numerical representation of time.
- **Drop-Type Variation**: The brightness or saturation of a drop's color can vary based on its type (second, minute, or hour) to give it a distinct visual identity.

---

## 4. New Feature Concept: Ink Splatter Effect

### 4.1. Conceptual Goal
To enhance the physical realism and visual satisfaction of a new drop's appearance. When a drop "lands" on the canvas, it should create a small, explosive splatter, mimicking the real-world physics of liquid impact.

### 4.2. Proposed Implementation
This can be implemented as a sub-system within the `InkDrop` class or as a separate `SplatterParticle` class.

1.  **Trigger**: When a new `InkDrop` is created (especially for larger `minute` and `hour` drops).
2.  **Particle Generation**: Generate a small number (e.g., 5-15) of tiny, secondary particles around the main drop's impact point.
3.  **Particle Physics**:
    *   **Initial Velocity**: Give each particle a high initial velocity directed outwards from the impact center. The angle and speed should have a random component.
    *   **No Fluid Interaction**: To maintain performance, these tiny particles should *not* be affected by the `Fluid.js` vector field. They follow a simple ballistic trajectory (initial velocity + gravity/drag).
    *   **Short Lifespan**: These particles should have a very short lifespan (e.g., 0.5-1 second) and fade out completely, without leaving a stain.
4.  **Rendering**: Splatter particles can be rendered directly on the `activeLayer` along with the main drops.

This effect will add a layer of dynamic, high-frequency detail that contrasts with the slow, flowing movement of the main drops, enriching the overall visual texture.