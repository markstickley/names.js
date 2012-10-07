// If there is no support for AMD or requirejs, add a run-once function to load
//   the module.
if(typeof define === 'undefined') {
    define = function(callback) {
        callback();
        define = undefined;
    };
}

/**
    @module names.js
*/
define(function() {

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        FN_ARG_SPLIT = /,/,
        FN_ARG = /^\s*(.+?)\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    /**
        Takes a function and returns an array containing the names of the function's
          arguments in the correct order
        @param {function} func The function
        @returns {array} The names of the function's arguments
    */
    function getArgsFromFunction(func) {
        var functionText, argDeclaration, declaredArgs, matches, i,
            args = [];

        if (typeof func === 'function') {

            func.__namesArgs = func.__namesArgs || {};

            if(!func.__namesArgs.args) {

                functionText = func.toString().replace(STRIP_COMMENTS, '');
                argDeclaration = functionText.match(FN_ARGS)[1];
                declaredArgs = argDeclaration.split(FN_ARG_SPLIT);

                for(i = 0; i < declaredArgs.length; i++) {

                    matches = declaredArgs[i].match(FN_ARG);

                    if(matches !== null) {
                        args.push(matches[1]);
                    }

                }

                func.__namesArgs.args = args;

            }

            return func.__namesArgs.args;

        }
        else {
            throw new Error('getArgsFromFunction: func must be a function');
        }

    }

    /**
        Works like function.apply except you apply an object and the items
          are indexed with the name of the arguments of the function to which
          they are applied.
        @param {object} scope The scope in which the function should be run
        @param {object} args The arguments to be applied to the function
        @returns {mixed} Whatever the function returns
    */
    Function.prototype.applyNamed = function(scope, namedArgs) {

        var i,
            appliedArgs = [],
            functionArgs = getArgsFromFunction(this);

        for(i = 0; i < functionArgs.length; i++) {
            if(namedArgs.hasOwnProperty(functionArgs[i])) {
                appliedArgs.push(namedArgs[functionArgs[i]]);
            }
            else if(this.__namesArgs && this.__namesArgs.defaults &&
              this.__namesArgs.defaults.hasOwnProperty(functionArgs[i])) {
                appliedArgs.push(this.__namesArgs.defaults[functionArgs[i]]);
            }
            else {
                appliedArgs.push(null);
            }
        }

        return this.apply(scope, appliedArgs);

    };

});