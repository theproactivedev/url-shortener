var app = angular.module("shortenURLApp", []);

app.controller("shortenURLCtrl", function($scope) {
  $scope.urlToShorten = "Hello World";
});