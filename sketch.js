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
 * Mouse interaction - Apply force to fluid based on mouse movement
 * 
 * PHILOSOPHY (Pillar 3): "The Fluid as Attention Reservoir"
 * Mouse movement represents distraction and scattered focus. The faster the mouse moves,
 * the more turbulence is injected into the "attention reservoir," making the fluid less
 * viscous and causing ink drops to spread chaotically. This creates a tangible feedback
 * loop where the user's interaction directly reflects their mental state.
 */
function mouseMoved() {
    if (app && !mouseIsPressed) {
        const fluid = app.container.get('fluid');
        const factory = app.container.get('particleFactory');
        const colorManager = app.container.get('colorManager');
        const clock = app.container.get('clock');
        const config = app.container.get('config');
        
        if (fluid) {
            const dx = mouseX - pmouseX;
            const dy = mouseY - pmouseY;
            const speed = sqrt(dx * dx + dy * dy);
            
            if (speed > 0.5) {  // Only respond to meaningful movement
                const force = createVector(dx, dy).normalize();
                const strength = config.fluid.mouseForce.strength;
                
                // Apply force to fluid at mouse position
                fluid.addForceAtPoint(mouseX, mouseY, force, strength);
                
                // Add turbulence based on mouse speed
                // PHILOSOPHY: Fast movement = scattered attention = high turbulence
                fluid.addTurbulence(speed * 0.01);
                
                // Create visible ink drops at mouse position for feedback
                // PHILOSOPHY: Make distraction visible - every movement leaves a trace
                if (factory && colorManager && clock && frameCount % 3 === 0) {  // Every 3 frames to avoid spam
                    const currentMinute = clock.getCurrentMinute();
                    const currentHour = clock.getCurrentHour();
                    const color = colorManager.getColorForTime(currentMinute, currentHour);
                    const drop = factory.createSecondDrop(mouseX, mouseY, color);
                    if (drop) {
                        app.activeDrops.push(drop);
                    }
                }
            }
        }
    }
}

/**
 * Application - Main application class
 * Manages application lifecycle and coordinates all services
 * 
 * PHILOSOPHY: "Time flows equally, but traces differ based on our actions"
 * Zen Mode allows pure observation without numerical time reference
 * 
 * @class
 * @property {Container} container - IoC container with all dependencies
 * @property {boolean} isPaused - Pause state
 * @property {number} turbulenceLevel - Current turbulence (0-1)
 * @property {boolean} isZenMode - Zen mode (hide time display)
 * @property {boolean} isDebugMode - Debug mode (show performance)
 * @property {Object} layers - Graphics layers for rendering
 * @property {Array<InkDrop>} activeDrops - Active ink drops
 * @property {Array<InkDrip>} activeDrips - Active drips
 * @property {SunDrop} sunDrop - Sun drop (objective time marker)
 * @property {Array<CymaticPattern>} cymaticPatterns - Active cymatics patterns
 */
class Application {
    constructor(container) {
        this.container = container;
        this.isPaused = false;
        this.turbulenceLevel = 0;
        
        // UX enhancements
        this.isZenMode = false;          // z key: hide time display for pure observation
        this.isDebugMode = false;        // d key: show performance metrics
        this.showKeyboardHelp = false;   // ? key: show keyboard shortcuts
        
        // Graphics layers
        this.layers = {
            bg: null,
            trail: null,
            history: null,
            fx: null,        // ✨ Effects layer for Cymatics
            active: null
        };
        
        // Particle collections
        this.activeDrops = [];
        this.activeDrips = [];
        this.sunDrop = null;
        this.cymaticPatterns = []; // ✨ Cymatics patterns
        
        // Performance monitoring
        this.frameRateHistory = [];
        this.frameRateAverage = 60;
        
        // ✨ Onboarding UX
        this.hasInteracted = false;
        this.onboardingAlpha = 255;
    }

