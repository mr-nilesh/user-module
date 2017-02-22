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