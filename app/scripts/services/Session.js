'use strict';

myapp.factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });