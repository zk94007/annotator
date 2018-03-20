var hypothesis = {
    storageKey: function () {
        // TODO: if hypothesis changes how it stores the data, this won't work anymore
        var apiDomain = new URL(window.hypothesisConfig().services[0].apiUrl).hostname;
        apiDomain = apiDomain.replace(/\./g, '%2E');
        return `hypothesis.oauth.${apiDomain}.token`;
    }
}

$('document').ready(function () {
    var clientID = window.hypothesisConfig().oauthClientId;
    var webAuth = new auth0.WebAuth({
        domain: 'linalgo.eu.auth0.com',
        clientID: clientID,
        responseType: 'token id_token',
        audience: 'https://linalgo.eu.auth0.com/userinfo',
        scope: 'openid profile',
        redirectUri: window.location.href
    });
    function handleAuthentication(cb) {
        webAuth.parseHash(function (err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                setSession(authResult);
            } else if (err) {
                console.log(err);
                alert(
                    'Error: ' + err.error + '. Check the console for further details.'
                );
            }
            cb();
        });
    }

    function setSession(authResult) {
        // Set the time that the access token will expire at
        var expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 + new Date().getTime()
        );
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        localStorage.setItem(hypothesis.storageKey(), JSON.stringify({
            accessToken: authResult.idToken,
            refreshToken: "", // This won't be needed
            expiresAt: JSON.parse(expiresAt)
        }));
    }

    function logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem(hypothesis.storageKey())
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
    }

    function isAuthenticated() {
        var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }
    function ensureAuthenticated () {
        if (!isAuthenticated()) {
            webAuth.authorize();
        } else {
            var queryParams = window.location.search.slice(1).split('&').reduce(function(res, e) {
                var x = e.split('=');
                res[x[0]] = x[1];
                return res;
            }, {});
            if (queryParams.popup) {
                window.opener.location.reload();
                window.close();
            }
        }
    }
    handleAuthentication(function () {
        ensureAuthenticated();
    })
});
