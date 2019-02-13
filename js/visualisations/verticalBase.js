const Visualisation = require('./visualisation');

class VerticalBase extends Visualisation {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, config);
    }

    repaint() {
        this._repaintCustom();
        this.updateTicks();
        this.updateStartYearAndNowString();
        this.updateEntries();
    }

    _repaintCustom() {
        // hook for subclasses
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
        let offset = this.getTopOffsetForScale();

        if (this.config.scale.arrowHead.enabled) {
            offset += this.config.scale.arrowHead.height;
        }

        return offset;
    }

    getHeightForEntry() {
        const offset = this.getTopOffsetForEntry() + this.getBottomOffsetForScale();

        return this.getHeight() - offset;
    }

    // Height and offsets for Scale

    getTopOffsetForScale() {
        let offset = 0;

        if (this.config.drawToday) {
            offset += this.config.scale.fontSize + 2;
        }

        return offset;
    }

    getBottomOffsetForScale() {
        let offset = 3;

        if (this.config.drawBaseLineYear) {
            offset += this.config.scale.fontSize + 2;
        }

        return offset;
    }

    updateEntries() {
        const allEntries = this.timeline.getTimelineEntries();

        _.values(this.timelineEntryVisualisationMaps)
            .forEach(shape => this.masterSvg.removeChild(shape));

        allEntries.forEach(entry => this.onNewTimelineEntry(entry));
    }

    /*
        Draw methods
        Each method keeps track of it's own elements
    */
    getTickStrokeWidth() {
        return this.config.scale.ticks.line.stroke;
    }

    updateTicks() {
        const height = this.getHeightForEntry();
        const offsetTop = this.getTopOffsetForEntry();
        const withLabels = this.config.scale.ticks.drawLabels;

        const lineWidth = this.config.scale.ticks.line.margin;
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
            const year = this.timeline.getFromYear() + i;
            line.setAttribute('x1', left);
            line.setAttribute('y1', yPos);

            line.setAttribute('x2', right);
            line.setAttribute('y2', yPos);

            line.setAttribute('style', 'stroke:rgb(0,0,0);stroke-width:' + this.getTickStrokeWidth());
            line.classList.add(`year-${year}`);
            this.tickSvgs.push(line);
            this.masterSvg.appendChild(line);

            if (withLabels && i !== 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', right - this.config.scale.ticks.numbers.marginRight);
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

    updateStartYearAndNowString() {
        if (this.labelSvgs) {
            for (const index in this.labelSvgs) {
                this.masterSvg.removeChild(this.labelSvgs[index]);
            }
        }

        this.labelSvgs = [];

        const left = this.getCenter() - 15;
        const fontSize = this.config.scale.fontSize;
        const fontOffset = fontSize * 0.3;

        if (this.config.drawToday) {
            const todaySvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
            todaySvg.setAttribute("x", left);
            todaySvg.setAttribute("y", fontOffset * 2.7);
            todaySvg.setAttribute("fill", "black");
            todaySvg.setAttribute("font-size", fontSize);

            const todayString = document.createTextNode("today");
            todaySvg.appendChild(todayString);
            this.labelSvgs.push(todaySvg);
            this.masterSvg.appendChild(todaySvg);

        }

        if (this.config.drawBaseLineYear) {
            const baseLineYearSvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
            baseLineYearSvg.setAttribute("x", left);
            baseLineYearSvg.setAttribute("y", this.getHeight() - fontOffset);
            baseLineYearSvg.setAttribute("fill", "black");
            baseLineYearSvg.setAttribute("font-size", fontSize);

            const baseLineYearString = document.createTextNode(this.timeline.getFromYear());
            baseLineYearSvg.appendChild(baseLineYearString);
            this.labelSvgs.push(baseLineYearSvg);
            this.masterSvg.appendChild(baseLineYearSvg);

        }
    }
}

module.exports = VerticalBase;