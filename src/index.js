import angular from 'angular';
import  './components/donut-chart';
import './assets/template-base-class';
import { Visualization } from "./assets/viz-base-class";

const app = angular.module('vizApp',[]);

app.controller('VisualizationController', ['$http', function($http) {
    let vizCtrl = this;
    let myViz = new Visualization;
    vizCtrl.view = 'dashboard';

    vizCtrl.setView = function(view) {
        vizCtrl.view = view;
    };

    vizCtrl.fireIt = function() {
        myViz.getDataFiles();
    }
}]);