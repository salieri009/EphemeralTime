/**
 * Fluid.js - Perlin Noise based fluid simulation
 * 
 * PHILOSOPHY: "Attention Reservoir"
 * - Calm state: high viscosity, clear traces (mindful)
 * - Distracted state: low viscosity, chaotic traces (scattered attention)
 * 
 * @class
 * @property {number} resolution - Grid cell size in pixels
 * @property {number} cols - Grid columns
 * @property {number} rows - Grid rows
 * @property {Array<Array<p5.Vector>>} field - 2D vector field
 * @property {number} turbulence - Current turbulence (0-1)
 * @property {number} targetTurbulence - Target turbulence for smooth interpolation
 * @property {number} currentViscosity - Current viscosity value
 * @property {SunDrop} sunDrop - Reference to sun drop for repulsion
 */
class Fluid {
    /**
     * Create fluid simulation
     * 
     * @param {number} resolution - Grid cell size (default: 20)
     * @param {Object} config - Configuration object
     */
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
        
        // Turbulence state (attention reservoir)
        this.turbulence = 0;
        this.targetTurbulence = 0; // ✨ NEW: Target for smooth interpolation
        this.turbulenceInertia = 0.05; // ✨ NEW: Smoothing factor (lower = smoother)
        
        // Sun drop reference (for repulsion)
        this.sunDrop = null;
        
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

                const magnitude = 0.3; // base flow magnitude (subtle drift)
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
     * Update viscosity based on turbulence
     * PHILOSOPHY: Distraction doesn't speed up time, but creates more traces
     * Higher turbulence → lower viscosity → ink spreads faster → more trails
     * 
     * @param {number} turbulence - Current turbulence level (0-1)
     */
    updateViscosity(turbulence) {
        const viscConfig = this.config.fluid.viscosity;
        
        // Calm (turbulence=0): high viscosity (0.95) - ink moves slowly, leaves clear marks
        // Distracted (turbulence=1): low viscosity (0.65) - ink spreads fast, many trails
        this.currentViscosity = lerp(
            viscConfig.baseValue,      // 0.95 - calm, mindful state
            viscConfig.minValue || 0.65, // 0.65 - chaotic, distracted state
            constrain(turbulence, 0, 1)
        );
    }

    /**
     * Get viscosity value for drop physics
     * 
     * @returns {number} Current viscosity multiplier (0.65-0.95)
     */
    getViscosity() {
        return this.currentViscosity;
    }

    /**
     * Add turbulence to the system based on mouse velocity.
     * PHILOSOPHY: Attention reservoir fills gradually, empties gradually
     * Natural inertia creates realistic "attention momentum"
     * 
     * @param {number} mouseVelocity - The velocity of the mouse movement.
     */
    addTurbulence(mouseVelocity) {
        if (mouseVelocity > this.config.fluid.turbulence.velocityThreshold) {
            const turbulenceIncrease = map(
                mouseVelocity,
                this.config.fluid.turbulence.velocityThreshold,
                50, // max expected velocity
                0,
                0.1
            );
            
            // Increase TARGET turbulence (not immediate)
            this.targetTurbulence = constrain(
                this.targetTurbulence + turbulenceIncrease,
                0,
                this.config.fluid.turbulence.maxValue
            );
        }
    }

    /**
     * Update the turbulence level (smooth interpolation + decay over time).
     * PHILOSOPHY: Smooth transitions create natural "attention momentum"
     */
    updateTurbulence() {
        // Smooth interpolation toward target (inertia)
        this.turbulence = lerp(this.turbulence, this.targetTurbulence, this.turbulenceInertia);
        
        // Natural decay of target (attention fades when not stimulated)
        this.targetTurbulence *= this.config.fluid.turbulence.decay;
        
        // Snap to zero when very small
        if (this.targetTurbulence < 0.001) {
            this.targetTurbulence = 0;
        }
        if (this.turbulence < 0.001) {
            this.turbulence = 0;
        }
    }

    /**
     * Reset turbulence to calm state (for canvas reset)
     */
    resetTurbulence() {
        this.turbulence = 0;
        this.targetTurbulence = 0; // ✨ Reset target as well
        console.log('🌊 Fluid turbulence reset to calm state');
    }
    
