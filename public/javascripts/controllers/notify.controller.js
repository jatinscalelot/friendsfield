app.controller("NotifyController", ($scope, $http, SocketService) => {
    if (sessionStorage.getItem(CHANNEL_DATA) != null && sessionStorage.getItem(CHANNEL_DATA) != undefined && sessionStorage.getItem(CHANNEL_DATA) != ''){
        SocketService.emit("init", { channelID: sessionStorage.getItem(CHANNEL_DATA) });
    }else{
        console.log('channel not found yet');
    }
    SocketService.on('newMessage', async (reqData) => {
        $http({
            url: BASE_URL + "chats/checkSession",
            method: "POST",
            data: { data: reqData },
            cache: false,
            headers: { "Content-Type": "application/json; charset=UTF-8" },
        }).then(function (response) {
            if (response.data.IsSuccess == true) {
                if (reqData.content.contentType == 'text') {
                    if (!("Notification" in window)) {
                        alert("This browser does not support desktop notification");
                    } else if (Notification.permission === "granted") {
                        var notification = new Notification('New Message from Friends Field - ' + reqData.customername, {
                            body: reqData.content.text,
                            badge: './assets/images/FFIcon.png',
                            icon: './assets/images/FFIcon.png'
                        });
                        notification.onclick = function (event) {
                            event.preventDefault();
                            window.open('https://friendsfield.in', '_self');
                        }
                    } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then(function (permission) {
                            if (permission === "granted") {
                                var notification = new Notification('New Message from Friends Field - ' + reqData.customername, {
                                    body: reqData.content.text,
                                    badge: './assets/images/FFIcon.png',
                                    icon: './assets/images/FFIcon.png'
                                });
                                notification.onclick = function (event) {
                                    event.preventDefault();
                                    window.open('https://friendsfield.in', '_self');
                                }
                            }
                        });
                    }
                } else if (reqData.content.contentType == 'media') {
                    if (!("Notification" in window)) {
                        alert("This browser does not support desktop notification");
                    } else if (Notification.permission === "granted") {
                        var notification = new Notification('New Message from Friends Field - ' + reqData.customername, {
                            body: reqData.content.media.caption,
                            badge: './assets/images/FFIcon.png',
                            icon: './assets/images/FFIcon.png',
                            image: reqData.content.media.url
                        });
                        notification.onclick = function (event) {
                            event.preventDefault();
                            window.open('https://friendsfield.in', '_self');
                        }
                    } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then(function (permission) {
                            if (permission === "granted") {
                                var notification = new Notification('New Message from Friends Field - ' + reqData.customername, {
                                    body: reqData.content.media.caption,
                                    badge: './assets/images/FFIcon.png',
                                    icon: './assets/images/FFIcon.png',
                                    image: reqData.content.media.url
                                });
                                notification.onclick = function (event) {
                                    event.preventDefault();
                                    window.open('https://friendsfield.in', '_self');
                                }
                            }
                        });
                    } 
                }
            }
        }, function (error) {
            console.log(error);
        });
    });
    SocketService.on('newFriendRequest', async (reqData) => {

    });
    SocketService.on('incomingCall', async (reqData) => {

    });
    SocketService.on('incomingNotification', async (reqData) => {

    });
});