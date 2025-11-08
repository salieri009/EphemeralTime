/**
 * sketch.js - Ephemeral Time v0.2
 * Event-driven architecture for "The Reservoir of Attention"
 * 
 * ARCHITECTURE:
 * - Dependency Injection for particle creation
 * - Shared renderers for performance
 * - Clear separation of concerns
 */

let clock, colorManager, fluid, audio, sunDrop;
let bgLayer, trailLayer, historyLayer, activeLayer;
let activeDrops = [];
let activeDrips = []; // dripping ink trails
let isPaused = false;
let turbulenceLevel = 0;

// Shared rendering strategies (performance optimization)
let stampRenderer, splatterRenderer;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    clock = new Clock(CONFIG);
    colorManager = new ColorManager(CONFIG);
    fluid = new Fluid(CONFIG.fluid.resolution, CONFIG);
    audio = new Audio(CONFIG);
    sunDrop = new SunDrop(CONFIG.sun, width);
    
    // Initialize shared renderers (reused by all particles)
    stampRenderer = new StampRenderer(CONFIG.drops.stamp || {});
    splatterRenderer = new SplatterRenderer(CONFIG.drops.splatter || {});
    
    bgLayer = createGraphics(width, height);
    trailLayer = createGraphics(width, height);
    historyLayer = createGraphics(width, height);
    activeLayer = createGraphics(width, height);
    
    // Initialize trail layer with transparency
    trailLayer.clear();
    
    initializeBackgroundLayer();
    setupEventListeners();
    
    console.log('Setup complete - EphemeralTime v0.2 (Refactored Architecture)');
}

function setupEventListeners() {
    clock.on('second', (data) => {
        if (!isPaused) createSecondDrop(data);
    });
    
    clock.on('minute', (data) => {
        if (!isPaused) createMinuteDrop(data);
    });
    
    clock.on('hour', (data) => {
        if (!isPaused) {
            createHourDrop(data);
        }
    });
    
    clock.on('hourComplete', (data) => {
        // 1 hour completed: reset canvas for new hour
        if (!isPaused) {
            console.log(`Hour ${data.completedHour} complete. Resetting canvas for hour ${data.newHour}.`);
            resetCanvasForNewHour();
        }
    });
    
    clock.on('chime', (data) => {
        if (!isPaused) createChimeDrop(data);
    });
}

function draw() {
    background(255);
    clock.update();
    
    if (!isPaused) {
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
