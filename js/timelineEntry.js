/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

class TimelineEntry {

    constructor(title, fromDate, toDate, color) {
        this.title = title;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.color = color;
        this.level = 0;
        this.listeners = [];
        this.highlightingHtmlElements = [];
    }

    getHash() {
        return this.title + "_" + this.fromDate.getTime() + "_" + this.toDate.getTime();
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    addHTMLElementToTriggerHover(hTMLElement) {
        this.highlightingHtmlElements.push(hTMLElement);
        this.listeners.forEach(l => l.onHTMLElementToTriggerHoverAdded(this, hTMLElement));
    }
}

module.exports = TimelineEntry;
