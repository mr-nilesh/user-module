import './styles/user.scss';
'use strict';
(function() {

    angular
        .module('tsUIAdmin.user', [])
        .config(Config);

        Config.$inject = ['$stateProvider', '$urlRouterProvider'];

        function Config($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('app.user.select', {
                    url: '/list',
                    templateUrl: 'user-select.html',
                    controller:'SelectUserController',
                    controllerAs:'selectUser'
                })
                .state('app.user.edit', {
                    url: '/edit/:userId',
                    templateUrl: 'manage-user.html',
                    controller:'EditUserController',
                    controllerAs:'manageUser',
                    resolve: {
                        userDetails: ['userService', '$stateParams', function(userService, $stateParams){
                            return userService.getUserDetails($stateParams.userId);
                        }]
                    }
                })
                .state('app.user.add', {
                    url: '/add',
                    templateUrl: 'manage-user.html',
                    controller:'AddUserController',
                    controllerAs:'manageUser'
                });
        }

    require('./utilities/ui-grid-column-definations.util.js');
    require('./controllers/select-user.controller.js');
    require('./controllers/edit-user.controller.js');
    require('./controllers/add-user.controller.js');
})();