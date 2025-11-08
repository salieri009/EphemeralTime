/**
 * Clock.js - Time tracking and event emission
 * Emits events for seconds, minutes, hours, and quarter-hour chimes
 */
class Clock {
    constructor(config = CONFIG) {
        this.config = config;
        this.lastSecond = -1;
        this.lastMinute = -1;
        this.lastHour = -1;
        this.listeners = {};
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
        const now = new Date();
        const newSecond = now.getSeconds();
        const newMinute = now.getMinutes();
        const newHour = now.getHours();

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

        if (newHour !== this.lastHour) {
            this.emit('hour', { hour: newHour });
            this.lastHour = newHour;
        }
    }

    getCurrentMinute() {
        return new Date().getMinutes();
    }

    getCurrentHour() {
        return new Date().getHours();
    }

    getTimeString() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }
}
