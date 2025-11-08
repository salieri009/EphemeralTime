/**
 * sketch.js - Ephemeral Time v0.3
 * Enterprise-Grade Architecture with IoC Container
 * 
 * ARCHITECTURE IMPROVEMENTS:
 * - IoC Container: No global variables, managed dependencies
 * - Factory Pattern: Centralized particle creation
 * - Error Handling: Try-catch blocks with meaningful messages
 * - Performance: Shared renderers, efficient updates
 */

// IoC Container (single global, manages everything else)
let container;
let app;

function setup() {
    try {
        createCanvas(windowWidth, windowHeight);
        
        // Initialize IoC Container
        container = new Container(CONFIG);
        
        // Get services from container
        const clock = container.get('clock');
        const factory = container.get('particleFactory');
        
        // Initialize application
        app = new Application(container);
        app.setup();
        
        console.log('✓ Setup complete - EphemeralTime v0.3 (Enterprise Architecture)');
        console.log('✓ IoC Container initialized');
        console.log('✓ Registered services:', container.getRegisteredServices().join(', '));
        
    } catch (error) {
        console.error('✗ Setup failed:', error);
        alert(`Setup failed: ${error.message}`);
    }
}

function draw() {
    try {
        if (app) {
            app.draw();
        }
    } catch (error) {
        console.error('✗ Draw loop error:', error);
        noLoop(); // Stop draw loop on critical error
    }
}

function windowResized() {
    try {
        if (app) {
            app.handleResize();
        }
    } catch (error) {
        console.error('✗ Resize error:', error);
    }
}

function keyPressed() {
    try {
        if (app) {
            app.handleKeyPress(key, keyCode);
        }
    } catch (error) {
        console.error('✗ Key press error:', error);
    }
}

/**
 * Application - Main application class
 * Manages application lifecycle and coordinates all services
 */
class Application {
    constructor(container) {
        this.container = container;
        this.isPaused = false;
        this.turbulenceLevel = 0;
        
        // Graphics layers
        this.layers = {
            bg: null,
            trail: null,
            history: null,
            active: null
        };
        
        // Particle collections
        this.activeDrops = [];
        this.activeDrips = [];
        this.sunDrop = null;
    }

    setup() {
        // Get services
        const clock = this.container.get('clock');
        const factory = this.container.get('particleFactory');
        const fluid = this.container.get('fluid');
        
        // Initialize graphics layers
        this.layers.bg = createGraphics(width, height);
        this.layers.trail = createGraphics(width, height);
        this.layers.history = createGraphics(width, height);
        this.layers.active = createGraphics(width, height);
        
        this.layers.trail.clear();
        this._initializeBackgroundLayer();
        
        // Create sun drop
        this.sunDrop = factory.createSunDrop(CONFIG.sun, width);
        
        // Setup event listeners
        this._setupEventListeners(clock, factory);
    }

    _setupEventListeners(clock, factory) {
        clock.on('second', (data) => {
            if (!this.isPaused) this._createSecondDrop(data, factory);
        });
        
        clock.on('minute', (data) => {
            if (!this.isPaused) this._createMinuteDrop(data, factory);
        });
        
        clock.on('hour', (data) => {
            if (!this.isPaused) this._createHourDrop(data, factory);
        });
        
        clock.on('hourComplete', (data) => {
            if (!this.isPaused) {
                console.log(`Hour ${data.completedHour} complete. Resetting canvas for hour ${data.newHour}.`);
                this._resetCanvasForNewHour();
            }
        });
        
        clock.on('chime', (data) => {
            if (!this.isPaused) this._createChimeDrop(data, factory);
        });
    }

    draw() {
        background(255);
        
        // Get services
        const clock = this.container.get('clock');
        const fluid = this.container.get('fluid');
        const colorManager = this.container.get('colorManager');
        const audio = this.container.get('audio');
        
        // Update core systems
        clock.update();
        
        if (!this.isPaused) {
            this.turbulenceLevel = fluid.getTurbulence();
            colorManager.update(this.turbulenceLevel);
            audio.updateTurbulence(this.turbulenceLevel);
            fluid.update();
            this.sunDrop.update(minute());
        }
        
        // Rendering
        this._fadeTrailLayer();
        this.sunDrop.stampTrail(this.layers.trail, this.turbulenceLevel);
        this._updateAndRenderDrops(fluid);
        this.sunDrop.render(this.layers.active);
        this._renderLayers();
        
        // Audio and UI
        const inkDensity = this._calculateInkDensity();
        audio.update(inkDensity);
        this._updateUI(clock);
    }

