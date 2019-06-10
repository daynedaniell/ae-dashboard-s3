class Visualization {
    constructor(config) {

        this.colorSeries1 = config.colorSeries1 || "#4d3c96";
        this.colorSeries2 = config.colorSeries2 || "#0fbbc1";
        this.colorSeries3 = config.colorSeries3 || "#ff9999";

        let DS_VIS_STORE = {
            activeFilter: null,
            stateActive: [1,2,3],
            interestsActive: [1,2,3],
            mediaActive: [1,2,3],
            activeView: 1,
            activeTab: 'dashboard',
            scaleWeight: 1,
            seriesColors: [colorSeries1,colorSeries2,colorSeries3],
            dnaBarWidths: [4,3,2]
        }
    }

    /*******************************************************************************
     *** Tooltips *******************************************************************
     *******************************************************************************/
     addTooltip(tooltipNode, htmlString, xOffset, yOffset) {
        let e = window.event;
        var x = e.clientX,
            y = e.clientY;

        let tipY = (y + yOffset) + 'px';
        let tipX = (x + xOffset) + 'px';

        // Move tooltip to the left of the cursor if it gets too close to right edge
        if  (window.innerWidth - x < 200) {
            tipX = (x - 130) + 'px';
        }

        tooltipNode.html(htmlString)
            .style("opacity", .9)
            .style('left', `${(tipX)}`)
            .style('top', `${(tipY)}`);
    }
    //end tooltip


}