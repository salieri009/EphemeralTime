/**
 * InkDrop.js (REFACTORED) - Individual ink drop class
 * 
 * ARCHITECTURE:
 * - Extends Particle (physics + lifecycle abstraction)
 * - Uses Strategy Pattern for rendering (StampRenderer, SplatterRenderer)
 * - Dependency Injection (config, renderers, fluid)
 * - Separation of Concerns: physics, rendering, lifecycle decoupled
 * 
 * Represents ink drops generated at 3 scales: second (1x), minute (6x), hour (36x)
 */
class InkDrop extends Particle {
    constructor(x, y, color, type = 'second', dependencies = {}) {
        // Destructure dependencies (Dependency Injection)
        const {
            config = CONFIG,
            stampRenderer = null,
            splatterRenderer = null,
            fluid = null
        } = dependencies;

        // Calculate properties based on type
        const baseSize = config.drops.second.baseSize;
        let size, lifespan, opacity;

        if (type === 'minute') {
            size = baseSize * config.drops.minute.sizeMultiplier;
            lifespan = config.drops.minute.lifespan;
            opacity = config.drops.minute.opacity;
        } else if (type === 'hour') {
            size = baseSize * config.drops.hour.sizeMultiplier;
            lifespan = config.drops.hour.lifespan;
            opacity = config.drops.hour.opacity;
        } else {
            // second (default)
            size = baseSize;
            lifespan = config.drops.second.lifespan;
            opacity = config.drops.second.opacity;
        }

        // Call parent constructor (Particle)
        super(x, y, lifespan, config);

        // Domain-specific properties
        this.color = color;
        this.type = type;
        this.targetSize = size;
        this.initialSize = size;
        this.initialOpacity = opacity;
        this.opacity = opacity;

        // Birth animation properties
        this.birthAge = 0;
        this.birthDuration = 6; // frames (0.1 sec @ 60fps)
        this.size = this.targetSize * 0.1; // start at 10% for explode-in effect

        // Stamp state
        this.hasBeenStamped = false;

        // Drip generation state
        this.canDrip = (type === 'minute' || type === 'hour');
        this.dripTimer = 0;
        this.dripInterval = config.drops.drip?.interval || 15;
        this.childDrips = [];

        // Injected dependencies
        this.stampRenderer = stampRenderer || new StampRenderer(config.drops.stamp);
        this.splatterRenderer = splatterRenderer || new SplatterRenderer(config.drops.splatter);
        this.fluid = fluid;

        // Generate initial splatter using renderer
        this.splatterParticles = this.splatterRenderer.generateSplatter(
            x, y,
            this.initialSize,
            this.vel
        );
    }

    // ==================== LIFECYCLE HOOKS (Template Method Pattern) ====================

    /**
     * Hook: Execute before physics update
     * Handles drip generation logic
     */
    onBeforeUpdate() {
        // Birth animation
        this.birthAge++;
        if (this.birthAge <= this.birthDuration) {
            this._updateBirthAnimation();
        }

        // Drip generation (only after birth)
        if (this.birthAge > this.birthDuration && this.canDrip && this.config.drops.drip?.enabled) {
            this.dripTimer++;
            if (this.dripTimer >= this.dripInterval) {
                const drip = this._createDrip();
                if (drip) {
                    // Notify external system (observer pattern potential)
                    this.dripTimer = 0;
                }
            }
        }
    }

    /**
     * Hook: Execute after physics update
     * Handles aging, fading, size reduction
     */
    onAfterUpdate() {
        // Opacity fade: linear interpolation from initial to residue
        const fadeProgress = this.age / this.lifespan;
        
        if (fadeProgress >= 1.0) {
            // Fully aged: hold at residue opacity
            this.opacity = this.config.performance.stainFade.residueOpacity;
            this.size = this.targetSize * 0.7;
        } else {
            // Fading
            const residueOpacity = this.config.performance.stainFade.residueOpacity;
            this.opacity = this.initialOpacity - (this.initialOpacity - residueOpacity) * fadeProgress;
            
            // Size reduction (only after birth)
            if (this.birthAge > this.birthDuration) {
                this.size = this.targetSize * (1 - fadeProgress * 0.5);
            }
        }
    }

    /**
     * Hook: Execute on death
     * Cleanup child drips
     */
    onDeath() {
        this._markChildDripsForCleanup();
    }

    // ==================== CUSTOM PHYSICS (Override parent method) ====================

    /**
     * Override: Custom physics for ink drops
     * Applies fluid force + additional forces (e.g., sun repulsion)
     */
    updatePhysics() {
        // Reset acceleration
        this.acc.set(0, 0);

        // Get fluid vector using individual noise offsets (autonomous movement)
        if (this.fluid && typeof this.fluid.getVectorAtWithOffset === 'function') {
            const fluidVector = this.fluid.getVectorAtWithOffset(
                this.pos.x,
                this.pos.y,
                this.noiseOffsetX,
                this.noiseOffsetY
            );
            
            if (fluidVector) {
                this.acc.add(p5.Vector.mult(fluidVector, 0.1)); // subtle influence
            }
        }

        // Additional forces can be added here
        // (e.g., sun repulsion - could be injected as force provider)

        // Standard physics
        this.vel.add(this.acc);
        this.vel.mult(0.95); // viscosity
        this.pos.add(this.vel);

        // Screen wrapping
        this.wrapScreen();
    }

