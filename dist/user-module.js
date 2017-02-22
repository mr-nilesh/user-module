/*
 * User Module
 * https://github.com/mr-nilesh/user-module
 * v0.0.1

*/import './styles/user.scss';
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

'use strict';
(function(){
    angular
        .module('tsUIAdmin.user')
        .controller('AddUserController', Controller);

        Controller.$inject = ['$rootScope', '$scope', '$state', 'registerService', '$timeout', 'materialToast'];
        function Controller($rootScope, $scope, $state, registerService, $timeout, materialToast){
            var vm = this;

            /* variable declaration */
            $rootScope.showLoading = false;
            vm.isScopeChanged = false;
            vm.isNewUser = true;
            vm.formData = {};
            vm.copyOfUserDetails = {};
            vm.showButtonLoading = false;

            /* function declaration */
            vm.backToUserList = backToUserList;
            vm.saveUser = saveUser;

            Activate();
            function Activate() {
                $scope.selections.currentRoute = $state.current.name;
                $rootScope.$broadcast('user selected', {'emailAddress': null, 'from': 'addUser'});
                $timeout(function(){
                    $scope.$watch(function(){
                        return vm.formData;
                    }, function(newValue, oldValue){
                        if(angular.equals(vm.copyOfUserDetails, newValue) === false) {
                            vm.isScopeChanged = true;
                            $rootScope.formDataModified = true;
                        } else {
                            vm.isScopeChanged = false;
                            $rootScope.formDataModified = false;
                        } 
                    }, true);
                }, 1000);
            }

            // Copy user's original data so we can check user's data are modified or not
            // while changing route without saving the data.
            function copyUserData(userDetails) {
                vm.copyOfUserDetails.firstName = '';
                vm.copyOfUserDetails.lastName = '';
                vm.copyOfUserDetails.username = '';
                vm.copyOfUserDetails.mobile = '';
                vm.copyOfUserDetails.emailAddress = '';
            }

            // Move back to user list.
            function backToUserList(form) {
                form.$setPristine();
                form.$setUntouched();
                vm.formData = {};
            }

            function saveUser(form) {
                if(form.$valid) {
                    if(vm.formData.emailAddress !== vm.formData.confirmEmailAddress) {
                        return;
                    }
                    if(vm.formData.password !== vm.formData.confirmPassword) {
                        return;
                    }
                    vm.showButtonLoading = true;
                    var userObj = {
                        Username: vm.formData.username,
                        EMailAddress: vm.formData.emailAddress,
                        EMailAddressRepeat: vm.formData.confirmEmailAddress,
                        Password: vm.formData.password,
                        PasswordRepeat: vm.formData.confirmPassword,
                        Profile: {
                            Firstname : vm.formData.firstName,
                            Lastname : vm.formData.lastName 
                        }
                    };
                    registerService.registerUser(userObj)
                        .then(function(data){
                            if(data.Validation.IsValid) {
                                $rootScope.$broadcast('user updated, refresh grid');
                                materialToast.successToast('User added successfully.');
                                $rootScope.formDataModified = false;
                                $state.go('app.user', {}, { ignoreDsr: true });
                            } else if(data.Validation.Fields.Username && !data.Validation.Fields.Username.IsValid) {
                                var invalidUserName = data.Validation.Fields.Username;
                                if(invalidUserName.Errors.indexOf('Exists') >= 0) {
                                    materialToast.dangerToast('The Username you are trying to use is already exist. Please try another one.');
                                }
                                } else {
                                console.log('Rest validations are goes here.');
                                }
                                vm.showButtonLoading = false;
                        }, function(error){
                            materialToast.dangerToast('Sorry! Something went wrong.');
                            vm.showButtonLoading = false;
                        });
                }
            }
        }
})();

