const {Timeline, TimelineEntry} = require('./index');

var timeline = new Timeline(2009);
timeline.addVisualisation(Timeline.Visualisations.VerticalSmallBar, document.getElementById("timeline"));
var entry1 = new TimelineEntry("first", new Date(2009, 3, 1), new Date(2012, 5, 1));
timeline.addTimelineEntry(entry1);
entry1.addHTMLElementToTriggerHover(document.getElementById("highlight1"));
timeline.addTimelineEntry(new TimelineEntry("second<br>second", new Date(2004, 5, 1), new Date(2011, 11, 31)));
timeline.addTimelineEntry(new TimelineEntry("third", new Date(2010, 0, 1), new Date(2014, 5, 1)));
timeline.addVisualisation(Timeline.Visualisations.VerticalBigBar, document.getElementById("timeline2"));
timeline.addVisualisation(Timeline.Visualisations.VerticalMinimal, document.getElementById("timeline3"));
