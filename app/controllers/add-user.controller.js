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