    /**
     * Initialize application
     * Sets up graphics layers, sun drop, and event listeners
     * 
     * @throws {Error} If container or required services are missing
     */
    setup() {
        // Get services
        const clock = this.container.get('clock');
        const factory = this.container.get('particleFactory');
        const fluid = this.container.get('fluid');
        
        // Initialize graphics layers
        this.layers.bg = createGraphics(width, height);
        this.layers.trail = createGraphics(width, height);
        this.layers.history = createGraphics(width, height);
        this.layers.fx = createGraphics(width, height); // ✨ Effects layer
        this.layers.active = createGraphics(width, height);
        
        this.layers.trail.clear();
        this.layers.fx.clear();
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

    /**
     * Main draw loop
     * Updates all systems and renders layers
     * 
     * PHILOSOPHY: Turbulence modulates all systems simultaneously
     * - Viscosity: affects fluid flow
     * - Audio: affects sound characteristics
     * - Chimes: trigger cymatics patterns
     * - Sun repulsion: affects drop movement
     * - Trail accumulation: affects visual persistence
     */
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
            
            // PHILOSOPHY: Turbulence modulates all systems
            // Distraction doesn't speed time, but creates more traces
            colorManager.update(this.turbulenceLevel);
            audio.updateTurbulence(this.turbulenceLevel);
            fluid.updateViscosity(this.turbulenceLevel);
            fluid.update();
            this.sunDrop.update(minute());
        }
        
        // SONIFICATION: Map SunDrop position to audio (hear time without looking)
        const normalizedTime = this.sunDrop.x / width;
        audio.updateTimeSonification(normalizedTime);
        
        // Update Cymatics patterns
        this._updateCymaticPatterns();
        
        // Rendering
        this._fadeTrailLayer();
        this.sunDrop.stampTrail(this.layers.trail, this.turbulenceLevel);
        this._updateAndRenderDrops(fluid);
        this._renderCymaticPatterns(); // ✨ Render Cymatics
        this.sunDrop.render(this.layers.active);
        this._renderLayers();
        