'use strict';
(function(){
    angular
        .module('tsUIAdmin.user')
        .controller('EditUserController', Controller);

        Controller.$inject = ['$rootScope', '$scope', '$state', 'userDetails', 'userService', '$stateParams', '$mdToast', '$timeout', '$mdDialog', 'materialToast'];
        
        function Controller($rootScope, $scope, $state, userDetails, userService, $stateParams, $mdToast, $timeout, $mdDialog, materialToast){
            var vm = this;
            $rootScope.showLoading = false;
            vm.isNewUser = false;
            vm.isScopeChanged = false;
            vm.showButtonLoading = false;
            vm.formData = {};
            vm.copyOfUserDetails = {};
            vm.backToUserList = backToUserList;
            vm.saveUser = saveUser;
            Activate();

            function Activate() {
                $scope.selections.currentRoute = $state.current.name;
                $rootScope.$broadcast('user selected', {'emailAddress': userDetails.EMailAddress, 'from': 'editUser'});
                copyUserData(userDetails);
                fillFormData(userDetails);
                $timeout(function(){
                    $scope.$watch(function(){
                        return vm.formData;
                    }, function(newValue, oldValue){
                        if(angular.equals(vm.copyOfUserDetails, newValue) === false) {
                            vm.isScopeChanged = true;
                            $rootScope.formDataModified = true;
                        } else {
                            vm.isScopeChanged = false;
                            $rootScope.formDataModified = false;
                        }
                    }, true);
                }, 1000);
            }

            // Copy user's original data so we can check user's data are modified or not
            // while changing route without saving the data.
            function copyUserData(userDetails) {
                vm.copyOfUserDetails.firstName = userDetails.Firstname || '';
                vm.copyOfUserDetails.lastName = userDetails.Lastname || '';
                vm.copyOfUserDetails.username = userDetails.Username || '';
                vm.copyOfUserDetails.emailAddress = userDetails.EMailAddress || '';
                vm.copyOfUserDetails.confirmEmailAddress = userDetails.EMailAddressRepeat || '';
            }

            // Fill form with user's data
            function fillFormData(userDetails) {
                vm.formData.firstName = userDetails.Firstname || '';
                vm.formData.lastName = userDetails.Lastname || '';
                vm.formData.username = userDetails.Username || '';
                vm.formData.emailAddress = userDetails.EMailAddress || '';
                vm.formData.confirmEmailAddress = userDetails.EMailAddressRepeat || '';
            }

            // Move back to user list.
            function backToUserList() {
                fillFormData(userDetails);
            }

            function saveUser(form) {
                if(form.$valid) {
                    if(vm.formData.emailAddress !== vm.formData.confirmEmailAddress) {
                        return;
                    }
                    vm.showButtonLoading = true;
                    var userObj = {
                        UserId: $stateParams.userId,
                        Firstname: vm.formData.firstName,
                        Lastname: vm.formData.lastName,
                        Username: vm.formData.username,
                        EMailAddress: vm.formData.emailAddress,
                        EMailAddressRepeat: vm.formData.confirmEmailAddress
                    };

                    userService.updateUser(userObj)
                        .then(function(data){
                            if(data.Validation.IsValid) {
                                $rootScope.$broadcast('user updated, refresh grid');
                                materialToast.successToast('User update successfully.');
                                $rootScope.formDataModified = false;
                                $state.go('app.user', {}, { ignoreDsr: true });
                            } else if(data.Validation.Fields.Username && !data.Validation.Fields.Username.IsValid) {
                                var invalidUserName = data.Validation.Fields.Username;
                                if(invalidUserName.Errors.indexOf('Exists') >= 0) {
                                    materialToast.dangerToast('The Username you are trying to use is already exist. Please try another one.');
                                }
                            } else {
                                console.log('Rest validations are goes here.');
                            }
                            vm.showButtonLoading = false;
                        }, function(error){
                            materialToast.dangerToast('Sorry! Something went wrong.');
                            vm.showButtonLoading = false;
                        });
                }
            }
        }
})();

