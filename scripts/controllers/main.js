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
  $scope.qrcode = new QRCode(document.getElementById("qrcode1"), $scope.maxAddress);
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
angular.module('webtechApp').directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    templateUrl: "views/modalwindow.html"
  };
});
angular.module('webtechApp').controller('MyCtrl', ['$scope', function($scope) {
  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };
  $scope.submitForm = function(isValid) {
    // check to make sure the form is completely valid
    if (!isValid) { 
      alert('This form has been submitted');
    }
  };
}]);
angular.module('webtechApp').controller('sendmax', ['$scope', function($scope) {
  $scope.submitForm = function(isValid) {
    if (!isValid) { 
        alert('This form has been submitted');
    }
  };
}]);