/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/


window.Timeline = Timeline;

var defaultConfig = {};
defaultConfig.scale = {};
defaultConfig.scale.lineWidth = 3;
defaultConfig.scale.fontSize = 15;
defaultConfig.scale.arrowHeadHeight = 13;
defaultConfig.scale.arrowHeadWidth = 20;
defaultConfig.drawToday = true;
defaultConfig.drawBaseLineYear = true;

Timeline.prototype.defaultConfig = defaultConfig;

//Timeline stuff

function Timeline(_htmlElement, _fromYear, _config) {

    this.config = !_config ? this.defaultConfig : _config;
    this.initializeConfig();

    this.location = _htmlElement;
    this.fromYear = _fromYear;
    this.timelineEntries = [];
    this.timelineShapes = {};

    //to see the arrow head
    this.offsetTop = 15;

    //this.colors = ["e11d21", "eb6420", "fbca04", "009800", "006b75", "207de5", "0052cc", "5319e7"];
    this.colors = ["f7c6c7", "fad8c7", "fef2c0", "bfe5bf", "bfdadc", "c7def8", "bfd4f2", "d4c5f9"];
    this.lastColor = 0;

    this.initialize();
}

Timeline.prototype.initializeConfig = function () {
    
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

    this.svgLine = this.updateScale();
    this.svgTicks = createTicksPerYear(this, true);
    this.svgText = createStartYearAndNowString(this);
    this.svgArrowHead = createArrowHead(this);




    this.masterSvg.appendChild(this.svgLine);
    for (index in this.svgTicks) {
        this.masterSvg.appendChild(this.svgTicks[index]);
    }

    for (index in this.svgText) {
        this.masterSvg.appendChild(this.svgText[index]);
    }

    this.masterSvg.appendChild(this.svgArrowHead);

    this.location.appendChild(this.masterSvg);
}



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

Timeline.prototype.getNextColor = function () {
    var colorIndex = this.lastColor + 1;

    if (this.colors.length == colorIndex)
        colorIndex = 0;

    this.lastColor = colorIndex;

    return this.colors[colorIndex];
}

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
Timeline.prototype.updateScale = function() {
    "use strict";
    var yStart = this.getTopOffsetForScale();
    var yEnd = this.getHeight() - this.getBottomOffsetForScale();

    var lineWidth = this.config.scale.lineWidth;
    var center = this.getCenter();


    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", yStart);

    line.setAttribute("x2", center);
    line.setAttribute("y2", yEnd);

    line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + lineWidth);


    return line;
}

function createTicks(timeline) {
    "use strict";
    var height = timeline.getHeightForLines() + timeline.offsetTop;
    var width = timeline.getWidth();
    var marginLeft = timeline.getCenter();
    var stepSize = height / 10;

    var lines = [];

    for (var i = 0; i < 10; i += 1) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", marginLeft - 8);
        line.setAttribute("y1", i * stepSize + stepSize);

        line.setAttribute("x2", marginLeft + 8);
        line.setAttribute("y2", i * stepSize + stepSize);

        line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 2);

        lines.push(line);
    }

    return lines;
}

function createTicksPerYear(timeline, withLabels) {
    "use strict";

    var height = timeline.getHeightForScale();
    var offsetTop = timeline.getTopOffsetForScale();

    var marginLeft = timeline.getCenter();
    var fromYear = timeline.getFromYear()
    var ticks = new Date().getFullYear() - fromYear + 1;

    var stepSize = height / ticks;

    var svgs = [];

    for (var i = 0; i < ticks; i += 1) {
        var yPos = offsetTop + height - i * stepSize;
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("x1", marginLeft - 8);
        line.setAttribute("y1", yPos);

        line.setAttribute("x2", marginLeft + 8);
        line.setAttribute("y2", yPos);

        line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 2);

        svgs.push(line);

        if (withLabels && i != 0) {
            var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", marginLeft + 3);
            text.setAttribute("y", yPos + 10);
            text.setAttribute("fill", "black");
            text.setAttribute("font-size", "10");


            var str = document.createTextNode((fromYear + i + ""));
            text.appendChild(str);

            svgs.push(text);
        }
    }

    return svgs;
}

function createStartYearAndNowString(timeline) {
    "use strict";
    var texts = [];
    var left = timeline.getCenter() - 15;
    var fontSize = timeline.config.scale.fontSize;
    var fontOffset = fontSize * 0.3;

    if (timeline.config.drawToday) {
        var todaySvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
        todaySvg.setAttribute("x", left);
        todaySvg.setAttribute("y", fontOffset * 2.7);
        todaySvg.setAttribute("fill", "black");
        todaySvg.setAttribute("font-size", fontSize);

        var todayString = document.createTextNode("today");
        todaySvg.appendChild(todayString);
        texts.push(todaySvg);

    }

    if (timeline.config.drawBaseLineYear) {
        var baseLineYearSvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
        baseLineYearSvg.setAttribute("x", left);
        baseLineYearSvg.setAttribute("y", timeline.getHeight() - fontOffset);
        baseLineYearSvg.setAttribute("fill", "black");
        baseLineYearSvg.setAttribute("font-size", fontSize);

        var baseLineYearString = document.createTextNode(timeline.getFromYear());
        baseLineYearSvg.appendChild(baseLineYearString);
        texts.push(baseLineYearSvg);

    }

    return texts;
}

function createArrowHead(timeline) {
    "use strict";
    var topOffset = timeline.getTopOffsetForScale();
    var lineWidth = timeline.config.scale.lineWidth;

    var center = timeline.getCenter();

    var width = timeline.config.scale.arrowHeadWidth;
    var widthHalf = width / 2;
    
    var arrowHeight = timeline.config.scale.arrowHeadHeight;

    var xStart = center - widthHalf;
    var yStart = arrowHeight + topOffset;

    var xCenter = center;
    var yCenter = topOffset;

    var xEnd = center + widthHalf;
    var yEnd = arrowHeight + topOffset;

    var path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    path.setAttribute("points", xStart + "," + yStart + " " + xCenter + "," + yCenter + " " + xEnd + "," + yEnd);
    path.setAttribute("style", "fill:none;stroke:black;stroke-width:"+lineWidth);

    return path;
}
