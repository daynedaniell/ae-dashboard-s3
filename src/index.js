import angular from 'angular';
import * as Visualization from "./assets/viz-base-class";
import { DonutChart } from "./components/donut-chart";
import { BarChart } from "./components/bar-chart";
import {audienceTitles} from "../build/assets/viz-base-class";
import * as dataConfig from "../dataVis";


const app = angular.module('vizApp',[]);


app.controller('VisualizationController',["$scope",  function($scope) {
    let vizCtrl = this;
    let myViz = Visualization;
    vizCtrl.view = 'dashboard';
    vizCtrl.audienceTitle = audienceTitles[0];
    vizCtrl.audience2Title = audienceTitles[1];
    vizCtrl.audience3Title = audienceTitles[2];
    vizCtrl.selectedAudiences = [];
    vizCtrl.audienceNum1 = true;
    vizCtrl.audienceNum2 = false;
    vizCtrl.audienceNum3 = false;

    vizCtrl.setView = function(view) {
        vizCtrl.view = view;
    };

    vizCtrl.selectAudience = function(audienceVal) {
        console.log('audienceVal is ' + audienceVal);
        vizCtrl.selectedAudiences.push(audienceVal);
        myViz.displayAudienceData(1, vizCtrl.selectedAudiences);
    };

    vizCtrl.config = myViz.getConfig();
    vizCtrl.elementConfig = myViz.getElementConfig();

    /*
    imported from base class
     */
    vizCtrl.showActiveFilter = function(store) {
        let cat = null;
        if (store["activeFilter"] != null) {
            cat = store["activeFilter"][0];
            cat = cat[0].toUpperCase() + cat.slice(1)
            $(".ds-current-filter-remove").css("display", "inline");
            $(".ds-filter-tip").css("display","none");
        } else {
            $(".ds-filter-tip").css("display","");
            $(".ds-current-filter-remove").css("display", "none");
        }
        if (store.activeTab == "dashboard") {
            $(".ds-current-filter").text(store["activeFilter"] != null ? cat + ": " + store["activeFilter"][1] : "Click chart item to apply filter.");
        } else {
            $(".ds-filter-tip").css("display","none");
        }
    };

    vizCtrl.removeActiveFilter = function(store) {
        store["activeFilter"] = null;
       // drawCharts(targetAuds);
    };

    vizCtrl.addAudienceLegend = function(targetAuds) {
        if (dataConfig.config.activeView === 1) {
            $("#dsAudienceLegend1 .ds-audience-legend-color").css("background-color", dataConfig.config.colorOverIndex);
            $("#dsAudienceLegend1 .ds-audience-legend-label span").text("Over-Index");
            $("#dsAudienceLegend2 .ds-audience-legend-color").css("background-color", dataConfig.config.colorUnderIndex);
            $("#dsAudienceLegend2 .ds-audience-legend-label span").text("Under-Index");
            $("#dsAudienceLegend3 .ds-audience-legend-color").css({"background-color": dataConfig.config.colorZeroIndex, "display": "block"});
            $("#dsAudienceLegend3 .ds-audience-legend-label span").text("No Data");
            $("#dsAudienceLegend3 .ds-audience-legend-label span").css("display", "block");
        } else {
            targetAuds.forEach(function(aud, i) {
                console.log('active view is not 1');
                $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("background-color", dataConfig.config.seriesColors[i]);
                $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).text(aud.name);
                $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("display", "block");
                $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).css("display", "block");
            });
            if (targetAuds.length < dataConfig.config.seriesColors.length) {
                let i = targetAuds.length;
                while (i <= targetAuds.length) {
                    $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("display", "none");
                    $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).css("display", "none");
                    i += 1;
                }
            }
        }
    };

    vizCtrl.addSeriesStats = function(attrName, statsArray, prefix='', suffix='') {
        // remove existing stats, if any
        let chart = $( "#" + attrName + "Chart" );

           chart.prev(".tile-header")
            .find(".ds-stats")
            .remove();

        let statString = "<div class='ds-stats'><span class='ds-stats-name'>" + prefix + "</span>";
        statsArray.forEach(function(stat, i) {
            statString += `<span class='ds-stat-${i+1}' style='color: ${dataConfig.config.seriesColors[i]}'>${stat} ${suffix}</span>`;
            if (i !== statsArray.length - 1) {
                statString += "<span style='float:left;margin:0 3px;'> | </span>"
            }
        });
        statString += "</div>";

        // add in stats
        chart.prev(".tile-header").append(statString);
    };



 (function() {
        myViz.getDataFiles().then(function(result) {
            //console.log(result);
            if(result === 'queueEmpty') {

            }
        })
    })();
}]);