'use strict';
(function(){
    angular
        .module('tsUIAdmin.user')
        .controller('MasterUserController', Controller);

        Controller.$inject = ['$rootScope', '$scope', 'uiGridColumnDefsLookup', 'userList', '$state', 'userService', 'lodash', 'materialToast', '$timeout', '$mdDialog', '$interval'];
        function Controller($rootScope, $scope, uiGridColumnDefsLookup, userList, $state, userService, _, materialToast, $timeout, $mdDialog, $interval){
            var vm = this;

            /* variable declaration */
            $rootScope.showLoading = false;    
            $scope.selectAll = false;
            vm.gridData = _.forEach(userList, function(user) {
                user.selected = false;
            });
            vm.copyOfUser = angular.copy(userList);
            vm.enableRemoveUserButton = false;
            vm.selectedRow = '';
            vm.gridOptions = {
                rowSelection: false,
                multiSelect: false,
                autoSelect: true,
                decapitate: false,
                largeEditDialog: false,
                boundaryLinks: false,
                limitSelect: true,
                pageSelect: true
            };

            vm.query = {
                order: '',
                limit: 5,
                page: 1
            };
            vm.showUserEmail = false;

            vm.selected = [];
            $scope.selections = {};
            function logOrder (order) {
                console.log('order: ', order);
            };         

            /* function declaration*/
            vm.removeUser = removeUser;
            vm.backToUserList = backToUserList;
            vm.moveToAddUser = moveToAddUser;
            vm.selectAllUser = selectAllUser;
            vm.rowSelection = rowSelection;

            Activate();

            function Activate() {
                $timeout(function(){
                    $scope.$watch(function(){
                        return vm.gridData;
                    }, function(newValue, oldValue){
                        if(angular.equals(vm.copyOfUser, newValue) === false) {
                            vm.enableRemoveUserButton = true;
                        } else {
                            vm.enableRemoveUserButton = false;
                        }
                    }, true);
                }, 1000);
            }

            function rowSelection (selectedUser, isDeleted) {
                if (isDeleted === true) {
                    deleteUser(selectedUser);
                } else {
                    vm.selectedRow = null;
                    $rootScope.ignoreDsr = true;
                    vm.selectedRow = selectedUser.UserId;
                    $state.go('app.user.edit', {userId: selectedUser.UserId});    
                }                
            }

            function deleteUser (user) {
                if (user) {
                    var deleteConfirm = $mdDialog.confirm()
                        .title('Delete Confirmation!')
                        .textContent('Would you like to delete user(s)?')
                        .ok('Delete')
                        .cancel('Cancel');

                    $mdDialog.show(deleteConfirm)
                        .then(function() {
                            $rootScope.showLoading = true;
                            userService.deleteUser(user.UserId)
                                .then(function(data) {
                                    $rootScope.showLoading = false;
                                    materialToast.successToast('User(s) deleted successfully.');
                                    refreshGridData();
                                    vm.enableRemoveUserButton = false;
                                    $state.go('app.user', {}, { ignoreDsr: true });
                                }, function  (argument) {
                                    $rootScope.showLoading = false;
                                    materialToast.successToast('Sorry! Something went wrong.'); 
                                });
                            }, function() {
                        });
                }                
            }

            //@depricated
            function removeUser() {
                var users = _.filter(vm.gridData, {selected: true});
                if(vm.selected.length === 0) {
                    return;
                }
                var deleteConfirm = $mdDialog.confirm()
                    .title('Delete Confirmation!')
                    .textContent('Would you like to delete user(s)?')
                    .ok('Delete')
                    .cancel('Cancel');

                $mdDialog.show(deleteConfirm)
                    .then(function() {
                        $rootScope.showLoading = true;
                        userService.deleteUser(vm.selected[0].UserId)
                            .then(function(data) {
                                $rootScope.showLoading = false;
                                materialToast.successToast('User(s) deleted successfully.');
                                refreshGridData();
                                vm.enableRemoveUserButton = false;
                                $state.go('app.user', {}, { ignoreDsr: true });
                            }, function  (argument) {
                                $rootScope.showLoading = false;
                                materialToast.successToast('Sorry! Something went wrong.'); 
                            });
                        }, function() {
                    });
            }

            // Move back to user list.
            function backToUserList() {
                vm.selectedRow = null;
                $rootScope.ignoreDsr = true;
                $state.go('app.user', {}, { ignoreDsr: true });
            }

            // Move to add user screen.
            function moveToAddUser() {
                vm.selectedRow = null;
                $state.go('app.user.add');
            }

            //@depricated
            function selectAllUser(allSelected) {
                if(!allSelected) {
                    _.forEach(vm.gridData, function(data) {
                        data.selected = true;
                    });
                } else {
                    _.forEach(vm.gridData, function(data) {
                        data.selected = false;
                    });
                }
            }

            $rootScope.$on('user updated, refresh grid', function() {
                refreshGridData();
            });

            $scope.$on('user selected', function (event, userDetailObj) {
                if (userDetailObj.emailAddress === null && userDetailObj.from === '') {
                    vm.showUserEmail = false;
                } else {
                    vm.showUserEmail = true;    
                }
                vm.userEmailAddress = userDetailObj.emailAddress;             
            });

            function refreshGridData() {
                userService.userList()
                    .then(function(userList){
                        vm.gridData = userList;
                        vm.copyOfUser = angular.copy(userList);
                    }, function(error){
                    });
            }
        }
})();

'use strict';
(function(){
    angular
        .module('tsUIAdmin.user')
        .controller('SelectUserController', Controller);

        Controller.$inject = ['$rootScope', '$scope', 'uiGridColumnDefsLookup', 'userList', '$state'];
        function Controller($rootScope, $scope, uiGridColumnDefsLookup, userList, $state){
            var vm = this;
            $scope.gridOptions = {
                enableRowSelection: true
            };

            $scope.gridOptions.columnDefs = uiGridColumnDefsLookup.userList.columnDefs;

            Activate();

            function Activate() {
                $scope.gridOptions.data = userList;

                $scope.gridOptions.onRegisterApi = function(gridApi){
                    $scope.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope, function(row){ 
                        $state.go('app.user.edit', {userId: row.entity._id});
                    });
                }; 
            }

            function selectUser() {
            }
        }
})();

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


'use strict';

(function() {

    var uiGridColumnDefsLookupInjectParams = ['uiGridConstants'];

    var uiGridColumnDefsLookup = function(uiGridConstants) {

        return {
            userList: {
                columnDefs: [{
                    field: 'Firstname',
                    title: 'First Name',
                    width: '20%'
                },
                {
                    field: 'Lastname',
                    title: 'Last Name',
                    width: '20%'
                },
                {
                    field: 'EMailAddress',
                    title: 'Email',
                    width: '28%'
                },
                {
                    field: 'Username',
                    title: 'Username',
                    width: '7%'
                }]
            }
        }
    };

    uiGridColumnDefsLookup.$inject = uiGridColumnDefsLookupInjectParams;

    angular
        .module('tsUIAdmin.user')
        .factory('uiGridColumnDefsLookup', uiGridColumnDefsLookup);

}());


