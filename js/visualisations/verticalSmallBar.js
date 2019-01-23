const { Visualisation }= require('./visualisation');

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
        var realCenter = this.getWidth() / 2;
        var usedCenter = realCenter * 0.9;
        return usedCenter;
    }

    getPosForDate(date) {
        var startTimestamp = new Date(this.timeline.getFromYear(), 0, 1).getTime();
        var nowTimestamp = new Date().getTime();
        var timespan = nowTimestamp - startTimestamp;

        var posOnTimespan = date.getTime() - startTimestamp;
        var percentFromStart = posOnTimespan / timespan;

        var offsetTop = this.getTopOffsetForEntry();
        var maxHeight = this.getHeightForEntry();

        if (percentFromStart >= 1) {
            return offsetTop;
        } else if (percentFromStart <= 0) {
            return offsetTop + maxHeight;
        } else {
            var pos = maxHeight - (maxHeight * percentFromStart) + offsetTop
            return pos;
        }
    }


// Height and offsets for Entry 
    getTopOffsetForEntry() {
        var offset = this.getTopOffsetForScale();

        offset += this.config.scale.arrowHeadHeight + 2;

        return offset;
    }

    getBottomOffsetForEntry() {
        return this.getBottomOffsetForScale();
    }

    getHeightForEntry() {
        var offset = this.getTopOffsetForEntry() + this.getBottomOffsetForScale();

        return this.getHeight() - offset;
    }

