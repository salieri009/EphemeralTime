/**
 * config.js - Centralized configuration for Ephemeral Time
 * Concept: Time expressed as ink drops with varying sizes based on temporal scale
 * - Second drops: smallest (generated every second, 60-color gradient)
 * - Minute drops: 6x larger (generated every minute)
 * - Hour drops: 36x larger (generated every hour, canvas reset)
 */

const CONFIG = {
    // ========================================
    // INK DROP HIERARCHY (Size ratios 1:6:36)
    // ========================================
    drops: {
        // Second drop (base size)
        second: {
            baseSize: 8,                     // diameter in pixels (reduced from 15)
            lifespan: 300,                   // frames (5 sec @ 60fps)
            opacity: 200,                    // initial alpha
            fadeMode: 'stain'                // 'stain' = leaves trace, 'fade' = complete disappear
        },
        
        // Minute drop (6x second)
        minute: {
            sizeMultiplier: 6,               // 6x second drop
            lifespan: 600,                   // frames (10 sec @ 60fps)
            opacity: 220,
            fadeMode: 'stain'
        },
        
        // Hour drop (36x second)
        hour: {
            sizeMultiplier: 36,              // 36x second drop
            lifespan: 1200,                  // frames (20 sec @ 60fps)
            opacity: 240,
            fadeMode: 'stain',
            clearHistory: true               // reset canvas on new hour
        },
        
        // Organic splatter effect (inspired by kwertyops painting code)
        splatter: {
            enabled: true,                   // enable splash effect
            particleCount: 25,               // increased for more organic feel
            radius: 2.5,                     // splatter radius multiplier
            alphaMultiplier: 0.5,            // particle transparency
            velocityInfluence: 0.8,          // how much drop velocity affects splatter direction
            sizeVariation: 0.7               // size randomness (0-1)
        },
        
        // Dripping effect (only for minute/hour drops)
        drip: {
            enabled: true,                   // enable dripping effect
            interval: 15,                    // frames between drip generation
            sizeRatio: 0.15,                 // drip size relative to parent drop
            maxSpeed: 2,                     // max drip velocity
            fadeRate: 0.03,                  // how fast drip shrinks
            gravityStrength: 0.15,           // downward pull
            fluidInfluence: 0.8,             // how much drip follows fluid (0-1)
            wobble: 0.3                      // horizontal randomness
        }
    },

    // ========================================
    // COLOR SYSTEM (Realistic Fountain Pen Ink)
    // ========================================
    colors: {
        // 60-step gradient: Cool Morning → Warm Evening
        // Based on real fountain pen ink chemistry
        minuteGradient: {
            enabled: true,
            steps: 60,
            // Color stops: [minute, [R, G, B]]
            // Real ink reference: Diamine, Pilot Iroshizuku, Sailor
            keyColors: [
                [0, [45, 70, 95]],           // 0min: Prussian Blue (cold, morning)
                [10, [50, 85, 110]],         // 10min: Steel Blue
                [20, [60, 95, 105]],         // 20min: Petrol Blue-Grey
                [30, [75, 100, 90]],         // 30min: Slate (neutral midday)
                [40, [95, 85, 70]],          // 40min: Warm Grey
                [50, [115, 75, 60]],         // 50min: Terracotta
                [59, [125, 65, 55]]          // 59min: Burnt Sienna (warm, evening)
            ]
            // Total shift: Cool blue → Neutral grey → Warm brown
            // Subtle but readable over 60 minutes
        },
        
        // Hour-based darkness variation (day/night cycle)
        hourVariation: {
            enabled: true,
            darknessByHour: true,
            brightnessRange: [0.85, 1.0]     // slightly darker overall (ink absorption)
        },
        
        // Turbulence desaturation (Pillar 3: distracted mind)
        turbulence: {
            desaturationAmount: 0.6,         // how much color fades when turbulent (0-1)
            muddyShift: 15                   // shift toward muddy brown when turbulent
        }
    },

    // ========================================
    // PERFORMANCE OPTIMIZATION
    // ========================================
    performance: {
        // Layer management (stamping for performance)
        maxActiveDrops: 180,                 // max active drops before forced stamping
        stampOpacityThreshold: 50,           // stamp when opacity falls below this
        stampAgeThreshold: 400,              // or when age exceeds this many frames
        
        // Staining effect (realistic ink absorption into paper)
        stainFade: {
            enabled: true,
            residueOpacity: 60,              // lower = more transparent (like dried ink)
            residueColor: null               // null = use original ink color (not brown)
        }
    },

    // ========================================
    // FLUID SIMULATION (Perlin noise based)
    // ========================================
    fluid: {
        resolution: 25,                      // grid cell size (px)
        noiseScale: 0.08,                    // Perlin noise detail
        noiseSpeed: 0.003,                   // animation speed
        baseFlowMagnitude: 0.15,             // base current strength (very subtle drift)
        
        // Turbulence system (attention reservoir)
        turbulence: {
            current: 0,                      // current turbulence level (0-1)
            decay: 0.98,                     // how quickly turbulence fades
            velocityThreshold: 5,            // min mouse velocity to add turbulence
            maxValue: 1.0                    // maximum turbulence level
        },
        
        // Mouse interaction (drag to create flow)
        mouseForce: {
            enabled: true,
            radius: 120,                     // influence radius (px)
            strength: 8,                     // vortex/drag strength
            viscosityScales: true            // stronger drag = more ink viscous
        },
        
        // Viscosity (increases with accumulated ink)
        viscosity: {
            enabled: true,
            baseValue: 0.95,                 // base friction multiplier
            maxValue: 0.70,                  // max friction (heavy)
            densityThreshold: 0.3            // when to start increasing viscosity
        }
    },

    // ========================================
    // AUDIO SYSTEM (Generative + Data-driven)
    // ========================================
    audio: {
        enabled: true,
        
        // Drop sound (pitch = color, pan = x position)
        dropSound: {
            useGenerative: true,             // synthesized plink
            oscillator: {
                type: 'sine',
                baseFreq: 900,
                freqRange: [600, 1400],      // wider range
                panRange: [-1, 1],           // stereo panning range
                attack: 0.008,
                decay: 0.25,
                sustain: 0,
                release: 0.08
            },
            volume: 0.25
        },
        
        // Ambient pad (controlled by ink density)
        ambient: {
            enabled: true,
            baseVolume: 0.12,
            filter: {
                type: 'lowpass',
                baseFreq: 1200,
                freqRange: [300, 1600],      // maps to ink density
                resonance: 3
            }
        }
    },

    // ========================================
    // TRAIL SYSTEM (Motion trail & smudge effect)
    // ========================================
    trail: {
        enabled: true,                       // enable motion trails
        fadeAlpha: 3,                        // trail fade speed (lower = longer trails, 1-10 range)
        baseAlpha: 25,                       // base trail opacity (calm state)
        sizeMultiplier: 0.8,                 // trail size relative to drop size
        turbulenceEffect: 0.7                // how much turbulence reduces trail (0-1)
        // Concept: Calm mind = clear trails, Turbulent mind = faint trails
    },

    // ========================================
    // INTERACTION SYSTEM
    // ========================================
    interaction: {
        // Drag to disturb fluid
        fluidDrag: {
            enabled: true,
            visualFeedback: false            // show flow vectors
        },
        
        // Scrubbing (time manipulation - stretch goal)
        scrubbing: {
            enabled: true,
            dragLeft: 'reverse',             // fade recent drops
            dragRight: 'forward',            // burst new drops
            sensitivity: 0.05
        },
        
        // Debug
        showDebugInfo: true
    },

    // ========================================
    // CANVAS & RENDERING
    // ========================================
    canvas: {
        backgroundColor: [255, 255, 255],    // pure white
        useFullscreen: true,
        pixelDensity: 1                      // 1 = standard, 2 = retina
    },

    rendering: {
        maxDropRadius: 540                   // hour drop: 15 * 36 = 540
    },

    // ========================================
    // SUN DROP (HOURLY MARKER)
    // ========================================
    sun: {
        size: 20,
        yPosition: 30,
        color: [255, 255, 0], // Bright yellow
        coreOpacity: 255,
        coronaOpacity: 100,
        pulseSpeed: 0.05,
        pulseMagnitude: 0.2,
        repulsionRadius: 150,
        repulsionStrength: 0.8               // reduced from 2 for gentler repulsion
    },

    // ========================================
    // CHIME DROPS (Quarter-hour markers)
    // ========================================
    chime: {
        ripple: {
            count: 3,                        // number of drops in ripple pattern
            radius: 100,                     // radius of ripple pattern
            sizeMultiplier: 4                // size relative to second drops
        }
    },

    // ========================================
    // TURBULENCE SYSTEM (Pillar 3)
    // ========================================
    turbulence: {
        enabled: true,
        decay: 0.98,                         // gradual calming
        velocityThreshold: 5,                // mouse speed to trigger
        maxValue: 1.0,
        colorDesaturation: 0.7               // max desaturation multiplier
    },

    // ========================================
    // MISCELLANEOUS
    // ========================================
    debug: {
        showFPS: true,
        showGrid: true,
        showDropInfo: true
    },

    // ========================================
    // TIME CONTROL (for testing/presentation)
    // ========================================
    time: {
        speedMultiplier: 1,                  // 1 = real-time, 60 = 1 minute per second
        useRealTime: true                    // false = use simulated accelerated time
    }
};

// Export for ES6 modules (if using modules later)
// export default CONFIG;