    /**
     * Apply circular force from Cymatics patterns to fluid field
     * PHILOSOPHY: Sound waves physically disturb the medium, creating visible flow patterns
     * 
     * @param {Array<Object>} activeRings - Array of active cymatics rings with x, y, radius, strength
     */
    applyCircularForce(activeRings) {
        if (!activeRings || activeRings.length === 0) return;
        
        activeRings.forEach(ring => {
            const centerGridX = floor(ring.x / this.resolution);
            const centerGridY = floor(ring.y / this.resolution);
            const ringGridRadius = ring.radius / this.resolution;
            const forceStrength = ring.strength * 2.5; // Amplify cymatics force
            
            // Create expanding circular wave force
            const searchRadius = ceil(ringGridRadius + 2);
            
            for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                    const gx = centerGridX + dx;
                    const gy = centerGridY + dy;
                    
                    if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
                        const gridDist = sqrt(dx * dx + dy * dy);
                        const ringDist = abs(gridDist - ringGridRadius);
                        
                        // Force concentrated at the ring edge (wave front)
                        if (ringDist < 2) {
                            const angle = atan2(dy, dx);
                            const forceMagnitude = forceStrength * (1 - ringDist / 2);
                            
                            // Tangential force (creates circular flow)
                            const tangentAngle = angle + HALF_PI;
                            const forceVec = createVector(
                                cos(tangentAngle) * forceMagnitude,
                                sin(tangentAngle) * forceMagnitude
                            );
                            
                            this.field[gy][gx].add(forceVec);
                        }
                    }
                }
            }
        });
    }

    /**
     * Get current turbulence level
     * Used by all systems to modulate behavior
     * 
     * @returns {number} Current turbulence (0-1)
     */
    getTurbulence() {
        return this.turbulence;
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

    addDrop(drop) {
        this.inkDrops.push(drop);
        this.applyInk(drop);

        // Apply a ripple effect if the drop's config has it enabled
        if (drop.config.ripple && drop.config.ripple.enabled) {
            this.applyRipple(drop.x, drop.y, drop.config.ripple.strength, drop.config.ripple.radius);
        }
    }

    /**
     * Applies a radial force to the velocity field to create a ripple.
     * @param {number} x - The center x-coordinate of the ripple.
     * @param {number} y - The center y-coordinate of the ripple.
     * @param {number} strength - The force of the ripple.
     * @param {number} radius - The radius of the ripple's effect.
     */
    applyRipple(x, y, strength, radius) {
        const cellX = Math.floor(x / this.scale);
        const cellY = Math.floor(y / this.scale);
        const radiusSq = (radius / this.scale) * (radius / this.scale);

        for (let i = -Math.floor(radius / this.scale); i <= Math.floor(radius / this.scale); i++) {
            for (let j = -Math.floor(radius / this.scale); j <= Math.floor(radius / this.scale); j++) {
                const targetX = cellX + i;
                const targetY = cellY + j;

                if (targetX >= 0 && targetX < this.width && targetY >= 0 && targetY < this.height) {
                    const dx = i;
                    const dy = j;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < radiusSq) {
                        const index = this.IX(targetX, targetY);
                        const dist = Math.sqrt(distSq);
                        
                        // Avoid division by zero
                        if (dist > 0) {
                            const force = strength * (1 - dist / (radius / this.scale));
                            this.vx[index] += (dx / dist) * force;
                            this.vy[index] += (dy / dist) * force;
                        }
                    }
                }
            }
        }
    }


    // ========================================
    // SIMULATION STEP
    // ========================================
    step() {
        // Add a repulsion force from the sun drop
        if (this.sunDrop) {
            this.applyRepulsion(
                this.sunDrop.x,
                this.sunDrop.y,
                this.sunDrop.config.repulsion.strength,
                this.sunDrop.config.repulsion.radius
            );
        }

        // Standard fluid simulation steps
        this.addSource(this.density, this.s);
        this.diffuse(this.vx0, this.vx, this.visc, this.dt);
        this.project(this.vx, this.vy, this.vx0, this.vy0);
    }

    /**
     * Applies a radial repulsion force to the velocity field.
     * @param {number} x - The center x-coordinate of the repulsion.
     * @param {number} y - The center y-coordinate of the repulsion.
     * @param {number} strength - The force of the repulsion.
     * @param {number} radius - The radius of the repulsion's effect.
     */
    applyRepulsion(x, y, strength, radius) {
        const cellX = Math.floor(x / this.scale);
        const cellY = Math.floor(y / this.scale);
        const radiusSq = (radius / this.scale) * (radius / this.scale);

        for (let i = -Math.floor(radius / this.scale); i <= Math.floor(radius / this.scale); i++) {
            for (let j = -Math.floor(radius / this.scale); j <= Math.floor(radius / this.scale); j++) {
                const targetX = cellX + i;
                const targetY = cellY + j;

                if (targetX >= 0 && targetX < this.width && targetY >= 0 && targetY < this.height) {
                    const dx = targetX - cellX;
                    const dy = targetY - cellY;
                    const distSq = dx * dx + dy * dy;

                    if (distSq > 0 && distSq < radiusSq) {
                        const index = this.IX(targetX, targetY);
                        const dist = Math.sqrt(distSq);
                        const force = (strength / (distSq + 0.0001)) * (1 - dist / (radius / this.scale));
                        this.vx[index] += (dx / dist) * force;
                        this.vy[index] += (dy / dist) * force;
                    }
                }
            }
        }
    }

    // ========================================
    // RENDERING
    // ========================================
    render() {
        // Rendering code here (e.g., drawing the fluid simulation to the canvas)
    }
}
