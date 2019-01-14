/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

class Visualisation {
    constructor(timeline, htmlElement, config) {
        this.timeline = timeline;
        this.htmlElement = htmlElement;
        this.timelineEntryVisualisationMaps = {};
        this.config = config == null ? {} : config;

        //make sure element is empty
        while (this.htmlElement.firstChild) {
            this.htmlElement.removeChild(this.htmlElement.firstChild);
        }

        this.masterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.masterSvg.setAttribute("style", "position:absolute;left:0px;top:0px;width:100%;height:100%;");

        this.id = new Date().getTime();

        this.htmlElement.appendChild(this.masterSvg);
    }

    getWidth() {
        return this.htmlElement.clientWidth;
    }

    getHeight() {
        return this.htmlElement.clientHeight;
    }

    getConfig() {
        return this.config;
    }

    getHTMLElement() {
        return this.htmlElement;
    }

    /*
     * Abstract Methods
     */
    repaint() {
        throw new Error("NotImplementedException");
    }

    getShapeForTimelineEntry() {
        throw new Error("NotImplementedException");
    }


    /*
     * Implemented listeners
     */
    onNewTimelineEntry(timelineEntry) {
        var shape = this.getShapeForTimelineEntry(timelineEntry);
        this.timelineEntryVisualisationMaps[timelineEntry.getHash()] = shape;

        for (var index in timelineEntry.highlightingHtmlElements) {
            this.onHTMLElementToTriggerHoverAdded(timelineEntry, timelineEntry.highlightingHtmlElements[index]);
        }

        this.masterSvg.appendChild(shape);
    }

    onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement) {
        var shape = this.timelineEntryVisualisationMaps[timelineEntry.getHash()];
        addEvent(htmlElement, "mouseover", function (event) {
            shape.classList.add("hover");

        });

        addEvent(htmlElement, "mouseout", function (event) {
            shape.classList.remove("hover");

        });
    }
}

function addEvent(ele, type, func) {
    if (ele.addEventListener) {
        ele.addEventListener(type, func, false);
    } else if (ele.attachEvent) {
        ele.attachEvent("on" + type, func);
    }
}

module.exports = { Visualisation };
