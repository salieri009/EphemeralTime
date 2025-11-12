/**
 * ColorManager.js - Realistic Fountain Pen Ink Color System
 * 
 * PHILOSOPHY: "Time as Ink Chemistry"
 * The passage of time is visualized through realistic fountain pen ink behavior.
 * Morning starts with cool blues (clarity, focus), evening ends with warm earth tones (reflection).
 * Turbulence creates "muddy" mixed ink - when attention scatters, colors lose their purity.
 * 
 * Design Principles:
 * - Realistic fountain pen ink chemistry (Diamine, Pilot, Sailor)
 * - Subtle cool→warm gradient for time readability without numbers
 * - Paper absorption simulation (desaturation + darkening)
 * - Turbulence = mixed ink effect (distracted mind muddies perception)
 */
class ColorManager {
    constructor(config = CONFIG) {
        this.config = config;
        this.colorGradient = [];
        this.currentTurbulence = 0;
        this.buildGradient();
    }

    /**
     * Build 60-step realistic ink gradient
     * Smooth interpolation between fountain pen ink colors
     */
    buildGradient() {
        const keyColors = this.config.colors.minuteGradient.keyColors;
        const steps = this.config.colors.minuteGradient.steps;
        
        const keyColorObjects = keyColors.map(([minute, rgb]) => ({
            minute,
            color: color(rgb[0], rgb[1], rgb[2])
        }));

        // Interpolate with subtle easing for natural ink flow
        for (let i = 0; i < steps; i++) {
            let lowerKey = keyColorObjects[0];
            let upperKey = keyColorObjects[keyColorObjects.length - 1];

            for (let j = 0; j < keyColorObjects.length - 1; j++) {
                if (i >= keyColorObjects[j].minute && i <= keyColorObjects[j + 1].minute) {
                    lowerKey = keyColorObjects[j];
                    upperKey = keyColorObjects[j + 1];
                    break;
                }
            }

            // Smooth interpolation with slight ease-in-out
            const range = upperKey.minute - lowerKey.minute;
            let progress = (i - lowerKey.minute) / range;
            progress = this.easeInOutQuad(progress); // subtle easing
            
            const interpColor = lerpColor(lowerKey.color, upperKey.color, progress);
            this.colorGradient[i] = interpColor;
        }
    }

    /**
     * Subtle easing function for natural color transitions
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    /**
     * Update with current turbulence level
     * @param {number} turbulence - Current turbulence (0-1)
     */
    update(turbulence = 0) {
        this.currentTurbulence = constrain(turbulence, 0, 1);
    }

    /**
     * Get realistic ink color for given time
     * Applies paper absorption, turbulence, and sonification effects
     * 
     * @param {number} minute - minute of the hour (0-59)
     * @param {number} hour - hour of the day (0-23)
     * @param {number} sonificationValue - audio brightness value (0-1) for visual-audio feedback
     * @returns {p5.Color} realistic ink color
     */
    getColorForTime(minute, hour, sonificationValue = 0.5) {
        minute = constrain(minute, 0, 59);
        let c = this.colorGradient[minute];

        let r = red(c);
        let g = green(c);
        let b = blue(c);

        // PHILOSOPHY: "Closing the synesthetic loop"
        // As the sound brightens (higher filter cutoff), the ink becomes slightly more vibrant
        // This creates a visual rhyme with the audio, making the connection undeniable
        const brightnessFactor = lerp(0.92, 1.08, sonificationValue);
        r *= brightnessFactor;
        g *= brightnessFactor;
        b *= brightnessFactor;

        // Effect 1: Turbulence creates "muddy" mixed ink
        // PHILOSOPHY: Scattered attention muddies perception
        // When distracted, colors lose their purity and blend chaotically
        // ✨ ENHANCED: Stronger visual feedback for turbulence
        if (this.currentTurbulence > 0) {
            const turbConfig = this.config.colors.turbulence;
            
            // ✨ STRONGER desaturation (0.6 → 0.85 max)
            const desatAmount = this.currentTurbulence * 0.85;
            const gray = (r + g + b) / 3;
            r = lerp(r, gray, desatAmount);
            g = lerp(g, gray, desatAmount);
            b = lerp(b, gray, desatAmount);
            
            // Shift toward muddy brown (mixed fountain pen inks)
            const muddyShift = this.currentTurbulence * turbConfig.muddyShift;
            r += muddyShift * 0.3;
            g += muddyShift * 0.2;
            b += muddyShift * 0.1;
        }

        // Effect 2: Paper absorption (slight darkening)
        if (this.config.colors.hourVariation.enabled) {
            const brightness = this.config.colors.hourVariation.brightnessRange[0];
            r *= brightness;
            g *= brightness;
            b *= brightness;
        }

        // Effect 3: Natural ink variation (pigment inconsistency)
        r = constrain(r + random(-3, 3), 0, 255);
        g = constrain(g + random(-3, 3), 0, 255);
        b = constrain(b + random(-3, 3), 0, 255);

        return color(r, g, b);
    }

    /**
     * Get residue color for stamped stains
     * Real ink: color persists but becomes more transparent
     * 
     * @param {p5.Color} originalColor - original ink color
     * @returns {p5.Color} dried/absorbed ink color
     */
    getResidueColor(originalColor) {
        // If config specifies a residue color, use it
        if (this.config.performance.stainFade.residueColor) {
            const rc = this.config.performance.stainFade.residueColor;
            return color(rc[0], rc[1], rc[2]);
        }
        
        // Otherwise: preserve original hue but darken + desaturate (realistic dried ink)
        let r = red(originalColor);
        let g = green(originalColor);
        let b = blue(originalColor);
        
        // Darken by 30% (paper absorption)
        r *= 0.7;
        g *= 0.7;
        b *= 0.7;
        
        // Slight desaturation (pigment oxidation)
        const gray = (r + g + b) / 3;
        r = lerp(r, gray, 0.2);
        g = lerp(g, gray, 0.2);
        b = lerp(b, gray, 0.2);
        
        return color(r, g, b);
    }

    /**
     * Get color by drop type with size-based adjustments
     * Larger drops = more pigment = slightly darker
     */
    getColorByType(minute, hour, dropType = 'second') {
        let baseColor = this.getColorForTime(minute, hour);

        // Larger drops carry more pigment
        switch (dropType) {
            case 'minute':
                // Slightly more saturated (more ink volume)
                let r1 = red(baseColor) * 1.05;
                let g1 = green(baseColor) * 1.05;
                let b1 = blue(baseColor) * 1.05;
                baseColor = color(
                    constrain(r1, 0, 255),
                    constrain(g1, 0, 255),
                    constrain(b1, 0, 255)
                );
                break;
                
            case 'hour':
                // Noticeably darker (heavy ink drop)
                let r2 = red(baseColor) * 1.15;
                let g2 = green(baseColor) * 1.15;
                let b2 = blue(baseColor) * 1.15;
                baseColor = color(
                    constrain(r2, 0, 255),
                    constrain(g2, 0, 255),
                    constrain(b2, 0, 255)
                );
                break;
        }

        return baseColor;
    }
}
