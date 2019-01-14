/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

const {VerticalSmallBar, VerticalBigBar, VerticalMinimal, VerticalGroupedByColor} = require('./visualisations/');
const _ = require('lodash');

class Timeline {
    static get Visualisations() {
        return {
            VerticalSmallBar: 1,
            VerticalBigBar: 2,
            VerticalMinimal: 3,
            VerticalGroupedByColor: 4,
        };
    }

    constructor(fromYear) {
        this.fromYear = fromYear;
        this.visualisations = [];
        this.timelineEntries = [];
    }


    addVisualisation(_visualisationType, _htmlElement, _visualisationConfig) {
        let vis = null;
        if (_visualisationType == Timeline.Visualisations.VerticalSmallBar) {
            vis = new VerticalSmallBar(this, _htmlElement, _visualisationConfig);
        } else if (_visualisationType == Timeline.Visualisations.VerticalBigBar) {
            vis = new VerticalBigBar(this, _htmlElement, _visualisationConfig);
        } else if (_visualisationType == Timeline.Visualisations.VerticalMinimal) {
            vis = new VerticalMinimal(this, _htmlElement, _visualisationConfig);
        } else if (_visualisationType == Timeline.Visualisations.VerticalGroupedByColor) {
            vis = new VerticalGroupedByColor(this, _htmlElement, _visualisationConfig);
        }

        if (vis != null) {
            this.visualisations.push(vis);
            return vis;
        }

        throw "Unrecognized Visualisation";
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
    getEntriesInTimeRange(fromDate, toDate, excludedEntry) {
        const resultList = [];
        this.timelineEntries.forEach((timelineEntry) => {
            if ((timelineEntry.fromDate >= fromDate && timelineEntry.fromDate <= toDate) ||
                (timelineEntry.toDate >= fromDate && timelineEntry.toDate <= toDate) ||
                (timelineEntry.fromDate < fromDate && timelineEntry.toDate > toDate)) {
                if (timelineEntry != excludedEntry)
                    resultList.push(timelineEntry);
            }
        });

        return resultList;
    }

    getTakenLevelsInTimeRange(fromDate, toDate, excludedEntry) {
        const entries = this.getEntriesInTimeRange(fromDate, toDate, excludedEntry);
        const takenLevels = [];

        entries.forEach((entry) => takenLevels.push(entry.level));

        return _.uniq(takenLevels);
    }

    addTimelineEntry(timelineEntry) {
        this.timelineEntries.push(timelineEntry);
        timelineEntry.addListener(this);
        this.visualisations.forEach(vis => vis.onNewTimelineEntry(timelineEntry));
    }

    /*
     * TimelineEntry Listener implementation
     */
    onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement) {
        this.visualisations.forEach(vis => vis.onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement));
    }
}

module.exports = Timeline;
