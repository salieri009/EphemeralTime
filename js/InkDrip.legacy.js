/**
 * InkDrip.js - Dripping ink trails from larger drops
 * Simulates ink bleeding/running along fluid flow + gravity
 * Inspired by water flowing down paper
 * 
 * NOTE: This class will be refactored to extend Particle in future update
 * For now, supports both legacy and dependency injection constructor patterns
 */
class InkDrip {
    constructor(x, y, color, parentSize, configOrDependencies = CONFIG) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        
        this.color = color;
        
        // Support both old (config) and new (dependencies object) patterns
        if (configOrDependencies.config) {
            // New pattern: dependencies object
            this.config = configOrDependencies.config;
            this.fluid = configOrDependencies.fluid;
        } else {
            // Legacy pattern: direct config
            this.config = configOrDependencies;
            this.fluid = null;
        }
        
        // Drip characteristics based on parent drop size
        const dripConfig = this.config.drops.drip || {
            enabled: true,
            sizeRatio: 0.15,
            maxSpeed: 2,
            fadeRate: 0.03,
            gravityStrength: 0.15,
            fluidInfluence: 0.3,
            wobble: 0.3
        };
        
        this.startRadius = parentSize * dripConfig.sizeRatio;
        this.radius = this.startRadius;
        this.maxSpeed = map(this.radius, 0, parentSize * 0.5, 1, dripConfig.maxSpeed);
        this.fadeRate = dripConfig.fadeRate;
        this.gravityStrength = dripConfig.gravityStrength;
        this.fluidInfluence = dripConfig.fluidInfluence;
        this.wobble = dripConfig.wobble;
        
        // Lifecycle
        this.isDead = false;
        this.parentDied = false; // signal from parent drop
    }
    
    /**
     * Update drip position based on fluid flow and gravity
     * @param {p5.Vector} fluidVector - flow from fluid field
     */
    update(fluidVector) {
        // Reset acceleration
        this.acc = createVector(0, 0);
        
        // Apply gravity (downward force)
        this.acc.add(createVector(0, this.gravityStrength));
        
        // Apply fluid influence (follow the flow) - STRONG influence
        if (fluidVector && fluidVector.x !== undefined && fluidVector.y !== undefined) {
            this.acc.add(fluidVector.copy().mult(this.fluidInfluence));
        }
        
        // Add subtle horizontal wobble (like water on paper)
        this.acc.add(createVector(random(-this.wobble, this.wobble) * 0.1, 0));
        
        // Physics update
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        
        // Shrink over time (drip evaporates/disperses)
        let fadeRate = this.fadeRate;
        if (this.parentDied) {
            fadeRate *= 2; // fade faster when parent dies
        }
        this.radius -= fadeRate;
        
        // Check if dead
        if (this.radius <= 0 || this.pos.y > height + 50) {
            this.isDead = true;
        }
        
        // Screen wrapping (only horizontal)
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.x > width) this.pos.x = 0;
    }
    
    /**
     * Draw the drip on the given layer
     * @param {p5.Graphics} layer - target graphics layer
     */
    display(layer) {
        if (this.isDead) return;
        
        // Alpha based on current size
        const alpha = map(this.radius, 0, this.startRadius, 0, 180);
        
        layer.push();
        layer.noStroke();
        layer.fill(red(this.color), green(this.color), blue(this.color), alpha);
        layer.ellipse(this.pos.x, this.pos.y, this.radius * 2);
        layer.pop();
    }
    
    /**
     * Stamp drip to history layer (permanent mark)
     * Realistic ink absorption: preserves hue
     * @param {p5.Graphics} historyLayer
     */
    stampToHistory(historyLayer) {
        if (this.radius <= 0) return;
        
        const alpha = map(this.radius, 0, this.startRadius, 0, 50);
        
        // Realistic residue: preserve original color, darken slightly
        let residueR, residueG, residueB;
        
        if (this.config.performance.stainFade.residueColor) {
            const rc = this.config.performance.stainFade.residueColor;
            residueR = rc[0];
            residueG = rc[1];
            residueB = rc[2];
        } else {
            // Darken original color
            residueR = red(this.color) * 0.7;
            residueG = green(this.color) * 0.7;
            residueB = blue(this.color) * 0.7;
        }
        
        historyLayer.push();
        historyLayer.noStroke();
        historyLayer.fill(residueR, residueG, residueB, alpha);
        historyLayer.ellipse(this.pos.x, this.pos.y, this.radius * 1.5);
        historyLayer.pop();
    }
    
    /**
     * Stamp motion trail to trail layer
     * @param {p5.Graphics} trailLayer
     * @param {number} turbulenceLevel - current fluid turbulence (0-1)
     */
    stampTrail(trailLayer, turbulenceLevel = 0) {
        const config = this.config.trail;
        if (!config.enabled) return;
        
        // Drips leave fainter trails than main drops
        const turbulenceFactor = 1 - (turbulenceLevel * config.turbulenceEffect);
        const trailAlpha = config.baseAlpha * 0.5 * turbulenceFactor; // 50% of drop trail
        
        const trailSize = this.radius * config.sizeMultiplier;
        
        trailLayer.push();
        trailLayer.noStroke();
        trailLayer.fill(
            red(this.color), 
            green(this.color), 
            blue(this.color), 
            trailAlpha
        );
        trailLayer.ellipse(this.pos.x, this.pos.y, trailSize);
        trailLayer.pop();
    }
    
    /**
     * Check if drip should leave a trail mark
     * @returns {boolean}
     */
    shouldStamp() {
        // Stamp periodically as it drips (every few frames)
        return frameCount % 5 === 0 && this.radius > 0.5;
    }
}
