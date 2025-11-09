# Architectural Refactoring & Core Principles (v2.0)

**Author:** Lead Engineer
**Status:** Complete
**Objective:** Transition the prototype from a monolithic, tightly-coupled structure to a scalable, maintainable, and service-oriented architecture. This document serves as the definitive guide to the v2.0 architecture for all current and future contributors.

---

### 1. Executive Summary: The "Why"

The initial prototype, while functional, suffered from critical architectural flaws that made it brittle and difficult to extend. All logic was centralized in `sketch.js`, creating a "God Object" that knew too much and did too much. Dependencies were implicit and scattered, making refactoring or adding new features a high-risk endeavor.

The v2.0 refactoring was executed with one primary goal: **To establish an enterprise-grade foundation based on Inversion of Control (IoC).** By decoupling components into self-contained, injectable services, we have created a system that is robust, testable, and immediately comprehensible to any developer familiar with modern software design patterns.

**Direct Quote:** *"We are no longer building a script; we are engineering a system. Every component must be responsible for a single, well-defined task and must be ignorant of the implementation details of its collaborators."*

---

### 2. The Core Architectural Pillars of v2.0

#### 2.1. The IoC Container (`js/core/Container.js`)

This is the heart of the new architecture. It is the **single source of truth** for service instantiation and dependency management.

-   **What it does:** The container creates and holds a single instance (Singleton pattern) of every core service (`Clock`, `Fluid`, `ParticleFactory`, etc.).
-   **Why it exists:** To eliminate global variables and manual dependency chaining. When a service needs another service (e.g., `ParticleFactory` needs `Fluid`), it simply receives it from the container during its construction. This is **Dependency Injection (DI)**.
-   **Onboarding Implication:** To understand the system's components, a developer only needs to look at `Container.js`. The entire object graph is defined in one place.

#### 2.2. The Factory Pattern (`js/core/ParticleFactory.js`)

Particle creation was previously a scattered responsibility. The factory centralizes this logic.

-   **What it does:** It is the sole authority responsible for creating, initializing, and managing pools of all particle types (`InkDrop`, `SunDrop`, etc.).
-   **Why it exists:**
    1.  **Decoupling:** Consumers (like `sketch.js`) no longer need to know *how* to construct a particle. They simply request one from the factory (e.g., `factory.createInkDrop()`).
    2.  **Centralized Dependency Management:** The factory is responsible for injecting all necessary dependencies (like `fluid`, `colorManager`) into the particles it creates.
    3.  **Performance:** It manages the **Object Pools**, significantly reducing garbage collection overhead by reusing particle objects instead of creating and destroying them constantly.

#### 2.3. The Abstract Base Class (`js/core/Particle.js`)

We introduced a `Particle` base class to enforce a common contract and share behavior.

-   **What it does:** Provides shared properties (`id`, `lifespan`, `pool`) and methods (`update`, `isDead`, `reset`).
-   **Why it exists:**
    1.  **Polymorphism:** All particles can be treated as a `Particle`, allowing the main loop to manage a single collection of heterogeneous objects.
    2.  **Code Reusability:** Common physics and lifecycle logic are defined once in the base class.
    3.  **Extensibility:** To create a new particle type, one simply extends `Particle` and implements the required `onReset`, `update`, and `render` logic.

#### 2.4. The `reset` / `onReset` Lifecycle for Object Pooling

This pattern is critical for performance.

-   **What it is:** Instead of destroying a "dead" particle, it is returned to its pool. When a new particle is requested, the factory retrieves an inactive one from the pool and calls `onReset()` to re-initialize its state (position, velocity, etc.).
-   **Why it matters:** In a simulation with thousands of short-lived objects, the JavaScript garbage collector can become a major bottleneck, causing frame rate drops. Object pooling effectively eliminates this problem.
-   **Direct Quote:** *"Treat objects as renewable resources, not disposable trash. The cost of creation is paid once; the cost of re-initialization is negligible."*

---

### 3. New Data & Control Flow

The flow is now event-driven and orchestrated, not monolithic.

1.  **Initialization:**
    -   `sketch.js` creates the `Container`.
    -   The `Container` instantiates and injects all services.

2.  **Runtime Loop (Example: A new second passes):**
    -   `Clock.js` detects the new second and `emit('second', { time })`.
    -   `sketch.js` has a listener: `this.clock.on('second', ...)`.
    -   The handler calls `this.particleFactory.createInkDrop(...)`.
    -   The `ParticleFactory` gets a recycled `InkDrop` from its pool, calls `onReset()` on it, and adds it to the active particle set.
    -   In the main `draw()` loop, `sketch.js` iterates through all active particles, calling `particle.update()` and `particle.render()`.
    -   The `InkDrop`'s `update()` method interacts with the `Fluid` service to calculate its next position.

---

### 4. Guide for New Contributors

To add a new feature, embrace the existing patterns. **Do not modify `sketch.js` to add new logic if it can be encapsulated in a service.**

**Example: Adding a new "Sparkle" particle.**

1.  **Create `js/Sparkle.js`:** Extend `Particle`. Implement its unique `update` and `render` logic.
2.  **Update `ParticleFactory.js`:**
    -   Add an `ObjectPool` for sparkles.
    -   Create a `createSparkle()` method.
3.  **Update `Container.js`:** Register the new pool if needed.
4.  **Trigger from `sketch.js`:** In an appropriate event handler (e.g., a new `clock` event), call `this.particleFactory.createSparkle()`.

By following this decoupled process, your changes will be localized, predictable, and aligned with the project's core architectural principles.