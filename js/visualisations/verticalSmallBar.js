const Visualisation = require('./visualisation');

class VerticalSmallBar extends Visualisation {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, config);

        this.htmlElement.classList.add('small-bar');

        this.repaint();
    }

    /*
     * VisualisationBase Implementation
     */
    repaint() {
        this.updateScale();
        this.updateTicks();
        this.updateStartYearAndNowString();
        this.updateArrowHead();
        this.updateEntries();
    }

    getCenter() {
        const realCenter = this.getWidth() / 2;
        return realCenter * 0.9;
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

        offset += this.config.scale.arrowHeadHeight + 2;

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

//currently one tick per year
    updateTicks() {
        

        const height = this.getHeightForEntry();
        const offsetTop = this.getTopOffsetForEntry();
        const withLabels = this.config.drawTickLabels;

        const center = this.getCenter();
        const widthHalf = 8;

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
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            line.setAttribute("x1", center - widthHalf);
            line.setAttribute("y1", yPos);

            line.setAttribute("x2", center + widthHalf);
            line.setAttribute("y2", yPos);

            line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 2);

            this.tickSvgs.push(line);
            this.masterSvg.appendChild(line);

            if (withLabels && i !== 0) {
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", center + 3);
                text.setAttribute("y", yPos + 10);
                text.setAttribute("fill", "black");
                text.setAttribute("font-size", "10");


                const str = document.createTextNode((this.timeline.getFromYear() + i + ""));
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