'use strict';

/*Placeholder for dynamic contact elements such as a
 *twitter feed */
myapp.controller('contactController', function ($scope) {
});

/* This controller watches the two input fields
 * in the recieve tab and updates the Qrcode 
 * accordingly when any of them are changed.
 * TODO: Move Qrcode insantiation logic into
 * seperate service or directive to make it
 * More 'Angular' like.*/
myapp.controller('qrcode', function($scope) {
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

/* QR code scanner directive using qrcode
 * scanner library */
myapp.directive('qrscan', function($document) {
  return {
      restrict: 'A',
      scope: {
        input: "="
      },
      link: function(scope, element, attrs, parentCtrl) {
        scope.input = "Waiting for QR Code...";
        angular.element(element).html5_qrcode(function(data){
          console.log(data);
          scope.input = data;
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

/* wallet address book 
 * TODO: Change data to results of api request when api reader*/
myapp.controller('addressbookctrl', ['$scope', 'addressbook', function($scope, addressbook) {
  // add some entries to the table 

  //$scope.tabledata = {};
  //$scope.find();
  // update table when the user adds an entry
  $scope.addData = function() {
    $scope.addAddress();
    //$scope.tabledata.push({name:$scope.name, address:$scope.address});
    $scope.name = '';
    $scope.address = '';
  };
  $scope.addAddress = function() {
    var entry = new addressbook({
      name: this.name,
      address: this.address
    });
    entry.$save(function(response) {
      $scope.tabledata.push(response);
    });
  };
  $scope.find = function() {
    addressbook.query(function(entries) {
      console.log(entries);
      $scope.tabledata = entries;
    });
  };
  $scope.find();
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

/*
 * Controller spanning all application. Toaster directive from imported
 * module injected as a dependency to enable use of toaster messages */
myapp.controller('MyCtrl', ['$scope', 'toaster', 'Auth', '$location', function($scope, toaster, Auth, $location) {
  $scope.user = {};
  $scope.error = {};
  /*Fix accessing form. Problem is due to AngularJs' 
   *transclude scoping error with forms*/
  $scope.con = {};
  $scope.formNames = ['email', 'password'];
  $scope.inputs = [$scope.user.email, $scope.user.password];
  $scope.$watchCollection('[user.email, user.password]', function(values) {
    $scope.setValidityOfForms();
  });
  $scope.pop = function(){
    toaster.pop('success', "Success", "You have logged in");
  };
  $scope.setValidityOfForms = function(){
    angular.forEach($scope.formNames, function(error, field) {
      if($scope.con.userForm)
        console.log($scope.con.userForm[$scope.formNames[field]].$setValidity('server', true));
    });
  }
  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.setValidityOfForms();
    $scope.user.email = "";
    $scope.user.password = "";
    $scope.modalShown = !$scope.modalShown;
    $scope.con.userForm.$setPristine();
  };
  $scope.submitForm = function(isValid) {
    // check to make sure the form is completely valid
    Auth.login('password', {
          'email': $scope.user.email,
          'password': $scope.user.password
        },
        function(err) {
          $scope.errors = {};
          if (!err) {
            $scope.toggleModal();
            $scope.pop();
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              $scope.con.userForm[field].$setValidity('server', false);
              $scope.errors[field] = error.type;
              toaster.pop('error', "Error", "You have not been logged in");
            });
            $scope.error.other = err.message;
          }
      });
    };
    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
}]);

/* Main controller in send tab. Contains functions to show and hide the 
 * modal window.
 * */
myapp.controller('sendmax', ['$scope', '$stateParams','toaster', function($scope, $stateParams, toaster) {
  $scope.data = "Waiting for qrcode to be scanned.........."
  $scope.modalShown = false;
  $scope.user = {};
  $scope.user.address = $stateParams.addr;
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };
  $scope.submitForm = function(isValid) {
    toaster.pop('success', "Success", "Your maxcoin has been sent successfully");
  };
  $scope.updateAddress = function() {
    //$scope.userForm.address.$modelValue= "testing";
    console.log($scope.userForm);
    $scope.toggleModal();
    toaster.pop('success', "Success", "Qrcode successfully scanned");
  };
}]);
/* end of modal section */

/*This controller manages ths support ticket section
 * */
myapp.controller('supportCtrl', ['$scope', '$stateParams', 'tickets', function($scope, $stateParams, tickets) {
  $scope.ticket = {};
  $scope.addTicket = function() {
    var ticket = new tickets({
      email: this.ticket.email,
      summary: this.ticket.summary,
      notes: this.ticket.notes
    });
    ticket.$save(function(response) {
      $scope.tickets.push(response);
      $scope.clearInputs();
    });
  };
  $scope.find = function() {
    tickets.query(function(tickets) {
      $scope.tickets = tickets;
    });
  };
  $scope.clearInputs = function() {
    $scope.ticket.email = '';
    $scope.ticket.summary = '';
    $scope.ticket.notes = '';
  }
  $scope.find();
}]);

myapp.controller('supportTicketCtrl', ['$scope', '$stateParams', 'tickets', function($scope, $stateParams, tickets) {
  console.log('State params = ',$stateParams);
  tickets.get({
    id: $stateParams.id
  }, function(entry) {
    console.log('Ticket = ', entry);
    $scope.email = entry.email;
    $scope.summary = entry.summary;
    $scope.notes = entry.notes;
  });
}]);

/*
 * Controller spanning all application. Toaster directive from imported
 * module injected as a dependency to enable use of toaster messages */
myapp.controller('createWalletCtrl', ['$scope', 'toaster', 'Auth', '$location', function($scope, toaster, Auth, $location) {
  $scope.user = {};
  $scope.error = {};
  /*Fix accessing form. Problem is due to AngularJs' 
   *transclude scoping error with forms*/
  $scope.con = {};
  $scope.formNames = ['email', 'password'];
  $scope.inputs = [$scope.user.email, $scope.user.password];
  $scope.$watchCollection('[user.email, user.password]', function(values) {
    $scope.setValidityOfForms();
  });
  $scope.pop = function(){
    toaster.pop('success', "Success", "Your account has been created");
  };
  $scope.setValidityOfForms = function(){
    angular.forEach($scope.formNames, function(error, field) {
      if($scope.con.userForm)
        console.log($scope.con.userForm[$scope.formNames[field]].$setValidity('server', true));
    });
  }
  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.setValidityOfForms();
    if($scope.modalShown) {
      $scope.user.email = "";
      $scope.user.password = "";
    } else {
      $scope.user.email = $scope.email;
      $scope.user.password = $scope.password;
    }
    $scope.modalShown = !$scope.modalShown;
    $scope.con.userForm.$setPristine();
  };
  $scope.submitForm = function(isValid) {
    // check to make sure the form is completely valid
    Auth.login('password', {
          'email': $scope.user.email,
          'password': $scope.user.password
        },
        function(err) {
          $scope.errors = {};
          if (!err) {
            $scope.toggleModal();
            $scope.pop();
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              $scope.con.userForm[field].$setValidity('server', false);
              $scope.errors[field] = error.type;
              toaster.pop('error', "Error", "You have not been logged in");
            });
            $scope.error.other = err.message;
          }
      });
    };
    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
    $scope.submitForm = function(isValid) {
    // check to make sure the form is completely valid
      Auth.createUser({
          email: $scope.user.email,
          password: $scope.user.password
        },
        function(err) {
          $scope.errors = {};
          if (!err) {
            $scope.toggleModal();
            $scope.pop();
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              $scope.con.userForm[field].$setValidity('server', false);
              $scope.errors[field] = error.type;
            });
            toaster.pop('error', "Error", "Your account has not been created");
            $scope.error.other = err.message;
          }
        }
      );
    };
}]);