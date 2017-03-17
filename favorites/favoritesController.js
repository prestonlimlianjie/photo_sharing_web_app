'use strict';

cs142App.controller('FavoritesController', ['$scope', '$routeParams', '$resource', '$rootScope', '$route', '$location', '$mdDialog',
  function ($scope, $routeParams, $resource, $rootScope, $route, $location, $mdDialog) {
  	$scope.main.title = $scope.main.username + '\'s Favorites';

	var favRes = $resource('/favorites');
	$scope.main.favArrayModel = favRes.get({}, function(){
    	console.log("Displaying favorites");
    	console.log($scope.main.favArrayModel);

  	}, function errorHandling(err){
    	console.log('Problem retrieving favArrayModel');
    	return;
  	});

    
    function DialogController($scope, $mdDialog, items) {
        $scope.items = items;
        // $scope.items = [1];
        $scope.closeDialog = function() {
          $mdDialog.hide();
        };
    }

    $scope.showImage = function($event, filename, datetime, createddatetime) {
    	$scope.items = {filename: filename, datetime: datetime, createddatetime: createddatetime};
    	$scope.filename = datetime;
    	console.log($scope.main.filename);
       var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: $event,
         template:
           '<md-dialog aria-label="List dialog">' +
           '  <md-dialog-content>'+
           '    <md-list>'+
           // '      <md-list-item ng-repeat="item in items">'+
           '	<md-list-item>' +
           '     <p><img ng-src="images/{{items.filename}}"/></p></md-list-item>'+
           '     <md-list-item><br /><p>Created: {{items.createddatetime}}</p></md-list-item>'+
           '     </md-list-item><md-list-item><p>Favorited: {{items.datetime}}</p></md-list-item>'+
           '    </md-list>'+
           '  </md-dialog-content>' +
           '  <md-dialog-actions>' +
           '    <md-button ng-click="closeDialog()" class="md-primary">' +
           '      Close Dialog' +
           '    </md-button>' +
           '  </md-dialog-actions>' +
           '</md-dialog>',
         locals: {
           items: $scope.items,
           filename: $scope.filename
         },
         controller: DialogController
      });
   };


    $scope.cancelButtonClick = function(photoObj_id){
      console.log(photoObj_id);

      var favoriteRes = $resource('/favoritePhoto/' + photoObj_id);
      var photoModel = favoriteRes.save({}, function(){
        console.log("Favorite button clicked");
        console.log(photoModel);
        $route.reload();

      }, function errorHandling(err){
        console.log('Problem retrieving photoModel');
        return;
      });
    };

}]);