const Visualisation = require('./visualisation');

class VerticalMinimal extends Visualisation {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, config);

        this.htmlElement.classList.add('minimal');

        this.repaint();
    }

    /*
     * VisualisationBase Implementation
     */
    repaint() {
        this.updateTicks();
        this.updateStartYear();
        this.updateEntries();
    }

    getCenter() {
        return this.getWidth() / 2;
    }

    getPosForDate(date) {
        const startTimestamp = new Date(this.timeline.getFromYear(), 0, 1).getTime();
        const nowTimestamp = new Date().getTime();
        const timespan = nowTimestamp - startTimestamp;

        const posOnTimespan = date.getTime() - startTimestamp;
        const percentFromStart = posOnTimespan / timespan;

        const offsetTop = this.getTopOffsetForEntry();
        const maxHeight = this.getHeightForEntry();

        if (percentFromStart >= 1) {
            return offsetTop;
        } else if (percentFromStart <= 0) {
            return offsetTop + maxHeight;
        } else {
            return maxHeight - (maxHeight * percentFromStart) + offsetTop;
        }
    }


// Height and offsets for Entry 
    getTopOffsetForEntry() {
        return this.getTopOffsetForScale();
    }

    getHeightForEntry() {
        const offset = this.getTopOffsetForEntry() + this.getBottomOffsetForScale();

        return this.getHeight() - offset;
    }

// Height and offsets for Scale

    getTopOffsetForScale() {
        return 0;
    }

    getBottomOffsetForScale() {
        let offset = 3;

        if (this.config.drawBaseLineYear) {
            offset += this.config.scale.fontSize + 2;
        }

        return offset;
    }

    /*
     Draw methods
     Each method keeps track of it's own elements
    */

//currently one tick per year
    updateTicks() {
        'use strict';

        const height = this.getHeightForEntry();
        const offsetTop = this.getTopOffsetForEntry();
        const withLabels = this.config.drawTickLabels;

        const lineWidth = this.config.scale.lineWidth;
        const margin = this.config.scale.margin;
        const width = this.getWidth();
        const left = margin + lineWidth;
        const right = width - (margin + lineWidth);

        //calculate step size
        const fromTimestamp = new Date(this.timeline.getFromYear(), 0, 1).getTime();
        const nowTimestamp = new Date().getTime();
        const timespan = nowTimestamp - fromTimestamp;
        const ticks = timespan / (31536000000 + 21600000); //a year + leap

        const stepSize = height / ticks;

        if (this.tickSvgs) {
            for (const index in this.tickSvgs) {
                this.masterSvg.removeChild(this.tickSvgs[index]);
            }
        }

        this.tickSvgs = [];

        for (let i = 0; i < ticks; i += 1) {
            const yPos = offsetTop + height - i * stepSize;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

            line.setAttribute('x1', left);
            line.setAttribute('y1', yPos);

            line.setAttribute('x2', right);
            line.setAttribute('y2', yPos);

            line.setAttribute('style', 'stroke:rgb(0,0,0);stroke-width:' + 1);

            this.tickSvgs.push(line);
            this.masterSvg.appendChild(line);

            if (withLabels && i !== 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', right - this.config.scale.numbersMarginRight);
                text.setAttribute('y', yPos + 10);
                text.setAttribute('fill', 'black');
                text.setAttribute('font-size', '10');


                const str = document.createTextNode((this.timeline.getFromYear() + i + ''));
                text.appendChild(str);

                this.tickSvgs.push(text);
                this.masterSvg.appendChild(text);
            }
        }
    }

    updateStartYear() {
        'use strict';
        if (this.labelSvgs) {
            for (const index in this.labelSvgs) {
                this.masterSvg.removeChild(this.labelSvgs[index]);
            }
        }

        this.labelSvgs = [];

        const left = this.getCenter() - 15;
        const fontSize = this.config.scale.fontSize;
        const fontOffset = fontSize * 0.3;

        if (this.config.drawBaseLineYear) {
            const baseLineYearSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            baseLineYearSvg.setAttribute('x', left);
            baseLineYearSvg.setAttribute('y', this.getHeight() - fontOffset);
            baseLineYearSvg.setAttribute('fill', 'black');
            baseLineYearSvg.setAttribute('font-size', fontSize);

            const baseLineYearString = document.createTextNode(this.timeline.getFromYear());
            baseLineYearSvg.appendChild(baseLineYearString);
            this.labelSvgs.push(baseLineYearSvg);
            this.masterSvg.appendChild(baseLineYearSvg);

        }
    }

    updateEntries() {
        const allEntries = this.timeline.getTimelineEntries();

        _.values(this.timelineEntryVisualisationMaps)
            .forEach(shape => this.masterSvg.removeChild(shape));

        allEntries.forEach(entry => this.onNewTimelineEntry(entry));
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
        shape.setAttribute('style', 'fill:#' + color + ';pointer-events:all;');
        shape.setAttribute('class', 'entry');

        return shape;
    }


}

module.exports = VerticalMinimal;