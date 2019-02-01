/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

const $ = require('jquery');

class TimelineEntry {

    constructor(title, fromDate, toDate, color) {
        this.title = title;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.color = color;
        this.listeners = [];
        this.highlightingHtmlElements = [];
    }

    getColor() {
        return this.color;
    }

    getHash() {
        return this.title + "_" + this.fromDate.getTime() + "_" + this.toDate.getTime();
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    addElementToTriggerHover(querySelector) {
        const element = document.querySelector(querySelector);

        this.highlightingHtmlElements.push(element);
        $(element).on('mouseover', () => this.listeners.forEach(l => l.onTimelineEntryHoverIn(this)));
        $(element).on('mouseout', () => this.listeners.forEach(l => l.onTimelineEntryHoverOut(this)));
    }
}

module.exports = TimelineEntry;
