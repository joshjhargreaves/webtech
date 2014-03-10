var myapp = angular.module('webtechApp', [
    'ui.router',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
    ]);
  myapp.run(function ($rootScope, $state, $stateParams, Poller) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
  myapp.config(function($stateProvider, $urlRouterProvider, $httpProvider){
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    
    // For any unmatched url, send to /main
    $urlRouterProvider
      .otherwise("/main")
    
    $stateProvider
      .state('main', {
          url: "/main",
          templateUrl: "views/main.html"
      })
      .state('about', {
          url: "/about",
          templateUrl: "views/about.html"
      })
      .state('contact', {
          url: "/contact",
          templateUrl: "views/contact.html"
      })

      // wallet pages
      .state('wallet', {
          // With abstract set to true, that means this state can not be explicitly activated.
          // It can only be implicitly activated by activating one of it's children.
          abstract: true,
          url: "/wallet",
          templateUrl: "views/wallet.html"
      })
      .state('wallet.overview', {
          url: '',
          templateUrl: "views/wallet.overview.html"
      })
      .state('wallet.receive', {
        url: '/receive',
        templateUrl: "views/wallet.receive.html"
      })
      .state('wallet.send', {
        url: '/send',
        templateUrl: "views/wallet.send.html"
      })
      .state('wallet.orders', {
        url: '/orders',
        templateUrl: "views/wallet.orders.html"
      })
      .state('wallet.addresses', {
        url: '/addresses',
        templateUrl: "views/wallet.addresses.html"
      })

      // footer pages
      .state('press', {
          url: "/press",
          templateUrl: "views/press.html"
      })
      .state('privacy', {
          url: "/privacy",
          templateUrl: "views/privacy-policy.html"
      })
      .state('tos', {
          url: "/tos",
          templateUrl: "views/tos.html"
      })
      .state('api', {
          url: "/api",
          templateUrl: "views/api.html"
      })
      .state('support', {
          url: "/support",
          templateUrl: "views/support.html"
      })
  })
