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
    static get Visualisations() {
        return {
            VerticalSmallBar: 1,
            VerticalBigBar: 2,
            VerticalMinimal: 3,
        };
    }

    constructor(fromYear, config) {
        const _config = _.defaults(config, defaultConfig);

        this.fromYear = fromYear;
        this.visualisations = [];
        this.timelineEntries = [];

        this.colors = _config.entries.colors;
        this.nextColor = 0;
    }


    addVisualisation(_visualisationType, _htmlElement, _visualisationConfig) {
        let vis = null;
        if (_visualisationType === Timeline.Visualisations.VerticalSmallBar) {
            vis = new VerticalSmallBar(this, _htmlElement, _visualisationConfig);
        } else if (_visualisationType === Timeline.Visualisations.VerticalBigBar) {
            vis = new VerticalBigBar(this, _htmlElement, _visualisationConfig);
        } else if (_visualisationType === Timeline.Visualisations.VerticalMinimal) {
            vis = new VerticalMinimal(this, _htmlElement, _visualisationConfig);
        }

        if (vis != null) {
            this.visualisations.push(vis);
            return vis;
        }

        throw 'Unrecognized Visualisation';
    }

    update() {
        this.visualisations.forEach((vis) => vis.update());
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
        this.visualisations.forEach(vis => vis.onNewTimelineEntry(entry));
    }

    /*
     * TimelineEntry Listener implementation
     */
    onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement) {
        this.visualisations.forEach(vis => vis.onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement));
    }
}

module.exports = Timeline;
