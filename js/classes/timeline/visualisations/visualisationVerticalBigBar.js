
var defaultConfig = {};
defaultConfig.scale = {};
defaultConfig.scale.lineWidth = 3;
defaultConfig.scale.margin = 3;
defaultConfig.scale.backgroundColor = "ddd";
defaultConfig.scale.fontSize = 15;
defaultConfig.scale.arrowHeadHeight = 13;
defaultConfig.scale.numbersMarginRight = 20;
defaultConfig.drawToday = true;
defaultConfig.drawBaseLineYear = true;
defaultConfig.drawTickLabels = true;
defaultConfig.entries = {};
defaultConfig.entries.colors = ["f7c6c7", "fad8c7", "fef2c0", "bfe5bf", "bfdadc", "c7def8", "bfd4f2", "d4c5f9"];


function VisualisationVerticalBigBar(timeline, _htmlElement, _config) {
    VisualisationBase.call(this, timeline, _htmlElement, !_config ? this.defaultConfig : _config);

    this.lastColor = 0;
    this.repaint();
}

VisualisationVerticalBigBar.prototype = Object.create(VisualisationBase.prototype);
VisualisationVerticalBigBar.prototype.defaultConfig = defaultConfig;

/*
 * VisualisationBase Implementation
 */
VisualisationVerticalBigBar.prototype.repaint = function () {
    this.updateScale();
    this.updateTicks();
    this.updateStartYearAndNowString();
    this.updateArrowHead();
    this.updateEntries();
}

VisualisationVerticalBigBar.prototype.getCenter = function () {
    return this.getWidth() / 2;
}

VisualisationVerticalBigBar.prototype.getNextColor = function () {
    var colorIndex = this.lastColor + 1;

    if (this.config.entries.colors.length == colorIndex)
        colorIndex = 0;

    this.lastColor = colorIndex;

    return this.config.entries.colors[colorIndex];
}

VisualisationVerticalBigBar.prototype.getPosForDate = function (date) {
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
VisualisationVerticalBigBar.prototype.getTopOffsetForEntry = function () {
    var offset = this.getTopOffsetForScale();

    offset += this.config.scale.arrowHeadHeight;

    return offset;
}

VisualisationVerticalBigBar.prototype.getBottomOffsetForEntry = function () {
    return this.getBottomOffsetForScale();
}

VisualisationVerticalBigBar.prototype.getHeightForEntry = function () {
    var offset = this.getTopOffsetForEntry() + this.getBottomOffsetForScale();

    return this.getHeight() - offset;
}

// Height and offsets for Scale

VisualisationVerticalBigBar.prototype.getTopOffsetForScale = function () {
    var offset = 0;

    if (this.config.drawToday) {
        offset += this.config.scale.fontSize + 2;
    }

    return offset;
}

VisualisationVerticalBigBar.prototype.getBottomOffsetForScale = function () {
    var offset = 3;

    if (this.config.drawBaseLineYear) {
        offset += this.config.scale.fontSize + 2;
    }

    return offset;
}

VisualisationVerticalBigBar.prototype.getHeightForScale = function () {
    var offset = this.getTopOffsetForScale() + this.getBottomOffsetForScale();

    return this.getHeight() - offset;
}

/*
 Draw methods
 Each method keeps track of it's own elements
*/
VisualisationVerticalBigBar.prototype.updateScale = function () {
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
    this.scaleBackground.setAttribute("width", right-left);
    this.scaleBackground.setAttribute("style", "fill:#" + this.config.scale.backgroundColor + ";");
    this.scaleBackground.setAttribute("class", "js_timeline_entry");
}

//currently one tick per year
VisualisationVerticalBigBar.prototype.updateTicks = function () {
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

VisualisationVerticalBigBar.prototype.updateStartYearAndNowString = function () {
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

VisualisationVerticalBigBar.prototype.updateArrowHead = function () {
    "use strict";
    var topOffset = this.getTopOffsetForScale();
    var lineWidth = this.config.scale.lineWidth;

    var margin = this.config.scale.margin;
    var width = this.getWidth();
    var left = margin + lineWidth;
    var right = width - (margin + lineWidth);
    var center = this.getCenter();

    var arrowHeight = this.config.scale.arrowHeadHeight;

    var xStart = left;
    var yStart = arrowHeight + topOffset;

    var xCenter = center;
    var yCenter = topOffset;

    var xEnd = right;
    var yEnd = arrowHeight + topOffset;

    if (!this.arrowHeadSvg) {
        this.arrowHeadSvg = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        this.masterSvg.appendChild(this.arrowHeadSvg);
    }

    this.arrowHeadSvg.setAttribute("points", xStart + "," + yStart + " " + xCenter + "," + yCenter + " " + xEnd + "," + yEnd);
    this.arrowHeadSvg.setAttribute("style", "fill:none;stroke:black;stroke-width:" + lineWidth);
}

VisualisationVerticalBigBar.prototype.updateEntries = function () {
    var allEntries = this.timeline.getTimelineEntries();
    for (var index in this.timelineEntryVisualisationMaps) {
        this.masterSvg.removeChild(this.timelineEntryVisualisationMaps[index]);
    }

    for (var index in allEntries) {
        var entry = allEntries[index];
        this.onNewTimelineEntry(entry);
    }
}

VisualisationVerticalBigBar.prototype.getShapeForTimelineEntry = function (timelineEntry) {
    //decide level
    var takenLevels = this.timeline.getTakenLevelsInTimeRange(timelineEntry.fromDate, timelineEntry.toDate, timelineEntry);
    var newLevel = 0;
    while (takenLevels.indexOf(newLevel) != -1) {
        newLevel += 1;
    }

    var level = newLevel;
    timelineEntry.level = newLevel;

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
    left = left + level * 6;



    var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    shape.setAttribute("y", yHigh);
    shape.setAttribute("x", left);
    shape.setAttribute("height", height);
    shape.setAttribute("width", 5);
    shape.setAttribute("style", "fill:#" + color + ";stroke:black;stroke-width:1;pointer-events:all;");
    shape.setAttribute("class", "js_timeline_entry");

    shape.onmouseover = function (event) {
        timelineEntry.tooltip = new Tooltip(event, timelineEntry.title);
        shape.classList.add("hover");

    };
    shape.onmouseout = function () {
        timelineEntry.tooltip.destroyExistingTooltip();
        shape.classList.remove("hover");
    }

    return shape;
}




function addEvent(ele, type, func) {
    if (ele.addEventListener) {
        ele.addEventListener(type, func, false);
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + type, func);
    }
}