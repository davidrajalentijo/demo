angular.module('dashboard',[]);
function mainController($scope, $http, $filter) {
    $scope.objects=[{}];
    var URL = "http://localhost:81/api/auth/logout";
    var URLOperation ="http://localhost:81/api/sites";


    $http.get(URLOperation, $scope)
        .success(function(data) {

            var groups = data;
            angular.forEach(groups, function(group) {
                var group2 = group;
            angular.forEach(group2.sites, function(group3){
                //console.log(group3.siteaddress);
                //console.log($scope.objects);

                $scope.objects = group3;
$scope.icc = group3.icc;
                $scope.ActivationStatus = group3.ActivationStatus;
                $scope.siteaddress = group3.siteaddress;
                $scope.city = group3.sitecity;
                $scope.sitezip = group3.sitezip;
                $scope.comments = group3.comments;




            })


            });

        })
        .error(function(data) {

            window.alert('Something Wrong...');
        });





    $scope.logout = function() {



        $http.get(URL)
            .success(function() {
                window.alert('Cerrando Sesión ');

                window.location.href='/index.html';
            })
            .error(function(data) {

                window.alert('No se ha podido cerrar la sesión');
            });
    };




















    $scope.password = {};
    $scope.changepassword = function() {



        $http.post(URL,$scope.signup)
            .success(function(data) {
                window.alert('Bienvenido ' + data.result.username + 'última vez que iniciaste sesión fue el '+ data.result.lastlogin);
                //$window.localStorage.token = data;
                window.location.href='/Dashboard.html';
            })
            .error(function(data) {

                window.alert('Wrong credetianls');
            });
    };

}
