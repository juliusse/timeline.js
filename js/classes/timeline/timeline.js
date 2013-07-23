/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

window.Timeline = Timeline;

Timeline.Visualisations = {
    VerticalSmallBar: 1,
    VerticalBigBar: 2
}


var js = {};

var defaultConfig = {};

Timeline.prototype.defaultConfig = defaultConfig;

//Timeline stuff

function Timeline(_fromYear, _config) {
    //init config
    this.config = !_config ? this.defaultConfig : _config;

    this.fromYear = _fromYear;
    this.visualisations = [];
    this.timelineEntries = [];
}

Timeline.prototype.addVisualisation = function (_visualisationType, _htmlElement, _visualisationConfig) {
    var vis = null;
    if (_visualisationType == Timeline.Visualisations.VerticalSmallBar) {
        vis = new VisualisationVerticalSmallBar(this, _htmlElement, _visualisationConfig);
    } else if (_visualisationType == Timeline.Visualisations.VerticalBigBar) {
        vis = new VisualisationVerticalBigBar(this, _htmlElement, _visualisationConfig);
    }

    if (vis != null) {
        this.visualisations.push(vis);
        return vis;
    }

    throw "Unrecognized Visualisation";
}

Timeline.prototype.update = function () {
    for (var index in this.visualisations) {
        this.visualisations[index].update();
    }
}


// getter

Timeline.prototype.getFromYear = function () {
    return this.fromYear;
}

Timeline.prototype.getLocation = function () {
    return this.location;
}

Timeline.prototype.getTimelineEntries = function () {
    return this.timelineEntries;
}



// timelineEntry related
Timeline.prototype.getEntriesInTimeRange = function (fromDate, toDate, excludedEntry) {
    var resultList = [];
    for (var index in this.timelineEntries) {
        var timelineEntry = this.timelineEntries[index];
        if ((timelineEntry.fromDate >= fromDate && timelineEntry.fromDate <= toDate) ||
            (timelineEntry.toDate >= fromDate && timelineEntry.toDate <= toDate) ||
            (timelineEntry.fromDate < fromDate && timelineEntry.toDate > toDate)) {
            if(timelineEntry != excludedEntry)
                resultList.push(timelineEntry);
        }
    }

    return resultList;
}


Timeline.prototype.getTakenLevelsInTimeRange = function (fromDate, toDate, excludedEntry) {
    var entries = this.getEntriesInTimeRange(fromDate, toDate, excludedEntry);
    var result = [];

    for (var index in entries) {
        var timelineEntry = entries[index];
        if (result.indexOf(timelineEntry.level) == -1)
            result.push(timelineEntry.level);
    }

    return result;
}

Timeline.prototype.addTimelineEntry = function (timelineEntry) {
    this.timelineEntries.push(timelineEntry);
    timelineEntry.addListener(this);
    for (var index in this.visualisations) {
        this.visualisations[index].onNewTimelineEntry(timelineEntry);
    }
}


/*
 * TimelineEntry Listener implementation
 */
Timeline.prototype.onHTMLElementToTriggerHoverAdded = function (timelineEntry, htmlElement) {
    for (var index in this.visualisations) {
        this.visualisations[index].onHTMLElementToTriggerHoverAdded(timelineEntry, htmlElement);
    }
}


