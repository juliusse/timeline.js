/*

Author:
    Julius Seltenheim 
    
*/
var LINE_WIDTH=3;


window.Timeline = Timeline;

//Timeline stuff

function Timeline(_htmlElement, _fromYear) {
    this.location = _htmlElement;
    this.fromYear = _fromYear;
    this.timelineEntries = [];
    this.timelineShapes = {};

    this.initialize();
}


Timeline.prototype.initialize = function () {
    this.masterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.masterSvg.setAttribute("version", "1.2");
    this.masterSvg.setAttribute("baseProfile", "tiny");
    this.masterSvg.setAttribute("style", "position:absolute;left:0px;");
    this.svgLine = createLine(this);
    this.svgTicks = createTicks(this);
    this.svgText = createStartNumber(this);
    this.svgArrowHead = createArrowHead(this);




    this.masterSvg.appendChild(this.svgLine);
    for (index in this.svgTicks) {
        this.masterSvg.appendChild(this.svgTicks[index]);
    }

    this.masterSvg.appendChild(this.svgText);
    this.masterSvg.appendChild(this.svgArrowHead);

    this.location.appendChild(this.masterSvg);
}

Timeline.prototype.getWidth = function () {
    return this.location.clientWidth;
}

Timeline.prototype.getHeight = function () {
    return this.location.clientHeight;
}

Timeline.prototype.getFromYear = function () {
    return this.fromYear;
}

Timeline.prototype.getHeightForLines = function () {
    return this.location.clientHeight - 20;
}

Timeline.prototype.getEntriesInTimeRange = function (fromDate, toDate) {
    var resultList = [];
    for (index in this.timelineEntries) {
        var timelineEntry = this.timelineEntries[index];
        if ((timelineEntry.fromDate >= fromDate && timelineEntry.fromDate <= toDate) ||
            (timelineEntry.toDate >= fromDate && timelineEntry.toDate <= toDate)) {
            resultList.push(timelineEntry);
        }
    }

    return resultList;
}

Timeline.prototype.getTakenLevelsInTimeRange = function (fromDate, toDate) {
    var entries = this.getEntriesInTimeRange(fromDate, toDate);
    var result = [];

    for (index in entries) {
        var timelineEntry = this.timelineEntries[index];
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
    var startTimestamp = new Date(this.fromYear,1,1).getTime();
    var nowTimestamp = new Date().getTime();
    var timespan = nowTimestamp - startTimestamp;

    var posOnTimespan = date.getTime() - startTimestamp;
    var percentFromStart = posOnTimespan / timespan;

    return this.getHeightForLines() -  (this.getHeightForLines() * percentFromStart);
}

function createLine(timeline) {
    "use strict";
    var height = timeline.getHeightForLines();
    var width = timeline.getWidth();

    var marginLeft = (width) / 2;


    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", marginLeft);
    line.setAttribute("y1", "0");

    line.setAttribute("x2", marginLeft);
    line.setAttribute("y2", height);

    line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:"+LINE_WIDTH);


    return line;
}

function createTicks(timeline) {
    "use strict";
    var height = timeline.getHeightForLines();
    var width = timeline.getWidth();
    var marginLeft = (width) / 2;
    var stepSize = height / 10;

    var lines = [];

    for (var i = 0; i < 10; i += 1) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", marginLeft-8);
        line.setAttribute("y1", i * stepSize + stepSize);

        line.setAttribute("x2", marginLeft+8);
        line.setAttribute("y2", i * stepSize + stepSize);

        line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 2);

        lines.push(line);
    }

    return lines;
}

function createStartNumber(timeline) {
    "use strict";
    var height = timeline.getHeightForLines();
    var width = timeline.getWidth();
    var left = (width) / 2 - 15;


    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", left);
    text.setAttribute("y", height + 16);
    text.setAttribute("fill", "black");
    text.setAttribute("font-size", "15");
    

    var str = document.createTextNode(timeline.getFromYear());
    text.appendChild(str);


    return text;
}

function createArrowHead(timeline) {
    "use strict";
    var width = timeline.getWidth();
    var center = width / 2;
    var arrowWidthHalf = 10;
    var arrowHeight = 13;

    var xStart = center - arrowWidthHalf;
    var yStart = arrowHeight;

    var xCenter = center;
    var yCenter = 0;
    
    var xEnd = center + arrowWidthHalf;
    var yEnd = arrowHeight;

    var path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    path.setAttribute("points", xStart + "," + yStart + " " + xCenter + "," + yCenter + " " + xEnd + "," + yEnd);
    path.setAttribute("style", "fill:none;stroke:black;stroke-width:3");

    return path;
}


//TimelineEntry stuff


function TimelineEntry(_title, _fromDate, _toDate) {
    this.title = _title;
    this.fromDate = _fromDate;
    this.toDate = _toDate;
    this.level = 0;
}

TimelineEntry.prototype.getHash = function () {
    return this.title + "_" + this.fromDate.getTime() + "_" + this.toDate.getTime();
}

TimelineEntry.prototype.getShapeForTimeline = function (timeline) {
    //decide level
    var takenLevels = timeline.getTakenLevelsInTimeRange(this.fromDate, this.toDate);

    var newLevel = 0;
    while (takenLevels.indexOf(newLevel) != -1) {
        newLevel += 1;
    }

    this.level = newLevel;

    var xLow = timeline.getPosForDate(this.fromDate);
    var xHigh = timeline.getPosForDate(this.toDate);
    var height = xLow - xHigh;

    var width = timeline.getWidth();
    var timelineCenter = width / 2;

    var left = 0;
    if (newLevel % 2 == 0) { //on right side
        left = timelineCenter + 3 + 6 * (newLevel / 2);

    } else { //on left side
        left = timelineCenter - 7 - 6 * ((newLevel-1) / 2);
    }




    var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    shape.setAttribute("y", xHigh);
    shape.setAttribute("x", left);
    shape.setAttribute("height", height);
    shape.setAttribute("width", 5);
    shape.setAttribute("style", "fill:#9acb42;stroke:black;stroke-width:1;");

    return shape;

}
