//'use strict';

/*angular.module('webtechApp', [
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
  });*/

  var myapp = angular.module('webtechApp', [
    'ui.router',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
    ])
    myapp.config(function($stateProvider, $urlRouterProvider){
      
      // For any unmatched url, send to /route1
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
