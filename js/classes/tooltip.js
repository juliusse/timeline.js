/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
*/

var jsTimelineTooltipDiv = null;
function tooltip(event, text, element) {

    var offsetDistance = 20;

    var x = event.pageX;
    var y = event.pageY;

    var tt = getNewTooltipDiv();
    var elem = element;
    tt.style.top = y + 'px';
    tt.style.left = (x + 10) + 'px';
    tt.style.display = 'block';
    tt.style.backgroundColor = "black";
    tt.style.color = "white";
    tt.style.font = "Arial";
    tt.style.fontSize = "10px";
    tt.style.padding = "3px";
    tt.innerHTML = text;



}

function tooltipHide() {
    destroyCurrentTooltip();
}

function destroyCurrentTooltip() {
    if (jsTimelineTooltipDiv != null) {
        document.getElementsByTagName("body")[0].removeChild(jsTimelineTooltipDiv);
    }
    jsTimelineTooltipDiv = null;
}

function getNewTooltipDiv(parent) {
    destroyCurrentTooltip();
    var div = document.createElement("div");
    div.style.position = "absolute";
    document.getElementsByTagName("body")[0].appendChild(div);
    jsTimelineTooltipDiv = div;
    return div;
}