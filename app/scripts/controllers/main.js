'use strict';

angular.module('webtechApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
angular.module('webtechApp')
  .controller('contactController', function ($scope) {
    $scope.message = 'Contact us! JK. This is just a demo.';
  });

