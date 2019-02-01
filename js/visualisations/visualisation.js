/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

const _ = require('lodash');
const $ = require('jquery');
const Tooltip = require('../tooltip');
const {LevelManagerColor, LevelManagerTime} = require('./level-manager');

const Level = {
    ORDER_BY_TIME: 1,
    ORDER_BY_COLOR: 2
};

const defaultConfig = {
    level: Level.ORDER_BY_TIME,
    entry: {
        width: 5
    }
};

defaultConfig.scale = {};
defaultConfig.scale.lineWidth = 3;
defaultConfig.scale.margin = 5;
defaultConfig.scale.backgroundColor = 'ffffff';
defaultConfig.scale.fontSize = 15;
defaultConfig.scale.arrowHeadHeight = 13;
defaultConfig.scale.arrowHeadWidth = 20;
defaultConfig.scale.numbersMarginRight = 20;
defaultConfig.drawToday = true;
defaultConfig.drawBaseLineYear = true;
defaultConfig.drawTickLabels = true;

require('./visualisation.less');

class Visualisation {
    constructor(timeline, htmlElement, config) {
        this.timeline = timeline;
        this.htmlElement = htmlElement;
        this.timelineEntryVisualisationMaps = {};
        this.config = _.defaults(config, defaultConfig);

        switch (this.config.level) {
            case Visualisation.Level.ORDER_BY_TIME:
                this.levelManager = new LevelManagerTime();
                break;
            case Visualisation.Level.ORDER_BY_COLOR:
                this.levelManager = new LevelManagerColor();
                break;
        }

        this.htmlElement.classList.add('timelinejs');

        //make sure element is empty
        while (this.htmlElement.firstChild) {
            this.htmlElement.removeChild(this.htmlElement.firstChild);
        }

        this.masterSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.masterSvg.classList.add('master');

        this.htmlElement.appendChild(this.masterSvg);
    }

    getWidth() {
        return this.htmlElement.clientWidth;
    }

    getHeight() {
        return this.htmlElement.clientHeight;
    }

    /*
     * Abstract Methods
     */
    repaint() {
        throw new Error('NotImplementedException');
    }

    getShapeForTimelineEntry() {
        throw new Error('NotImplementedException');
    }


    /*
     * Implemented listeners
     */
    onNewTimelineEntry(timeline, timelineEntry) {
        var shape = this.getShapeForTimelineEntry(timelineEntry);

        $(shape).on('mouseover', (event) => {
            timelineEntry.tooltip = new Tooltip(event, timelineEntry.title);
            shape.classList.add('hover');
        });
        $(shape).on('mouseout', () => {
            timelineEntry.tooltip.destroy();
            shape.classList.remove('hover');
        });

        this.timelineEntryVisualisationMaps[timelineEntry.getHash()] = shape;

        this.masterSvg.appendChild(shape);
    }

    onTimelineEntryHoverIn(timelineEntry) {
        const shape = this.timelineEntryVisualisationMaps[timelineEntry.getHash()];
        shape.classList.add('hover');
    }

    onTimelineEntryHoverOut(timelineEntry) {
        const shape = this.timelineEntryVisualisationMaps[timelineEntry.getHash()];
        shape.classList.remove('hover');
    }
}

Visualisation.Level = Level;

module.exports = Visualisation;
