'use strict';

myapp
  .factory('Auth', function Auth($location, $rootScope, Session, User, $cookieStore) {
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');

    return {

      login: function(provider, user, callback) {
        user.password = CryptoJS.SHA512(CryptoJS.SHA512(user.password)).toString();
        var cb = callback || angular.noop;
        console.log("Logging in with", user.email, " ", user.password);
        Session.save({
          provider: provider,
          email: user.email,
          password: user.password,
          rememberMe: user.rememberMe
        }, function(user) {
          $rootScope.currentUser = user;
          return cb();
        }, function(err) {
          return cb(err.data);
        });
      },
      logout: function(callback) {
        var cb = callback || angular.noop;
        Session.delete(function(res) {
            $rootScope.currentUser = null;
            return cb();
          },
          function(err) {
            return cb(err.data);
          });
      },
      currentUser: function() {
        Session.get(function(user) {
          console.log(user.email);
          $rootScope.currentUser = user;
        });
      },

      /*logout: function(callback) {
        var cb = callback || angular.noop;
        Session.delete(function(res) {
            $rootScope.currentUser = null;
            return cb();
          },
          function(err) {
            return cb(err.data);
          });
      },*/

      createUser: function(userinfo, callback) {
        var cb = callback || angular.noop;
        userinfo.password = CryptoJS.SHA512(CryptoJS.SHA512(userinfo.password)).toString();
        console.log(userinfo.password);
        User.save(userinfo,
          function(user) {
            $rootScope.currentUser = user;
            return cb();
          },
          function(err) {
            return cb(err.data);
          });
      }

      /*changePassword: function(email, oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;
        User.update({
          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
            console.log('password changed');
            return cb();
        }, function(err) {
            return cb(err.data);
        });
      },

      removeUser: function(email, password, callback) {
        var cb = callback || angular.noop;
        User.delete({
          email: email,
          password: password
        }, function(user) {
            console.log(user + 'removed');
            return cb();
        }, function(err) {
            return cb(err.data);
        });
      }*/
    };
  })