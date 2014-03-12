'use strict';

myapp
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
myapp
  .controller('contactController', function ($scope) {
    $scope.message = 'Contact us! JK. This is just a demo.'; // SHOULD THIS BE HERE?
});

myapp.controller('qrcode', function($scope) {
  $scope.maxAddress = "mPQERLaEVcj1cMSMX5tyCcCdBeZCkm6GEK"; // CAN WE PULL THE maxcoin: PART OUT?
  $scope.qrcode = new QRCode(document.getElementById("qrcode1"), $scope.maxAddress);
  $scope.textinputs = ['label', 'amount']
  $scope.$watchCollection('[label, amount]', function(values) {
      var code = "maxcoin: " + $scope.maxAddress;
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

/* MaxCoin price section
 * updates the current wallet valuation based upon ticker data */
myapp.controller('maxusdCtrl', ['$scope', 'Poller', function($scope, Poller) {
  $scope.data = Poller.data;
  $scope.amountOfMax = 23481.849;
  $scope.visible = true;
  $scope.showhide=function(){ // SHOULD THIS BE HERE?
    alert('This is a test');
  }
}]);
/* end of price section */

/* MaxCoin price ticker
 * pulls data on the current MaxCoin price from maxcointicker.com */
myapp.factory('Poller', function($http, $timeout, dateFilter) {
  var data = { response: {}, calls: 0, time: 0};
  var format = 'd/M/yy h:mm:ss a';
  var poller = function() {
    $http.get('http://www.corsproxy.com/maxcointicker.com/stats.php').then(function(r) {
      data.response = r.data;
      data.calls++;
      data.time = dateFilter(new Date(), format);
      //console.log(data);
      $timeout(poller, 10000);
    });
  };
  poller();
  
  return {
    data: data
  };
});
/* end of price ticker */

/* QR code scanner */
myapp.directive('qrscan', function($document) {
  return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        replace: false;
        angular.element(element).html5_qrcode(function(data){
          console.log(data);
          $scope.data = data;
        },
        function(error){
            //show read errors 
        }, function(videoError){
            //the video stream could be opened
        }
      );
      },
    };
});

/* wallet address book */
myapp.controller('addressbookctrl', ['$scope', function($scope) {
  // add some entries to the table
  $scope.tabledata = [ 
  {name:'Andrew', address:'mPQERLaEVcj1cMSMX5tyCcCdBeZCkm6GEK'},
  {name:'Luke', address: 'mLd65L1UUkjd1wVFCBEiuFLZBwFyV2R7np'}];

  // update table when the user adds an entry
  $scope.addData = function() {
    $scope.tabledata.push({name:$scope.name, address:$scope.address});
    $scope.name = '';
    $scope.address = '';
  };
}]);
/* end of wallet address book */

/* modal pop-up window */
myapp.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs, parentCtrl) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
        scope.$parent.toggleModal();
      };
    },
    templateUrl: "views/modalwindow.html"
  };
});

myapp.controller('MyCtrl', ['$scope', 'toaster', function($scope, toaster) {
  $scope.pop = function(){
    toaster.pop('success', "Success", "You have logged in");
  };
  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };
  $scope.submitForm = function(isValid) {
    // check to make sure the form is completely valid
    $scope.toggleModal();
    $scope.pop();
  };
}]);
myapp.controller('sendmax', ['$scope', 'toaster', function($scope, toaster) {
  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
    console.log($scope.modal);
  };
  $scope.submitForm = function(isValid) {
    toaster.pop('success', "Success", "Your maxcoin has been sent successfully");
    $scope.modalShown = true;
  };
}]);
/* end of modal section */
