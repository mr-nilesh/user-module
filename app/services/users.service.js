'use strict';

(function() {

    var injectParams = ['$http', '$q', 'lodash', 'appConfig'];

    var userService = function($http, $q, _, appConfig) {

        var userObj = {
            userList: userList,
            getUserDetails: getUserDetails,
            updateUser: updateUser,
            deleteUser: deleteUser,
        };

        return userObj;

        function userList() {
            var deferred = $q.defer();
            $http.get(appConfig.apiUrl + 'usrmgmt/user')
                .then(function(data) {
                    deferred.resolve(data.data);
                }, function(reason) {
                    deferred.reject(reason);
                });
            return deferred.promise;
        }

        function getUserDetails(userId) {
            var deferred = $q.defer();
            $http.get(appConfig.apiUrl + 'usrmgmt/user/' + userId)
                .then(function(data) {
                    deferred.resolve(data.data);
                }, function(reason) {
                    deferred.reject(reason);
                });
            return deferred.promise;
        }

        function updateUser(userObj) {
            var deferred = $q.defer();
            $http.post(appConfig.apiUrl + 'usrmgmt/user/save', userObj)
                .then(function(data) {
                    deferred.resolve(data.data);
                }, function(reason) {
                    deferred.reject(reason);
                });
            return deferred.promise;
        }


        function deleteUser(id) {
            var deferred = $q.defer();
            $http.get(appConfig.apiUrl + 'usrmgmt/user/delete/'+id)
                .then(function(data) {
                    deferred.resolve(data.data);
                }, function(reason) {
                    deferred.reject(reason);
                });
            return deferred.promise;
        }

    };

    userService.$inject = injectParams;

    angular
        .module('tsUIAdmin.user')
        .service('userService', userService);

}());