    _createSecondDrop(data, factory) {
        try {
            const colorManager = this.container.get('colorManager');
            const audio = this.container.get('audio');
            
            const dropColor = colorManager.getColorForTime(data.minute, data.hour);
            const x = random(width * 0.2, width * 0.8);
            const y = random(height * 0.2, height * 0.8);
            
            const drop = factory.createSecondDrop(x, y, dropColor);
            this.activeDrops.push(drop);
            audio.playDropSound(x, data.minute);
        } catch (error) {
            console.error('Failed to create second drop:', error);
        }
    }

    _createMinuteDrop(data, factory) {
        try {
            const colorManager = this.container.get('colorManager');
            const audio = this.container.get('audio');
            
            const dropColor = colorManager.getColorForTime(data.minute, data.hour);
            const x = random(width * 0.1, width * 0.9);
            const y = random(height * 0.1, height * 0.9);
            
            const drop = factory.createMinuteDrop(x, y, dropColor);
            this.activeDrops.push(drop);
            audio.playDropSound(x, data.minute);
        } catch (error) {
            console.error('Failed to create minute drop:', error);
        }
    }

    _createHourDrop(data, factory) {
        try {
            const colorManager = this.container.get('colorManager');
            const audio = this.container.get('audio');
            
            const dropColor = colorManager.getColorForTime(0, data.hour);
            const x = width / 2;
            const y = height / 2;
            
            const drop = factory.createHourDrop(x, y, dropColor);
            this.activeDrops.push(drop);
            audio.playDropSound(x, 0);
        } catch (error) {
            console.error('Failed to create hour drop:', error);
        }
    }

    _createChimeDrop(data, factory) {
        try {
            const colorManager = this.container.get('colorManager');
            const audio = this.container.get('audio');
            
            const dropColor = colorManager.getColorForTime(data.minute, data.hour);
            const centerX = width / 2 + random(-100, 100);
            const centerY = height / 2 + random(-100, 100);
            const rippleCount = CONFIG.chime.ripple.count;
            const rippleRadius = CONFIG.chime.ripple.radius;
            
            for (let i = 0; i < rippleCount; i++) {
                const angle = (TWO_PI / rippleCount) * i;
                const x = centerX + cos(angle) * rippleRadius;
                const y = centerY + sin(angle) * rippleRadius;
                const drop = factory.createChimeDrop(x, y, dropColor);
                this.activeDrops.push(drop);
            }
            audio.playDropSound(centerX, data.minute);
        } catch (error) {
            console.error('Failed to create chime drop:', error);
        }
    }

    _updateAndRenderDrops(fluid) {
        this.layers.active.clear();
        const inkDensity = this._calculateInkDensity();
        const viscosity = this._getViscosityFromDensity(inkDensity);
        
        // Update drops
        for (let i = this.activeDrops.length - 1; i >= 0; i--) {
            const drop = this.activeDrops[i];
            drop.stampTrail(this.layers.trail, this.turbulenceLevel);
            
            const newDrip = drop.update();
            if (newDrip) this.activeDrips.push(newDrip);
            
            if (drop.shouldStamp()) {
                drop.stampToHistory(this.layers.history);
            }
            
            if (drop.isDead) {
                this.activeDrops.splice(i, 1);
            } else {
                drop.display(this.layers.active);
            }
        }
        
        // Update drips
        for (let i = this.activeDrips.length - 1; i >= 0; i--) {
            const drip = this.activeDrips[i];
            drip.update();
            
            if (drip.shouldStamp()) {
                drip.stampToHistory(this.layers.history);
            }
            
            if (drip.isDead) {
                this.activeDrips.splice(i, 1);
            } else {
                drip.display(this.layers.active);
            }
        }
    }

    _renderLayers() {
        image(this.layers.bg, 0, 0);
        image(this.layers.trail, 0, 0);
        image(this.layers.history, 0, 0);
        image(this.layers.active, 0, 0);
    }

    _fadeTrailLayer() {
        this.layers.trail.fill(255, CONFIG.trail.fadeAlpha);
        this.layers.trail.noStroke();
        this.layers.trail.rect(0, 0, width, height);
    }

    _calculateInkDensity() {
        const totalDrops = this.activeDrops.length + this.activeDrips.length;
        const canvasArea = width * height;
        return totalDrops / (canvasArea / 10000);
    }

    _getViscosityFromDensity(density) {
        return map(density, 0, 5, 0.98, 0.85, true);
    }

    _initializeBackgroundLayer() {
        this.layers.bg.background(255);
    }

