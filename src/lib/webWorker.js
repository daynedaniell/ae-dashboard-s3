/**
 *  Data Visualization Web Worker
 *
 */
importScripts( "/assets/d3.js" );

let dataConfig;

function Queue() {
    var items = [];
    this.enqueue = function(element) {
        items.push(element);
    };
    this.dequeue = function() {
        return items.shift();
    };
    this.isEmpty = function() {
        return items.length === 0;
    };
    this.clear = function() {
        items = [];
    };
    this.size = function() {
        return items.length;
    };
}

/**
 * audiencesArr
 * @type {{audience2: Queue, audience3: Queue, audience1: Queue}}
 * this could be more data agnostic by iterating through the dataVis config file and creating the objects
 * let myArr = ['one', 'two', 'three'];

 let myNewObj = {};
 myArr.forEach(function(thing){
  myNewObj[thing] = [];
})
 console.log(myNewObj);
  */
const audiencesArr = {"audience1": new Queue(), "audience2": new Queue(), "audience3": new Queue()};
let audienceRetArr = {"audience1": [], "audience2": [], "audience3": []};
function buildQueue(audience) {
        dataConfig.audienceFiles[audience].forEach(function (audienceFile) {
            audiencesArr[audience].enqueue(audienceFile);
        });
        getDataFiles(audience, dataConfig.audienceFiles[audience]).then(function () {

        })

}

function updateProgress (evt) {
    if (evt.lengthComputable) {
        let percentComplete = evt.loaded / evt.total * 100;
        postMessage({'cmd': 'transferProgress', 'msg': {'title': 'progress', 'data': percentComplete}});
    } else {
    }
}

function transferComplete(title, data) {
    postMessage({'cmd': 'fileTransferComplete','msg': {"title": title, "data": data}});
    console.log('transfer was complete for ' + title);
}

/*
    if we actually use the queue service, we can reduce the chance of getting files mixed up
 */
function getDataFiles(audience, fileQueue) {
    return new Promise(function(resolve, reject) {
        let count = audiencesArr[audience].size();
        fileQueue.forEach(function (file, i) {
            getDataFile(audience, file);
            if((i + 1) === count) {
                resolve(audience)
            }
        });
    })
}


function getDataFile(audience, file) {
    try {
        if (file.url.includes('.tsv')) {
            d3.tsv(file.url).then(function (data) {
                    audienceRetArr[audience].push({title: file.title, data: data});
                    if(audienceRetArr[audience].length === dataConfig.audienceFiles[audience].length) {
                        //we're done... ship it
                        transferComplete( audience, audienceRetArr[audience]);
                    }
            });
        } else if (file.url.includes('.json')) {
           d3.json(file.url).then(function (data) {
               audienceRetArr[audience].push({title: file.title, data: data});
               if(audienceRetArr[audience].length === dataConfig.audienceFiles[audience].length) {
                   //we're done... ship it
                   transferComplete( audience, audienceRetArr[audience]);
               }
        })
        }else if (file.url.includes('.csv')) {
            d3.csv(file.url).then(function (data) {
                audienceRetArr[audience].push({title: file.title, data: data});
                if (audienceRetArr[audience].length === dataConfig.audienceFiles[audience].length) {
                    //we're done... ship it
                    transferComplete(audience, audienceRetArr[audience]);
                }
            })
        }
    } catch (err) {
        console.log('fetch failed', err);
    }
}


self.addEventListener('message', function(e) {
    let data = e.data;

    switch(data.cmd) {
        case 'configFile':
            dataConfig = JSON.parse(data.msg);
            let audienceFiles = Object.keys(dataConfig.audienceFiles);
             // audienceFiles.forEach(function(audience){
             //    buildQueue(audience);
             // });
            buildQueue(audienceFiles[0]);
            break;
    }
});