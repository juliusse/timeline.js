const { Visualisation }= require('./visualisation');

const localDefaultConfig = {};
localDefaultConfig.scale = {};
localDefaultConfig.scale.lineWidth = 3;
localDefaultConfig.scale.margin = 5;
localDefaultConfig.scale.backgroundColor = "ffffff";
localDefaultConfig.scale.fontSize = 15;
localDefaultConfig.scale.arrowHeadHeight = 13;
localDefaultConfig.scale.numbersMarginRight = 20;
localDefaultConfig.drawToday = true;
localDefaultConfig.drawBaseLineYear = true;
localDefaultConfig.drawTickLabels = true;
localDefaultConfig.entries = {};
localDefaultConfig.entries.colors = ["f7c6c7", "fad8c7", "fef2c0", "bfe5bf", "bfdadc", "c7def8", "bfd4f2", "d4c5f9"];


class VerticalGroupedByColor extends Visualisation {
    constructor(timeline, htmlElement, config) {
        super(timeline, htmlElement, config || localDefaultConfig);

        //set hover style
        var style = document.createElement("style");
        style.setAttribute("type", "text/css");
        var styleText = document.createTextNode(".js_timeline_entry.hover{opacity:0.5;} .js_timeline_entry{opacity:1;}");
        style.appendChild(styleText);

        this.masterSvg.appendChild(style);

        this.lastColor = 0;
        this.colorToLevelMap = {};
        this.nextLevel = 1;
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
        return this.getWidth() / 2;
    }

    getNextColor() {
        var colorIndex = this.lastColor + 1;

        if (this.config.entries.colors.length == colorIndex)
            colorIndex = 0;

        this.lastColor = colorIndex;

        return this.config.entries.colors[colorIndex];
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

        offset += this.config.scale.arrowHeadHeight;

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
        var yStart = this.getTopOffsetForEntry();
        var yEnd = this.getHeight() - this.getBottomOffsetForEntry();

        var lineWidth = this.config.scale.lineWidth;
        var margin = this.config.scale.margin;
        var width = this.getWidth();
        var left = margin + lineWidth;
        var right = width - (margin + lineWidth);

        if (!this.scaleLine1) {
            this.scaleLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.masterSvg.appendChild(this.scaleLine1);
            this.scaleLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.masterSvg.appendChild(this.scaleLine2);
            this.scaleBackground = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.masterSvg.appendChild(this.scaleBackground);
        }

        this.scaleLine1.setAttribute("x1", left);
        this.scaleLine1.setAttribute("y1", yStart);
        this.scaleLine1.setAttribute("x2", left);
        this.scaleLine1.setAttribute("y2", yEnd);
        this.scaleLine1.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + lineWidth);

        this.scaleLine2.setAttribute("x1", right);
        this.scaleLine2.setAttribute("y1", yStart);
        this.scaleLine2.setAttribute("x2", right);
        this.scaleLine2.setAttribute("y2", yEnd);
        this.scaleLine2.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + lineWidth);

        this.scaleBackground.setAttribute("y", yStart);
        this.scaleBackground.setAttribute("x", left);
        this.scaleBackground.setAttribute("height", yEnd - yStart);
        this.scaleBackground.setAttribute("width", right - left);
        this.scaleBackground.setAttribute("style", "fill:#" + this.config.scale.backgroundColor + ";");
        this.scaleBackground.setAttribute("class", "js_timeline_entry");
    }

//currently one tick per year
    updateTicks() {
        "use strict";

        var height = this.getHeightForEntry();
        var offsetTop = this.getTopOffsetForEntry();
        var withLabels = this.config.drawTickLabels;

        var lineWidth = this.config.scale.lineWidth;
        var margin = this.config.scale.margin;
        var width = this.getWidth();
        var left = margin + lineWidth;
        var right = width - (margin + lineWidth);

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

            line.setAttribute("x1", left);
            line.setAttribute("y1", yPos);

            line.setAttribute("x2", right);
            line.setAttribute("y2", yPos);

            line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 2);

            this.tickSvgs.push(line);
            this.masterSvg.appendChild(line);

            if (withLabels && i != 0) {
                var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", right - this.config.scale.numbersMarginRight);
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
        var lineWidth = 2;//this.config.scale.lineWidth;

        var margin = this.config.scale.margin;
        var width = this.getWidth();
        var left = 1;
        var right = width - 1;
        var center = this.getCenter();

        var arrowHeight = this.config.scale.arrowHeadHeight;

        var xStart = left;
        var yStart = arrowHeight + topOffset + 3;

        var xCenter = center;
        var yCenter = topOffset;

        var xEnd = right;
        var yEnd = arrowHeight + topOffset + 5;

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
        let level = this.colorToLevelMap[timelineEntry.color];
        if (level == null) {
            this.colorToLevelMap[timelineEntry.color] = this.nextLevel;
            level = this.nextLevel;
            this.nextLevel += 1;
        }

        timelineEntry.level = level;

        //decide color
        if (!timelineEntry.color)
            timelineEntry.color = this.getNextColor();
        var color = timelineEntry.color;

        //decide position
        //y
        var yLow = this.getPosForDate(timelineEntry.fromDate);
        var yHigh = this.getPosForDate(timelineEntry.toDate);
        var height = yLow - yHigh;

        //x
        var lineWidth = this.config.scale.lineWidth;
        var margin = this.config.scale.margin;
        var width = this.getWidth();
        var left = margin + lineWidth;
        left = left + level * 11;


        var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        shape.setAttribute("y", yHigh);
        shape.setAttribute("x", left);
        shape.setAttribute("height", height);
        shape.setAttribute("width", 10);
        shape.setAttribute("style", "fill:#" + color + ";stroke:black;stroke-width:1;pointer-events:all;");
        shape.setAttribute("class", "js_timeline_entry");

        return shape;
    }
}

module.exports = VerticalGroupedByColor;