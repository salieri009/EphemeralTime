/**
 * CymaticPattern.js - Visual representation of sound waves
 * 
 * PHILOSOPHY: "See the sound, hear the time"
 * Chime drops create circular wave rings that radiate outward,
 * visualizing the ripple effect described in the concept document.
 * 
 * Pattern intensity corresponds to the minute:
 * - 15 minutes: 3 rings (quarter)
 * - 30 minutes: 6 rings (half)
 * - 45 minutes: 9 rings (three-quarters)
 */
class CymaticPattern {
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
    
    update() {
        this.age++;
        
        if (this.age >= this.maxAge) {
            this.isDead = true;
            return;
        }
        
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
            }
        });
    }
    
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
     */
    isComplete() {
        return this.isDead;
    }
}
