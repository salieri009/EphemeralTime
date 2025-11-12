/**
 * Represents the "Sun" drop, a special marker for the current hour.
 * It moves horizontally across the top of the screen over the course of 60 minutes.
 */
class SunDrop {
    /**
     * @param {object} config - The configuration object for the sun drop.
     * @param {number} canvasWidth - The width of the canvas.
     */
    constructor(config, canvasWidth) {
        this.config = config;
        this.canvasWidth = canvasWidth;
        this.y = this.config.yPosition;
        this.x = 0;
        this.radius = this.config.size;
        this.color = this.config.color;
        this.pulseAngle = 0;
    }

    /**
     * Updates the SunDrop's horizontal position based on the current minute.
     * @param {number} minute - The current minute of the hour (0-59).
     */
    update(minute) {
        // Map the minute to the canvas width
        this.x = (minute / 59) * this.canvasWidth;
        this.pulseAngle += this.config.pulseSpeed;
    }

    /**
     * Renders the SunDrop on the provided graphics layer.
     * @param {p5.Graphics} layer - The graphics layer to draw on.
     */
    render(layer) {
        // Pulsating corona effect
        const pulseSize = this.radius * (1 + Math.sin(this.pulseAngle) * this.config.pulseMagnitude);
        
        // Draw the soft corona
        layer.noStroke();
        layer.fill(this.color[0], this.color[1], this.color[2], this.config.coronaOpacity);
        layer.ellipse(this.x, this.y, pulseSize, pulseSize);

        // Draw the hard core
        layer.fill(this.color[0], this.color[1], this.color[2], this.config.coreOpacity);
        layer.ellipse(this.x, this.y, this.radius, this.radius);
    }

    /**
     * Stamp motion trail to trail layer
     * PHILOSOPHY: The sun's path is objective and unwavering, 
     * a constant reference point against which subjective moments (ink drops) are measured.
     * 
     * @param {p5.Graphics} trailLayer
     * @param {number} turbulenceLevel - current fluid turbulence (0-1)
     */
    stampTrail(trailLayer, turbulenceLevel = 0) {
        // Use sun-specific trail config if available, otherwise fall back to global
        const config = this.config.trail;
        if (!config || !config.enabled) return;
        
        // Sun leaves a golden trail regardless of turbulence
        const trailColor = this.config.color || [255, 220, 0];
        const trailAlpha = config.baseAlpha || 50;
        const trailSize = this.radius * (config.sizeMultiplier || 0.8);

        trailLayer.noStroke();
        trailLayer.fill(trailColor[0], trailColor[1], trailColor[2], trailAlpha);
        trailLayer.ellipse(this.x, this.y, trailSize, trailSize);
    }

    /**
     * Calculate repulsion force for drops near the sun
     * 
     * PHILOSOPHY (Pillar 1): "Objective vs. Subjective Time"
     * The Sun Drop represents objective, mechanical time - it moves predictably
     * and cannot be disturbed. It actively repels subjective moments (ink drops),
     * symbolizing how our subjective experiences cannot alter the relentless
     * march of objective time. This creates a "sacred space" where time itself
     * maintains its own territory.
     * 
     * @param {number} dropX - X position of the drop
     * @param {number} dropY - Y position of the drop
     * @returns {p5.Vector} - Repulsion force vector (outward from sun)
     */
    getRepulsionForce(dropX, dropY) {
        const dx = dropX - this.x;
        const dy = dropY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const repulsionRadius = this.config.repulsionRadius || 150;
        const repulsionStrength = this.config.repulsionStrength || 2;
        
        if (distance < repulsionRadius && distance > 0) {
            // Inverse distance falloff: closer = stronger repulsion
            const force = repulsionStrength * (1 - distance / repulsionRadius);
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            return createVector(normalizedX * force, normalizedY * force);
        }
        
        return createVector(0, 0);
    }
}
