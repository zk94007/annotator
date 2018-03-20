var STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}
module.exports = {
    defaultInjector: {
        annotate: getParamNames,
        invoke: function(args, self, local) {
            var fn = args[args.length - 1];
            var params = args.slice(0, -1);
            var cb = args.indexOf("cb");
            if (cb !== -1) {
                var pargs = Array.apply(null, Array(params.length)).map(function () {});
                pargs[cb] = local.cb;
                fn.apply(self, pargs);
            } else {
                fn.call(self)
            }
        }
    },
    handleType: function(injector, controller, type, cb) {
        var settings = window.hypothesisConfig();
        injector = injector || this.defaultInjector;
        var handler = settings.handlers[type];
        if (handler) {
            console.log("calling handler for type: ", type)
            var params = injector.annotate(handler);
            injector.invoke(params.concat([handler]), controller, {"cb": cb});
            if (params.indexOf("cb") === -1) {
                cb();
            }
        } else {
            console.log("handler not found for type: ", type)
            cb();
        }
    }
}
