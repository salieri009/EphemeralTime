/**
 * CymaticPattern.js - Visual representation of sound waves
 * 
 * PHILOSOPHY (Pillar 2): "Cymatics & Chimes - Seeing the Sound of Time"
 * At 15, 30, and 45 minutes, a "Chime" event occurs. This doesn't just create
 * a sound; it creates a *visible sound wave* (Cymatics) that physically interacts
 * with the fluid. Sound becomes a tangible force, creating ripples in the
 * "attention reservoir" that push and swirl the ink drops.
 * 
 * This is a profound synesthetic experience where time is not just heard,
 * but seen and felt as a physical force.
 * 
 * Pattern intensity corresponds to time's significance:
 * - 15 minutes: 3 rings (quarter hour)
 * - 30 minutes: 6 rings (half hour - more significant)
 * - 45 minutes: 9 rings (three-quarters - most significant)
 * 
 * @class
 * @property {p5.Vector} pos - Pattern center position
 * @property {Object} config - Configuration object
 * @property {number} minute - Minute value (determines ring count)
 * @property {number} ringCount - Number of rings (3, 6, or 9)
 * @property {Array<Object>} rings - Ring data structures
 * @property {number} maxRadius - Maximum ring radius
 * @property {number} age - Current age in frames
 * @property {number} maxAge - Maximum age (180 frames / 3 seconds)
 * @property {boolean} isDead - Death flag
 */
class CymaticPattern {
    /**
     * Create a new Cymatics pattern
     * 
     * @param {number} x - Center X position
     * @param {number} y - Center Y position
     * @param {number} minute - Current minute (0-59)
     * @param {Object} config - Configuration object (default: CONFIG)
     */
    constructor(x, y, minute, config = CONFIG) {
        this.pos = createVector(x, y);
        this.config = config;
        this.minute = minute;
        
        // Determine ring count based on minute
        // 15min = 3, 30min = 6, 45min = 9
        this.ringCount = (minute / 15) * 3;
        
        // Ring properties
        this.rings = [];
        this.maxRadius = min(width, height) / 3; // 1/3 of screen as per concept
        this.ringSpacing = this.maxRadius / this.ringCount;
        
        // Lifecycle
        this.age = 0;
        this.maxAge = 180; // 3 seconds @ 60fps
        this.isDead = false;
        
        // Visual properties
        this.baseAlpha = 80;
        this.baseStrokeWeight = 3;
        
        // Initialize rings with staggered start times
        for (let i = 0; i < this.ringCount; i++) {
            this.rings.push({
                startAge: i * 3, // stagger by 3 frames
                radius: 0,
                targetRadius: (i + 1) * this.ringSpacing,
                alpha: this.baseAlpha
            });
        }
    }
    
    /**
     * Update cymatics pattern animation and return active rings for fluid interaction
     * PHILOSOPHY: Sound creates visible waves that physically disturb the fluid medium
     * 
     * @returns {Array<Object>} Active rings with position, radius, and strength for fluid interaction
     */
    update() {
        this.age++;
        
        if (this.age >= this.maxAge) {
            this.isDead = true;
            return [];
        }
        
        const activeRings = [];
        
        // Update each ring
        this.rings.forEach(ring => {
            if (this.age >= ring.startAge) {
                const ringAge = this.age - ring.startAge;
                const progress = ringAge / (this.maxAge - ring.startAge);
                
                // Expand radius with ease-out
                const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
                ring.radius = ring.targetRadius * easeProgress;
                
                // Fade out alpha
                const fadeProgress = Math.max(0, 1 - progress);
                ring.alpha = this.baseAlpha * fadeProgress;
                
                // Add to active rings for fluid interaction
                // Strength decreases as ring expands (inverse square law)
                if (ring.radius > 0 && fadeProgress > 0) {
                    activeRings.push({
                        x: this.pos.x,
                        y: this.pos.y,
                        radius: ring.radius,
                        strength: fadeProgress * 0.8 // Normalized strength for fluid force
                    });
                }
            }
        });
        
        return activeRings;
    }
    
    /**
     * Render pattern to specified layer
     * Uses ColorManager for time-appropriate colors
     * 
     * @param {p5.Graphics} layer - Graphics layer to render to
     */
    render(layer) {
        layer.push();
        layer.noFill();
        
        // Get color from ColorManager for current minute
        const colorManager = container.get('colorManager');
        const chimeColor = colorManager.getColorForTime(this.minute, hour());
        
        this.rings.forEach(ring => {
            if (ring.radius > 0) {
                // Multiple concentric strokes for wave effect
                for (let w = 0; w < 3; w++) {
                    const weight = this.baseStrokeWeight - w;
                    const alpha = ring.alpha * (1 - w * 0.3);
                    
                    layer.stroke(
                        red(chimeColor),
                        green(chimeColor),
                        blue(chimeColor),
                        alpha
                    );
                    layer.strokeWeight(weight);
                    layer.ellipse(this.pos.x, this.pos.y, ring.radius * 2);
                }
            }
        });
        
        layer.pop();
    }
    
    /**
     * Check if pattern animation is complete
     * 
     * @returns {boolean} True if pattern should be removed
     */
    isComplete() {
        return this.isDead;
    }
}
