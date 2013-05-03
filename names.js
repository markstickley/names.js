// If there is no support for AMD or requirejs, add a run-once function to load
//   the module.
if(typeof define === 'undefined') {
    define = function(callback) {
        callback();
        define = undefined;
    };
}

/**
    While JSDoc notation is used for all the methods, I don't think JSDoc is
    really designed for something like names.js.
    There is fairly comprehensive documentation available at:
        http://namesjs.markstickley.co.uk
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

            func.__names = func.__names || {};

            if(!func.__names.args) {

                functionText = func.toString().replace(STRIP_COMMENTS, '');
                argDeclaration = functionText.match(FN_ARGS)[1];
                declaredArgs = argDeclaration.split(FN_ARG_SPLIT);

                for(i = 0; i < declaredArgs.length; i++) {

                    matches = declaredArgs[i].match(FN_ARG);

                    if(matches !== null) {
                        args.push(matches[1]);
                    }

                }

                func.__names.args = args;

            }

            return func.__names.args;

        }
        else {
            throw new Error('names.js getArgNamesFromFunction: func must be a function');
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
            throw new Error('names.js passesTypeCheck: name is required');
        }

        if(
          (!args || !args[name]) &&
          types &&
          types[name]
        ) {
            throw new Error('names.js passesTypeCheck: argument "'+name+'" is required');
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
            throw new Error('names.js passesValidation: name is required');
        }

        if(!args || args[name] === undefined) {
            if(validation && validation[name] && validation[name].required) {
                throw new Error('names.js passesValidation: argument "'+name+'" is required');
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
        Creates a new function and sets up __names based on the args
        @param {array} args The args to the method, in order.
          Each arg should take the format ['name', type, default]
        @param {function} method The method
        @returns {function} The new function
    */
    function create(args, method) {
        var i, arg;

        if(!(args instanceof Array)) {
            throw new Error('names.js create: args must be an array');
        }

        method.__names = method.__names || {};
        method.__names.args = method.__names.args || [];
        method.__names.types = method.__names.types || {};
        method.__names.defaults = method.__names.defaults || {};

        for(i=0; i<args.length; i++) {
            arg = args[i];

            if(!(arg instanceof Array)) {
                throw new Error('names.js create: all args\' values must be arrays');
            }

            if(typeof arg[0] !== 'string') {
                throw new Error('names.js create: the first value in an arg must'+
                  ' be a string');
            }

            method.__names.args[i] = arg[0];

            // type
            if(typeof arg[1] === 'string' || typeof arg[1] === 'function') {
                method.__names.types[arg[0]] = arg[1];
            }
            else if(arg[1] !== undefined && arg[1] !== null) {
                throw new Error('names.js create: the second value in an arg'+
                  ' must be a string or a Class/function');
            }

            // default
            if(arg[2] !== undefined && arg[2] !== null) {
                if(arg[1] &&
                  passesTypeCheck({test: arg[2]}, {test: arg[1]}, 'test')) {
                    method.__names.defaults[arg[0]] = arg[2];
                }
                else {
                    throw new Error('names.js create: the third value in an arg'+
                      ' must match the type specified by the second value');
                }
            }
        }

        return method;
    }
    create.__names = {
        args: ['args', 'method']
    };


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
          (this.__names && this.__names.defaults)?this.__names.defaults:{},
          namedArgs
        );

        for(i = 0; i < argNames.length; i++) {
            name = argNames[i];
            argument = args[name];

            if(passesTypeCheck(args, this.__names.types, name)) {
                if(passesValidation(args, this.__names.validation, name)) {
                    argsToApply.push(argument || null);
                }
                else {
                    throw new Error('names.js applyNamed: '+args[name]+' is not valid');
                }
            }
            else {
                throw new Error('names.js applyNamed: '+args[name]+
                  ' is not of type '+this.__names.types[name]);
            }
        }

        return this.apply(scope, argsToApply);

    };


    /**
        Calls create with named args
        @param {object} args Object with properties args (array) and
          method (function)
        @returns {function} The constructed function
    */
    Function.createNamed = function(args) {
        return create.applyNamed(null, args);
    };


    /**
        Adds argument validation to the function, which you can't do as part of createNamed
        @param {object} validations Object in the form:
          {
            argName: {
              test: function|regex
              required: boolean (optional)
            }
          }
    */
    Function.prototype.addValidation = Function.createNamed({
        args: [['validations','object']],
        method: function(validations) {
            var i, validation;

            this.__names = this.__names || {};
            this.__names.validation = this.__names.validation || {};

            for(i in validations) {
                validation = validations[i];
                this.__names.validation[i] = validation;
            }
        }
    });
    Function.prototype.addValidation.addValidation({
        validations: {
            test: function(validations) {
                var i, validation;
                for(i in validations) {
                    validation = validations[i];
                    if(!validation.test ||
                      (typeof validation.test !== 'function' &&
                        !(typeof validation.test === 'object' && !!validation.test.test))) {
                        return false;
                    }
                    if(validation.required !== undefined &&
                      typeof validation !== 'boolean') {
                        return false;
                    }
                }

                return true;
            },
            required: true
        }
    });

});