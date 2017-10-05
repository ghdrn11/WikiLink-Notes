﻿(function () {
    "use strict";

    chrome.tabs.onActivated.addListener(activeInfo => {
        chrome.runtime.sendMessage({ method: "repository", key: "searchTerm" }, function (response) {
            console.log(response);
        });

        // httpExecute('GET', 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=nepal')
    });

    chrome.contextMenus.create({
        title: 'Search \"%s\" on Wikipedia',
        contexts: ["selection"],
        onclick: info => searchTerm(info.selectionText)
    });


    ///// Testing Area ////
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // console.log('on addListenet');
        // try {
        //     if (request.method === 'repository') {
        //         sendResponse(repo[request.key]);
        //     }
        // } catch (error) {
        //     alert(error.message);
        // }
        // sendResponse('Response sended');
        // return true;
    });

    //region Functions
    function repo() {

        return {
            searchTerm: httpGet,
        };


        //// Implementation ////

        function httpGet(termString) {
            return httpExecute('GET', `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${termString}`);
        }

        function httpExecute(method, url, data) {
            // 'http://www.w3.org/pub/WWW/TheProject.html'
            httpCall({
                url: url,
                method: method,
                data: data
            }).then(successCallback, errorCallback);

            function successCallback(response) {
                var json = JSON.parse(response.response);
                console.log(response);
                return response;

            }

            function errorCallback(response) {
                console.log(response);
                return response;
            }
        }
    }


    /**
     * @description Beautify http calls
     * @param {{url: string, method: string, data: string, dataType: string}} config 
     */
    function httpCall(config) {
        let httpRequest = new XMLHttpRequest();

        /**
         * 
         * @param {function} successCallback 
         * @param {function} errorCallback 
         */
        function then(successCallback, errorCallback) {

            let concatUrl = config.url + objToQuerystring(config.data);
            httpRequest.open(config.method, concatUrl, true);
            httpRequest.setRequestHeader('Content-Type', config.dataType || 'application/json');
            httpRequest.send();

            httpRequest.onreadystatechange = () => {

                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    switch (httpRequest.status) {
                        case 200: successCallback(httpRequest);
                            break;
                        default: errorCallback(httpRequest)
                            break;
                    }
                }
            };
        }


        function objToQuerystring(obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));

            return str.join("&");
        }

        return {
            then: then
        }
    }
    //endregion
})();