    _resetCanvasForNewHour() {
        this.layers.history.clear();
        this.layers.history.background(255, 0);
        this.layers.trail.clear();
        this.activeDrops = [];
        this.activeDrips = [];
        
        const fluid = this.container.get('fluid');
        if (fluid && typeof fluid.resetTurbulence === 'function') {
            fluid.resetTurbulence();
        }
    }

    _updateUI(clock) {
        const timeDisplay = select('#time-display');
        if (timeDisplay) {
            timeDisplay.html(clock.getCurrentTimeString());
        }
    }

    handleResize() {
        resizeCanvas(windowWidth, windowHeight);
        this._initializeBackgroundLayer();
    }

    handleKeyPress(key, keyCode) {
        if (key === ' ') {
            this.isPaused = !this.isPaused;
            console.log(this.isPaused ? 'Paused' : 'Resumed');
        }
    }
}
        turbulenceLevel = fluid.getTurbulence();
        colorManager.update(turbulenceLevel);
        audio.updateTurbulence(turbulenceLevel);
        fluid.update();
        sunDrop.update(minute());
    }
    
    // Fade trail layer gradually (creates ghosting effect)
    fadeTrailLayer();
    
    // Sun trail
    sunDrop.stampTrail(trailLayer, turbulenceLevel);
    
    updateAndRenderDrops();
    sunDrop.render(activeLayer);
    renderLayers();
    
    const inkDensity = calculateInkDensity();
    audio.update(inkDensity);
    updateUI();
}

function createSecondDrop(data) {
    const dropColor = colorManager.getColorForTime(data.minute, data.hour);
    const x = random(width * 0.2, width * 0.8);
    const y = random(height * 0.2, height * 0.8);
    
    // Dependency Injection: pass required dependencies
    const drop = new InkDrop(x, y, dropColor, 'second', {
        config: CONFIG,
        stampRenderer: stampRenderer,
        splatterRenderer: splatterRenderer,
        fluid: fluid
    });
    
    activeDrops.push(drop);
    audio.playDropSound(x, data.minute);
}

function createMinuteDrop(data) {
    const dropColor = colorManager.getColorForTime(data.minute, data.hour);
    const x = random(width * 0.1, width * 0.9);
    const y = random(height * 0.1, height * 0.9);
    
    // Dependency Injection: pass required dependencies
    const drop = new InkDrop(x, y, dropColor, 'minute', {
        config: CONFIG,
        stampRenderer: stampRenderer,
        splatterRenderer: splatterRenderer,
        fluid: fluid
    });
    
    activeDrops.push(drop);
    audio.playDropSound(x, data.minute);
}

function createHourDrop(data) {
    const dropColor = colorManager.getColorForTime(0, data.hour);
    const x = width / 2;
    const y = height / 2;
    
    // Dependency Injection: pass required dependencies
    const drop = new InkDrop(x, y, dropColor, 'hour', {
        config: CONFIG,
        stampRenderer: stampRenderer,
        splatterRenderer: splatterRenderer,
        fluid: fluid
    });
    
    activeDrops.push(drop);
    audio.playDropSound(x, 0);
}

function createChimeDrop(data) {
    const dropColor = colorManager.getColorForTime(data.minute, data.hour);
    const centerX = width / 2 + random(-100, 100);
    const centerY = height / 2 + random(-100, 100);
    const rippleCount = CONFIG.chime.ripple.count;
    const rippleRadius = CONFIG.chime.ripple.radius;
    
    for (let i = 0; i < rippleCount; i++) {
        const angle = (TWO_PI / rippleCount) * i;
        const x = centerX + cos(angle) * rippleRadius;
        const y = centerY + sin(angle) * rippleRadius;
        
        // Dependency Injection: pass required dependencies
        const drop = new InkDrop(x, y, dropColor, 'chime', {
            config: CONFIG,
            stampRenderer: stampRenderer,
            splatterRenderer: splatterRenderer,
            fluid: fluid
        });
        
        activeDrops.push(drop);
    }
    audio.playDropSound(centerX, data.minute);
}

