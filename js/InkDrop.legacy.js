/**
 * InkDrop.js - Individual ink drop class
 * Represents ink drops generated at 3 scales: second (1x), minute (6x), hour (36x)
 * Features organic splatter effect on creation
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
        
        // Birth animation (explode-in effect)
        this.birthAge = 0;
        this.birthDuration = 6; // frames (0.1 sec @ 60fps)
        this.targetSize = this.initialSize;
        this.size = this.initialSize * 0.1; // start at 10%
        
        // Lifecycle state
        this.isAlive = true;
        this.hasBeenStamped = false;
        
        // Store config
        this.config = config;
        
        // Individual autonomy (unique noise offset for independent movement)
        if (config.fluid?.dropVariation?.enabled) {
            this.noiseOffsetX = random(config.fluid.dropVariation.noiseOffsetRange);
            this.noiseOffsetY = random(config.fluid.dropVariation.noiseOffsetRange);
        } else {
            this.noiseOffsetX = 0;
            this.noiseOffsetY = 0;
        }
        
        // Splatter effect particles (generated on creation)
        this.splatterParticles = this.generateSplatter();
        
        // Drip generation (only for larger drops)
        this.canDrip = (type === 'minute' || type === 'hour');
        this.dripTimer = 0;
        this.dripInterval = config.drops.drip?.interval || 15; // frames between drips
        this.childDrips = []; // track child drips for cleanup
    }
    
    /**
     * Generate splatter particles around the main drop
     * Inspired by kwertyops painting code: distance-based sizing & alpha
     */
    generateSplatter() {
        const particles = [];
        const splatterConfig = this.config.drops.splatter || {
            enabled: true,
            particleCount: 25,
            radius: 2.5,
            alphaMultiplier: 0.5,
            velocityInfluence: 0.8,
            sizeVariation: 0.7
        };
        
        if (!splatterConfig.enabled) return particles;
        
        // More particles for larger drops
        const particleCount = splatterConfig.particleCount * (this.initialSize / this.config.drops.second.baseSize);
        const maxRadius = this.initialSize * splatterConfig.radius;
        
        // Use velocity direction if available (similar to kwertyops movedX/movedY)
        const velAngle = this.vel.heading();
        const velMag = this.vel.mag();
        
        for (let i = 0; i < particleCount; i++) {
            // Random angle with bias toward velocity direction
            let angle = random(TWO_PI);
            if (velMag > 0.5) {
                angle = velAngle + randomGaussian(0, PI/3); // cluster toward movement
            }
            
            // Distance: kwertyops style - varied distribution
            const distance = random(maxRadius * 0.2, maxRadius);
            
            // Size: inversely proportional to distance (kwertyops key insight!)
            // Far particles = smaller, near particles = larger
            const sizeRatio = map(distance, maxRadius * 0.2, maxRadius, 1, 0.2);
            const baseSize = this.initialSize * 0.4 * sizeRatio;
            const size = baseSize * random(1 - splatterConfig.sizeVariation, 1 + splatterConfig.sizeVariation);
            
            // Alpha: also inversely proportional to distance
            const alphaRatio = map(distance, maxRadius * 0.2, maxRadius, 1, 0.3);
            const alpha = random(80, 180) * splatterConfig.alphaMultiplier * alphaRatio;
            
            particles.push({
                offsetX: cos(angle) * distance,
                offsetY: sin(angle) * distance,
                size: max(1, size),
                alpha: alpha
            });
        }
        
        return particles;
    }

    /**
     * Update drop position and properties each frame
     * @param {p5.Vector} fluidVector - vector from fluid field
     * @param {number} viscosity - friction multiplier
     * @param {p5.Vector} additionalForce - optional additional force (e.g., sun repulsion)
     * @returns {InkDrip|null} - new drip if generated, otherwise null
     */
    update(fluidVector, viscosity = 0.95, additionalForce = null) {
        // Reset acceleration
        this.acc = createVector(0, 0);
        
        // Apply fluid force
        if (fluidVector && fluidVector.x !== undefined && fluidVector.y !== undefined) {
            this.acc.add(fluidVector.copy().mult(0.1)); // subtle fluid influence
        }
        
        // Apply additional force (sun repulsion, etc.)
        if (additionalForce && additionalForce.x !== undefined && additionalForce.y !== undefined) {
            this.acc.add(additionalForce.copy().mult(0.5)); // moderate repulsion
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
        this.birthAge++;
        
        // Birth animation (explode-in: 0.1 sec rapid expansion)
        if (this.birthAge <= this.birthDuration) {
            // Ease-out expansion
            const birthProgress = this.birthAge / this.birthDuration;
            const eased = 1 - Math.pow(1 - birthProgress, 3); // cubic ease-out
            this.size = this.targetSize * (0.1 + 0.9 * eased);
            this.initialSize = this.size; // update for subsequent calculations
        }
        
        // Drip generation (only for minute/hour drops, after birth)
        let newDrip = null;
        if (this.birthAge > this.birthDuration && this.canDrip && this.config.drops.drip?.enabled) {
            this.dripTimer++;
            if (this.dripTimer >= this.dripInterval) {
                newDrip = this.createDrip();
                this.dripTimer = 0;
            }
        }
        
        // Fade: opacity decreases linearly, then holds at residue level
        const fadeProgress = this.age / this.lifespan;
        if (fadeProgress >= 1.0) {
            // Drop is "dead" - hold at residue opacity
            this.opacity = this.config.performance.stainFade.residueOpacity;
            this.size = this.targetSize * 0.7; // slightly reduced
        } else {
            // Fading: linear interpolation from initial to residue opacity
            this.opacity = this.initialOpacity - (this.initialOpacity - this.config.performance.stainFade.residueOpacity) * fadeProgress;
            
            // Size reduction only after birth animation
            if (this.birthAge > this.birthDuration) {
                this.size = this.targetSize * (1 - fadeProgress * 0.5);
            }
        }
        
        return newDrip;
    }

    /**
     * Create a new drip from this drop
     * @returns {InkDrip} - new drip instance
     */
    createDrip() {
        // Create drip at bottom of drop
        const dripX = this.pos.x;
        const dripY = this.pos.y + this.size / 2;
        
        const drip = new InkDrip(dripX, dripY, this.color, this.initialSize, this.config);
        this.childDrips.push(drip);
        
        return drip;
    }

    /**
     * Draw this drop on the given graphics layer
     * @param {p5.Graphics} layer - target layer
     */
    display(layer) {
        layer.push();
        layer.noStroke();
        
        // Birth animation: splatter appears during expansion
        const birthProgress = min(1, this.birthAge / this.birthDuration);
        
        // Draw splatter particles first (behind main drop)
        const fadeProgress = min(1, this.age / this.lifespan);
        const splatterOpacity = map(fadeProgress, 0, 1, 1, 0.3); // fade out faster than main drop
        
        for (let particle of this.splatterParticles) {
            // Splatter appears gradually during birth
            const birthAlpha = birthProgress;
            const particleAlpha = particle.alpha * splatterOpacity * (this.opacity / 255) * birthAlpha;
            layer.fill(
                red(this.color), 
                green(this.color), 
                blue(this.color), 
                particleAlpha
            );
            layer.ellipse(
                this.pos.x + particle.offsetX,
                this.pos.y + particle.offsetY,
                particle.size
            );
        }
        
        // Draw main drop
        layer.fill(red(this.color), green(this.color), blue(this.color), this.opacity);
        layer.ellipse(this.pos.x, this.pos.y, max(this.size, 2));
        
        layer.pop();
    }

    /**
     * Stamp motion trail to trail layer
     * @param {p5.Graphics} trailLayer
     * @param {number} turbulenceLevel - current fluid turbulence (0-1)
     */
    stampTrail(trailLayer, turbulenceLevel = 0) {
        const config = this.config.trail;
        if (!config.enabled) return;
        
        // Trail opacity inversely proportional to turbulence
        // Calm (turbulence=0) -> strong trail, Turbulent (turbulence=1) -> faint trail
        const turbulenceFactor = 1 - (turbulenceLevel * config.turbulenceEffect);
        const trailAlpha = config.baseAlpha * turbulenceFactor;
        
        // Trail size proportional to drop size
        const trailSize = this.size * config.sizeMultiplier;
        
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
        const dead = this.age >= this.lifespan;
        if (dead && this.childDrips && this.childDrips.length > 0) {
            this.markChildDripsForCleanup(); // cleanup child drips
        }
        return dead;
    }

    /**
     * Mark all child drips for faster cleanup when parent dies
     */
    markChildDripsForCleanup() {
        if (!this.childDrips) return;
        
        for (let drip of this.childDrips) {
            if (drip && typeof drip === 'object' && 'parentDied' in drip) {
                drip.parentDied = true;
            }
        }
    }

    /**
     * Stamp this drop to history layer as residual stain
     * Realistic ink absorption: preserves hue but darkens + desaturates
     * @param {p5.Graphics} historyLayer
     */
    stampToHistory(historyLayer) {
        if (this.hasBeenStamped) return;
        
        historyLayer.push();
        historyLayer.noStroke();
        
        const residueOpacity = this.config.performance.stainFade.residueOpacity;
        
        // Get realistic residue color
        let residueR, residueG, residueB;
        
        if (this.config.performance.stainFade.residueColor) {
            // Use specified residue color (legacy)
            const rc = this.config.performance.stainFade.residueColor;
            residueR = rc[0];
            residueG = rc[1];
            residueB = rc[2];
        } else {
            // Realistic fountain pen ink: preserve hue, darken + desaturate
            residueR = red(this.color) * 0.7;
            residueG = green(this.color) * 0.7;
            residueB = blue(this.color) * 0.7;
            
            // Slight desaturation (pigment oxidation on paper)
            const gray = (residueR + residueG + residueB) / 3;
            residueR = lerp(residueR, gray, 0.2);
            residueG = lerp(residueG, gray, 0.2);
            residueB = lerp(residueB, gray, 0.2);
        }
        
        // Stamp splatter particles first
        for (let particle of this.splatterParticles) {
            const particleAlpha = particle.alpha * 0.4; // subtle residue
            historyLayer.fill(residueR, residueG, residueB, particleAlpha);
            historyLayer.ellipse(
                this.pos.x + particle.offsetX,
                this.pos.y + particle.offsetY,
                particle.size * 0.6
            );
        }
        
        // Oriental Brush Effect: dark center fading to light edges
        // Opposite of coffee ring - mimics ink brush on rice paper
        const stampSize = this.targetSize * 0.5;
        
        // Create gradient from center (dark) to edge (light)
        // Multiple layers for smooth gradient
        const layers = 8;
        for (let i = layers; i > 0; i--) {
            const ratio = i / layers;
            const layerSize = stampSize * ratio;
            
            // Alpha increases toward center (darker in middle)
            const layerAlpha = residueOpacity * (1.2 - ratio * 0.5); // 120% at center, 70% at edge
            
            historyLayer.noStroke();
            historyLayer.fill(residueR, residueG, residueB, layerAlpha);
            historyLayer.ellipse(this.pos.x, this.pos.y, layerSize);
        }
        
        // Brush fiber texture: random streaks radiating from center
        historyLayer.strokeWeight(0.5);
        historyLayer.stroke(residueR, residueG, residueB, residueOpacity * 0.3);
        
        const fiberCount = 12 + Math.floor(this.targetSize / 10);
        for (let i = 0; i < fiberCount; i++) {
            const angle = random(TWO_PI);
            const length = random(stampSize * 0.3, stampSize * 0.6);
            const startR = random(stampSize * 0.1);
            const endR = startR + length;
            
            const x1 = this.pos.x + cos(angle) * startR;
            const y1 = this.pos.y + sin(angle) * startR;
            const x2 = this.pos.x + cos(angle) * endR;
            const y2 = this.pos.y + sin(angle) * endR;
            
            historyLayer.line(x1, y1, x2, y2);
        }
        
        historyLayer.pop();
        this.hasBeenStamped = true;
    }
}
