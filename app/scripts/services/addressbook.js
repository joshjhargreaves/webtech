'use strict';

myapp.factory('addressbook', function ($resource) {
  return $resource('/api/addressbook/:id', {}, 
 		{'update': { method:'PUT'},
 		 'query': {method: 'GET', isArray: true}})
	});