const _ = require('lodash');
const VerticalBase = require('./verticalBase');

const defaultConfig = {
    scale: {
        ticks: {
            numbers: {
                marginRight: 5,
            },
            line: {
                margin: 12,
                stroke: 2,
            }
        },
    }
};

class VerticalSmallBar extends VerticalBase {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, _.defaultsDeep(config, defaultConfig));

        this.htmlElement.classList.add('small-bar');

        this.repaint();
    }

    /*
     * VisualisationBase Implementation
     */
    _repaintCustom() {
        this.updateScale();
        this.updateArrowHead();
    }

    /*
     Draw methods
     Each method keeps track of it's own elements
    */
    updateScale() {
        const yStart = this.getTopOffsetForScale();
        const yEnd = this.getHeight() - this.getBottomOffsetForScale();

        const lineWidth = this.config.scale.lineWidth;
        const center = this.getCenter();

        if (!this.scaleLine) {
            this.scaleLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.masterSvg.appendChild(this.scaleLine);
        }


        this.scaleLine.setAttribute("x1", center);
        this.scaleLine.setAttribute("y1", yStart);

        this.scaleLine.setAttribute("x2", center);
        this.scaleLine.setAttribute("y2", yEnd);

        this.scaleLine.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + lineWidth);
    }

    updateArrowHead() {
        const topOffset = this.getTopOffsetForScale();
        const lineWidth = this.config.scale.lineWidth;

        const center = this.getCenter();

        const width = this.config.scale.arrowHeadWidth;
        const widthHalf = width / 2;

        const arrowHeight = this.config.scale.arrowHeadHeight;

        const xStart = center - widthHalf;
        const yStart = arrowHeight + topOffset;

        const xCenter = center;
        const yCenter = topOffset;

        const xEnd = center + widthHalf;
        const yEnd = arrowHeight + topOffset;

        if (!this.arrowHeadSvg) {
            this.arrowHeadSvg = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            this.masterSvg.appendChild(this.arrowHeadSvg);
        }

        this.arrowHeadSvg.setAttribute("points", xStart + "," + yStart + " " + xCenter + "," + yCenter + " " + xEnd + "," + yEnd);
        this.arrowHeadSvg.setAttribute("style", "fill:none;stroke:black;stroke-width:" + lineWidth);
    }

    getShapeForTimelineEntry(timelineEntry) {
        const level = this.levelManager.getLevelFor(timelineEntry);
        const color = timelineEntry.color;

        const entryWidth = this.config.entry.width;

        const yLow = this.getPosForDate(timelineEntry.fromDate);
        const yHigh = this.getPosForDate(timelineEntry.toDate);
        const height = yLow - yHigh;

        const timelineCenter = this.getCenter();

        let left = 0;
        if (level % 2 === 0) { //on right side
            left = timelineCenter + 1 + (entryWidth + 1) * (level / 2);

        } else { //on left side
            left = timelineCenter - (entryWidth + 1) - 6 * ((level - 1) / 2);
        }


        const shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        shape.setAttribute("y", yHigh);
        shape.setAttribute("x", left);
        shape.setAttribute("height", height);
        shape.setAttribute("width", entryWidth);
        shape.setAttribute("style", "fill:#" + color + ";stroke:black;stroke-width:1;pointer-events:all;");
        shape.setAttribute("class", "entry");

        return shape;
    }
}

module.exports = VerticalSmallBar;