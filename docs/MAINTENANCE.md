# Project Maintenance & Onboarding Guide (v2.0)

**Audience:** All Developers & Future Contributors
**Purpose:** This document provides a practical guide for extending and maintaining the Ephemeral Time project. It assumes a baseline understanding of the v2.0 architecture.

---

## 1. Core Philosophy: "Contribute, Don't Complicate"

This project is built on a foundation of **decoupling** and **clear ownership**. The Inversion of Control (IoC) architecture is not just a pattern; it's a contract. Every service has a single responsibility, and it is ignorant of the implementation details of its collaborators.

**Your primary directive as a contributor is to uphold this contract.** Before adding code, ask yourself:
-   "Which existing service owns this responsibility?"
-   "If none, does this warrant a new, self-contained service?"
-   "Am I introducing a new dependency, or can I leverage existing events and services?"

Resist the urge to add logic directly into `sketch.js`. The orchestrator's role is to coordinate, not to *do*.

---

## 2. Onboarding: The Developer's Golden Path

To get up to speed, follow this sequence. Do not skip steps.

1.  **Read `IMPLEMENTATION_SUMMARY.md`**: This is your executive briefing. It explains the *business case* for the v2.0 refactor and connects our technical achievements to the project's conceptual goals.

2.  **Read `concept.md`**: This is the system blueprint. It details the high-level architecture and the role of each core service (`Container`, `ParticleFactory`, `Fluid`, etc.).

3.  **Read `REFACTORING_PROGRESS.md`**: This is the deep-dive engineering log. It provides the "direct quotes" and rationale from the lead engineer on *why* we chose specific patterns like IoC, Factories, and Object Pooling. **This is mandatory reading to understand our engineering culture.**

4.  **Browse the Code (`/js` directory)**: With the architectural context from the documents, navigate the service modules. Pay special attention to the constructor of each service to see dependency injection in action and the `// PHILOSOPHY:` comments, which bridge the gap between code and concept.

---

## 3. How to Add a New Feature: A Practical Walk-through

The architecture is designed for predictable, low-risk extension. Let's walk through the most common task: adding a new particle type.

**Scenario:** We want to add a `Sparkle` particle that appears on a new `quarterHour` event.

### Step 1: Define the Actor (`js/Sparkle.js`)
Create the class. It **must** extend the `Particle` base class to inherit core lifecycle and physics logic.

```javascript
// In: js/Sparkle.js
import { Particle } from './core/Particle.js';

export class Sparkle extends Particle {
    constructor(id, pool, config, fluid, colorManager) {
        // The base constructor handles ID, pool reference, and lifespan.
        super(id, pool, config.lifespan);

        // Store injected dependencies.
        this.config = config;
        this.fluid = fluid;
        this.colorManager = colorManager;
    }

    /**
     * The re-initialization hook for the Object Pool.
     * This is called by the factory instead of the constructor.
     */
    onReset(x, y, angle) {
        super.onReset(x, y, angle); // Handles position, velocity, etc.
        
        // Reset sparkle-specific properties here.
        this.size = Math.random() * this.config.maxSize;
        this.brightness = 1.0;
    }

    update() {
        // Implement unique behavior.
        this.brightness -= 0.01;
        
        // Always call the parent update() to apply fluid forces and handle lifespan.
        super.update();
    }

    render(ctx) {
        if (this.isDead()) return;
        // Implement unique rendering logic.
        ctx.fillStyle = `rgba(255, 255, 200, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

### Step 2: Update the Factory (`js/core/ParticleFactory.js`)
The factory is the only place where particles are created.

```javascript
// In: js/core/ParticleFactory.js
// ...
import { Sparkle } from '../Sparkle.js'; // 1. Import the new class.

export class ParticleFactory {
    constructor(container) {
        // ... existing dependencies
        
        // 2. Create a dedicated Object Pool for the new particle type.
        this.sparklePool = new ObjectPool(
            (id, pool) => new Sparkle(id, pool, this.config.particles.sparkle, this.fluid, this.colorManager),
            this.config.pools.sparkle
        );
    }

    // 3. Create a public method to produce the new particle.
    createSparkle(x, y, angle = 0) {
        const sparkle = this.sparklePool.get();
        if (sparkle) {
            sparkle.onReset(x, y, angle);
            this.activeParticles.add(sparkle);
            return sparkle;
        }
        return null; // Pool might be exhausted.
    }
    // ...
}
```

### Step 3: Update Configuration (`config.js`)
Add a configuration block for the new particle. This allows for tuning without code changes.

```javascript
// In: config.js
export const config = {
    // ...
    particles: {
        // ...
        sparkle: {
            lifespan: 100,
            maxSize: 3,
        }
    },
    pools: {
        // ...
        sparkle: 50, // Maximum number of concurrent sparkles.
    }
};
```

### Step 4: Orchestrate the Trigger (`sketch.js`)
Finally, tell the system *when* to create the new particle by listening to an event.

```javascript
// In: sketch.js
// In the Application class constructor or an init method...

// Assuming a 'quarterHour' event is emitted from Clock.js
this.clock.on('quarterHour', (data) => {
    const factory = this.container.get('particleFactory');
    const { x, y } = this.calculateChimePosition(data.minute);
    factory.createSparkle(x, y);
});
```

This process isolates changes, leverages existing patterns, and ensures the system remains stable and predictable. Welcome to the team.
