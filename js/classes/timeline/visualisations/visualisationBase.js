/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/


function VisualisationBase(_timeline, _htmlElement, _config) {
    this.timeline = _timeline;
    this.htmlElement = _htmlElement;
    this.timelineEntryVisualisationMaps = {};
    this.config = !_config ? {} : _config;

    //make sure element is empty
    while (this.htmlElement.firstChild) {
        this.htmlElement.removeChild(this.location.firstChild);
    }

    this.masterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.masterSvg.setAttribute("style", "position:absolute;left:0px;top:0px;width:100%;height:100%;");

    this.id = new Date().getTime();

    this.htmlElement.appendChild(this.masterSvg);
}


VisualisationBase.prototype.getWidth = function () {
    return this.htmlElement.clientWidth;
}

VisualisationBase.prototype.getHeight = function () {
    return this.htmlElement.clientHeight;
}

VisualisationBase.prototype.getConfig = function () {
    return this.config;
}

VisualisationBase.prototype.getHTMLElement = function () {
    return this.htmlElement;
}

/*
 * Abstract Methods
 */
VisualisationBase.prototype.repaint = function () {
    throw "NotImplementedException";
}

VisualisationBase.prototype.getShapeForTimelineEntry = function (timelineEntry) {
    throw "NotImplementedException";
}

/*
 * Implemented listeners
 */
VisualisationBase.prototype.onNewTimelineEntry = function (timelineEntry) {
    var shape = this.getShapeForTimelineEntry(timelineEntry);
    this.timelineEntryVisualisationMaps[timelineEntry.getHash()] = shape;

    for (var index in timelineEntry.highlightingHtmlElements) {
        this.onHTMLElementToTriggerHoverAdded(timelineEntry, timelineEntry.highlightingHtmlElements[index]);
    }

    this.masterSvg.appendChild(shape);
}

VisualisationBase.prototype.onHTMLElementToTriggerHoverAdded = function (timelineEntry, htmlElement) {
    var shape = this.timelineEntryVisualisationMaps[timelineEntry.getHash()];
    addEvent(htmlElement, "mouseover", function (event) {
        shape.classList.add("hover");

    });

    addEvent(htmlElement, "mouseout", function (event) {
        shape.classList.remove("hover");

    });
}