'use strict';

cs142App.controller('UserListController', ['$scope', '$resource', '$route',
    function ($scope, $resource, $route) {

        $scope.main.title = 'Users';
        $scope.userList = '';

        // $scope.FetchModel('/user/list', function(json_str){ 
        // 	$scope.$apply(function(){
        //     $scope.userList = json_str;
        // });
    // });

    // var userListRes = $resource("/user/list");
    // var userListModel = userListRes.query({}, function () {
    //   $scope.userList = userListModel;
    //   console.log(userListModel);
    //   }, function errorHandling(err) { 
    //   console.log('Problem retrieving userListModel');
    // });


    $scope.$on('Activity', function(event){
        console.log('Activity');
        $route.reload();
        var userListRes = $resource("/user/list");
        var userListModel = userListRes.query({}, function () {
          $scope.userList = userListModel;
          console.log(userListModel);
          }, function errorHandling(err) {
          console.log('Problem retrieving userListModel');
        });
    });
}]);

