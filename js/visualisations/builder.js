
const _ = require('lodash');

const Visualisation = require('./visualisation');
const SmallBar = require('./verticalSmallBar');
const BigBar = require('./verticalBigBar');
const Minimal = require('./verticalMinimal');

class Builder {
    static createForTimeline(timeline, querySelector) {
        return new Builder(timeline, document.querySelector(querySelector));
    }

    constructor(timeline, htmlElement) {
        this.timeline = timeline;
        this.htmlElement = htmlElement;
        this.clazz = BigBar;
        this.options = {
            level: Visualisation.Level.ORDER_BY_TIME,
        };
    }

    withBigBar() {
        this.clazz = BigBar;
        return this;
    }

    withSmallBar() {
        this.clazz = SmallBar;
        return this;
    }

    withMinimalBar() {
        this.clazz = Minimal;
        return this;
    }

    orderLevelByTime() {
        this.options.level = Visualisation.Level.ORDER_BY_TIME;
        return this;
    }

    orderLevelByColor() {
        this.options.level = Visualisation.Level.ORDER_BY_COLOR;
        return this;
    }

    withOptions(options) {
        this.options = _.assignIn(this.options, options);
        return this;
    }

    build() {
        const visualisation = new this.clazz(this.timeline, this.htmlElement, this.options);
        this.timeline.addListener(visualisation);

        return visualisation;
    }
}

module.exports = Builder;