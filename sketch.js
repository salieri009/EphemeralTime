/**
 * sketch.js - Ephemeral Time
 * Main p5.js sketch orchestrating the visualization
 * 
 * Concept: Time flows as ink drops of varying sizes
 * - Second drops: 1x base size, every second, 60-color gradient (minute)
 * - Minute drops: 6x base size, every minute
 * - Hour drops: 36x base size, every hour (canvas reset)
 * 
 * All drops fade to stains (coffee-like residue) leaving traces
 */

// Module instances
let clock;
let colorManager;
let fluid;
let audio;

// Graphics layers
let bgLayer;
let historyLayer;
let activeLayer;

// State
let activeDrops = [];
let isPaused = false;
let lastSecond = -1;
let lastMinute = -1;
let lastHour = -1;

// ========================================
// SETUP
// ========================================
function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize modules
    clock = new Clock(CONFIG);
    colorManager = new ColorManager(CONFIG);
    fluid = new Fluid(CONFIG.fluid.resolution, CONFIG);
    audio = new Audio(CONFIG);
    
    // Create graphics layers
    bgLayer = createGraphics(width, height);
    historyLayer = createGraphics(width, height);
    activeLayer = createGraphics(width, height);
    
    // Initialize background
    initializeBackgroundLayer();
    
    console.log('✓ Setup complete - EphemeralTime initialized');
    console.log(`Canvas: ${width} x ${height}`);
    console.log(`Time: ${clock.getTimeString()}`);
}

// ========================================
// DRAW LOOP
// ========================================
function draw() {
    // White background
    background(255);
    
    // Update clock
    clock.update();
    
    // Check for time transitions (second/minute/hour)
    const currentSecond = second();
    const currentMinute = minute();
    const currentHour = hour();
    
    if (!isPaused) {
        // NEW HOUR: reset canvas
        if (currentHour !== lastHour) {
            resetCanvasForNewHour();
            lastHour = currentHour;
            
            // Create hour drop
            createHourDrop();
        }
        
        // NEW MINUTE: create minute drop
        if (currentMinute !== lastMinute) {
            createMinuteDrop();
            lastMinute = currentMinute;
        }
        
        // NEW SECOND: create second drop
        if (currentSecond !== lastSecond) {
            createSecondDrop();
            lastSecond = currentSecond;
        }
        
        // Update fluid simulation
        fluid.update();
    }
    
    // Update and render active drops
    updateAndRenderDrops();
    
    // Compose layers
    renderLayers();
    
    // Calculate ink density for audio
    const inkDensity = calculateInkDensity();
    audio.update(inkDensity);
    
    // Update UI
    updateUI();
    
    // Debug info (optional)
    if (CONFIG.interaction.showDebugInfo) {
        drawDebugInfo();
    }
}

// ========================================
// DROP CREATION (Second/Minute/Hour)
// ========================================

function createSecondDrop() {
    // Get color based on current minute (0-59) → 60-step gradient
    const dropColor = colorManager.getColorForTime(minute(), hour());
    
    // Random position in canvas
    const x = random(width * 0.2, width * 0.8);
    const y = random(height * 0.2, height * 0.8);
    
    // Create second drop
    const drop = new InkDrop(x, y, dropColor, 'second', CONFIG);
    activeDrops.push(drop);
    
    // Play audio
    audio.playDropSound(x, minute());
    
    console.log(`⏰ Second: ${clock.getTimeString()}`);
}

function createMinuteDrop() {
    // Get color based on current minute
    const dropColor = colorManager.getColorForTime(minute(), hour());
    
    // Random position
    const x = random(width * 0.1, width * 0.9);
    const y = random(height * 0.1, height * 0.9);
    
    // Create minute drop (6x size)
    const drop = new InkDrop(x, y, dropColor, 'minute', CONFIG);
    activeDrops.push(drop);
    
    // Play audio (slightly different)
    audio.playDropSound(x, minute());
    
    console.log(`📍 Minute: ${clock.getTimeString()}`);
}

function createHourDrop() {
    // Get color based on current hour
    const dropColor = colorManager.getColorForTime(0, hour()); // Use start of hour color
    
    // Center of canvas
    const x = width / 2;
    const y = height / 2;
    
    // Create hour drop (36x size)
    const drop = new InkDrop(x, y, dropColor, 'hour', CONFIG);
    activeDrops.push(drop);
    
    // Play audio (lowest pitch)
    audio.playDropSound(x, 0);
    
    console.log(`🎯 Hour: ${clock.getTimeString()}`);
}

// ========================================
// DROP LIFECYCLE & RENDERING
// ========================================

function updateAndRenderDrops() {
    // Clear active layer each frame
    activeLayer.clear();
    
    // Get current viscosity (based on ink density)
    const inkDensity = calculateInkDensity();
    const viscosity = getViscosityFromDensity(inkDensity);
    
    // Update and render each drop
    for (let i = activeDrops.length - 1; i >= 0; i--) {
        const drop = activeDrops[i];
        
        // Get fluid vector at drop position
        const fluidVector = fluid.getVectorAt(drop.pos.x, drop.pos.y);
        
        // Update drop physics
        drop.update(fluidVector, viscosity);
        
        // Render to active layer
        drop.display(activeLayer);
        
        // Check if should stamp to history
        if (drop.shouldStamp() && !drop.hasBeenStamped) {
            drop.stampToHistory(historyLayer);
        }
        
        // Remove dead drops
        if (drop.isDead()) {
            if (!drop.hasBeenStamped) {
                drop.stampToHistory(historyLayer);
            }
            activeDrops.splice(i, 1);
        }
    }
    
    // Limit active drops
    if (activeDrops.length > CONFIG.performance.maxActiveDrops) {
        const excess = activeDrops.length - CONFIG.performance.maxActiveDrops;
        for (let i = 0; i < excess; i++) {
            const drop = activeDrops[i];
            if (!drop.hasBeenStamped) {
                drop.stampToHistory(historyLayer);
            }
        }
        activeDrops.splice(0, excess);
    }
}

