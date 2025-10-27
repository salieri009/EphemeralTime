/**
 * Fluid.js - Perlin Noise based fluid simulation
 */
class Fluid {
    constructor(resolution = 20, config) {
        this.resolution = resolution;
        this.cols = ceil(width / resolution);
        this.rows = ceil(height / resolution);
        
        this.field = [];
        this.noiseScale = config.fluid.noiseScale;
        this.noiseSpeed = config.fluid.noiseSpeed;
        this.baseFlowMagnitude = config.fluid.baseFlowMagnitude;
        
        this.config = config;
        this.currentViscosity = config.fluid.viscosity.baseValue;
        
        this.initField();
    }

    /**
     * Initialize the vector field
     */
    initField() {
        this.field = [];
        for (let y = 0; y < this.rows; y++) {
            this.field[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.field[y][x] = createVector(0, 0);
            }
        }
    }

    /**
     * Called every frame to update the field
     */
    update() {
        const t = frameCount * this.noiseSpeed;

        // Generate smooth base flow using Perlin noise
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const angle = noise(
                    x * this.noiseScale,
                    y * this.noiseScale,
                    t
                ) * TWO_PI;

                const magnitude = 2; // base flow magnitude
                const vx = cos(angle) * magnitude;
                const vy = sin(angle) * magnitude;

                this.field[y][x] = createVector(vx, vy);
            }
        }

        // Mouse interaction is handled in mouseMoved() via addForceAtPoint()
    }

    /**
     * Add force at a specific point (for mouse interaction)
     * @param {number} x - canvas x coordinate
     * @param {number} y - canvas y coordinate
     * @param {p5.Vector} force - force vector to add
     * @param {number} strength - force strength multiplier
     */
    addForceAtPoint(x, y, force, strength = 1) {
        const radius = this.config.fluid.mouseForce.radius;
        const gridX = floor(x / this.resolution);
        const gridY = floor(y / this.resolution);
        const range = floor(radius / this.resolution);

        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const gx = gridX + dx;
                const gy = gridY + dy;
                
                if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
                    const dist_val = dist(
                        gx * this.resolution,
                        gy * this.resolution,
                        x,
                        y
                    );

                    if (dist_val < radius) {
                        const falloff = (1 - dist_val / radius) * strength;
                        this.field[gy][gx].add(force.copy().mult(falloff));
                    }
                }
            }
        }
    }

    /**
     * Return the flow vector at the given canvas coordinates
     * @param {number} x - canvas x coordinate
     * @param {number} y - canvas y coordinate
     * @returns {p5.Vector} flow vector at the given location
     */
    getVectorAt(x, y) {
        const gridX = constrain(floor(x / this.resolution), 0, this.cols - 1);
        const gridY = constrain(floor(y / this.resolution), 0, this.rows - 1);

        return this.field[gridY][gridX].copy();
    }

    /**
     * Update viscosity based on ink density
     * @param {number} inkDensity - Current ink density (0-1)
     */
    updateViscosity(inkDensity) {
        const minViscosity = this.config.fluid.viscosity.maxValue;
        const maxViscosity = this.config.fluid.viscosity.baseValue;
        
        // Map ink density to viscosity (more ink = more friction)
        this.currentViscosity = map(
            inkDensity,
            0, 1,
            maxViscosity, minViscosity
        );
    }

    /**
     * Get current viscosity value
     * @returns {number} Current viscosity multiplier
     */
    getViscosity() {
        return this.currentViscosity;
    }

    /**
     * Debug: visualize the vector field
     * @param {number} scale - arrow scale
     */
    displayField(scale = 5) {
        push();
        stroke(0, 100);
        strokeWeight(1);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const posX = x * this.resolution + this.resolution / 2;
                const posY = y * this.resolution + this.resolution / 2;
                const vec = this.field[y][x];

                // draw arrow
                const endX = posX + vec.x * scale;
                const endY = posY + vec.y * scale;
                line(posX, posY, endX, endY);

                // 끝점 표시
                fill(0);
                noStroke();
                ellipse(endX, endY, 3);
            }
        }
        pop();
    }
}
