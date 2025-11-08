let config = {
    sun: {
        radius: 50,
        x: 50,
        y: 50
    },
    width: 800,
    height: 600
};

let clock;
let fluid;
let colorManager;
let audio;
let sunDrop; // The new SunDrop instance

// Mouse tracking for turbulence
let prevMouseX = 0;
let prevMouseY = 0;

// Graphics layers
let bgLayer, historyLayer, activeLayer;

function setup() {
    createCanvas(config.width, config.height);
    clock = new Clock(config);
    fluid = new Fluid(config.fluid, width, height, p5.Vector);
    fluid.sunDrop = sunDrop; // Pass the sunDrop instance to the fluid simulation
    colorManager = new ColorManager(config.colors);
    audio = new Audio(config);

    // Initialize the SunDrop
    sunDrop = new SunDrop(config.sun, width);

    // Initialize graphics layers
    bgLayer = createGraphics(width, height);
    historyLayer = createGraphics(width, height);
    activeLayer = createGraphics(width, height);
}

function draw() {
    // Calculate mouse velocity for turbulence
    const mouseVelocity = dist(mouseX, mouseY, prevMouseX, prevMouseY);
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    // If mouse is being dragged, add turbulence
    if (mouseIsPressed && mouseVelocity > 0) {
        fluid.addTurbulence(mouseVelocity);
    }

    // Update turbulence (decay over time)
    fluid.updateTurbulence();

    // Get current turbulence level
    const turbulence = fluid.getTurbulence();

    // Update the clock
    clock.update();

    // Update the fluid
    fluid.update();

    // Update the color manager with turbulence
    colorManager.update(turbulence);

    // Update audio with turbulence
    if (config.audio.enabled) {
        audio.updateTurbulence(turbulence);
    }

    // Update and render the SunDrop
    sunDrop.update(minute());
    sunDrop.render(activeLayer);

    // Composite the layers
    image(bgLayer, 0, 0);
}