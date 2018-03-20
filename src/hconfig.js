var staticUrl = '__ASSET_ROOT__'
var apiUrl = '__API_URL__'
var domain = '__API_DOMAIN__'
var oauthClientId = '__AUTH0_CLIENT_ID__'
var handlers = {
  highlight: function () {
    // This special type doesn't open the sidebar
  },
  comment: function (cb) {
    if (this.isNew()) {
      this.annotation.display_options.edit = true
    }
    cb()
  },
  translate: function ($http, cb) {
    var self = this
    if (self.isNew()) {
      // Added translate API to show word translation
      return $http.post('http://api.linalgo.com/v0/gtranslate', {
        'q': self.quote(),
        'source': 'en',
        'target': 'fr',
        'format': 'text'
      }).then(function (response) {
        self.annotation.text = response.data.translatedText
        cb()
      }).catch(function (err) {
        cb(error)
      })
    }else {
      cb()
    }
  },
  replace: function (cb) {
    // This special type strokes the text and print the replacement afterwards
    if (this.isNew()) {
      this.annotation.display_options.edit = true
    }
    cb()
  },
  question: function (cb) {
    if (this.isNew()) {
      this.annotation.display_options.edit = true
    }
    cb()
  }
}

window.hypothesisConfig = function () {
  return {
    'auth0': true,
    'oauthClientId': oauthClientId,
    'oauthEnabled': true,
    'assetRoot': staticUrl,
    'serviceUrl': apiUrl + 'api/',
    'oauthEndpoint': staticUrl + 'oauth_authenticator.html',
    'handlers': handlers,
    'services': [{
      'apiUrl': apiUrl + 'api/',
      'authority': domain
    }]
  }
}

document.getElementsByClassName('js-hypothesis-config')[0].innerHTML = JSON.stringify(window.hypothesisConfig());