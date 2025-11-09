/**
 * Clock.js - Time tracking and event emission
 * 
 * PHILOSOPHY: "Objective Time vs Subjective Experience"
 * The clock represents objective, universal time - it flows equally for everyone.
 * Events (second/minute/hour/chime) are discrete temporal signposts.
 * Yet how we experience these moments (through ink traces) varies based on attention.
 * 
 * Chimes (15/30/45 min) are stronger temporal anchors - cultural time markers
 * that help us orient without looking at numbers.
 * 
 * Simulation mode starts at 00:00:00 for canvas demonstration purposes.
 */
class Clock {
    constructor(config = CONFIG) {
        this.config = config;
        this.lastSecond = -1;
        this.lastMinute = -1;
        this.lastHour = -1;
        this.listeners = {};
        
        // Simulation mode: browser start = 00:00:00
        this.startTime = Date.now(); // when browser opened
        this.simulationMode = true;  // always use simulation for canvas
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    update() {
        // Simulation mode: elapsed time since browser start
        const elapsedMs = Date.now() - this.startTime;
        
        // Convert to time components (starts at 00:00:00)
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const newSecond = totalSeconds % 60;
        const newMinute = Math.floor(totalSeconds / 60) % 60;
        const newHour = Math.floor(totalSeconds / 3600) % 24;
        
        // Check for hour boundary (canvas reset trigger)
        if (newHour !== this.lastHour && this.lastHour !== -1) {
            this.emit('hourComplete', {
                completedHour: this.lastHour,
                newHour: newHour
            });
        }

        if (newSecond !== this.lastSecond) {
            this.emit('second', { second: newSecond, minute: newMinute, hour: newHour });
            this.lastSecond = newSecond;
        }

        if (newMinute !== this.lastMinute) {
            this.emit('minute', { minute: newMinute, hour: newHour });

            if ([15, 30, 45].includes(newMinute)) {
                this.emit('chime', { minute: newMinute, hour: newHour });
            }

            this.lastMinute = newMinute;
        }

        if (newHour !== this.lastHour && this.lastHour !== -1) {
            this.emit('hourComplete', {
                completedHour: this.lastHour,
                newHour: newHour
            });
        }
        
        if (newHour !== this.lastHour) {
            this.emit('hour', { hour: newHour });
        }
        
        this.lastHour = newHour;
    }

    getCurrentMinute() {
        const elapsedMs = Date.now() - this.startTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        return Math.floor(totalSeconds / 60) % 60;
    }

    getCurrentHour() {
        const elapsedMs = Date.now() - this.startTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        return Math.floor(totalSeconds / 3600) % 24;
    }

    getTimeString() {
        const elapsedMs = Date.now() - this.startTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        
        const s = totalSeconds % 60;
        const m = Math.floor(totalSeconds / 60) % 60;
        const h = Math.floor(totalSeconds / 3600) % 24;
        
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    
    /**
     * Get elapsed time since browser start (for debugging)
     */
    getElapsedTime() {
        return Date.now() - this.startTime;
    }
}
