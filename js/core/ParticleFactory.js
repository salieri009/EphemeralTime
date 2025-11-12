/**
 * ParticleFactory.js - Factory for creating particles with dependency injection
 * 
 * Design Patterns:
 * - Factory Pattern: Centralized particle creation
 * - Builder Pattern: Fluent API for configuration
 * - Dependency Injection: All dependencies passed in constructor
 * 
 * Benefits:
 * - DRY: No duplicate creation code
 * - Single point of change for particle creation
 * - Easy to add new particle types
 * - Consistent dependency injection
 * 
 * @example
 * const factory = new ParticleFactory({ config, fluid, ... });
 * const drop = factory.createSecondDrop(100, 100, color(0));
 */
class ParticleFactory {
    /**
     * @param {Object} dependencies - Injected dependencies
     * @param {Object} dependencies.config - Application config
     * @param {Fluid} dependencies.fluid - Fluid simulation
     * @param {ColorManager} dependencies.colorManager - Color manager
     * @param {StampRenderer} dependencies.stampRenderer - Stamp renderer (shared)
     * @param {SplatterRenderer} dependencies.splatterRenderer - Splatter renderer (shared)
     * @param {ObjectPool} [dependencies.pool] - Object pool for performance (optional)
     */
    constructor(dependencies) {
        // Validate required dependencies
        this._validateDependencies(dependencies);
        
        this.config = dependencies.config;
        this.fluid = dependencies.fluid;
        this.colorManager = dependencies.colorManager;
        this.stampRenderer = dependencies.stampRenderer;
        this.splatterRenderer = dependencies.splatterRenderer;
        
        // ✨ Object pooling for performance
        this.pool = dependencies.pool || null;
        this.usePool = !!this.pool;
        
        // Reusable dependency object (performance optimization)
        this._particleDeps = {
            config: this.config,
            fluid: this.fluid,
            stampRenderer: this.stampRenderer,
            splatterRenderer: this.splatterRenderer
        };
    }

    /**
     * Validate dependencies (fail-fast principle)
     * @private
     */
    _validateDependencies(deps) {
        const required = ['config', 'fluid', 'colorManager', 'stampRenderer', 'splatterRenderer'];
        
        for (const key of required) {
            if (!deps[key]) {
                throw new Error(`ParticleFactory: missing required dependency '${key}'`);
            }
        }
        
        // Validate config structure
        if (!deps.config.drops) {
            throw new Error('ParticleFactory: config.drops is required');
        }
    }

    /**
     * Create a second drop (1x scale, every second)
     * Uses object pooling if available for performance
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {p5.Color} color - Drop color
     * @returns {InkDrop}
     */
    createSecondDrop(x, y, color) {
        this._validatePosition(x, y);
        this._validateColor(color);
        
        // ✨ Use pool if available
        if (this.usePool) {
            return this.pool.acquire(x, y, color, 'second');
        }
        
        return new InkDrop(x, y, color, 'second', this._particleDeps);
    }

    /**
     * Create a minute drop (6x scale, every minute)
     * Uses object pooling if available for performance
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {p5.Color} color - Drop color
     * @returns {InkDrop}
     */
    createMinuteDrop(x, y, color) {
        this._validatePosition(x, y);
        this._validateColor(color);
        
        // ✨ Use pool if available
        if (this.usePool) {
            return this.pool.acquire(x, y, color, 'minute');
        }
        
        return new InkDrop(x, y, color, 'minute', this._particleDeps);
    }

    /**
     * Create an hour drop (36x scale, every hour)
     * Uses object pooling if available for performance
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {p5.Color} color - Drop color
     * @returns {InkDrop}
     */
    createHourDrop(x, y, color) {
        this._validatePosition(x, y);
        this._validateColor(color);
        
        // ✨ Use pool if available
        if (this.usePool) {
            return this.pool.acquire(x, y, color, 'hour');
        }
        
        return new InkDrop(x, y, color, 'hour', this._particleDeps);
    }

    /**
     * Create a chime drop (special event drop)
     * Uses object pooling if available for performance
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {p5.Color} color - Drop color
     * @returns {InkDrop}
     */
    createChimeDrop(x, y, color) {
        this._validatePosition(x, y);
        this._validateColor(color);
        
        // ✨ Use pool if available
        if (this.usePool) {
            return this.pool.acquire(x, y, color, 'chime');
        }
        
        return new InkDrop(x, y, color, 'chime', this._particleDeps);
    }

    /**
     * Create an ink drip (trailing from larger drops)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {p5.Color} color - Drop color
     * @param {number} parentSize - Parent drop size
     * @returns {InkDrip}
     */
    createDrip(x, y, color, parentSize) {
        this._validatePosition(x, y);
        this._validateColor(color);
        
        if (typeof parentSize !== 'number' || parentSize <= 0) {
            throw new Error(`ParticleFactory: parentSize must be positive number, got ${parentSize}`);
        }
        
        return new InkDrip(x, y, color, parentSize, this._particleDeps);
    }

