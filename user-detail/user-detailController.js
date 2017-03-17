'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource',
  function ($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;

    $scope.userDetails = '';
    $scope.main.title = ''; 


    var userListRes = $resource('/user/' + userId);
    var userListModel = userListRes.get({}, function () {
      $scope.userDetails = userListModel;
      $scope.main.title = userListModel.first_name + ' ' + userListModel.last_name;

      }, function errorHandling(err) { 
      console.log('Problem retrieving user detail');
    });
    

  }]);
