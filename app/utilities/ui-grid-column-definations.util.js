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


