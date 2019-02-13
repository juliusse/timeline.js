const {assert} = require('chai');

const {Timeline, Visualisations} = require('../../js');

require('./tests.less');
describe('TimelineJS', () => {
    let container;
    let timelineContainer;

    beforeEach(() => {
        container = document.createElement('div');
        timelineContainer = document.createElement('div');
        timelineContainer.style.width = '50px';
        timelineContainer.style.height = '300px';
        timelineContainer.id = 'container';
        container.appendChild(timelineContainer);
        document.querySelector('body').appendChild(container);
    });

    afterEach(() => {
        document.querySelector('body').removeChild(container);
    });
    describe('vertical entry positioning', () => {

        ['bigbar', 'smallbar', 'minimal'].forEach(visType => {
            describe(visType, () => {
                let timeline;
                let entry;
                let entryShape;

                let ticks = {};

                beforeEach(() => {
                    timeline = new Timeline(2017);
                    const visBuilder = Visualisations.Builder
                        .createForTimeline(timeline, '#container');

                    switch (visType) {
                        case 'bigbar':
                            visBuilder.withBigBar();
                            break;
                        case 'smallbar':
                            visBuilder.withSmallBar();
                            break;
                        case 'minial':
                            visBuilder.withMinimalBar();
                            break;
                    }

                    visBuilder.build();

                    ticks[2017] = document.querySelector('.year-2017');
                    ticks[2018] = document.querySelector('.year-2018');

                    entry = timeline.addEntry(
                        'This is an entry', new Date(2017, 0, 1, 0, 0), new Date(2017, 11, 31, 23, 59));

                    entryShape = document.querySelector(`.entry-${entry.getHash()}`);
                });

                it('start position is correct', () => {
                    const tickPosition = ticks[2017].y1.baseVal.value;
                    const entryBottom = entryShape.y.baseVal.value + entryShape.height.baseVal.value;
                    assert.isTrue(Math.abs(entryBottom - tickPosition) <= 1, 'entry should start at 2017 tick');
                });

                it('end position is correct', () => {
                    const tickPosition = Math.floor(ticks[2018].y1.baseVal.value);
                    const entryTop = Math.floor(entryShape.y.baseVal.value);
                    assert.isTrue(Math.abs(entryTop - tickPosition) <= 1, 'entry should end at 2018 tick');
                });
            });
        });
    });
});