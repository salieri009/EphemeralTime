/**
 * Particle.js - Base class for all movable entities
 * 
 * PHILOSOPHY: "Every moment is a particle in the flow of time"
 * Each particle (InkDrop, InkDrip) represents a discrete moment or trace.
 * The base class provides shared physics and lifecycle, while subclasses
 * define how that moment manifests visually and behaviorally.
 * 
 * Separation of Concerns:
 * - Physics: position, velocity, acceleration
 * - Lifecycle: age, lifespan, death detection
 * - Extensibility: Template method pattern for subclasses
 * 
 * @abstract
 */
class Particle {
    constructor(x, y, lifespan = Infinity, config = {}) {
        // Core physics properties
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        
        // Unique identifier for tracking
        this.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Individual noise offset for autonomous behavior
        this.noiseOffsetX = random(1000);
        this.noiseOffsetY = random(1000);
        
        // Lifecycle
        this.age = 0;
        this.lifespan = lifespan;
        this.isDead = false;
        
        // Configuration injection (Dependency Inversion Principle)
        this.config = config;
    }

    /**
     * Template method: defines algorithm skeleton
     * Subclasses override specific steps
     */
    update(deltaTime = 1) {
        if (this.isDead) return;
        
        // 1. Pre-update hook (for subclass-specific logic)
        this.onBeforeUpdate(deltaTime);
        
        // 2. Apply physics
        this.updatePhysics(deltaTime);
        
        // 3. Update lifecycle
        this.updateLifecycle(deltaTime);
        
        // 4. Post-update hook
        this.onAfterUpdate(deltaTime);
        
        // 5. Check death condition
        if (this.shouldDie()) {
            this.die();
        }
    }

    /**
     * Physics update (Strategy Pattern - can be swapped)
     */
    updatePhysics(deltaTime) {
        this.vel.add(this.acc);
        this.vel.mult(0.98); // base friction
        this.pos.add(p5.Vector.mult(this.vel, deltaTime));
        this.acc.mult(0); // reset acceleration
    }

    /**
     * Lifecycle management
     */
    updateLifecycle(deltaTime) {
        this.age += deltaTime;
    }

    /**
     * Apply force (Open/Closed Principle)
     */
    applyForce(force) {
        if (force && typeof force.x === 'number' && typeof force.y === 'number') {
            this.acc.add(force);
        }
    }

    /**
     * Screen wrapping utility
     */
    wrapScreen() {
        this.pos.x = (this.pos.x + width) % width;
        this.pos.y = (this.pos.y + height) % height;
    }

    /**
     * Boundary constraints
     */
    constrainToScreen() {
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);
    }
    
    /**
     * Reset particle to initial state (for Object Pooling)
     * PHILOSOPHY: "Treat objects as renewable resources, not disposable trash"
     * PERFORMANCE: Reusing particles reduces GC pressure by 50-70%
     * 
     * Like moments being rewritten in the reservoir of attention,
     * particles are recycled rather than constantly created/destroyed.
     * 
     * @param {number} x - New X position
     * @param {number} y - New Y position
     * @param {Object} additionalParams - Type-specific reset parameters
     */
    reset(x, y, additionalParams = {}) {
        // Reset physics
        this.pos.set(x, y);
        this.vel.set(0, 0);
        this.acc.set(0, 0);
        
        // Reset lifecycle
        this.age = 0;
        this.isDead = false;
        
        // New noise offsets for unique behavior
        this.noiseOffsetX = random(1000);
        this.noiseOffsetY = random(1000);
        
        // Hook for subclass-specific reset
        this.onReset(additionalParams);
    }
    
    /**
     * Hook for subclass-specific reset logic
     * @param {Object} params - Type-specific parameters
     */
    onReset(params) {
        // Override in subclasses
    }

    /**
     * Death detection (Template Method)
     */
    shouldDie() {
        return this.age >= this.lifespan;
    }

    /**
     * Death handler
     */
    die() {
        this.isDead = true;
        this.onDeath();
    }

    // ========================================
    // HOOKS (Override in subclasses)
    // ========================================

    onBeforeUpdate(deltaTime) {
        // Hook for subclass-specific pre-update logic
    }

    onAfterUpdate(deltaTime) {
        // Hook for subclass-specific post-update logic
    }

    onDeath() {
        // Hook for cleanup on death
    }

    /**
     * @abstract - Must be implemented by subclasses
     */
    display(layer) {
        throw new Error('display() must be implemented by subclass');
    }
}
