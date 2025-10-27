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
            baseSize: 15,                    // diameter in pixels
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
        }
    },

    // ========================================
    // COLOR SYSTEM (60-step minute gradient)
    // ========================================
    colors: {
        // 60-step gradient: Blue (0min) → Green → Yellow → Orange → Red (59min)
        minuteGradient: {
            enabled: true,
            steps: 60,
            // Color stops: [minute, [R, G, B]]
            keyColors: [
                [0, [30, 120, 200]],         // 0min: deep blue
                [15, [50, 180, 150]],        // 15min: cyan-green
                [30, [200, 180, 50]],        // 30min: yellow
                [45, [220, 140, 50]],        // 45min: orange
                [59, [200, 50, 50]]          // 59min: red
            ]
        },
        
        // Hour-based darkness variation (subtle)
        hourVariation: {
            enabled: true,
            darknessByHour: true,            // darker in night hours
            brightnessRange: [0.9, 1.1]     // multiplier on color brightness
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
        
        // Staining effect (coffee-like residue)
        stainFade: {
            enabled: true,
            residueOpacity: 80,              // opacity of stamped residue (0-255)
            residueColor: [120, 100, 80]     // warm brownish tint for residue
        }
    },

    // ========================================
    // FLUID SIMULATION (Perlin noise based)
    // ========================================
    fluid: {
        resolution: 25,                      // grid cell size (px)
        noiseScale: 0.08,                    // Perlin noise detail
        noiseSpeed: 0.003,                   // animation speed
        baseFlowMagnitude: 1.5,              // base current strength
        
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
    }
};

// Export for ES6 modules (if using modules later)
// export default CONFIG;
