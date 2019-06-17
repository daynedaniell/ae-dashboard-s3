import angular from 'angular';
import './components/wave-chart';
import './components/bubble-chart-classic';
import  './components/donut-chart';
import './components/bar-chart';
import './components/map-chart';
import './assets/template-base-class';
import * as d3 from 'd3';

const app = angular.module('vizApp',[]);

app.controller('VisualizationController', ['$http', function($http) {
    let vizCtrl = this;
    vizCtrl.view = 'dashboard';

    vizCtrl.setView = function(view) {
        vizCtrl.view = view;
    };

    vizCtrl.audience1 = [];

    let targetAuds = [];
    let targetAud =  d3.json("data/target_aud_" + 1 + "/audience.json");
    let targetDemog =  d3.tsv("data/target_aud_" + 1 + "/demographics_target.tsv");
    let targetInterests = d3.tsv("data/target_aud_" + 1 + "/interests_target.tsv");
    let targetMedia = d3.tsv("data/target_aud_" + 1 + "/media_target.tsv");
    let randomDemog = d3.tsv("data/random_audience/demographics_random.tsv");
    let randomInterests =  d3.tsv("data/random_audience/interests_random.tsv");
    let randomMedia =  d3.tsv("data/random_audience/media_random.tsv");

    targetAuds.push({
        name: targetAud.name,
        demog: targetDemog,
        interests: targetInterests,
        media: targetMedia
    });

    vizCtrl.audience1 = targetAuds;
let ageIndexCats = [
    {attrib_value: '18-25', target_count: 0, random_count: 0},
    {attrib_value: '26-35', target_count: 0, random_count: 0},
    {attrib_value: '36-45', target_count: 0, random_count: 0},
    {attrib_value: '46-55', target_count: 0, random_count: 0},
    {attrib_value: '56-65', target_count: 0, random_count: 0},
    {attrib_value: '66+', target_count: 0, random_count: 0}
];

    vizCtrl.indexAttr = function(attrName, catsArray, targetData, randomData) {
        let targetCounts = d3.nest()
            .key(function(d) { return d[attrName]; })
            .rollup(function(v) { return v.length; })
            .entries(targetData);

        let targetNonMissTotal = d3.nest()
            .rollup(function(v) {
                return d3.sum(v, function(d) {
                    if (d.key != "") {return d.value;}
                });
            })
            .object(targetCounts);

        let randomCounts = d3.nest()
            .key(function(d) { return d[attrName]; })
            .rollup(function(v) { return v.length; })
            .entries(randomData);

        let randomNonMissTotal = d3.nest()
            .rollup(function(v) {
                return d3.sum(v, function(d) {
                    if (d.key != "") {return d.value;}
                });
            })
            .object(randomCounts);

        let indexArray = _.cloneDeep(catsArray);

        indexArray.forEach(function(catEntryIndex) {
            let targetResult = targetCounts.filter(function(catEntryTarget) {
                return catEntryTarget.key === catEntryIndex.attrib_value;
            });
            catEntryIndex["target_count"] = (targetResult[0] !== undefined) ? targetResult[0].value : 0;
            if (targetNonMissTotal > 0) {
                catEntryIndex["target_pct"] = Math.round(100 * catEntryIndex["target_count"] / targetNonMissTotal);
            } else { catEntryIndex["target_pct"] = 0 }
            let randomResult = randomCounts.filter(function(catEntryRandom) {
                return catEntryRandom.key === catEntryIndex.attrib_value;
            });
            catEntryIndex["random_count"] = (randomResult[0] !== undefined) ? randomResult[0].value : 0;
            if (randomNonMissTotal > 0) {
                catEntryIndex["random_pct"] = Math.round(100 * catEntryIndex["random_count"] / randomNonMissTotal);
            } else { catEntryIndex["random_pct"] = 0 }

            if (catEntryIndex["random_pct"] > 0) {
                catEntryIndex["index"] = Math.round(100 * catEntryIndex["target_pct"] / catEntryIndex["random_pct"]);
            } else {catEntryIndex["index"] = 0}
        });

        return indexArray;
    }







    vizCtrl.ageData = vizCtrl.indexAttr("age", ageIndexCats, targetDemog, randomDemog);

    vizCtrl.genderData = [{"attrib_value": "F", "index": 102,
        "random_count": 4946, "random_pct": 53, "target_count": 5231, "target_pct": 54},
        {"attrib_value": "M", "index": 98, "random_count": 4361, "random_pct": 47, "target_count": 4553, "target_pct": 46}];

    vizCtrl.ethnicityData = [];

}]);