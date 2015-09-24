(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);
        var games = new WinJS.Binding.List();
        var achievements = new WinJS.Binding.List();
        var rewards = new WinJS.Binding.List();
        var data = {
        	games: games,
        	achievements: achievements,
        	rewards: rewards
        };
        WinJS.Namespace.define("Data", data);
        WinJS.Application.Data = data;
        WinJS.UI.processAll();
        document.getElementById('loginClick').addEventListener('click', onLoginClick.bind(this), false);
        
    };

    function onPause() {
    };

    function onResume() {
    };

    function postTokenRequest(url, params, user, password) {
    	return new WinJS.Promise(function (comp, err, prog) {
    		var req = new XMLHttpRequest();
    		function handler() {
    			if (req.readyState == 4) {
    				if (req.status == 200) {
    					var profileObj = JSON.parse(req.responseText);
    					comp(profileObj);
    				} else {
    					err(req)
    				}
    			}
    		}

    		req.open("POST", url, true);
    		req.onreadystatechange = handler;	
    		req.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent(user + ':' + password))));
    		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    		req.setRequestHeader("Content-length", params.length);
    		req.setRequestHeader("Connection", "close");
    		req.send(params);
    		prog();
    	});
    }
    function onLoginClick() {
    	var scope = 'sc2.profile';

    	var ref = window.open('https://us.battle.net/oauth/authorize?client_id=' + WinJS.Application.clientId + '&scope=' + scope + '&redirect_uri=https://localhost/callback&response_type=code', '_blank', 'location=no');
    	ref.addEventListener('loadstart', function (event) {
    		if ((event.url).indexOf("https://localhost/callback") == 0) {
    			var requestToken = (event.url).split("code=")[1];
				
    			ref.close();
				/*
    			ref = window.open('http://us.battle.net/sc2/en/profile/friends', '_blank', 'location=no');
    			ref.addEventListener('loadstart', function (event) {
    				if ((event.url).indexOf("https://localhost/callback") == 0) {

    				}
    			});
				*/
    			postTokenRequest('https://us.battle.net/oauth/token', 'grant_type=authorization_code&code=' + requestToken + '&redirect_uri=https://localhost/callback&scope=' + scope, WinJS.Application.clientId, WinJS.Application.secret).then(function (results) {
    				var token = results.access_token;
    				var profileUrl = 'https://us.api.battle.net/sc2/profile/user?locale=en_US&access_token=' + token;
    				loadResourceAsync(profileUrl).then(function (profile) {
    					var profilePath = profile.characters[0].profilePath;
    					
    					loadProfile(profilePath, WinJS.Application.Data);
    				});
    			});
    		}
    	});
    };
} )();
