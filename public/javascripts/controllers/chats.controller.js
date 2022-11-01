app.controller("ChatsController", ($scope, $http, SocketService, HelperService, $interval, $location) => {
    if (sessionStorage.getItem(CHANNEL_DATA) != null && sessionStorage.getItem(CHANNEL_DATA) != undefined && sessionStorage.getItem(CHANNEL_DATA) != ''){
        console.log('channelID', sessionStorage.getItem(CHANNEL_DATA));
        SocketService.emit("init", { channelID: sessionStorage.getItem(CHANNEL_DATA) });
    }else{
        window.location.href = AUTO_LOGOUT;
    }
    $scope.friendsList = () => {
        
    };
});
