import * as d3 from 'd3';
import * as dataConfig from '../../dataVis.json';

export class Visualization {

    getDataFiles() {
        if(typeof (w) == "undefined") {
            let w = new Worker('../state-management/webWorker.js');

            w.onmessage = function(event) {
                console.log(event.data);
            };
        }
    }

}



