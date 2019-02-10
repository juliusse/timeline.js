const _ = require('lodash');
const VerticalBase = require('./verticalBase');

const defaultConfig = {
    drawToday: false,
    scale: {
        arrowHeadHeight: 0,
        arrowHead: {
            enabled: false,
        },
    },
};

class VerticalMinimal extends VerticalBase {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, _.defaults(config, defaultConfig));

        this.htmlElement.classList.add('minimal');

        this.repaint();
    }

    /*
     Draw methods
     Each method keeps track of it's own elements
    */

    getShapeForTimelineEntry(timelineEntry) {
        const level = this.levelManager.getLevelFor(timelineEntry);
        const color = timelineEntry.color;

        const entryWidth = this.config.entry.width;

        //decide position
        //y
        const yLow = this.getPosForDate(timelineEntry.fromDate);
        const yHigh = this.getPosForDate(timelineEntry.toDate);
        const height = yLow - yHigh;

        //x
        const lineWidth = this.config.scale.lineWidth;
        const margin = this.config.scale.margin;
        let left = margin + lineWidth;
        left = left + level * (entryWidth + 1);


        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('y', yHigh);
        shape.setAttribute('x', left);
        shape.setAttribute('height', height);
        shape.setAttribute('width', entryWidth);
        shape.setAttribute('style', 'fill:#' + color + ';pointer-events:all;');
        shape.setAttribute('class', 'entry');

        return shape;
    }


}

module.exports = VerticalMinimal;