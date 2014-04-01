var myapp = angular.module('webtechApp', [
    'ui.router',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'toaster'
    ]);
  myapp.run(function ($rootScope, $state, $stateParams, Poller, Auth, $location) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
        //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function(currentUser) {
      // if no currentUser and on a page that requires authorization then try to update it
      // will trigger 401s if user does not have a valid session
      if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
        Auth.currentUser();
      }
    });
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
        
      .state('contact', {
          url: "/contact",
          templateUrl: "views/contact.html"
      })

      .state('about', {
          url: "/about",
          templateUrl: "views/about.html"
      })

      // footer states
      .state('press', {
          url: "/press",
          templateUrl: "views/press.html"
      })

      .state('tos', {
          url: "/tos",
          templateUrl: "views/tos.html"
      })

      .state('privacy', {
          url: "/privacy",
          templateUrl: "views/privacy-policy.html"
      })

      .state('api', {
          url: "/api",
          templateUrl: "views/api.html"
      })

      // support states
      .state('support', {
          url: "/support",
          templateUrl: "views/support.html"
      })

      .state('tickets', {
          url: "/tickets",
          templateUrl: "views/tickets.html"
      })

      // wallet states
      .state('wallet', {
          // With abstract set to true, that means this state can not be explicitly activated.
          // It can only be implicitly activated by activating one of it's children.
          abstract: true,
          url: "/wallet",
          templateUrl: "views/wallet.html"
      })
      .state('wallet.overview', {
          url: "",
          templateUrl: "views/wallet.overview.html"
      })
      .state('wallet.receive', {
        url: "/receive",
        templateUrl: "views/wallet.receive.html"
      })
      .state('wallet.send', {
        url: "/send",
        templateUrl: "views/wallet.send.html"
      })
      .state('wallet.addresses', {
        url: "/addresses",
        templateUrl: "views/wallet.addresses.html"
      })
      .state('wallet.address', {
        url: "/address",
        templateUrl: "views/wallet.address.html"
      })
      .state('wallet.orders', {
        url: "/orders",
        templateUrl: "views/wallet.orders.html"
      })
      .state('wallet.transactions', {
        url: "/transactions",
        templateUrl: "views/wallet.transactions.html"
      })
  })