function updateAndRenderDrops() {
    activeLayer.clear();
    const inkDensity = calculateInkDensity();
    const viscosity = getViscosityFromDensity(inkDensity);
    
    // Update and render main drops
    for (let i = activeDrops.length - 1; i >= 0; i--) {
        const drop = activeDrops[i];
        const fluidVector = fluid.getVectorAt(drop.pos.x, drop.pos.y);
        const sunRepulsion = sunDrop.getRepulsionForce(drop.pos.x, drop.pos.y);
        
        // Leave motion trail
        drop.stampTrail(trailLayer, turbulenceLevel);
        
        // Update drop and collect new drips
        const newDrip = drop.update(fluidVector, viscosity, sunRepulsion);
        if (newDrip) {
            activeDrips.push(newDrip); // add to drip array
        }
        
        drop.display(activeLayer);
        
        if (drop.shouldStamp() && !drop.hasBeenStamped) {
            drop.stampToHistory(historyLayer);
        }
        
        if (drop.isDead()) {
            if (!drop.hasBeenStamped) drop.stampToHistory(historyLayer);
            activeDrops.splice(i, 1);
        }
    }
    
    // Update and render drips
    for (let i = activeDrips.length - 1; i >= 0; i--) {
        const drip = activeDrips[i];
        const fluidVector = fluid.getVectorAt(drip.pos.x, drip.pos.y);
        
        // Leave drip trail
        drip.stampTrail(trailLayer, turbulenceLevel);
        
        drip.update(fluidVector);
        drip.display(activeLayer);
        
        // Stamp drip trail to history periodically
        if (drip.shouldStamp()) {
            drip.stampToHistory(historyLayer);
        }
        
        if (drip.isDead) {
            activeDrips.splice(i, 1);
        }
    }
    
    if (activeDrops.length > CONFIG.performance.maxActiveDrops) {
        const excess = activeDrops.length - CONFIG.performance.maxActiveDrops;
        for (let i = 0; i < excess; i++) {
            const drop = activeDrops[i];
            if (!drop.hasBeenStamped) drop.stampToHistory(historyLayer);
        }
        activeDrops.splice(0, excess);
    }
}

function mouseMoved() {
    if (fluid && CONFIG.interaction?.fluidDrag?.enabled) {
        const mouseVel = createVector(mouseX - pmouseX, mouseY - pmouseY);
        if (typeof fluid.addForceAtPoint === 'function') {
            fluid.addForceAtPoint(mouseX, mouseY, mouseVel, CONFIG.fluid.mouseForce.strength);
        }
    }
    return false;
}

function mouseDragged() {
    const speed = dist(mouseX, mouseY, pmouseX, pmouseY);
    const threshold = CONFIG.turbulence?.velocityThreshold || CONFIG.fluid?.turbulence?.velocityThreshold || 5;
    
    if (fluid && speed > threshold) {
        const intensity = constrain(map(speed, threshold, 50, 0, 1), 0, 1);
        if (typeof fluid.addTurbulence === 'function') {
            fluid.addTurbulence(intensity);
        }
    }
    mouseMoved();
    return false;
}

function initializeBackgroundLayer() {
    bgLayer.background(255);
}

function resetCanvasForNewHour() {
    console.log('🔄 Resetting canvas for new hour...');
    
    // Clear all layers
    historyLayer.clear();
    historyLayer.background(255);
    
    trailLayer.clear();
    
    // Clear all active elements
    activeDrops = [];
    activeDrips = [];
    
    // Reset fluid turbulence
    if (fluid && typeof fluid.resetTurbulence === 'function') {
        fluid.resetTurbulence();
    }
    
    console.log('✅ Canvas reset complete');
}

function renderLayers() {
    image(bgLayer, 0, 0);
    image(trailLayer, 0, 0);
    image(historyLayer, 0, 0);
    image(activeLayer, 0, 0);
}

function fadeTrailLayer() {
    // Apply subtle fade to create ghosting effect
    // Lower fadeRate = longer trails (0.98 = very slow fade)
    trailLayer.push();
    trailLayer.noStroke();
    trailLayer.fill(255, 255, 255, CONFIG.trail.fadeAlpha);
    trailLayer.rect(0, 0, width, height);
    trailLayer.pop();
}

function calculateInkDensity() {
    const totalInk = activeDrops.reduce((sum, drop) => sum + drop.radius, 0);
    const maxInk = CONFIG.performance.maxActiveDrops * CONFIG.rendering.maxDropRadius;
    return constrain(totalInk / maxInk, 0, 1);
}

function getViscosityFromDensity(density) {
    return map(density, 0, 1, 1, 3);
}

function updateUI() {
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) timeDisplay.textContent = clock.getTimeString();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    bgLayer = createGraphics(width, height);
    historyLayer = createGraphics(width, height);
    activeLayer = createGraphics(width, height);
    initializeBackgroundLayer();
}

function keyPressed() {
    if (key === ' ') {
        isPaused = !isPaused;
        return false;
    }
    if (key === 'r' || key === 'R') {
        resetCanvasForNewHour();
        return false;
    }
}
