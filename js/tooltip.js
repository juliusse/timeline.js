/*

Author:
    Julius Seltenheim (mail@julius-seltenheim.com)
    
    Tooltip is right now a single instance class.
    When another instance is created, the old one will be destroyed
*/

class Tooltip {
    constructor(event, text) {
        //check if tooltip exists
        this.div = this.createDiv();

        var x = event.pageX;
        var y = event.pageY;

        this.div.style.top = y + 'px';
        this.div.style.left = (x + 10) + 'px';

        this.div.innerHTML = text;

        document.getElementsByTagName("body")[0].appendChild(this.div);
    }

    createDiv() {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.display = 'block';
        div.style.backgroundColor = "black";
        div.style.color = "white";
        div.style.font = "Arial";
        div.style.fontSize = "10px";
        div.style.padding = "3px";

        return div;
    }

    destroy() {
        document.getElementsByTagName("body")[0].removeChild(this.div);
    }
}

module.exports = Tooltip;