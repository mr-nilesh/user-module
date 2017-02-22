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