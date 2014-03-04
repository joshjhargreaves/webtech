'use strict';

angular.module('webtechApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/contact', {
        templateUrl : 'views/contact.html',
        controller  : 'contactController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
