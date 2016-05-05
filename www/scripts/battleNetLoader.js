function loadResourceAsync(url) {
	return new WinJS.Promise(function (comp, err, prog) {
		var req = new XMLHttpRequest();
		function handler() {
			if (req.readyState == 4) {
				if (req.status == 200) {
					var profileObj = JSON.parse(req.responseText);
					comp(profileObj);
				} else {
				    err(req);
				}
			}
		}

		req.open("GET", url, true);
		req.onreadystatechange = handler;
		req.send();
		prog();
	});
}

function processProfile(profile, achievements, rewards, achievementsJson, rewardsJson) {
	var portrait = document.getElementById('profilePicture');
	portrait.style.width = profile.portrait.w + "px";
	portrait.style.height = profile.portrait.h + "px";
	portrait.style.backgroundImage = "url(" + profile.portrait.url + ")";
	portrait.style.backgroundPositionX = profile.portrait.x + "px";
	portrait.style.backgroundPositionY = profile.portrait.y + "px";

	var portraitBorder = document.getElementById('profileBorder');
	var league = profile.career.league;
	portraitBorder.style.backgroundImage = "url('images/portrait-summary-" + league + ".png')";

	var name = document.getElementById('displayName');
	name.textContent = profile.displayName;
	for (var i = 0; i < profile.rewards.earned.length; i++) {
		var id = profile.rewards.earned[i];
		for (var j = 0; j < rewardsJson.portraits.length; j++) {
			var a = rewardsJson.portraits[j];
			if (a.id == id) {
				rewards.push(
					{
						url: "url(" + a.icon.url + ")",
						w: a.icon.w + "px",
						h: a.icon.h + "px",
						x: a.icon.x + "px",
						y: a.icon.y + "px",
						title: a.title
					});
			}
		}
	}

	for (i = 0; i < profile.achievements.achievements.length; i++) {
		var id = profile.achievements.achievements[i].achievementId;
		for (j = 0; j < achievementsJson.achievements.length; j++) {
			var a = achievementsJson.achievements[j];
			if (a.achievementId == id) {
				achievements.push(
					{
						url: "url(" + a.icon.url + ")",
						w: a.icon.w + "px",
						h: a.icon.h + "px",
						x: a.icon.x + "px",
						y: a.icon.y + "px",
						title: a.title,
						description: a.description
					});
			}
		}
	}
}

function processMatches(matches, games) {
	for (i = 0; i < matches.matches.length; i++) {
		games.push(matches.matches[i]);
	}
}

function loadProfile(profilePath, data) {
	var games = data.games;
	var achievements = data.achievements;
	var rewards = data.rewards;

	var baseUrl = "https://us.api.battle.net/sc2";
	var profileUrl = baseUrl + profilePath;
	var laddersUrl = profileUrl + "ladders";
	var matchesUrl = profileUrl + "matches";
	var achievementsUrl = baseUrl + "/data/achievements";
	var rewardsUrl = baseUrl + "/data/rewards";


	var profileUrlWithKey = profileUrl + "?apikey=" + WinJS.Application.clientId;
	loadResourceAsync(profileUrlWithKey).then(function (profile) {
	    var achievementsUrlWithKey = achievementsUrl + "?apikey=" + WinJS.Application.clientId;
	    loadResourceAsync(achievementsUrlWithKey).then(function (achievementsJson) {
	        var rewardsUrlWithKey = rewardsUrl + "?apikey=" + WinJS.Application.clientId;
			loadResourceAsync(rewardsUrlWithKey).then(function (rewardsJson) {
				processProfile(profile, achievements, rewards, achievementsJson, rewardsJson);
			});
		});
	});
	var matchesUrlWithKey = matchesUrl + "?apikey=" + WinJS.Application.clientId;
	loadResourceAsync(matchesUrlWithKey).then(function (matches) {
		processMatches(matches, games);
	});
}
