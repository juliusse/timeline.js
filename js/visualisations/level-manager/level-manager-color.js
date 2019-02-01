const { LevelManager } = require('./level-manager');

class LevelManagerColor extends LevelManager {

    constructor() {
        super();
        this.colors = [];
    }

    getLevelFor(timelineEntry) {
        const color = timelineEntry.getColor();

        if (this.colors.indexOf(color) !== -1) {
            return this.colors.indexOf(color);
        }

        this.colors.push(color);
        return this.colors.indexOf(color);
    }
}

module.exports = LevelManagerColor;
