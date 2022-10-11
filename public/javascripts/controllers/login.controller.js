app.controller("LoginController", ($scope, $http,) => {
    $scope.countryCodes = [
        { displayvalue : '+91', value : '91' },
        { displayvalue : '+64', value : '64' },
        { displayvalue : '+355', value : '355' },
        { displayvalue : '+213', value : '213' },
        { displayvalue : '+1-684', value : '1684' },
        { displayvalue : '+376', value : '376' },
        { displayvalue : '+244', value : '244' },
        { displayvalue : '+1-264', value : '1264' },
        { displayvalue : '+1-268', value : '1268' },
        { displayvalue : '+54', value : '54' },
        { displayvalue : '+374', value : '374' },
        { displayvalue : '+297', value : '297' },
        { displayvalue : '+61', value : '61' },
        { displayvalue : '+43', value : '43' },
        { displayvalue : '+994', value : '994' },
        { displayvalue : '+1-242', value : '1242' },
        { displayvalue : '+973', value : '973' },
        { displayvalue : '+880', value : '880' },
        { displayvalue : '+1-246', value : '1246' },
        { displayvalue : '+375', value : '375' },
        { displayvalue : '+32', value : '32' },
        { displayvalue : '+501', value : '501' },
        { displayvalue : '+229', value : '229' },
        { displayvalue : '+1-441', value : '1441' },
        { displayvalue : '+975', value : '975' },
        { displayvalue : '+591', value : '591' },
        { displayvalue : '+387', value : '387' },
        { displayvalue : '+267', value : '267' },
        { displayvalue : '+55', value : '55' },
        { displayvalue : '+246', value : '246' },
        { displayvalue : '+1-284', value : '1284' },
        { displayvalue : '+673', value : '673' },
        { displayvalue : '+359', value : '359' },
        { displayvalue : '+226', value : '226' },
        { displayvalue : '+257', value : '257' },
        { displayvalue : '+855', value : '855' },
        { displayvalue : '+237', value : '237' },
        { displayvalue : '+1', value : '1' },
        { displayvalue : '+238', value : '238' },
        { displayvalue : '+1-345', value : '1345' },
        { displayvalue : '+236', value : '236' },
        { displayvalue : '+235', value : '235' },
        { displayvalue : '+56', value : '56' },
        { displayvalue : '+86', value : '86' },
        { displayvalue : '+61', value : '61' },
        { displayvalue : '+57', value : '57' },
        { displayvalue : '+269', value : '269' },
        { displayvalue : '+682', value : '682' },
        { displayvalue : '+506', value : '506' },
        { displayvalue : '+385', value : '385' },
        { displayvalue : '+53', value : '53' },
        { displayvalue : '+357', value : '357' },
        { displayvalue : '+420', value : '420' },
        { displayvalue : '+243', value : '243' },
        { displayvalue : '+45', value : '45' },
        { displayvalue : '+253', value : '253' },
        { displayvalue : '+1-767', value : '1767' },
        { displayvalue : '+1-809', value : '1809' },
        { displayvalue : '+1-829', value : '1829' },
        { displayvalue : '+670', value : '670' },
        { displayvalue : '+593', value : '593' },
        { displayvalue : '+20', value : '20' },
        { displayvalue : '+503', value : '503' },
        { displayvalue : '+240', value : '240' },
        { displayvalue : '+291', value : '291' },
        { displayvalue : '+372', value : '372' },
        { displayvalue : '+251', value : '251' },
        { displayvalue : '+500', value : '500' },
        { displayvalue : '+298', value : '298' },
        { displayvalue : '+679', value : '679' },
        { displayvalue : '+358', value : '358' },
        { displayvalue : '+33', value : '33' },
    ]; 
    $scope.userdata = {
        contactnumber : '',
        countrycode : '91'
    }
    $scope.sendotp = () => {
        $http({
            url: BASE_URL+'sendotp',
            method: "POST",
            cache: false,
            data: {contactNo : $scope.userdata.contactnumber, countryCode : $scope.userdata.countrycode},
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
        }).then(
            function (response) {
                if (response.data.IsSuccess == true && response.data.Data != 0) {
                    console.log('here');
                } else {
                    window.location.href = AUTO_LOGOUT;
                }
              },
              function (error) {
                window.location.href = AUTO_LOGOUT;
              }
        );
    };
    $scope.onLogin = function () {
        $('#loadingdiv').show();
        $http({
            url: BASE_URL,
            method: "POST",
            cache: false,
            data: $scope.form,
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
        }).then(
            function (response) {
                if (response.data.IsSuccess == true && response.data.Data != 0) {
                    sessionStorage.setItem("userName", response.data.Data[0].name);
                    sessionStorage.setItem(CHANNEL_DATA, response.data.Data[0].channelId);
                    sessionStorage.setItem(UNIQID, response.data.Data[0]._id);
                    sessionStorage.setItem(USER_ROLE, response.data.Data[0].roleId.name);
                    sessionStorage.setItem("LoginToken", response.data.Data[0].loginToken);
                    window.location.href = "/chats";
                } else {
                    $('#loadingdiv').hide();
                    swal("Oops", response.data.Message, "error")
                }
            },
            function (error) {
                $('#loadingdiv').hide();
                console.log(error);
                if (error.status == 401) {
                    window.location.href = AUTO_LOGOUT;
                }
                console.error("Something Went Wrong! try again");
            }
        );
    };
});