    /**
     * Create sun drop (special particle, never dies)
     * @param {Object} sunConfig - Sun configuration
     * @param {number} canvasWidth - Canvas width
     * @returns {SunDrop}
     */
    createSunDrop(sunConfig, canvasWidth) {
        if (!sunConfig) {
            throw new Error('ParticleFactory: sunConfig is required');
        }
        
        return new SunDrop(sunConfig, canvasWidth, this._particleDeps);
    }

    /**
     * Batch create drops (useful for events like chimes)
     * @param {Array<{x, y, color, type}>} specs - Array of drop specifications
     * @returns {Array<InkDrop>}
     */
    createBatch(specs) {
        if (!Array.isArray(specs)) {
            throw new Error('ParticleFactory: specs must be an array');
        }
        
        return specs.map(spec => {
            const { x, y, color, type = 'second' } = spec;
            
            switch (type) {
                case 'second': return this.createSecondDrop(x, y, color);
                case 'minute': return this.createMinuteDrop(x, y, color);
                case 'hour': return this.createHourDrop(x, y, color);
                case 'chime': return this.createChimeDrop(x, y, color);
                default:
                    throw new Error(`ParticleFactory: unknown type '${type}'`);
            }
        });
    }

    /**
     * Create drop with automatic color generation
     * Uses ColorManager to determine color based on time
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Drop type
     * @param {number} minute - Current minute (0-59)
     * @param {number} hour - Current hour (0-23)
     * @returns {InkDrop}
     */
    createDropWithAutoColor(x, y, type, minute, hour) {
        const color = this.colorManager.getColorForTime(minute, hour);
        
        switch (type) {
            case 'second': return this.createSecondDrop(x, y, color);
            case 'minute': return this.createMinuteDrop(x, y, color);
            case 'hour': return this.createHourDrop(x, y, color);
            case 'chime': return this.createChimeDrop(x, y, color);
            default:
                throw new Error(`ParticleFactory: unknown type '${type}'`);
        }
    }

    // ==================== VALIDATION HELPERS ====================

    /**
     * Validate position parameters
     * @private
     */
    _validatePosition(x, y) {
        if (typeof x !== 'number' || isNaN(x)) {
            throw new Error(`ParticleFactory: x must be a number, got ${x}`);
        }
        if (typeof y !== 'number' || isNaN(y)) {
            throw new Error(`ParticleFactory: y must be a number, got ${y}`);
        }
    }

    /**
     * Validate color parameter
     * @private
     */
    _validateColor(color) {
        if (!color) {
            throw new Error('ParticleFactory: color is required');
        }
        
        // Check if it's a p5.Color object or has RGB components
        const hasRGB = typeof color === 'object' && 
                      ('levels' in color || ('r' in color && 'g' in color && 'b' in color));
        
        if (!hasRGB) {
            throw new Error('ParticleFactory: color must be a p5.Color or RGB object');
        }
    }

    // ==================== BUILDER API (Optional Fluent Interface) ====================

    /**
     * Create a drop builder for complex configurations
     * @returns {DropBuilder}
     */
    builder() {
        return new DropBuilder(this);
    }
}

/**
 * DropBuilder - Fluent API for creating drops with complex configurations
 * 
 * @example
 * const drop = factory.builder()
 *     .at(100, 100)
 *     .withColor(color(255, 0, 0))
 *     .ofType('minute')
 *     .withAutoColor(30, 12)
 *     .build();
 */
class DropBuilder {
    constructor(factory) {
        this.factory = factory;
        this.x = 0;
        this.y = 0;
        this.color = null;
        this.type = 'second';
        this.autoColor = null;
    }

    /**
     * Set position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {DropBuilder}
     */
    at(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Set color
     * @param {p5.Color} color - Drop color
     * @returns {DropBuilder}
     */
    withColor(color) {
        this.color = color;
        return this;
    }

    /**
     * Set type
     * @param {string} type - Drop type
     * @returns {DropBuilder}
     */
    ofType(type) {
        this.type = type;
        return this;
    }

    /**
     * Enable auto color based on time
     * @param {number} minute - Current minute
     * @param {number} hour - Current hour
     * @returns {DropBuilder}
     */
    withAutoColor(minute, hour) {
        this.autoColor = { minute, hour };
        return this;
    }

    /**
     * Build the drop
     * @returns {InkDrop}
     */
    build() {
        if (this.autoColor) {
            return this.factory.createDropWithAutoColor(
                this.x, this.y, this.type,
                this.autoColor.minute, this.autoColor.hour
            );
        }

        if (!this.color) {
            throw new Error('DropBuilder: color is required (use withColor() or withAutoColor())');
        }

        switch (this.type) {
            case 'second': return this.factory.createSecondDrop(this.x, this.y, this.color);
            case 'minute': return this.factory.createMinuteDrop(this.x, this.y, this.color);
            case 'hour': return this.factory.createHourDrop(this.x, this.y, this.color);
            case 'chime': return this.factory.createChimeDrop(this.x, this.y, this.color);
            default:
                throw new Error(`DropBuilder: unknown type '${this.type}'`);
        }
    }
}
