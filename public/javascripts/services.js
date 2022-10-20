//CUSTOM SERVICES
app.service('HelperService', function() {
    this.errorDetector = function(error) {
        if (error.status == 403) {
            swal(error.data.Message, { icon: "error" });
        }
        if (error.status == 401) {
            window.location.href = AUTO_LOGOUT;
        }
    }
    this.queryString = function(key) {
        var url_string = window.location.href;
        var url = new URL(url_string);
        var value = url.searchParams.get(key);
        return value;
    };

    this.checkWindow = function(lastMessageAt) {
        let currentDate = new Date();
        if(lastMessageAt && lastMessageAt != undefined && lastMessageAt != null){
            let time = timeDiffCalc(lastMessageAt, currentDate);
            if (time.day > 0) {
                return "0";
            } else {
                return "" + (23 - time.hour) + " Hr " + (60 - time.minute) + " Mins";
            }
        }else{
            return "0";
        }
    }

    this.mobileNumberValidator = function(mobileNumber) {
        let mLength = mobileNumber.toString().trim().length;
        if (mLength >= 11) {
            if (!isNaN(mobileNumber)) {
                return { status: true, message: "Mobile number is valid!" };
            } else {
                return { status: false, message: "Mobile number must be in digit!." };
            }
        } else {
            return { status: false, message: "Mobile number must be 11 digit!" };
        }
    }

    this.paginator = function(totalPages, page, maxLength) {
        if (maxLength < 5) throw "maxLength must be at least 5";

        function range(start, end) {
            return Array.from(Array(end - start + 1), (_, i) => i + start);
        }

        var sideWidth = maxLength < 9 ? 1 : 2;
        var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
        var rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;
        if (totalPages <= maxLength) {
            return range(1, totalPages);
        }
        if (page <= maxLength - sideWidth - 1 - rightWidth) {
            return range(1, maxLength - sideWidth - 1)
                .concat(0, range(totalPages - sideWidth + 1, totalPages));
        }
        if (page >= totalPages - sideWidth - 1 - rightWidth) {
            return range(1, sideWidth)
                .concat(0, range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages));
        }

        return range(1, sideWidth)
            .concat(0, range(page - leftWidth, page + rightWidth),
                0, range(totalPages - sideWidth + 1, totalPages));
    }
	this.getRandomColors = function (doc_Length) {
		let arrayList = [];
		const Colors = [
			'bg-primary',
			'bg-secondary',
			'bg-success',
			'bg-danger',
			'bg-warning',
			'bg-info',
		];
		let selectedColors = [];
		function regenerate() {
			let rNumber = Math.floor((Math.random() * 6));
			let newColor = Colors[rNumber];
			if (selectedColors.length > 0) {
				let index = selectedColors.length - 1;
				let lastColor = selectedColors[index];
				if (lastColor == newColor && index != undefined) {
					regenerate();
				} else {
					return newColor;
				}
			} else {
				return newColor;
			}
		}
		for (let i = 0; i < doc_Length; i++) {
			let color = regenerate();
			selectedColors.push(color);
		}
		return selectedColors;
	}
});
app.service('SocketService', ['socketFactory', function SocketService(socketFactory) {
    return socketFactory({
        ioSocket: io.connect(window.location.origin)
    });
}]);
