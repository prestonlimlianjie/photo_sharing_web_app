'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource', '$location', '$rootScope', '$route',
  function($scope, $routeParams, $resource, $location, $rootScope, $route) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
     $scope.main.commentArray = [];
     var user_id = $routeParams.userId;

     $scope.likeButtonClick = function(photoObj_id){
      console.log(photoObj_id);

      var likeRes = $resource('/likePhoto/' + photoObj_id);
      var photoModel = likeRes.save({}, function(){
        console.log("Like button clicked");
        console.log(photoModel);
        $route.reload();

      }, function errorHandling(err){
        console.log('Problem retrieving photoModel');
        return;
      });

      console.log($scope.main.likeButton);
     };


    $scope.favoritesButtonClick = function(photoObj_id){
      console.log(photoObj_id);

      var favoriteRes = $resource('/favoritePhoto/' + photoObj_id);
      var photoModel = favoriteRes.save({}, function(){
        console.log("Favorite button clicked");
        $route.reload();

      }, function errorHandling(err){
        console.log('Problem retrieving photoModel');
        return;
      });
    };


    var photoListRes = $resource('/photosOfUser/' +  user_id);
    var photoListModel = photoListRes.query({}, function () { // photoListModel is an array of photo objects
      $scope.main.photos = photoListModel;//.sort(function(a, b){return b.likes.length - a.likes.length;}); // Sort the photos array in desending numerical order, function(a.likes.length, b.likes.length){return b.likes.length - a.likes.length}
      // Set the Like or Unlike button
      if (!photoListModel.isLiked){
        $scope.main.likeButton = "Like";
      } else if (photoListModel.isLiked){
        $scope.main.likeButton = "Unlike";
      }

      }, function errorHandling(err) {
      console.log('Problem retrieving photoListModel');
    });

    var titleRes = $resource('/user/' + user_id);
    var titleModel = titleRes.get({}, function () {
      $scope.main.title = "Photos of " + titleModel.first_name + " " + titleModel.last_name;
      }, function errorHandling(err) {
      console.log('Problem retrieving titleModel');
    });



    $scope.commentButtonClick = function(photoObj_id, index){
      var photoRes = $resource('/commentsOfPhoto/' + photoObj_id);
      var lastactivityRes = $resource('/lastactivity');
      var photoModel = photoRes.save({comment:$scope.main.commentArray[index]}, function () {
        // Success
        $scope.main.lastActivity = 'Commented: \"' + $scope.main.commentArray[index] + '\"';
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

        console.log("Posted comment successfully");
        $scope.errormsg = '';
        
       // $location.path('/photosOfUser' + user_id);
        $route.reload();
          
      }, function errorHandling(err) { 
        console.log(err);
        $scope.errormsg = 'Cannot post comment';
        console.log('Cannot post comment');
          // Any error or non-OK status
      });  

  };

    // $scope.FetchModel('/photosOfUser/' + userId, function(json_str){ 
    //       $scope.$apply(function(){
    //         $scope.userPhotos = json_str;

    //       });
    // });

    // $scope.FetchModel('/user/' + userId, function(json_string){ 
    //   $scope.$apply(function(){
    //     $scope.main.title = 'Photos of ' + json_string['first_name'] + ' ' + json_string['last_name'];

    //     });
    // });

  }]);
