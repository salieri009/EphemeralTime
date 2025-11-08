/**
 * StampRenderer.js - Rendering Strategy for permanent ink stamps
 * 
 * Strategy Pattern: Encapsulates rendering algorithm
 * Implements Oriental brush stamp effect with fiber texture
 */
class StampRenderer {
    constructor(config = {}) {
        this.config = {
            layers: config.layers || 8,
            maxRadius: config.maxRadius || 1.2,
            minRadius: config.minRadius || 0.7,
            maxOpacity: config.maxOpacity || 120,
            minOpacity: config.minOpacity || 70,
            fibers: config.fibers || 40,
            fiberLength: config.fiberLength || 0.3,
            ...config
        };
    }

    /**
     * Render Oriental brush stamp on history layer
     */
    renderStamp(layer, x, y, size, color, angle = 0) {
        layer.push();
        layer.translate(x, y);
        layer.rotate(angle);
        layer.noStroke();

        // Multi-layer gradient for depth
        for (let i = 0; i < this.config.layers; i++) {
            const t = i / (this.config.layers - 1);
            const radius = lerp(
                size * this.config.maxRadius,
                size * this.config.minRadius,
                t
            );
            const opacity = lerp(
                this.config.maxOpacity,
                this.config.minOpacity,
                t
            );

            layer.fill(red(color), green(color), blue(color), opacity);
            layer.ellipse(0, 0, radius, radius);
        }

        // Radial fiber texture
        this._drawFibers(layer, size, color);

        layer.pop();
    }

    /**
     * Private: Draw radial fiber texture
     */
    _drawFibers(layer, size, color) {
        layer.push();
        layer.strokeWeight(0.5);

        for (let i = 0; i < this.config.fibers; i++) {
            const angle = random(TWO_PI);
            const length = random(size * this.config.fiberLength);
            const distance = random(size * 0.5);
            const opacity = random(30, 80);

            layer.stroke(red(color), green(color), blue(color), opacity);

            const x1 = cos(angle) * distance;
            const y1 = sin(angle) * distance;
            const x2 = x1 + cos(angle) * length;
            const y2 = y1 + sin(angle) * length;

            layer.line(x1, y1, x2, y2);
        }

        layer.pop();
    }

    /**
     * Render motion trail on trail layer
     */
    renderTrail(layer, x, y, size, color, trailAlpha) {
        layer.push();
        layer.noStroke();
        layer.fill(red(color), green(color), blue(color), trailAlpha);
        layer.ellipse(x, y, size * 0.8, size * 0.8);
        layer.pop();
    }
}
