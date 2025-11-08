/**
 * ColorManager.js - Handles color generation for time-based ink drops
 * 60-step color gradient based on minutes (0-59)
 * Blue (0min) → Cyan-Green (15min) → Yellow (30min) → Orange (45min) → Red (59min)
 */
class ColorManager {
    constructor(config = CONFIG) {
        this.config = config;
        this.colorGradient = [];
        this.currentTurbulence = 0; // Track turbulence for color adjustments
        this.buildGradient();
    }

    /**
     * Build 60-step color gradient by interpolating between key colors
     */
    buildGradient() {
        const keyColors = this.config.colors.minuteGradient.keyColors;
        const steps = this.config.colors.minuteGradient.steps;
        
        // Create color objects at key points
        const keyColorObjects = keyColors.map(([minute, rgb]) => ({
            minute,
            color: color(rgb[0], rgb[1], rgb[2])
        }));

        // Interpolate between key colors for all 60 minutes
        for (let i = 0; i < steps; i++) {
            let interpColor;

            // Find the two key colors this minute falls between
            let lowerKey = keyColorObjects[0];
            let upperKey = keyColorObjects[keyColorObjects.length - 1];

            for (let j = 0; j < keyColorObjects.length - 1; j++) {
                if (i >= keyColorObjects[j].minute && i <= keyColorObjects[j + 1].minute) {
                    lowerKey = keyColorObjects[j];
                    upperKey = keyColorObjects[j + 1];
                    break;
                }
            }

            // Interpolate between lower and upper key
            const range = upperKey.minute - lowerKey.minute;
            const progress = (i - lowerKey.minute) / range;
            interpColor = lerpColor(lowerKey.color, upperKey.color, progress);

            this.colorGradient[i] = interpColor;
        }
    }

    /**
     * Get color for a given minute (0-59)
     * @param {number} minute - minute of the hour (0-59)
     * @param {number} hour - hour of the day (0-23) for optional variation
     * @returns {p5.Color} the color for this time
     */
    getColorForTime(minute, hour) {
        minute = constrain(minute, 0, 59);
        let c = this.colorGradient[minute];

        // Apply subtle hour-based brightness variation
        if (this.config.colors.hourVariation.enabled) {
            const hourProgress = hour / 24;
            const brightMult = map(hourProgress, 0, 1, this.config.colors.hourVariation.brightnessRange[0], this.config.colors.hourVariation.brightnessRange[1]);
            
            let r = red(c) * brightMult;
            let g = green(c) * brightMult;
            let b = blue(c) * brightMult;
            
            c = color(r, g, b);
        }

        // Add tiny random jitter (natural ink variation)
        let r = constrain(red(c) + random(-5, 5), 0, 255);
        let g = constrain(green(c) + random(-5, 5), 0, 255);
        let b = constrain(blue(c) + random(-5, 5), 0, 255);

        return color(r, g, b);
    }

    /**
     * Get color by drop type (for potential future tweaking)
     * @param {number} minute
     * @param {number} hour
     * @param {string} dropType - 'second', 'minute', or 'hour'
     * @returns {p5.Color}
     */
    getColorByType(minute, hour, dropType = 'second') {
        let baseColor = this.getColorForTime(minute, hour);

        // Could apply type-specific adjustments here
        // e.g., hour drops could be slightly darker/more saturated
        switch (dropType) {
            case 'minute':
                // Optionally make minute drops slightly more saturated
                break;
            case 'hour':
                // Optionally make hour drops darker
                break;
        }

        return baseColor;
    }
}
