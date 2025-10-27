/**
 * Clock.js - Time tracking and event detection
 * Detects second, minute, and hour transitions for drop generation
 */
class Clock {
    constructor(config = CONFIG) {
        this.config = config;
        this.prevSecond = second();
        this.prevMinute = minute();
        this.prevHour = hour();
    }

    /**
     * Update time values (call once per frame)
     */
    update() {
        this.prevSecond = second();
        this.prevMinute = minute();
        this.prevHour = hour();
    }

    /**
     * Check if a new second just started
     * @returns {boolean}
     */
    isNewSecond() {
        return second() !== this.prevSecond;
    }

    /**
     * Check if a new minute just started
     * @returns {boolean}
     */
    isNewMinute() {
        return minute() !== this.prevMinute;
    }

    /**
     * Check if a new hour just started
     * @returns {boolean}
     */
    isNewHour() {
        return hour() !== this.prevHour;
    }

    /**
     * Get current minute (0-59) for color mapping
     * @returns {number}
     */
    getCurrentMinute() {
        return minute();
    }

    /**
     * Get current hour (0-23)
     * @returns {number}
     */
    getCurrentHour() {
        return hour();
    }

    /**
     * Get hour in 12-hour format
     * @returns {number} 0-11 (0 = midnight)
     */
    getHour12() {
        return hour() % 12;
    }

    /**
     * Get current time as formatted string
     * @returns {string} "HH:MM:SS"
     */
    getTimeString() {
        const h = String(hour()).padStart(2, '0');
        const m = String(minute()).padStart(2, '0');
        const s = String(second()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }
}
