app.controller("ProfileController", ($scope, $http, $interval, $location) => {
    $scope.profile = {};
    $scope.goToProfile = () => {
        window.location.href = '/profile/create';
    };
    $scope.goToChats = () => {
        window.location.href = '/chats';
    };
    $scope.onInit = () => {
        $http({
            url: BASE_URL+'profile',
            method: "POST",
            cache: false,
            data: {},
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
        }).then(
            function (response) {
                if (response.data.IsSuccess == true && response.data.Data != 0) {
                    $scope.profile = response.data.Data;
                    console.log('$scope.profile', $scope.profile);
                } else {
                    window.location.href = AUTO_LOGOUT;
                }
              },
              function (error) {
                window.location.href = AUTO_LOGOUT;
              }
        );
    };
    $scope.onInit();
});
