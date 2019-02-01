/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

const _ = require('lodash');
const {VerticalSmallBar, VerticalBigBar, VerticalMinimal} = require('./visualisations/');
const TimelineEntry = require('./timelineEntry');

const defaultConfig = {
    entries: {
        colors: ['fad8c7', 'fef2c0', 'bfe5bf', 'bfdadc', 'c7def8', 'bfd4f2', 'd4c5f9', 'f7c6c7']
    }
};

class Timeline {
    constructor(fromYear, config) {
        const _config = _.defaults(config, defaultConfig);

        this.fromYear = fromYear;
        this.listeners = [];
        this.timelineEntries = [];

        this.colors = _config.entries.colors;
        this.nextColor = 0;
    }

    addListener(timelineListener) {
        this.listeners.push(timelineListener);
    }


// getter

    getFromYear() {
        return this.fromYear;
    }

    getTimelineEntries() {
        return this.timelineEntries;
    }


// timelineEntry related
    getNextColor() {
        const color = this.colors[this.nextColor];
        this.nextColor = (this.nextColor + 1) % this.colors.length;

        return color;
    }

    addEntry(title, fromDate, toDate, { color = null, hoverSelectors = [] } = {}) {
        const _color = color || this.getNextColor();
        const entry = new TimelineEntry(title, fromDate, toDate, _color);

        hoverSelectors.forEach((selector => entry.addHTMLElementToTriggerHover(document.querySelector(selector))));

        this.timelineEntries.push(entry);
        entry.addListener(this);
        this.listeners.forEach(l => l.onNewTimelineEntry(this, entry));
    }

    /*
     * TimelineEntry Listener implementation
     */
    onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement) {
        this.listeners.forEach(l => l.onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement));
    }
}

module.exports = Timeline;
