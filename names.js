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
          arguments in the correct order. Inspired by and adapted from AngularJS'
          dependency injection (http://angularjs.org/)
        @param {function} func The function
        @returns {array} The names of the function's arguments
    */
    function getArgNamesFromFunction(func) {
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
            throw new Error('getArgNamesFromFunction: func must be a function');
        }

    }


    /**
        Determines whether an argument is of the correct type
        @param {object} args An object of arguments
        @param {object} types An object containing the types of the args
        @param {string} name The argument name to check
    */
    function passesTypeCheck(args, types, name) {
        if(!name) {
            throw new Error('passesTypeCheck: name is required');
        }

        if(
          (!args || !args[name]) &&
          types &&
          types[name]
        ) {
            throw new Error('passesTypeCheck: argument "'+name+'" is required');
        }

        if(!types || !types[name]) {
            return true;
        }
        else if(args && args[name]) {
            if(typeof types[name] === 'string' &&
              typeof args[name] === types[name]) {
                return true;
            }

            if(typeof types[name] === 'function' &&
              args[name] instanceof types[name]) {
                return true;
            }

        }

        return false;
    }


    /**
        Determines whether an argument passes its validation
        @param {object} args An object of arguments
        @param {object} validation An object containing validation for the args
        @param {string} name The argument name to check
    */
    function passesValidation(args, validation, name) {
        if(!name) {
            throw new Error('passesValidation: name is required');
        }

        if(!args || args[name] === undefined) {
            if(validation && validation[name] && validation[name].required) {
                throw new Error('passesValidation: argument "'+name+'" is required');
            }
            else {
                return true;
            }
        }
        else {
            if(!validation || !validation[name] || !validation[name].test) {
                return true;
            }
            else {
                if(typeof validation[name].test === 'function') {
                    return validation[name].test(args[name]);
                }

                if(typeof validation[name].test === 'object' &&
                  !!validation[name].test.test) {
                    return validation[name].test.test(args[name]);
                }

            }
        }

        return false;
    }


    /**
        Takes any number of objects and combines their properties such that the
        last to be specified overwrites previous properties of the same name
        @param {object} * Objects to be combined
        @returns {object} a single object containing the combined properties
    */
    function combine() {
        var i, j, arg,
            combined = {};

        for(i=0; i<arguments.length; i++) {
            arg = arguments[i];
            for(j in arg) {
                if(arg.hasOwnProperty(j)) {
                    combined[j] = arg[j];
                }
            }
        }

        return combined;
    }


    /**
        Works like function.apply except you apply an object and the items
          are indexed with the name of the arguments of the function to which
          they are applied.
        @param {object} scope The scope in which the function should be run
        @param {object} namedArgs The arguments to be applied to the function
        @returns {mixed} Whatever the function returns
    */
    Function.prototype.applyNamed = function(scope, namedArgs) {

        var i, argument, name, args,
            argsToApply = [],
            argNames = getArgNamesFromFunction(this);

        args = combine(
          (this.__namesArgs && this.__namesArgs.defaults)?this.__namesArgs.defaults:{},
          namedArgs
        );

        for(i = 0; i < argNames.length; i++) {
            name = argNames[i];
            argument = args[name];

            if(passesTypeCheck(args, this.__namesArgs.types, name)) {
                if(passesValidation(args, this.__namesArgs.validation, name)) {
                    argsToApply.push(argument || null);
                }
                else {
                    throw new Error('applyNamed: '+args[name]+' is not valid');
                }
            }
            else {
                throw new Error('applyNamed: '+args[name]+
                  ' is not of type '+this.__namesArgs.types[name]);
            }
        }

        return this.apply(scope, argsToApply);

    };

});