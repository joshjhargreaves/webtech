//'use strict';

  var myapp = angular.module('webtechApp', [
    'ui.router',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
    ])
    myapp.config(function($stateProvider, $urlRouterProvider){
      
      // For any unmatched url, send to /main
      $urlRouterProvider.otherwise("/main")
      
      $stateProvider
        .state('main', {
            url: "/main",
            templateUrl: "views/main.html"
        })
          
        .state('contact', {
            url: "/contact",
            templateUrl: "views/contact.html"
        })
    })
