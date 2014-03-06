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
    ]);
  myapp.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
  myapp.config(function($stateProvider, $urlRouterProvider){
    
    // For any unmatched url, send to /main
    $urlRouterProvider
      .otherwise("/main")
    
    $stateProvider
      .state('main', {
          url: "/main",
          templateUrl: "views/main.html"
      })
        
      .state('contact', {
          url: "/contact",
          templateUrl: "views/contact.html"
      })
      .state('wallet', {
          // With abstract set to true, that means this state can not be explicitly activated.
          // It can only be implicitly activated by activating one of it's children.
          abstract: true,
          url: "/wallet",
          templateUrl: "views/wallet.html"
      })
      .state('wallet.overview', {
          url: '',
          templateUrl: "views/wallet.overview.html",
          'menuTip': {
              // templateProvider is the final method for supplying a template.
              // There is: template, templateUrl, and templateProvider.
              templateProvider: ['$stateParams',
                function (        $stateParams) {
                  // This is just to demonstrate that $stateParams injection works for templateProvider.
                  // $stateParams are the parameters for the new state we're transitioning to, even
                  // though the global '$stateParams' has not been updated yet.
                  return '<hr><small class="muted">Contact ID: ' + $stateParams.contactId + '</small>';
                }]
            }
      })
  })
