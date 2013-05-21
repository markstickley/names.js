[Quick start](#Quickstart)

[Why?](#Why) | [Get](#About) | [Loading](#Loading)


What is names.js? <a id="About"></a>
-----------------

`names.js` augments the function prototype. Features include:

* Named, unordered arguments
* Default argument values
* Argument type checking
* Argument validation


How to use names.js <a id="Quickstart"></a>
-------------------

### Step 1: Declare

```
var doSomething = Function.createNamed({
    args: [
        ['arg1', 'argumentType', 'defaultValue'],
        ['arg2', 'string', 'defaultValue'], // Eg.
        ['arg3', MyClass, someVar] // or this
    ],
    method: function(arg1, arg2, arg3) {
        ...
    }
});
```

### Step 2: Call

```
doSomething.applyNamed(null, {
    arg1: 42,
    arg2: 'something else',
    arg3: aVariable
});
```

[A more detailed explanation](#Usage)


What problems does it solve? Why bother? <a id="Why"></a>
----------------------------------------

When you call a function, you provide a list of arguments whose purpose is opaque without going to the function definition and reading the argument names. Going with the adage that code is read far more frequently than it is written, it makes sense that it should be clear what role arguments to a function have without having to jump to the function itself. `names.js` solves that problem.

Which is clearer to understand?

```
node.clone(true);
```

or

```
node.clone.applyNamed(node, { deep: true });
```

This call to `swfobject` would be an ideal candidate for `names.js`!

```
swfobject.embedSWF("myContent.swf", "myContent", "300", "120", "9.0.0","expressInstall.swf", { foo: 'bar' }, { hello: 'world' }, { wmode: 'transparent' });
```

In addition to this, `names.js` supports:

* *default values* for arguments, so you don't have to specify them each time for the common usage.
* Argument type checking and simple validation so your functions can focus purely on their task and not worry about incorrect arguments.




Installation <a id="Installation"></a>
------------

You only need `names.js` (or the minified version, `names.min.js`) so you can do one of the following:

* Clone the entire repo as a submodule of your project

```
git submodule add https://github.com/markstickley/names.js.git path/to/clone/to
```
    
* Go to the [project page](https://github.com/markstickley/names.js) and click on `names.js` or `names.min.js` and download to include anywhere in your project

* Or you could click one of the handy links at the top of the page to download the whole lot


Loading <a id="Loading"></a>
-------

`names.js` can be loaded with [requirejs](http://www.requirejs.org) but if you are not using that you can just include it in a script tag.



Usage <a id="Usage"></a>
-----

First set up a function by calling `Function.create`.

```
var myFunction = Function.create(
    [           // The items in this array represent the args of the function
                // They MUST be in the same order as they appear in the function
        [
            'arg_name', // This is how the first argument will be identified when calling applyNamed
                        // It doesn't have to match the name used in the function but it makes sense to.
            'type',     // This can either be the type returned by typeof, a class function.
                        // If you don't want to type check this arg, just leave it out or set to null.
            'default_value' // If provided, this default value will be used when the arg is not provided.
        ],
        ... // repeat the array above for all args
    ],
    function(arg_name, ...) {
        ...
    }
}
);
```

E.g.
```
var divide = Function.create(
    [['dividend','number'],['divisor','number']],
    function(dividend,divisor) {
        return dividend/divisor;
    }
);
```

Optionally, you can add validation for any argument that needs it.

```
myFunction.addValidation({
    arg_name: {
        test: /.*/, // This can be a regex or a function returning true or false
        required: true // If not set to true, if the arg is not provided it is not tested
    },
    ...
});
```

E.g.
```
divide.addValidation({
    dividend: {
        required: true
    },
    divisor: {
        test: function(arg) {
            if(arg === 0) {
                console.log('Cannot divide by 0');
                return false;
            }
        },
        required: true
    }
});
```

Once set up, use `Function.prototype.applyNamed` to call your function. It works just like `Function.prototype.apply` ([docs](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/apply)) except you pass an object as the second value instead of an array. 

E.g.
```
var quotient = divide.applyNamed(null, {
    dividsor: 5,
    dividend: 20
});
```

Further Usage Information <a id="FurtherUsage"></a>
-------------------------

### Omitting an argument sets it to `null`

```
var anyOldFunction = Function.createNamed({
    args: [['arg1'], ['arg2'], ['arg3']],
    method: function(arg1, arg2, arg3) {
        return [arg1, arg2, arg3];
    }
});

anyOldFunction.applyNamed(null, {
    arg3: 'baz',
    arg2: 'foo'
}); // returns [null, 'foo', 'baz']
```


### The __names property

Your function has a property `__names`. You shouldn't need to manually change this, but it's useful to know for debugging. Here is the structure:

```
myFunction.__names = {
    args: {
        ['arg1','arg2'] // The args in order
    },
    types: {
        arg1: 'string',
        arg2: Class
    },
    defaults: {
        arg1: 'default value'
        arg2: classInstance
    },
    validation: {
        arg1: {
            test: /.*/,
            required: true
        },
        arg2: {
            test: function() { return true; }
        }
    }
};
```

### Quick usage

You can use `applyNamed` with any function, not just those created with `createNamed`. *However*, it is only recommended for test or prototype situations as it will not work once the code is minified.

```
// This
myFunc.applyNamed(null, {
    arg1: 'something',
    arg2: 'somethingElse'
});

// Works with this
function myFunc(arg1, arg2) {
    ...
}

// But not this (the same code minified)
function a(b,c){
    ...
}
```