    // ==================== RENDERING (Abstract display() implementation) ====================

    /**
     * Required by Particle: Render this drop on active layer
     */
    display(layer) {
        layer.push();
        layer.noStroke();

        const birthProgress = Math.min(1, this.birthAge / this.birthDuration);
        const fadeProgress = Math.min(1, this.age / this.lifespan);

        // Render splatter using renderer
        const splatterOpacity = map(fadeProgress, 0, 1, 1, 0.3);
        this.splatterRenderer.renderSplatter(
            layer,
            this.pos.x,
            this.pos.y,
            this.splatterParticles,
            this.color,
            this.opacity * splatterOpacity * birthProgress
        );

        // Render main drop
        layer.fill(red(this.color), green(this.color), blue(this.color), this.opacity);
        layer.ellipse(this.pos.x, this.pos.y, Math.max(this.size, 2));

        layer.pop();
    }

    // ==================== SPECIALIZED RENDERING ====================

    /**
     * Render motion trail to trail layer
     */
    stampTrail(trailLayer, turbulenceLevel = 0) {
        const trailConfig = this.config.drops.trail;
        if (!trailConfig || !trailConfig.enabled) return;

        // Calculate trail alpha based on turbulence
        const turbulenceFactor = 1 - (turbulenceLevel * trailConfig.turbulenceEffect);
        const trailAlpha = trailConfig.baseAlpha * turbulenceFactor;

        // Use renderer
        this.stampRenderer.renderTrail(
            trailLayer,
            this.pos.x,
            this.pos.y,
            this.size * trailConfig.sizeMultiplier,
            this.color,
            trailAlpha
        );
    }

    /**
     * Stamp permanent residue to history layer (Oriental brush effect)
     */
    stampToHistory(historyLayer) {
        if (this.hasBeenStamped) return;

        // Get residue color
        const residueColor = this._calculateResidueColor();

        // Render splatter residue
        for (let particle of this.splatterParticles) {
            const particleAlpha = particle.alpha * 0.4;
            historyLayer.fill(residueColor.r, residueColor.g, residueColor.b, particleAlpha);
            historyLayer.ellipse(
                this.pos.x + particle.offset.x,
                this.pos.y + particle.offset.y,
                particle.size * 0.6
            );
        }

        // Render main stamp using renderer (Oriental brush effect)
        this.stampRenderer.renderStamp(
            historyLayer,
            this.pos.x,
            this.pos.y,
            this.targetSize * 0.5,
            color(residueColor.r, residueColor.g, residueColor.b),
            0
        );

        this.hasBeenStamped = true;
    }

    // ==================== STATE QUERIES ====================

    /**
     * Check if drop should be stamped to history
     */
    shouldStamp() {
        return this.age >= this.lifespan && !this.hasBeenStamped;
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Update birth animation (explode-in effect)
     */
    _updateBirthAnimation() {
        const birthProgress = this.birthAge / this.birthDuration;
        const eased = 1 - Math.pow(1 - birthProgress, 3); // cubic ease-out
        this.size = this.targetSize * (0.1 + 0.9 * eased);
        this.initialSize = this.size;
    }

    /**
     * Create a new drip from this drop
     */
    _createDrip() {
        const dripX = this.pos.x;
        const dripY = this.pos.y + this.size / 2;

        // Create drip with same dependency injection pattern
        const drip = new InkDrip(dripX, dripY, this.color, this.initialSize, {
            config: this.config,
            fluid: this.fluid
        });

        this.childDrips.push(drip);
        return drip;
    }

    /**
     * Mark child drips for cleanup when parent dies
     */
    _markChildDripsForCleanup() {
        if (!this.childDrips) return;

        for (let drip of this.childDrips) {
            if (drip && typeof drip === 'object' && 'parentDied' in drip) {
                drip.parentDied = true;
            }
        }
    }

    /**
     * Calculate residue color (realistic fountain pen ink aging)
     */
    _calculateResidueColor() {
        const residueConfig = this.config.performance.stainFade;
        
        if (residueConfig.residueColor) {
            // Legacy: use specified color
            const rc = residueConfig.residueColor;
            return { r: rc[0], g: rc[1], b: rc[2] };
        } else {
            // Realistic: preserve hue, darken + desaturate
            let r = red(this.color) * 0.7;
            let g = green(this.color) * 0.7;
            let b = blue(this.color) * 0.7;

            // Desaturation (pigment oxidation)
            const gray = (r + g + b) / 3;
            r = lerp(r, gray, 0.2);
            g = lerp(g, gray, 0.2);
            b = lerp(b, gray, 0.2);

            return { r, g, b };
        }
    }
}
