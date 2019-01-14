/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

const _ = require('lodash');
const $ = require('jquery');
const Tooltip = require('../tooltip');

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

        $(shape).on('mouseover', (event) => {
            timelineEntry.tooltip = new Tooltip(event, timelineEntry.title);
            shape.classList.add("hover");
        });
        shape.onmouseout = function () {
            timelineEntry.tooltip.destroy();
            shape.classList.remove("hover");
        };

        this.timelineEntryVisualisationMaps[timelineEntry.getHash()] = shape;

        for (var index in timelineEntry.highlightingHtmlElements) {
            this.onHTMLElementToTriggerHoverAdded(timelineEntry, timelineEntry.highlightingHtmlElements[index]);
        }

        this.masterSvg.appendChild(shape);
    }

    onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement) {
        const shape = this.timelineEntryVisualisationMaps[timelineEntry.getHash()];
        $(htmlElement).on('mouseover', () => shape.classList.add("hover"));
        $(htmlElement).on('mouseout', () => shape.classList.remove("hover"));
    }
}

module.exports = {Visualisation};
