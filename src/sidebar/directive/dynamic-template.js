'use strict';

var getTemplateUrl = function(name) {
  var templateName = 'annotation-' + name + '.html';
  return 'templates/' + templateName;
}

module.exports = ["$http", "$templateCache", "$compile", "$parse", "settings", function($http, $templateCache, $compile, $parse, settings) {
  return {
    restrict: 'E',
    link: function(scope , iElement, iAttrs) {
      var name = $parse(iAttrs.name)(scope);
      var url = settings.assetRoot + getTemplateUrl(name);
      var cb = function(response){
        var tplContent = response.data;
        iElement.replaceWith($compile(tplContent)(scope));
      };
      $http({url: url, method: "GET", headers: {Authorization: undefined}}, {cache: $templateCache}).then(cb, function(error) {
        return $http({url: settings.assetRoot + getTemplateUrl('default'), method: "GET", headers: {Authorization: undefined}},
                     {cache: $templateCache}).then(cb);
      });
    }
  }
}];
