'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$routeParams', '$resource', '$rootScope', '$route', '$location',
  function ($scope, $routeParams, $resource, $rootScope, $route, $location) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

   /*  textInput - A string property that is written by a input tag and displayed. It
    *  demonstrates the two-way binding of Angular
    */
   // $scope.main.username = '';

   $scope.errormsg = '';

   $scope.userDetails = '';
   $scope.main.title = 'Please Login'; 
   $scope.main.register = false;
   $scope.main.occupation = '';
   $scope.main.location = '';

  $scope.buttonClick = function(buttonName){
      var loginRes = $resource('/admin/login');
      var userModel = loginRes.save({login_name: $scope.main.username, password: $scope.main.password}, function () {
        // Success

        console.log("Login successful");
        $scope.main.loggedIn = true;
        $scope.errormsg = '';
        
        // Broadcast to route to user page
        $rootScope.$broadcast('Login', userModel);
          
      }, function errorHandling(err) { 
        console.log(err);
        $scope.errormsg = 'Login name incorrect';
        console.log('Login name incorrect');
          // Any error or non-OK status
      }); 
  }; 

  $scope.regButtonClick = function(buttonName){
    $scope.main.register = true;
    $location.path("/login-register");
  };

  $scope.registerUser = function(butonName){
    if ($scope.main.username === '' || $scope.main.password === '' || $scope.main.firstname === '' || $scope.main.lastname === '' || $scope.main.location === '' || $scope.main.description === '' || $scope.main.occupation === ''){
      $scope.errormsg = 'All fields must be filled';
      return;
    }
    var regRes = $resource('/user');
    var userModel = regRes.save({login_name: $scope.main.username, password: $scope.main.password, first_name: $scope.main.firstname, last_name: $scope.main.lastname, location: $scope.main.location, description: $scope.main.description, occupation: $scope.main.occupation}, function(){
      console.log("User successfully registered");
      $scope.main.lastActivity = 'Created user';

      $rootScope.$broadcast('Activity');
      
      // Reset the login page
      $scope.main.register = false;
      $location.path("/login-register");

    }, function errorHandling(err) { 
        console.log("Usermodel: " + userModel._id + " " + userModel.login_name);
        console.log(err);
        $scope.errormsg = 'Problem with registration';
          // Any error or non-OK status
    }); 
  };


}]);
