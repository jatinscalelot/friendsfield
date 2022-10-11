//CUSTOM DIRECTIVES
app.directive("fileInput", function ($parse) {
    return {
        link: function ($scope, element, attrs) {
            element.on("change", function (event) {
                var files = event.target.files;
                console.dir(files);
                $parse(attrs.fileInput).assign($scope, element[0].files[0]);
                $scope.$apply();
            });
        }
    }
});

app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            element.hover(function(){
                element.tooltip('show');
            }, function(){
                element.tooltip('hide');
            });
        }
    };
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    console.dir(element[0].files[0]);
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.directive('stopccp', function () {
    return {
        scope: {},
        link: function (scope, element) {
            element.on('cut copy paste', function (event) {
                event.preventDefault();
            });
        }
    };
});


app.directive("directiveWhenScrolled", function () {
    return function (scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function () {
            if ((Math.ceil(raw.scrollTop + raw.offsetHeight) + 5) >= raw.scrollHeight) {
                scope.$apply(attr.directiveWhenScrolled);
            }
        });
    };
});

app.directive("directiveWhenScrolledUp", function () {
    return function (scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function () {
            if(scope.chatList.length > 0){
                if (raw.scrollTop < 25) {
                    scope.$apply(attr.directiveWhenScrolledUp);
                    raw.scrollTop = 10;
                }
            }
        });
    };
});

app.directive('intlBox', function () {
    return {
        link: function (scope, elem, attrs) {
            $(elem).intlTelInput({});
            scope.$apply();
        }
    };
});

app.directive('lightgallery', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        if (scope.$last) {
          element.parent().lightGallery();
        }
      }
    };
});

app.directive('ng-dropzone', function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            options: '=?',
            methods: '=?',
            callbacks: '=?',
        },
        link: function (scope, el) {
            Dropzone.autoDiscover = false;
            var drop = new Dropzone(el[0], scope.options);
            scope.methods = scope.methods || {};
            scope.methods.getDropzone = function () {
                return drop;
            };
            scope.methods.getAllFiles = function () {
                return drop.files;
            };
            var controlMethods = [
                'removeFile', 'removeAllFiles', 'processQueue',
                'getAcceptedFiles', 'getRejectedFiles', 'getQueuedFiles', 'getUploadingFiles',
                'disable', 'enable', 'confirm', 'createThumbnailFromUrl'
            ];
            angular.forEach(controlMethods, function (methodName) {
                scope.methods[methodName] = function () {
                    drop[methodName].apply(drop, arguments);
                    if (!scope.$$phase && !scope.$root.$$phase) scope.$apply();
                };
            });
            if (scope.callbacks) {
                var callbackMethods = [
                    'drop', 'dragstart', 'dragend',
                    'dragenter', 'dragover', 'dragleave', 'addedfile', 'removedfile',
                    'thumbnail', 'error', 'processing', 'uploadprogress',
                    'sending', 'success', 'complete', 'canceled', 'maxfilesreached',
                    'maxfilesexceeded', 'processingmultiple', 'sendingmultiple', 'successmultiple',
                    'completemultiple', 'canceledmultiple', 'totaluploadprogress', 'reset', 'queuecomplete'
                ];
                angular.forEach(callbackMethods, function (method) {
                    var callback = (scope.callbacks[method] || angular.noop);
                    drop.on(method, function () {
                        callback.apply(null, arguments);
                        if (!scope.$$phase && !scope.$root.$$phase) scope.$apply();
                    });
                });
            }
        }
    };
});
