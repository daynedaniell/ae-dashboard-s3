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
}]);