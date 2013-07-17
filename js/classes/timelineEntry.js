/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

//TimelineEntry stuff


function TimelineEntry(_title, _fromDate, _toDate, _color) {
    this.title = _title;
    this.fromDate = _fromDate;
    this.toDate = _toDate;
    this.color = _color;
    this.level = 0;
}

TimelineEntry.prototype.getHash = function () {
    return this.title + "_" + this.fromDate.getTime() + "_" + this.toDate.getTime();
}

TimelineEntry.prototype.getShapeForTimeline = function (timeline) {
    //decide level
    var takenLevels = timeline.getTakenLevelsInTimeRange(this.fromDate, this.toDate);
    var color = !this.color ? timeline.getNextColor() : this.color;
    var newLevel = 0;
    while (takenLevels.indexOf(newLevel) != -1) {
        newLevel += 1;
    }

    this.level = newLevel;

    var yLow = timeline.getPosForDate(this.fromDate);
    var yHigh = timeline.getPosForDate(this.toDate);
    var height = yLow - yHigh;

    var width = timeline.getWidth();
    var timelineCenter = timeline.getCenter();

    var left = 0;
    if (newLevel % 2 == 0) { //on right side
        left = timelineCenter + 1 + 6 * (newLevel / 2);

    } else { //on left side
        left = timelineCenter - 7 - 6 * ((newLevel - 1) / 2);
    }




    var shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    shape.setAttribute("y", yHigh);
    shape.setAttribute("x", left);
    shape.setAttribute("height", height);
    shape.setAttribute("width", 5);
    shape.setAttribute("style", "fill:#" + color + ";stroke:black;stroke-width:1;pointer-events:all;");
    shape.setAttribute("class", "js_timeline_entry");

    var entry = this;
    shape.onmouseover = function(event) {
        entry.tooltip = new Tooltip(event, entry.title);
    };
    shape.onmouseout = function () {
        entry.tooltip.destroyExistingTooltip();
    }

    return shape;

}