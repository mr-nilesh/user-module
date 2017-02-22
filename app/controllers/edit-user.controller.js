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