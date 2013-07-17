/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/
var LINE_WIDTH = 3;


window.Timeline = Timeline;

//Timeline stuff

function Timeline(_htmlElement, _fromYear) {
    this.location = _htmlElement;
    this.fromYear = _fromYear;
    this.timelineEntries = [];
    this.timelineShapes = {};

    //to see the arrow head
    this.offsetTop = 15;

    this.colors = ["E8D0A9", "B7AFA3", "C1DAD6", "F5FAFA", "ACD1E9", "6D929B"];
    this.lastColor = 0;

    this.initialize();
}


Timeline.prototype.initialize = function () {
    //make sure element is empty
    while (this.location.firstChild) {
        this.location.removeChild(this.location.firstChild);
    }


    this.masterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.masterSvg.setAttribute("version", "1.2");
    this.masterSvg.setAttribute("baseProfile", "tiny");
    this.masterSvg.setAttribute("style", "position:absolute;left:0px;top:0px;");

    //set hover style
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    var styleText = document.createTextNode(".js_timeline_entry:hover{opacity:0.5;}");
    style.appendChild(styleText);

    this.masterSvg.appendChild(style);

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
    return this.location.clientHeight - 20 - this.offsetTop;
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
    var startTimestamp = new Date(this.fromYear,1,1).getTime();
    var nowTimestamp = new Date().getTime();
    var timespan = nowTimestamp - startTimestamp;

    var posOnTimespan = date.getTime() - startTimestamp;
    var percentFromStart = posOnTimespan / timespan;

    var pos = this.getHeightForLines() - (this.getHeightForLines() * percentFromStart);
    return (pos < 0 ? 0 : pos > this.getHeightForLines() ? this.getHeightForLines() : pos) + this.offsetTop;
}

function createLine(timeline) {
    "use strict";
    var height = timeline.getHeightForLines()+timeline.offsetTop;
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
    var height = timeline.getHeightForLines() + timeline.offsetTop;
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
    var height = timeline.getHeightForLines() + timeline.offsetTop;
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

    var yLow = timeline.getPosForDate(this.fromDate);
    var yHigh = timeline.getPosForDate(this.toDate);
    var height = yLow - yHigh;

    var width = timeline.getWidth();
    var timelineCenter = width / 2;

    var left = 0;
    if (newLevel % 2 == 0) { //on right side
        left = timelineCenter + 3 + 6 * (newLevel / 2);

    } else { //on left side
        left = timelineCenter - 9 - 6 * ((newLevel-1) / 2);
    }




    var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    shape.setAttribute("y", yHigh);
    shape.setAttribute("x", left);
    shape.setAttribute("height", height);
    shape.setAttribute("width", 5);
    shape.setAttribute("style", "fill:#" + timeline.getNextColor() + ";stroke:black;stroke-width:1;pointer-events:all;");
    shape.setAttribute("class", "js_timeline_entry");
    shape.setAttribute("onmouseover", "tooltip(event, '" + this.title + "',this)");
    shape.setAttribute("onmouseout", "tooltipHide()");

    return shape;

}

var jsTimelineTooltipDiv = null;
function tooltip(event, text, element) {

    var offsetDistance = 20;

    var x = event.pageX;
    var y = event.pageY;

    var tt = getNewTooltipDiv();
    var elem = element;
    tt.style.top = y + 'px';
    tt.style.left = (x+10) + 'px';
    tt.style.display = 'block';
    tt.style.backgroundColor = "black";
    tt.style.color = "white";
    tt.style.font = "Arial";
    tt.style.fontSize = "10px";
    tt.style.padding = "3px";
    tt.innerHTML = text;


    
}

function tooltipHide() {
    destroyCurrentTooltip();
}

function destroyCurrentTooltip() {
    if (jsTimelineTooltipDiv != null) {
        document.getElementsByTagName("body")[0].removeChild(jsTimelineTooltipDiv);
    }
    jsTimelineTooltipDiv = null;
}

function getNewTooltipDiv(parent) {
    destroyCurrentTooltip();
    var div = document.createElement("div");
    div.style.position = "absolute";
    document.getElementsByTagName("body")[0].appendChild(div);
    jsTimelineTooltipDiv = div;
    return div;
}
