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
     * Calculate repulsion force for drops near the sun
     * @param {number} dropX - X position of the drop
     * @param {number} dropY - Y position of the drop
     * @returns {p5.Vector} - Repulsion force vector
     */
    getRepulsionForce(dropX, dropY) {
        const dx = dropX - this.x;
        const dy = dropY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const repulsionRadius = this.config.repulsionRadius || 150;
        const repulsionStrength = this.config.repulsionStrength || 2;
        
        if (distance < repulsionRadius && distance > 0) {
            const force = repulsionStrength * (1 - distance / repulsionRadius);
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            return createVector(normalizedX * force, normalizedY * force);
        }
        
        return createVector(0, 0);
    }
}