// ========================================
// MOUSE INTERACTION (Fluid Drag + Scrubbing)
// ========================================

function mouseMoved() {
    // Mouse affects fluid field
    if (CONFIG.interaction.fluidDrag.enabled) {
        const mouseVel = createVector(
            mouseX - pmouseX,
            mouseY - pmouseY
        );
        fluid.addForceAtPoint(mouseX, mouseY, mouseVel, CONFIG.fluid.mouseForce.strength);
    }
    return false;
}

function mouseDragged() {
    // Same as mouseMoved - create drag effect
    mouseMoved();
    
    // Optional: scrubbing implementation
    if (CONFIG.interaction.scrubbing.enabled) {
        const deltaX = mouseX - pmouseX;
        
        // Drag right: burst forward (create extra drops)
        if (deltaX > 0) {
            // TODO: Implement forward scrubbing
        }
        // Drag left: reverse (fade recent drops)
        else if (deltaX < 0) {
            // TODO: Implement reverse scrubbing
        }
    }
    
    return false;
}

function mousePressed() {
    // Start audio context on first user interaction
    userStartAudio();
    
    // Could implement pause-on-click here
    // For now, just prevent default
    return false;
}

// ========================================
// LAYER MANAGEMENT
// ========================================

function initializeBackgroundLayer() {
    bgLayer.background(255, 255, 255);
    
    // Optional: add subtle texture
    bgLayer.fill(240, 240, 240, 10);
    bgLayer.noStroke();
    for (let i = 0; i < 50; i++) {
        const x = random(width);
        const y = random(height);
        const size = random(2, 8);
        bgLayer.ellipse(x, y, size);
    }
}

function renderLayers() {
    // Draw background layer
    image(bgLayer, 0, 0);
    
    // Draw accumulated history layer
    image(historyLayer, 0, 0);
    
    // Draw active drops layer
    image(activeLayer, 0, 0);
}

function resetCanvasForNewHour() {
    // Clear active drops
    activeDrops = [];
    
    // Clear layers
    historyLayer.clear();
    activeLayer.clear();
    
    console.log(`✓ Canvas reset for new hour: ${hour()}`);
}

// ========================================
// ANALYSIS & STATE
// ========================================

function calculateInkDensity() {
    // Sample history layer to estimate ink coverage (0-1)
    historyLayer.loadPixels();
    const sampleRate = 20; // sample every 20th pixel for speed
    let darkPixels = 0;
    let totalSamples = 0;
    
    const bgBrightness = 255; // white background
    
    for (let y = 0; y < historyLayer.height; y += sampleRate) {
        for (let x = 0; x < historyLayer.width; x += sampleRate) {
            const idx = (y * historyLayer.width + x) * 4;
            const r = historyLayer.pixels[idx];
            const g = historyLayer.pixels[idx + 1];
            const b = historyLayer.pixels[idx + 2];
            const brightness = (r + g + b) / 3;
            
            // Count as "inked" if significantly darker than white
            if (brightness < bgBrightness - 40) {
                darkPixels++;
            }
            totalSamples++;
        }
    }
    
    return totalSamples > 0 ? darkPixels / totalSamples : 0;
}

function getViscosityFromDensity(inkDensity) {
    // Viscosity increases with ink density (heavier = more drag)
    const { enabled, baseValue, maxValue, densityThreshold } = CONFIG.fluid.viscosity;
    
    if (!enabled) return baseValue;
    
    if (inkDensity < densityThreshold) {
        return baseValue;
    }
    
    const excessDensity = inkDensity - densityThreshold;
    const densityRange = 1 - densityThreshold;
    const progress = excessDensity / densityRange;
    
    return baseValue - (baseValue - maxValue) * progress;
}

// ========================================
// UI & DEBUG
// ========================================

function updateUI() {
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.textContent = clock.getTimeString();
    }
}

function drawDebugInfo() {
    fill(0);
    textSize(12);
    textAlign(LEFT);
    
    let y = 20;
    const lineHeight = 16;
    
    text(`FPS: ${frameRate().toFixed(1)}`, 20, y);
    y += lineHeight;
    
    text(`Active drops: ${activeDrops.length}`, 20, y);
    y += lineHeight;
    
    text(`Time: ${clock.getTimeString()}`, 20, y);
    y += lineHeight;
    
    const density = calculateInkDensity();
    text(`Ink density: ${(density * 100).toFixed(1)}%`, 20, y);
}

// ========================================
// WINDOW RESIZE
// ========================================

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Recreate layers with new size
    bgLayer = createGraphics(width, height);
    historyLayer = createGraphics(width, height);
    activeLayer = createGraphics(width, height);
    
    // Reinitialize background
    initializeBackgroundLayer();
    
    // Reset fluid field
    fluid = new Fluid(CONFIG.fluid.resolution, CONFIG);
    
    console.log(`🔲 Window resized: ${width} x ${height}`);
}

/**
 * Mouse moved handler
 */
function mouseMoved() {
    // The fluid field will handle mouse position input automatically
    return false;
}

/**
 * Mouse pressed handler - Toggle pause
 */
function mousePressed() {
    if (CONFIG.interaction.pauseEnabled) {
        isPaused = !isPaused;
        audio.setPause(isPaused);
        
        if (CONFIG.interaction.showDebugInfo) {
            console.log(`Paused: ${isPaused}`);
        }
    }
    return false;
}
