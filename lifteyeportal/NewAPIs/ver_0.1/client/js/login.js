angular.module('MainApp',[])
    function mainController($scope, $http, $filter) {

     var URL = "http://localhost:81/api/auth/login";
        $scope.signup = {};
        $scope.loginUser = function() {



            $http.post(URL,$scope.signup)
                .success(function(data) {
                    window.alert('Bienvenido ' + data.result.username + '�ltima vez que iniciaste sesi�n fue el '+ data.result.lastlogin);
                    //$window.localStorage.token = data;
                    window.location.href='/Dashboard.html';
                })
                .error(function(data) {

                    window.alert('Wrong credetianls');
                });
        };
    }