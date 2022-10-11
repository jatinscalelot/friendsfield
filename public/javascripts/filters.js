// CORE JS FILTERS
function today() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

function monthStart() {
    let date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
}

function addDays(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0);
    return date;
}

function subDays(days) {
    var date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
}

function timeDiffCalc(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
    const days = Math.floor(diffInMilliSeconds / 86400);

    diffInMilliSeconds -= days * 86400;
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;

    diffInMilliSeconds -= hours * 3600;
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;

    diffInMilliSeconds -= minutes * 60;

    let difference = '';
    if (days > 0) {
        difference += (days === 1) ? `${days} day, ` : `${days} days, `;
    }

    difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `;
    difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`;

    return {
        day: days,
        hour: hours,
        minute: minutes
    };
}

//CUSTOM FILTERS
app.filter('capitalizeWord', function () {
    return function (text) {
        return (!!text) ? text.charAt(0).toUpperCase() + text.substr(1).toLowerCase() : '';
    }
});

app.filter('timeStampToDate', function () {
    return function (timestamp) {
        var timestamp = parseInt(timestamp);
        var a = new Date(timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        let hour = a.getHours().toString();
        let min = a.getMinutes().toString();
        let stringMin = min.length == 1 ? '0' + min : min;
        let stringHour = hour.length == 1 ? '0' + hour : hour;
        var time = date + '-' + month + '-' + year + ' ' + stringHour + ':' + stringMin;
        return time;
    }
});

app.filter('timesDate', function () {
    return function (timestamp) {
        var timestamp = parseInt(timestamp);
        var a = new Date(timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        let hour = a.getHours().toString();
        let min = a.getMinutes().toString();
        let stringMin = min.length == 1 ? '0' + min : min;
        let stringHour = hour.length == 1 ? '0' + hour : hour;
        var time = date + '-' + month + '-' + year;
        return time;
    }
});

app.filter('timeStampAge', function () {
    return function (previous) {
        if (previous != null) {
            let current = Date.now();
            let msPerMinute = 60 * 1000;
            let msPerHour = msPerMinute * 60;
            let msPerDay = msPerHour * 24;
            let msPerMonth = msPerDay * 30;
            let msPerYear = msPerDay * 365;
            let elapsed = current - previous;
            if(elapsed <= 0){
                return 'Just Now';
            }else if (elapsed < msPerMinute) {
                return (Math.round(elapsed / 1000)) < 0 ? 0 : (Math.round(elapsed / 1000)) + ' seconds ago';
            } else if (elapsed < msPerHour) {
                return Math.round(elapsed / msPerMinute) + ' minutes ago';
            } else if (elapsed < msPerDay) {
                return Math.round(elapsed / msPerHour) + ' hours ago';
            } else if (elapsed < msPerMonth) {
                return Math.round(elapsed / msPerDay) + ' days ago';
            } else if (elapsed < msPerYear) {
                return Math.round(elapsed / msPerMonth) + ' months ago';
            } else {
                return Math.round(elapsed / msPerYear) + ' years ago';
            }
        } else {
            return "";
        }
    }
});




app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
});

app.filter('paginationRange', function () {
    return function (currentPage, totalNumberOfPages) {
        total = parseInt(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
});

app.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

app.filter('initials', function () {
    return function (name) {
        let stringsData = [];
        if (name != undefined) {
            let splits = name.trim().replace(/[^a-zA-Z ]/g, "").replace(" ", "-").split("-");
            for (let a = 0; a < splits.length; a++) {
                if (splits[a] != " ") {
                    stringsData.push(splits[a].trim());
                }
            }
            let inits = "";
            if (stringsData.length == 1) {
                inits = stringsData[0].substr(0, 1).toUpperCase().trim();
                return inits;
            } else {
                inits = stringsData[0].substr(0, 1).toUpperCase().trim() + stringsData[1].substr(0, 1).toUpperCase().trim();
                return inits;
            }
        } else {
            return "";
        }
    }
});



app.filter('fileExtension', function () {
    return function (name) {
        let stringName = name.split("/");
        let fileName = stringName[stringName.length - 1];
        let extension = fileName.split(".");
        return extension[1].toUpperCase().substr(0, 3);
    }
});

app.filter('Window', function () {
    return function (lastMessageAt) {
        let currentDate = new Date();
        let time = timeDiffCalc(lastMessageAt, currentDate);
        if (time.day > 0) {
            return "Closed!";
        } else {
            return "" + (23 - time.hour) + " hr " + (60 - time.minute) + " min";
        }
    }
});
