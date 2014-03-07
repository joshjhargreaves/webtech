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

angular.module('webtechApp').controller('qrcode', function($scope) {
  $scope.maxAddress = "maxcoin:mPQERLaEVcj1cMSMX5tyCcCdBeZCkm6GEK";
  $scope.qrcode = new QRCode(document.getElementById("qrcode1"), "http://www.google.com");
  $scope.textinputs = ['label', 'amount']
  $scope.$watchCollection('[label, amount]', function(values) {
      var code = $scope.maxAddress;
      /*label (for some reason opposite way around)*/
      if(values[0] != null)
      {
        console.log("not null");
      }
      if(values[1] != null) {
        if(values[1].length != 0)
          code = code + "?label=" + values[1];
      }
      if(values[0] != null) {
        if(values[0].length != 0)
          code = code + "?amount=" + values[0];
      }
      $scope.qrcode.clear();
      $scope.qrcode.makeCode(code);
      console.log('New code :', code);
    });
});
