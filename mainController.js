'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            // when('/users', {
            //     templateUrl: 'components/user-list/user-listTemplate.html',
            //     controller: 'UserListController'
            // }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/favorites', {
                templateUrl: 'components/favorites/favoritesTemplate.html',
                controller: 'FavoritesController'
            }).
            otherwise({
                templateUrl:'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            });

    }]);

cs142App.controller('MainController', ['$scope', '$resource', '$rootScope', '$location', '$http', '$route', '$mdDialog',
    function ($scope, $resource, $rootScope, $location, $http, $route, $mdDialog) {

        $scope.main = {};
        $scope.main.title = '';
        $scope.main.version = '0';
        $scope.main.loggedIn = false;
        $scope.main.username = '';
        $scope.main.lastActivity = 'Created user';
        $scope.main.lastWasPhoto = false;

        $rootScope.$on("$routeChangeStart", function(event, next, current) {
            if (!$scope.main.loggedIn) {
                // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }

        });

        $scope.$on('Login', function(event, userModel){
            var lastactivityRes = $resource('/lastactivity');
            $scope.main.lastActivity = 'Logged in';
            $scope.main.lastWasPhoto = false;
            $scope.main.lastPhotoName = '';
            lastactivityRes.save({lastActivity: $scope.main.lastActivity, lastWasPhoto: $scope.main.lastWasPhoto, lastPhotoName: $scope.main.lastPhotoName}, function(){
                $rootScope.$broadcast('Activity');
            },
            function errorHandling(err) { 
                console.log(err);
                $scope.errormsg = 'Cannot save last activity';
                console.log('Cannot save last activity');
                // Any error or non-OK status
            });  


            $scope.main.username = userModel.first_name + ' ' + userModel.last_name;
            $location.path("/user/list");
            $location.path("users/" + userModel._id);
        });


        //
        //
        //
        //

        var selectedPhotoFile;   // Holds the last file selected by the user

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            return !!selectedPhotoFile;
        };

        // Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.uploadPhoto = function () {
            if (!$scope.inputFileNameSelected()) {
                console.error("uploadPhoto called with no selected file");
                return;
            }
            console.log('fileSubmitted', selectedPhotoFile);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(function(newPhoto){
                console.log("Photo upload successful");
                var lastactivityRes = $resource('/lastactivity');
                $scope.main.lastActivity = 'Uploaded:';
                $scope.main.lastWasPhoto = true;
                $scope.main.lastPhotoName = newPhoto.file_name;
            
                lastactivityRes.save({lastActivity: $scope.main.lastActivity, lastWasPhoto: $scope.main.lastWasPhoto, lastPhotoName: $scope.main.lastPhotoName}, function(){
                    $rootScope.$broadcast('Activity');
                },
                function errorHandling(err) { 
                    console.log(err);
                    $scope.errormsg = 'Cannot save last activity';
                    console.log('Cannot save last activity');
                    // Any error or non-OK status
                });  

                console.log(selectedPhotoFile.name);
                $route.reload();
                // The photo was successfully uploaded. XXX - Do whatever you want on success.
            }).error(function(err){
                // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                console.error('ERROR uploading photo', err);
            });

        };


      $scope.logoutButtonClick = function(buttonName){

        var logoutRes = $resource('/admin/logout');

        var lastactivityRes = $resource('/lastactivity');
        $scope.main.lastActivity = 'Logged out';
        $scope.main.lastWasPhoto = false;
        $scope.main.lastPhotoName = '';
        lastactivityRes.save({lastActivity: $scope.main.lastActivity, lastWasPhoto: $scope.main.lastWasPhoto, lastPhotoName: $scope.main.lastPhotoName}, function()
        {$rootScope.$broadcast('Activity');},
        function errorHandling(err) { 
            console.log(err);
            $scope.errormsg = 'Cannot save last activity';
            console.log('Cannot save last activity');
            // Any error or non-OK status
        }); 

        logoutRes.save({login_name: $scope.main.username}, function () {
          // Success
          console.log("Logout successful");
          $scope.main.loggedIn = false;
          $scope.errormsg = '';
            
            $scope.main.username = '';
            $location.path("/login-register");
          // Broadcast to route to login page
          // $rootScope.$broadcast('Logout');
            
        }, function errorHandling(err) { 
          console.log(err);
          console.log('Logout failed');
            // Any error or non-OK status
        });  
      };

      $scope.favoritesButtonClick = function(buttonName){
        $location.path("favorites");
      };

    }]);
