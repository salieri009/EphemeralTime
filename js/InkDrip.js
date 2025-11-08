/**
 * InkDrip.js (REFACTORED) - Dripping ink trails from larger drops
 * 
 * ARCHITECTURE:
 * - Extends Particle (consistent with InkDrop)
 * - Gravity + fluid flow physics
 * - Dependency Injection pattern
 * - Error handling with validation
 * 
 * Simulates ink bleeding/running along fluid flow + gravity
 * Inspired by water flowing down paper
 */
class InkDrip extends Particle {
    constructor(x, y, color, parentSize, dependencies = {}) {
        // Validate inputs
        if (typeof parentSize !== 'number' || parentSize <= 0) {
            throw new Error(`InkDrip: parentSize must be positive number, got ${parentSize}`);
        }
        
        const { config = CONFIG, fluid = null, stampRenderer = null } = dependencies;
        
        if (!config?.drops?.drip) {
            throw new Error('InkDrip: config.drops.drip is required');
        }
        
        // Drip configuration
        const dripConfig = config.drops.drip;
        const lifespan = dripConfig.lifespan || 300;
        
        // Call parent constructor
        super(x, y, lifespan, config);
        
        // Domain-specific properties
        this.color = color;
        this.parentSize = parentSize;
        this.fluid = fluid;
        this.stampRenderer = stampRenderer;
        
        // Size configuration
        this.startRadius = parentSize * (dripConfig.sizeRatio || 0.15);
        this.radius = this.startRadius;
        
        // Physics configuration
        this.maxSpeed = map(this.radius, 0, parentSize * 0.5, 1, dripConfig.maxSpeed || 2);
        this.gravityStrength = dripConfig.gravityStrength || 0.15;
        this.fluidInfluence = dripConfig.fluidInfluence || 0.3;
        this.wobble = dripConfig.wobble || 0.3;
        
        // Lifecycle
        this.fadeRate = dripConfig.fadeRate || 0.03;
        this.parentDied = false;
        this.hasBeenStamped = false;
    }

    onBeforeUpdate() {
        if (this.parentDied) {
            this.age += 1;
        }
    }

    onAfterUpdate() {
        let fadeRate = this.fadeRate;
        if (this.parentDied) {
            fadeRate *= 2;
        }
        this.radius -= fadeRate;
        
        if (this.radius <= 0 || this.pos.y > height + 50) {
            this.isDead = true;
        }
    }

    updatePhysics() {
        this.acc.set(0, 0);
        this.acc.add(createVector(0, this.gravityStrength));
        
        if (this.fluid && typeof this.fluid.getVectorAtWithOffset === 'function') {
            try {
                const fluidVector = this.fluid.getVectorAtWithOffset(
                    this.pos.x, this.pos.y,
                    this.noiseOffsetX, this.noiseOffsetY
                );
                if (fluidVector) {
                    this.acc.add(p5.Vector.mult(fluidVector, this.fluidInfluence));
                }
            } catch (error) {
                console.warn('InkDrip: fluid vector calculation failed', error);
            }
        }
        
        this.acc.add(createVector(random(-this.wobble, this.wobble) * 0.1, 0));
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.x > width) this.pos.x = 0;
    }

    display(layer) {
        if (this.isDead) return;
        
        try {
            layer.push();
            layer.noStroke();
            const alpha = map(this.radius, 0, this.startRadius, 0, 200);
            layer.fill(red(this.color), green(this.color), blue(this.color), alpha);
            layer.ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
            layer.pop();
        } catch (error) {
            console.error('InkDrip: display error', error);
        }
    }

    stampToHistory(historyLayer) {
        if (this.hasBeenStamped || this.radius <= 0) return;
        
        try {
            historyLayer.push();
            historyLayer.noStroke();
            const residueAlpha = 30;
            historyLayer.fill(
                red(this.color) * 0.7,
                green(this.color) * 0.7,
                blue(this.color) * 0.7,
                residueAlpha
            );
            historyLayer.ellipse(this.pos.x, this.pos.y, this.radius * 1.5, this.radius * 1.5);
            historyLayer.pop();
            this.hasBeenStamped = true;
        } catch (error) {
            console.error('InkDrip: stampToHistory error', error);
        }
    }

    shouldStamp() {
        return this.isDead && !this.hasBeenStamped && this.radius > 0.5;
    }

    notifyParentDied() {
        this.parentDied = true;
    }
}