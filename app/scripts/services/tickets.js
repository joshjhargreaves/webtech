'use strict';

myapp.factory('tickets', function ($resource) {
  return $resource('/api/tickets/:id', {}, 
 		{'update': { method:'PUT'},
 		 'query': {method: 'GET', isArray: true}})
	});