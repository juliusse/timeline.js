const _ = require('lodash');
const VerticalBase = require('./verticalBase');

const defaultConfig = {
    scale: {
        ticks: {
            line: {
                stroke: 2,
            }
        },
    }
};

class VerticalBigBar extends VerticalBase {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, _.defaultsDeep(config, defaultConfig));

        this.htmlElement.classList.add('big-bar');

        this.repaint();
    }

    /*
     * VisualisationBase Implementation
     */
    _repaintCustom() {
        this.updateScale();
        this.updateArrowHead();
    }


// Height and offsets for Entry

    /*
     Draw methods
     Each method keeps track of it's own elements
    */
    updateScale() {
        const yStart = this.getTopOffsetForEntry();
        const yEnd = this.getHeight() - this.getBottomOffsetForScale();

        const lineWidth = this.config.scale.lineWidth;
        const margin = this.config.scale.margin;
        const width = this.getWidth();
        const left = margin + lineWidth;
        const right = width - (margin + lineWidth);

        if (!this.scaleLine1) {
            this.scaleLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            this.masterSvg.appendChild(this.scaleLine1);
            this.scaleLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            this.masterSvg.appendChild(this.scaleLine2);
            this.scaleBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this.masterSvg.appendChild(this.scaleBackground);
        }

        this.scaleLine1.setAttribute('x1', left);
        this.scaleLine1.setAttribute('y1', yStart);
        this.scaleLine1.setAttribute('x2', left);
        this.scaleLine1.setAttribute('y2', yEnd);
        this.scaleLine1.setAttribute('style', 'stroke:rgb(0,0,0);stroke-width:' + lineWidth);

        this.scaleLine2.setAttribute('x1', right);
        this.scaleLine2.setAttribute('y1', yStart);
        this.scaleLine2.setAttribute('x2', right);
        this.scaleLine2.setAttribute('y2', yEnd);
        this.scaleLine2.setAttribute('style', 'stroke:rgb(0,0,0);stroke-width:' + lineWidth);

        this.scaleBackground.setAttribute('y', yStart);
        this.scaleBackground.setAttribute('x', left);
        this.scaleBackground.setAttribute('height', yEnd - yStart);
        this.scaleBackground.setAttribute('width', right - left);
        this.scaleBackground.setAttribute('style', 'fill:#' + this.config.scale.backgroundColor + ';');
        this.scaleBackground.setAttribute('class', 'js_timeline_entry');
    }

    updateArrowHead() {
        const topOffset = this.getTopOffsetForScale();
        const lineWidth = 2;//this.config.scale.lineWidth;

        const width = this.getWidth();
        const left = 1;
        const right = width - 1;
        const center = this.getCenter();

        const arrowHeight = this.config.scale.arrowHeadHeight;

        const xStart = left;
        const yStart = arrowHeight + topOffset + 3;

        const xCenter = center;
        const yCenter = topOffset;

        const xEnd = right;
        const yEnd = arrowHeight + topOffset + 5;

        if (!this.arrowHeadSvg) {
            this.arrowHeadSvg = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            this.masterSvg.appendChild(this.arrowHeadSvg);
        }

        this.arrowHeadSvg.setAttribute('points', xStart + ',' + yStart + ' ' + xCenter + ',' + yCenter + ' ' + xEnd + ',' + yEnd);
        this.arrowHeadSvg.setAttribute('style', 'fill:none;stroke:black;stroke-width:' + lineWidth);
    }

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
        shape.setAttribute('style', 'fill:#' + color + ';stroke:black;stroke-width:1;pointer-events:all;');
        shape.setAttribute('class', 'entry');

        return shape;
    }

}

module.exports = VerticalBigBar;