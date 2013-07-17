/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

window.Timeline = Timeline;

var js = {};
js.timelineInstances = [];

var defaultConfig = {};
defaultConfig.scale = {};
defaultConfig.scale.lineWidth = 3;
defaultConfig.scale.fontSize = 15;
defaultConfig.scale.arrowHeadHeight = 13;
defaultConfig.scale.arrowHeadWidth = 20;
defaultConfig.drawToday = true;
defaultConfig.drawBaseLineYear = true;
defaultConfig.drawTickLabels = true;
defaultConfig.entries = {};
defaultConfig.entries.colors = ["f7c6c7", "fad8c7", "fef2c0", "bfe5bf", "bfdadc", "c7def8", "bfd4f2", "d4c5f9"];

Timeline.prototype.defaultConfig = defaultConfig;

//Timeline stuff

function Timeline(_htmlElement, _fromYear, _config) {
    //set id
    this.id = js.timelineInstances.length;
    js.timelineInstances.push(this);

    //init config
    this.config = !_config ? this.defaultConfig : _config;
    this.initializeConfig();

    this.location = _htmlElement;
    this.fromYear = _fromYear;
    this.timelineEntries = [];
    this.timelineShapes = {};

    this.lastColor = 0;

    this.initialize();
}

Timeline.prototype.initializeConfig = function () {
    //TODO merge values with default conf
}

Timeline.prototype.initialize = function () {
    //make sure element is empty
    while (this.location.firstChild) {
        this.location.removeChild(this.location.firstChild);
    }


    this.masterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.masterSvg.setAttribute("style", "position:absolute;left:0px;top:0px;width:100%;height:100%;");

    //set hover style
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    var styleText = document.createTextNode(".js_timeline_entry:hover{opacity:0.5;}");
    style.appendChild(styleText);

    this.masterSvg.appendChild(style);

    this.updateScale();
    this.updateTicks();
    this.updateStartYearAndNowString();
    this.updateArrowHead(this);

    this.location.appendChild(this.masterSvg);
}


// getter

Timeline.prototype.getWidth = function () {
    return this.location.clientWidth;
}

Timeline.prototype.getCenter = function () {
    var realCenter = this.getWidth() / 2;
    var usedCenter = realCenter * 0.9;
    return usedCenter;
}

Timeline.prototype.getHeight = function () {
    return this.location.clientHeight;
}

Timeline.prototype.getFromYear = function () {
    return this.fromYear;
}

// Height and offsets for Entry 
Timeline.prototype.getTopOffsetForEntry = function () {
    var offset = this.getTopOffsetForScale();

    offset += this.config.scale.arrowHeadHeight + 2;

    return offset;
}

Timeline.prototype.getBottomOffsetForEntry = function () {
    return this.getBottomOffsetForScale();
}

Timeline.prototype.getHeightForEntry = function () {
    var offset = this.getTopOffsetForEntry() + this.getBottomOffsetForScale();

    return this.getHeight() - offset;
}

// Height and offsets for Scale

Timeline.prototype.getTopOffsetForScale = function () {
    var offset = 0;

    if (this.config.drawToday) {
        offset += this.config.scale.fontSize + 2;
    }

    return offset;
}

Timeline.prototype.getBottomOffsetForScale = function () {
    var offset = 3;

    if (this.config.drawBaseLineYear) {
        offset += this.config.scale.fontSize + 2;
    }

    return offset;
}

Timeline.prototype.getHeightForScale = function () {
    var offset = this.getTopOffsetForScale() + this.getBottomOffsetForScale();

    return this.getHeight() - offset;
}




// timelineEntry related
Timeline.prototype.getEntriesInTimeRange = function (fromDate, toDate) {
    var resultList = [];
    for (index in this.timelineEntries) {
        var timelineEntry = this.timelineEntries[index];
        if ((timelineEntry.fromDate >= fromDate && timelineEntry.fromDate <= toDate) ||
            (timelineEntry.toDate >= fromDate && timelineEntry.toDate <= toDate) ||
            (timelineEntry.fromDate < fromDate && timelineEntry.toDate > toDate)) {
            resultList.push(timelineEntry);
        }
    }

    return resultList;
}

Timeline.prototype.getTakenLevelsInTimeRange = function (fromDate, toDate) {
    var entries = this.getEntriesInTimeRange(fromDate, toDate);
    var result = [];

    for (index in entries) {
        var timelineEntry = entries[index];
        if (result.indexOf(timelineEntry.level) == -1)
            result.push(timelineEntry.level);
    }

    return result;
}

Timeline.prototype.getNextColor = function () {
    var colorIndex = this.lastColor + 1;

    if (this.config.entries.colors.length == colorIndex)
        colorIndex = 0;

    this.lastColor = colorIndex;

    return this.config.entries.colors[colorIndex];
}



Timeline.prototype.addTimelineEntry = function (timelineEntry) {
    var shape = timelineEntry.getShapeForTimeline(this);
    this.timelineEntries.push(timelineEntry);
    this.timelineShapes[timelineEntry.getHash()] = shape;

    this.masterSvg.appendChild(shape);
}

Timeline.prototype.getPosForDate = function (date) {
    var startTimestamp = new Date(this.fromYear, 1, 1).getTime();
    var nowTimestamp = new Date().getTime();
    var timespan = nowTimestamp - startTimestamp;

    var posOnTimespan = date.getTime() - startTimestamp;
    var percentFromStart = posOnTimespan / timespan;

    var offsetTop = this.getTopOffsetForEntry();
    var maxHeight = this.getHeight() - this.getBottomOffsetForEntry();

    var pos = offsetTop + this.getHeightForEntry() - (this.getHeightForEntry() * percentFromStart);
    return pos < offsetTop ? offsetTop : pos > maxHeight ? maxHeight : pos;
}

/*
 Draw methods
 Each method keeps track of it's own elements
*/
Timeline.prototype.updateScale = function () {
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
Timeline.prototype.updateTicks = function() {
    "use strict";

    var height = this.getHeightForScale();
    var offsetTop = this.getTopOffsetForScale();
    var withLabels = this.config.drawTickLabels;

    var center = this.getCenter();
    var widthHalf = 8;

    //calculate step size
    var fromYear = this.getFromYear()
    var ticks = new Date().getFullYear() - fromYear + 1;
    var stepSize = height / ticks;

    if (this.tickSvgs) {
        for (index in this.tickSvgs) {
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


            var str = document.createTextNode((fromYear + i + ""));
            text.appendChild(str);

            this.tickSvgs.push(text);
            this.masterSvg.appendChild(text);
        }
    }
}

Timeline.prototype.updateStartYearAndNowString = function() {
    "use strict";
    if (this.labelSvgs) {
        for (index in this.labelSvgs) {
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

        var baseLineYearString = document.createTextNode(this.getFromYear());
        baseLineYearSvg.appendChild(baseLineYearString);
        this.labelSvgs.push(baseLineYearSvg);
        this.masterSvg.appendChild(baseLineYearSvg);

    }
}

Timeline.prototype.updateArrowHead = function() {
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
