/**
 * SplatterRenderer.js - Rendering Strategy for kwertyops-style splatter
 * 
 * Strategy Pattern: Encapsulates splatter particle rendering
 * Distance-based sizing with velocity influence
 */
class SplatterRenderer {
    constructor(config = {}) {
        this.config = {
            particleCount: config.particleCount || 25,
            velocityInfluence: config.velocityInfluence || 0.3,
            minSize: config.minSize || 0.15,
            maxSize: config.maxSize || 0.6,
            sizeVariation: config.sizeVariation || 0.3,
            baseAlpha: config.baseAlpha || 180,
            ...config
        };
    }

    /**
     * Generate splatter particles for a drop
     */
    generateSplatter(x, y, size, velocity) {
        const particles = [];

        for (let i = 0; i < this.config.particleCount; i++) {
            const angle = random(TWO_PI);
            const distance = randomGaussian(size * 1.5, size * 0.5);

            // Velocity bias: moving drops splash forward
            const velocityBias = p5.Vector.fromAngle(angle)
                .mult(this.config.velocityInfluence);
            const biasedVel = p5.Vector.add(velocity, velocityBias);

            particles.push({
                offset: createVector(cos(angle) * distance, sin(angle) * distance),
                size: random(
                    size * this.config.minSize,
                    size * this.config.maxSize
                ),
                alpha: map(
                    distance,
                    0,
                    size * 3,
                    this.config.baseAlpha,
                    this.config.baseAlpha * 0.3
                ),
                velocity: biasedVel.copy()
            });
        }

        return particles;
    }

    /**
     * Render active splatter particles
     */
    renderSplatter(layer, x, y, particles, color, opacity) {
        if (!particles || particles.length === 0) return;

        layer.push();
        layer.noStroke();

        for (const particle of particles) {
            const px = x + particle.offset.x;
            const py = y + particle.offset.y;
            const alpha = particle.alpha * (opacity / 255);

            layer.fill(red(color), green(color), blue(color), alpha);
            layer.ellipse(px, py, particle.size, particle.size);
        }

        layer.pop();
    }

    /**
     * Update splatter particle positions (for animated splatter)
     */
    updateSplatter(particles, deltaTime = 1) {
        if (!particles) return;

        for (const particle of particles) {
            particle.offset.add(
                p5.Vector.mult(particle.velocity, deltaTime)
            );
            particle.velocity.mult(0.95); // Friction
        }
    }
}