        // Audio and UI
        const inkDensity = this._calculateInkDensity();
        audio.update(inkDensity);
        this._renderOnboarding(); // ✨ Onboarding UX cue
        this._renderKeyboardHelp(); // ✨ Keyboard shortcuts help
        this._updateUI(clock);
    }

    _createSecondDrop(data, factory) {
        try {
            const colorManager = this.container.get('colorManager');
            const audio = this.container.get('audio');
            
            // PHILOSOPHY: Visual-audio feedback loop - audio brightness influences ink vibrancy
            const sonificationValue = audio.getLastSonificationValue();
            const dropColor = colorManager.getColorForTime(data.minute, data.hour, sonificationValue);
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
            
            const sonificationValue = audio.getLastSonificationValue();
            const dropColor = colorManager.getColorForTime(data.minute, data.hour, sonificationValue);
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
            
            const sonificationValue = audio.getLastSonificationValue();
            const dropColor = colorManager.getColorForTime(0, data.hour, sonificationValue);
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
            const fluid = this.container.get('fluid');
            
            const sonificationValue = audio.getLastSonificationValue();
            const dropColor = colorManager.getColorForTime(data.minute, data.hour, sonificationValue);
            const centerX = width / 2 + random(-100, 100);
            const centerY = height / 2 + random(-100, 100);
            const rippleCount = CONFIG.chime.ripple.count;
            const rippleRadius = CONFIG.chime.ripple.radius;
            
            // PHILOSOPHY: Strong chime = temporal signpost
            // Creates both visual pattern AND fluid disturbance
            
            // 1. Create visual pattern (circle of drops)
            for (let i = 0; i < rippleCount; i++) {
                const angle = (TWO_PI / rippleCount) * i;
                const x = centerX + cos(angle) * rippleRadius;
                const y = centerY + sin(angle) * rippleRadius;
                const drop = factory.createChimeDrop(x, y, dropColor);
                this.activeDrops.push(drop);
            }
            
            // 2. Create STRONG fluid ripple (1/3 screen size)
            const rippleStrength = CONFIG.chime.ripple.strength || 5;
            const rippleSize = min(width, height) / 3; // 1/3 of screen
            if (fluid.applyRipple) {
                fluid.applyRipple(centerX, centerY, rippleSize, rippleStrength);
            }
            
            // 3. Create CYMATICS pattern (visual sound wave)
            const cymaticPattern = new CymaticPattern(centerX, centerY, data.minute);
            this.cymaticPatterns.push(cymaticPattern);
            
            // 4. Strong audio feedback (bell-like)
            audio.playDropSound(centerX, data.minute);
            console.log(`🔔 CHIME at ${data.minute} minutes - Cymatics pattern + fluid ripple`);
            
        } catch (error) {
            console.error('Failed to create chime drop:', error);
        }
    }

    _updateAndRenderDrops(fluid) {
        this.layers.active.clear();
        const inkDensity = this._calculateInkDensity();
        const viscosity = this._getViscosityFromDensity(inkDensity);
        
        // Get pool for object recycling
        const pool = this.container.get('particlePool');
        
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
                // ✨ Return to pool instead of just removing
                if (pool) {
                    pool.release(drop);
                }
                this.activeDrops.splice(i, 1);
            } else {
                drop.display(this.layers.active);
            }
        }
        
        // Update drips (not pooled yet, but could be in future)
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
        image(this.layers.fx, 0, 0);      // ✨ Cymatics layer
        image(this.layers.active, 0, 0);
    }

    _updateCymaticPatterns() {
        const fluid = this.container.get('fluid');
        
        // Update and clean up completed patterns
        for (let i = this.cymaticPatterns.length - 1; i >= 0; i--) {
            const pattern = this.cymaticPatterns[i];
            
            // PHILOSOPHY: Cymatics patterns return active rings for fluid interaction
            // Sound creates visible waves that physically disturb the medium
            const activeRings = pattern.update();
            
            // Apply circular force to fluid - pass the entire array of active rings
            if (activeRings && activeRings.length > 0) {
                fluid.applyCircularForce(activeRings);
            }
            
            if (pattern.isComplete()) {
                this.cymaticPatterns.splice(i, 1);
            }
        }
    }

    _renderCymaticPatterns() {
        this.layers.fx.clear();
        this.cymaticPatterns.forEach(pattern => {
            pattern.render(this.layers.fx);
        });
    }

    _fadeTrailLayer() {
        // PHILOSOPHY: Busier time = more traces = slower fade
        // When turbulent, traces accumulate longer (more records of activity)
        
        const baseFadeAlpha = CONFIG.trail.fadeAlpha || 8;
        
        // High turbulence (busy) → lower fade alpha → traces persist longer
        const fadeAlpha = lerp(
            baseFadeAlpha,           // calm: 8 (fades normally)
            baseFadeAlpha * 0.3,     // distracted: 2.4 (fades slowly, accumulates)
            this.turbulenceLevel
        );
        
        this.layers.trail.fill(255, fadeAlpha);
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
        this.layers.fx.clear(); // ✨ Clear Cymatics patterns
        this.activeDrops = [];
        this.activeDrips = [];
        this.cymaticPatterns = []; // ✨ Clear patterns array
        
        const fluid = this.container.get('fluid');
        if (fluid && typeof fluid.resetTurbulence === 'function') {
            fluid.resetTurbulence();
        }
    }

    /**
     * Render subtle onboarding cue for first-time users
     * PHILOSOPHY: "Discovery without disruption" - guide intuitively without tutorials
     * ✨ ENHANCED: More explicit multi-line instructions for better UX
     */
    _renderOnboarding() {
        if (!this.hasInteracted && this.onboardingAlpha > 0) {
            const fluid = this.container.get('fluid');
            
            // Check if user has interacted (turbulence detected)
            if (fluid.getTurbulence() > 0.01) {
                this.hasInteracted = true;
            }

            // Fade out after interaction
            if (this.hasInteracted) {
                this.onboardingAlpha -= 5;
            }

            // ✨ Enhanced multi-line instructions
            push();
            textAlign(CENTER, CENTER);
            textSize(18);
            textFont('Georgia'); // Elegant, readable font
            
            // Gentle pulse effect
            const pulse = sin(frameCount * 0.05) * 10 + 245;
            const alpha = this.onboardingAlpha * (pulse / 255);
            
            fill(100, alpha);
            noStroke();
            
            // Multi-line instructions
            const lines = [
                "Move your mouse slowly...",
                "then quickly...",
                "Watch how time responds"
            ];
            
            let yOffset = mouseY - 70;
            lines.forEach((line, i) => {
                text(line, mouseX, yOffset + i * 25);
            });
            
            // ✨ Visual hint - pulsing circle around cursor
            stroke(100, alpha * 0.5);
            strokeWeight(2);
            noFill();
            const circleSize = 50 + sin(frameCount * 0.08) * 10;
            ellipse(mouseX, mouseY, circleSize, circleSize);
            
            pop();
        }
    }

    /**
     * Render keyboard shortcuts help overlay
     * ✨ USER EXPERIENCE: Makes controls discoverable
     */
    _renderKeyboardHelp() {
        if (this.showKeyboardHelp) {
            push();
            
            // Semi-transparent background
            fill(0, 220);
            noStroke();
            rect(10, height - 180, 320, 170, 5);
            
            // Title
            fill(255);
            textSize(14);
            textFont('monospace');
            textAlign(LEFT, TOP);
            text("KEYBOARD SHORTCUTS", 20, height - 170);
            
            // Shortcuts list
            textSize(12);
            const shortcuts = [
                "SPACE : Pause/Resume",
                "Z     : Zen Mode (hide time)",
                "D     : Debug Mode (performance)",
                "?     : Toggle this help"
            ];
            
            shortcuts.forEach((line, i) => {
                text(line, 20, height - 145 + i * 22);
            });
            
            // Subtle hint
            fill(150);
            textSize(10);
            text("Press ? again to hide", 20, height - 25);
            
            pop();
        }
    }

    _updateUI(clock) {
        const timeDisplay = select('#time-display');
        if (timeDisplay) {
            // PHILOSOPHY: Zen Mode - experience time without looking at numbers
            if (this.isZenMode) {
                timeDisplay.html('');
                timeDisplay.style('opacity', '0');
            } else {
                timeDisplay.html(clock.getTimeString());
                timeDisplay.style('opacity', '1');
            }
        }
        
        // Debug mode: performance overlay
        if (this.isDebugMode) {
            this._renderDebugOverlay();
        }
    }
    
    /**
     * Render performance metrics overlay
     * TECHNICAL SOPHISTICATION: Real-time monitoring for optimization
     * ✨ Now includes object pool statistics
     */
    _renderDebugOverlay() {
        // Update FPS history
        this.frameRateHistory.push(frameRate());
        if (this.frameRateHistory.length > 60) {
            this.frameRateHistory.shift();
        }
        this.frameRateAverage = this.frameRateHistory.reduce((a, b) => a + b, 0) / this.frameRateHistory.length;
        
        // Get pool stats
        const pool = this.container.get('particlePool');
        const poolStats = pool ? pool.getStats() : null;
        
        // Render overlay (taller to fit pool stats)
        push();
        fill(0, 200);
        noStroke();
        const overlayHeight = poolStats ? 180 : 120;
        rect(10, 10, 280, overlayHeight, 5);
        
        fill(255);
        textSize(12);
        textFont('monospace');
        text(`FPS: ${this.frameRateAverage.toFixed(1)}`, 20, 30);
        text(`Drops: ${this.activeDrops.length}`, 20, 50);
        text(`Drips: ${this.activeDrips.length}`, 20, 70);
        text(`Cymatics: ${this.cymaticPatterns.length}`, 20, 90);
        text(`Turbulence: ${(this.turbulenceLevel * 100).toFixed(1)}%`, 20, 110);
        
        // ✨ Pool statistics
        if (poolStats) {
            fill(100, 255, 100); // Green for pool stats
            text(`Pool Active: ${poolStats.active}`, 20, 130);
            text(`Pool Available: ${poolStats.available}`, 20, 150);
            text(`Pool Created: ${poolStats.totalCreated}`, 20, 170);
        }
        
        pop();
    }

    /**
     * Handle window resize
     * Recreates canvas and reinitializes background
     */
    handleResize() {
        resizeCanvas(windowWidth, windowHeight);
        this._initializeBackgroundLayer();
    }

    /**
     * Handle key press events
     * 
     * PHILOSOPHY (Pillar 4): "Zen & Debug Modes - User Empowerment"
     * Allows the user to control their experience:
     * - Zen Mode: Experience time without numbers, encouraging pure perception
     * - Debug Mode: Transparent view of system metrics for understanding
     * - Pause: Take control of time's flow
     * 
     * @param {string} key - Pressed key character
     * @param {number} keyCode - Key code
     * 
     * Controls:
     * - SPACE: Pause/Resume
     * - Z: Toggle Zen Mode (hide time) - "Feel time, don't measure it"
     * - D: Toggle Debug Mode (show metrics) - "Understand the mechanism"
     * - ?: Toggle Keyboard Help - "Discover available controls"
     */
    handleKeyPress(key, keyCode) {
        if (key === ' ') {
            this.isPaused = !this.isPaused;
            console.log(this.isPaused ? '⏸ Paused' : '▶ Resumed');
        } else if (key === 'z' || key === 'Z') {
            this.isZenMode = !this.isZenMode;
            console.log(this.isZenMode ? '🧘 Zen Mode: ON (time hidden)' : '🕐 Zen Mode: OFF (time shown)');
        } else if (key === 'd' || key === 'D') {
            this.isDebugMode = !this.isDebugMode;
            console.log(this.isDebugMode ? '🔧 Debug Mode: ON' : '🔧 Debug Mode: OFF');
        } else if (key === '?' || key === '/') {
            this.showKeyboardHelp = !this.showKeyboardHelp;
            console.log(this.showKeyboardHelp ? '⌨️  Keyboard Help: ON' : '⌨️  Keyboard Help: OFF');
        }
    }
}
