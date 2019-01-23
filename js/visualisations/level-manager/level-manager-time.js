const _ = require('lodash');
const { LevelManager } = require('./level-manager');


class LevelManagerTime extends LevelManager {

    constructor() {
        super();
        this.timelineEntries = [];
        this.entryToLevelMap = {};
    }

    getLevelFor(timelineEntry) {
        if (_.has(this.timelineEntries, timelineEntry)) {
            return this.entryToLevelMap[timelineEntry];
        }

        const takenLevels = this.getTakenLevelsInTimeRange(timelineEntry.fromDate, timelineEntry.toDate);
        let newLevel = 0;
        while (takenLevels.indexOf(newLevel) != -1) {
            newLevel += 1;
        }

        this.timelineEntries.push(timelineEntry);
        this.entryToLevelMap[timelineEntry.getHash()] = newLevel;
        return newLevel;
    }

    getEntriesInTimeRange(fromDate, toDate) {
        const resultList = [];
        this.timelineEntries.forEach((timelineEntry) => {
            if ((timelineEntry.fromDate >= fromDate && timelineEntry.fromDate <= toDate) ||
                (timelineEntry.toDate >= fromDate && timelineEntry.toDate <= toDate) ||
                (timelineEntry.fromDate < fromDate && timelineEntry.toDate > toDate)) {
                resultList.push(timelineEntry);
            }
        });

        return resultList;
    }

    getTakenLevelsInTimeRange(fromDate, toDate) {
        const entries = this.getEntriesInTimeRange(fromDate, toDate);
        const takenLevels = [];

        entries.forEach((entry) => takenLevels.push(this.entryToLevelMap[entry.getHash()]));
        return _.uniq(takenLevels);
    }
}

module.exports = LevelManagerTime;
