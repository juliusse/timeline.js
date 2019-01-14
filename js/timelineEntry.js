/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

//TimelineEntry stuff


function TimelineEntry(_title, _fromDate, _toDate, _color) {
    this.title = _title;
    this.fromDate = _fromDate;
    this.toDate = _toDate;
    this.color = _color;
    this.level = 0;
    this.listeners = [];
    this.highlightingHtmlElements = [];
}

TimelineEntry.prototype.getHash = function () {
    return this.title + "_" + this.fromDate.getTime() + "_" + this.toDate.getTime();
}

TimelineEntry.prototype.addListener = function (listener) {
    this.listeners.push(listener);
}

TimelineEntry.prototype.addHTMLElementToTriggerHover = function (hTMLElement) {
    this.highlightingHtmlElements.push(hTMLElement);
    for (var index in this.listeners) {
        this.listeners[index].onHTMLElementToTriggerHoverAdded(this, hTMLElement);
    }

}

module.exports = TimelineEntry;
