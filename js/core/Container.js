/**
 * Container.js - Inversion of Control Container
 * 
 * ARCHITECTURE PHILOSOPHY (from concept.md): "Single Source of Truth"
 * Enterprise Pattern: Dependency Injection Container
 * 
 * Just as time provides a universal reference frame, the Container provides
 * a universal service registry - one place to understand all dependencies.
 * 
 * This implements the "Enterprise-Grade Modularity" described in concept.md Section 2:
 * - Eliminates global variables (except container itself)
 * - Each component receives dependencies from the container
 * - Clear separation of concerns
 * - Easy testing via dependency injection
 * - Lazy initialization (services created only when needed)
 * 
 * Benefits:
 * - Single source of truth for dependencies
 * - Lazy initialization (services created only when needed)
 * - Easy mocking for tests
 * - Clear dependency graph (readable architecture)
 * 
 * @example
 * const container = new Container(CONFIG);
 * container.get('clock');  // returns Clock instance
 */
class Container {
    constructor(config) {
        if (!config) {
            throw new Error('Container: config is required');
        }
        
        this.config = config;
        this.services = new Map();
        this.factories = new Map();
        this.singletons = new Set();
        
        this._registerFactories();
    }

    /**
     * Register service factories
     * Factory pattern: delayed instantiation until first access
     */
    _registerFactories() {
        // Configuration as a service (for consistency with IoC pattern)
        this.registerSingleton('config', () => this.config);
        
        // Core services
        this.registerSingleton('clock', () => new Clock(this.config));
        this.registerSingleton('fluid', () => new Fluid(this.config.fluid.resolution, this.config));
        this.registerSingleton('colorManager', () => new ColorManager(this.config));
        this.registerSingleton('audio', () => new Audio(this.config));
        
        // Rendering strategies (shared instances for performance)
        this.registerSingleton('stampRenderer', () => 
            new StampRenderer(this.config.drops?.stamp || {})
        );
        this.registerSingleton('splatterRenderer', () => 
            new SplatterRenderer(this.config.drops?.splatter || {})
        );
        
        // Object pool for performance (must be registered BEFORE particleFactory)
        // Note: Pool will receive factory through lazy getter
        this.registerSingleton('particlePool', () =>
            new ObjectPool(
                () => this.get('particleFactory'),
                this.config.performance?.poolSize || 200
            )
        );
        
        // Particle factory (depends on other services + pool)
        // ✨ Now includes pool for object pooling performance
        this.registerSingleton('particleFactory', () => {
            const factory = new ParticleFactory({
                config: this.config,
                fluid: this.get('fluid'),
                colorManager: this.get('colorManager'),
                stampRenderer: this.get('stampRenderer'),
                splatterRenderer: this.get('splatterRenderer'),
                pool: this.get('particlePool') // ✨ Inject pool
            });
            return factory;
        });
    }

    /**
     * Register a singleton service
     * Singleton: only one instance exists
     * 
     * @param {string} name - Service name
     * @param {Function} factory - Factory function that creates the service
     */
    registerSingleton(name, factory) {
        if (typeof factory !== 'function') {
            throw new Error(`Container: factory for '${name}' must be a function`);
        }
        
        this.factories.set(name, factory);
        this.singletons.add(name);
    }

    /**
     * Register a transient service
     * Transient: new instance created each time
     * 
     * @param {string} name - Service name
     * @param {Function} factory - Factory function
     */
    registerTransient(name, factory) {
        if (typeof factory !== 'function') {
            throw new Error(`Container: factory for '${name}' must be a function`);
        }
        
        this.factories.set(name, factory);
    }

    /**
     * Get a service instance
     * Lazy initialization: created on first access
     * 
     * @param {string} name - Service name
     * @returns {*} Service instance
     * @throws {Error} If service not registered
     */
    get(name) {
        // Return cached singleton
        if (this.services.has(name)) {
            return this.services.get(name);
        }

        // Check if factory exists
        if (!this.factories.has(name)) {
            throw new Error(`Container: service '${name}' not registered. Available: ${Array.from(this.factories.keys()).join(', ')}`);
        }

        // Create instance
        const factory = this.factories.get(name);
        const instance = factory();

        // Cache if singleton
        if (this.singletons.has(name)) {
            this.services.set(name, instance);
        }

        return instance;
    }

    /**
     * Check if service is registered
     * @param {string} name - Service name
     * @returns {boolean}
     */
    has(name) {
        return this.factories.has(name) || this.services.has(name);
    }

    /**
     * Clear all cached services
     * Useful for testing or hot reload
     */
    clear() {
        this.services.clear();
    }

    /**
     * Get all registered service names
     * @returns {string[]}
     */
    getRegisteredServices() {
        return Array.from(this.factories.keys());
    }

    /**
     * Replace a service (useful for testing/mocking)
     * @param {string} name - Service name
     * @param {*} instance - Service instance
     */
    mock(name, instance) {
        this.services.set(name, instance);
    }
}