// Height and offsets for Scale

    getTopOffsetForScale() {
        var offset = 0;

        if (this.config.drawToday) {
            offset += this.config.scale.fontSize + 2;
        }

        return offset;
    }

    getBottomOffsetForScale() {
        var offset = 3;

        if (this.config.drawBaseLineYear) {
            offset += this.config.scale.fontSize + 2;
        }

        return offset;
    }

    getHeightForScale() {
        var offset = this.getTopOffsetForScale() + this.getBottomOffsetForScale();

        return this.getHeight() - offset;
    }

    /*
     Draw methods
     Each method keeps track of it's own elements
    */
    updateScale() {
        "use strict";
        var yStart = this.getTopOffsetForScale();
        var yEnd = this.getHeight() - this.getBottomOffsetForScale();

        var lineWidth = this.config.scale.lineWidth;
        var center = this.getCenter();

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
        "use strict";

        var height = this.getHeightForEntry();
        var offsetTop = this.getTopOffsetForEntry();
        var withLabels = this.config.drawTickLabels;

        var center = this.getCenter();
        var widthHalf = 8;

        //calculate step size
        var fromTimestamp = new Date(this.timeline.getFromYear(), 0, 1).getTime();
        var nowTimestamp = new Date().getTime();
        var timespan = nowTimestamp - fromTimestamp;
        var ticks = timespan / (31536000000 + 21600000); //a year + leap

        var stepSize = height / ticks;

        if (this.tickSvgs) {
            for (var index in this.tickSvgs) {
                this.masterSvg.removeChild(this.tickSvgs[index]);
            }
        }

        this.tickSvgs = [];

        for (var i = 0; i < ticks; i += 1) {
            var yPos = offsetTop + height - i * stepSize;
            var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            line.setAttribute("x1", center - widthHalf);
            line.setAttribute("y1", yPos);

            line.setAttribute("x2", center + widthHalf);
            line.setAttribute("y2", yPos);

            line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 2);

            this.tickSvgs.push(line);
            this.masterSvg.appendChild(line);

            if (withLabels && i != 0) {
                var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", center + 3);
                text.setAttribute("y", yPos + 10);
                text.setAttribute("fill", "black");
                text.setAttribute("font-size", "10");


                var str = document.createTextNode((this.timeline.getFromYear() + i + ""));
                text.appendChild(str);

                this.tickSvgs.push(text);
                this.masterSvg.appendChild(text);
            }
        }
    }

    updateStartYearAndNowString() {
        "use strict";
        if (this.labelSvgs) {
            for (var index in this.labelSvgs) {
                this.masterSvg.removeChild(this.labelSvgs[index]);
            }
        }

        this.labelSvgs = [];

        var left = this.getCenter() - 15;
        var fontSize = this.config.scale.fontSize;
        var fontOffset = fontSize * 0.3;

        if (this.config.drawToday) {
            var todaySvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
            todaySvg.setAttribute("x", left);
            todaySvg.setAttribute("y", fontOffset * 2.7);
            todaySvg.setAttribute("fill", "black");
            todaySvg.setAttribute("font-size", fontSize);

            var todayString = document.createTextNode("today");
            todaySvg.appendChild(todayString);
            this.labelSvgs.push(todaySvg);
            this.masterSvg.appendChild(todaySvg);

        }

        if (this.config.drawBaseLineYear) {
            var baseLineYearSvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
            baseLineYearSvg.setAttribute("x", left);
            baseLineYearSvg.setAttribute("y", this.getHeight() - fontOffset);
            baseLineYearSvg.setAttribute("fill", "black");
            baseLineYearSvg.setAttribute("font-size", fontSize);

            var baseLineYearString = document.createTextNode(this.timeline.getFromYear());
            baseLineYearSvg.appendChild(baseLineYearString);
            this.labelSvgs.push(baseLineYearSvg);
            this.masterSvg.appendChild(baseLineYearSvg);

        }
    }

    updateArrowHead() {
        "use strict";
        var topOffset = this.getTopOffsetForScale();
        var lineWidth = this.config.scale.lineWidth;

        var center = this.getCenter();

        var width = this.config.scale.arrowHeadWidth;
        var widthHalf = width / 2;

        var arrowHeight = this.config.scale.arrowHeadHeight;

        var xStart = center - widthHalf;
        var yStart = arrowHeight + topOffset;

        var xCenter = center;
        var yCenter = topOffset;

        var xEnd = center + widthHalf;
        var yEnd = arrowHeight + topOffset;

        if (!this.arrowHeadSvg) {
            this.arrowHeadSvg = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            this.masterSvg.appendChild(this.arrowHeadSvg);
        }

        this.arrowHeadSvg.setAttribute("points", xStart + "," + yStart + " " + xCenter + "," + yCenter + " " + xEnd + "," + yEnd);
        this.arrowHeadSvg.setAttribute("style", "fill:none;stroke:black;stroke-width:" + lineWidth);
    }

    updateEntries() {
        var allEntries = this.timeline.getTimelineEntries();
        for (var index in this.timelineEntryVisualisationMaps) {
            this.masterSvg.removeChild(this.timelineEntryVisualisationMaps[index]);
        }

        for (var index in allEntries) {
            var entry = allEntries[index];
            this.onNewTimelineEntry(entry);
        }
    }

    getShapeForTimelineEntry(timelineEntry) {
        //decide level
        const level = this.levelManager.getLevelFor(timelineEntry);

        //decide color
        if (!timelineEntry.color)
            timelineEntry.color = this.getNextColor();
        var color = timelineEntry.color;

        var yLow = this.getPosForDate(timelineEntry.fromDate);
        var yHigh = this.getPosForDate(timelineEntry.toDate);
        var height = yLow - yHigh;

        var width = this.getWidth();
        var timelineCenter = this.getCenter();

        var left = 0;
        if (level % 2 == 0) { //on right side
            left = timelineCenter + 1 + 6 * (level / 2);

        } else { //on left side
            left = timelineCenter - 7 - 6 * ((level - 1) / 2);
        }


        var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        shape.setAttribute("y", yHigh);
        shape.setAttribute("x", left);
        shape.setAttribute("height", height);
        shape.setAttribute("width", 5);
        shape.setAttribute("style", "fill:#" + color + ";stroke:black;stroke-width:1;pointer-events:all;");
        shape.setAttribute("class", "entry");

        return shape;
    }
}

module.exports = VerticalSmallBar;