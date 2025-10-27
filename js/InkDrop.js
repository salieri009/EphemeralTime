/**
 * InkDrop.js - Individual ink drop class
 * Represents ink drops generated at 3 scales: second (1x), minute (6x), hour (36x)
 */
class InkDrop {
    constructor(x, y, color, type = 'second', config = CONFIG) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        
        this.color = color;
        this.type = type; // 'second', 'minute', or 'hour'
        
        // Set size based on type
        const baseSize = config.drops.second.baseSize;
        if (type === 'minute') {
            this.initialSize = baseSize * config.drops.minute.sizeMultiplier;
            this.lifespan = config.drops.minute.lifespan;
            this.initialOpacity = config.drops.minute.opacity;
        } else if (type === 'hour') {
            this.initialSize = baseSize * config.drops.hour.sizeMultiplier;
            this.lifespan = config.drops.hour.lifespan;
            this.initialOpacity = config.drops.hour.opacity;
        } else {
            // second (default)
            this.initialSize = baseSize;
            this.lifespan = config.drops.second.lifespan;
            this.initialOpacity = config.drops.second.opacity;
        }
        
        this.size = this.initialSize;
        this.age = 0;
        this.opacity = this.initialOpacity;
        
        // Lifecycle state
        this.isAlive = true;
        this.hasBeenStamped = false;
        
        // Store config
        this.config = config;
    }

    /**
     * Update drop position and properties each frame
     * @param {p5.Vector} fluidVector - vector from fluid field
     * @param {number} viscosity - friction multiplier
     */
    update(fluidVector, viscosity = 0.95) {
        // Apply fluid force
        if (fluidVector) {
            this.acc = fluidVector.copy().mult(0.6);
        }

        // Physics
        this.vel.add(this.acc);
        this.vel.mult(viscosity);
        this.pos.add(this.vel);

        // Screen wrapping
        this.pos.x = (this.pos.x + width) % width;
        this.pos.y = (this.pos.y + height) % height;

        // Lifecycle
        this.age++;
        
        // Fade: opacity decreases linearly, then holds at residue level
        const fadeProgress = this.age / this.lifespan;
        if (fadeProgress >= 1.0) {
            // Drop is "dead" - hold at residue opacity
            this.opacity = this.config.performance.stainFade.residueOpacity;
            this.size = this.initialSize * 0.7; // slightly reduced
        } else {
            // Fading: linear interpolation from initial to residue opacity
            this.opacity = this.initialOpacity - (this.initialOpacity - this.config.performance.stainFade.residueOpacity) * fadeProgress;
            this.size = this.initialSize * (1 - fadeProgress * 0.5); // gradual size reduction
        }
    }

    /**
     * Draw this drop on the given graphics layer
     * @param {p5.Graphics} layer - target layer
     */
    display(layer) {
        layer.push();
        layer.fill(red(this.color), green(this.color), blue(this.color), this.opacity);
        layer.noStroke();
        layer.ellipse(this.pos.x, this.pos.y, max(this.size, 2));
        layer.pop();
    }

    /**
     * Check if drop should be permanently stamped to history
     * @returns {boolean}
     */
    shouldStamp() {
        // Stamp after full lifespan
        return this.age >= this.lifespan && !this.hasBeenStamped;
    }

    /**
     * Check if drop is completely dead (ready for garbage collection)
     * @returns {boolean}
     */
    isDead() {
        return this.age >= this.lifespan;
    }

    /**
     * Stamp this drop to history layer as residual stain
     * @param {p5.Graphics} historyLayer
     */
    stampToHistory(historyLayer) {
        if (this.hasBeenStamped) return;
        
        historyLayer.push();
        
        // Use residue color (warm brown tint for coffee-like effect)
        const residueColor = this.config.performance.stainFade.residueColor;
        historyLayer.fill(residueColor[0], residueColor[1], residueColor[2], this.config.performance.stainFade.residueOpacity);
        historyLayer.noStroke();
        
        // Stamp smaller than original for delicate residue effect
        const stampSize = this.initialSize * 0.5;
        historyLayer.ellipse(this.pos.x, this.pos.y, stampSize);
        
        historyLayer.pop();
        this.hasBeenStamped = true;
    }
}
