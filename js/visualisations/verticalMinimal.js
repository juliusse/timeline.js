﻿const { Visualisation }= require('./visualisation');
const Tooltip = require('../tooltip');

var defaultConfig = {};
defaultConfig.scale = {};
defaultConfig.scale.lineWidth = 3;
defaultConfig.scale.margin = 5;
defaultConfig.scale.backgroundColor = "ffffff";
defaultConfig.scale.fontSize = 15;
defaultConfig.scale.numbersMarginRight = 20;
defaultConfig.drawBaseLineYear = true;
defaultConfig.drawTickLabels = true;
defaultConfig.entries = {};
defaultConfig.entries.colors = ["f7c6c7", "fad8c7", "fef2c0", "bfe5bf", "bfdadc", "c7def8", "bfd4f2", "d4c5f9"];

class VerticalMinimal extends Visualisation {


    constructor(timeline, _htmlElement, _config) {
        super(timeline, _htmlElement, !_config ? defaultConfig : _config);

        //set hover style
        var style = document.createElement("style");
        style.setAttribute("type", "text/css");
        var styleText = document.createTextNode(".js_timeline_entry_" + this.id + ".hover{stroke-width:1;stroke:black;}");
        style.appendChild(styleText);

        this.masterSvg.appendChild(style);

        this.lastColor = 0;
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
        return 0;
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

            line.setAttribute("style", "stroke:rgb(0,0,0);stroke-width:" + 1);

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

    updateStartYear() {
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
        shape.setAttribute("style", "fill:#" + color + ";pointer-events:all;");
        shape.setAttribute("class", "js_timeline_entry_" + this.id);

        shape.onmouseover = function (event) {
            timelineEntry.tooltip = new Tooltip(event, timelineEntry.title);
            shape.classList.add("hover");

        };
        shape.onmouseout = function () {
            timelineEntry.tooltip.destroy();
            shape.classList.remove("hover");
        }

        return shape;
    }


}

function addEvent(ele, type, func) {
    if (ele.addEventListener) {
        ele.addEventListener(type, func, false);
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + type, func);
    }
}

module.exports = VerticalMinimal;