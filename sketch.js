/**
 * sketch.js - Ephemeral Time v0.2
 * Event-driven architecture for "The Reservoir of Attention"
 */

let clock, colorManager, fluid, audio, sunDrop;
let bgLayer, historyLayer, activeLayer;
let activeDrops = [];
let isPaused = false;
let turbulenceLevel = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    clock = new Clock(CONFIG);
    colorManager = new ColorManager(CONFIG);
    fluid = new Fluid(CONFIG.fluid.resolution, CONFIG);
    audio = new Audio(CONFIG);
    sunDrop = new SunDrop(CONFIG.sun, width);
    
    bgLayer = createGraphics(width, height);
    historyLayer = createGraphics(width, height);
    activeLayer = createGraphics(width, height);
    
    initializeBackgroundLayer();
    setupEventListeners();
    
    console.log('Setup complete - EphemeralTime v0.2');
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
            resetCanvasForNewHour();
            createHourDrop(data);
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
    const drop = new InkDrop(x, y, dropColor, 'second', CONFIG);
    activeDrops.push(drop);
    audio.playDropSound(x, data.minute);
}

function createMinuteDrop(data) {
    const dropColor = colorManager.getColorForTime(data.minute, data.hour);
    const x = random(width * 0.1, width * 0.9);
    const y = random(height * 0.1, height * 0.9);
    const drop = new InkDrop(x, y, dropColor, 'minute', CONFIG);
    activeDrops.push(drop);
    audio.playDropSound(x, data.minute);
}

function createHourDrop(data) {
    const dropColor = colorManager.getColorForTime(0, data.hour);
    const x = width / 2;
    const y = height / 2;
    const drop = new InkDrop(x, y, dropColor, 'hour', CONFIG);
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
        const drop = new InkDrop(x, y, dropColor, 'chime', CONFIG);
        activeDrops.push(drop);
    }
    audio.playDropSound(centerX, data.minute);
}

function updateAndRenderDrops() {
    activeLayer.clear();
    const inkDensity = calculateInkDensity();
    const viscosity = getViscosityFromDensity(inkDensity);
    
    for (let i = activeDrops.length - 1; i >= 0; i--) {
        const drop = activeDrops[i];
        const fluidVector = fluid.getVectorAt(drop.pos.x, drop.pos.y);
        const sunRepulsion = sunDrop.getRepulsionForce(drop.pos.x, drop.pos.y);
        fluidVector.add(sunRepulsion);
        drop.update(fluidVector, viscosity);
        drop.display(activeLayer);
        
        if (drop.shouldStamp() && !drop.hasBeenStamped) {
            drop.stampToHistory(historyLayer);
        }
        
        if (drop.isDead()) {
            if (!drop.hasBeenStamped) drop.stampToHistory(historyLayer);
            activeDrops.splice(i, 1);
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
    if (CONFIG.interaction.fluidDrag.enabled) {
        const mouseVel = createVector(mouseX - pmouseX, mouseY - pmouseY);
        fluid.addForceAtPoint(mouseX, mouseY, mouseVel, CONFIG.fluid.mouseForce.strength);
    }
    return false;
}

function mouseDragged() {
    const speed = dist(mouseX, mouseY, pmouseX, pmouseY);
    if (speed > CONFIG.turbulence.threshold) {
        const intensity = constrain(map(speed, CONFIG.turbulence.threshold, 50, 0, 1), 0, 1);
        fluid.addTurbulence(intensity);
    }
    mouseMoved();
    return false;
}

function initializeBackgroundLayer() {
    bgLayer.background(255);
}

function resetCanvasForNewHour() {
    historyLayer.clear();
    historyLayer.background(255);
    activeDrops = [];
}

function renderLayers() {
    image(bgLayer, 0, 0);
    image(historyLayer, 0, 0);
    image(activeLayer, 0, 0);
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
