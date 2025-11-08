/**
 * Renderable.js - Interface for drawable objects
 * 
 * Single Responsibility: Rendering concerns only
 * Enables different rendering strategies (Visitor Pattern potential)
 */
class Renderable {
    constructor() {
        this.visible = true;
        this.opacity = 255;
    }

    /**
     * Main render method - delegates to specific render type
     */
    render(layer) {
        if (!this.visible) return;
        
        layer.push();
        this.draw(layer);
        layer.pop();
    }

    /**
     * @abstract - Implement drawing logic
     */
    draw(layer) {
        throw new Error('draw() must be implemented');
    }

    /**
     * Visibility control
     */
    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    setOpacity(value) {
        this.opacity = constrain(value, 0, 255);
    }
}
