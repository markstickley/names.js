// If there is no support for AMD or requirejs, add a run-once function to load
//   the module.
if(typeof define === 'undefined') {
    define = function(deps, callback) {
        callback();
        define = undefined;
    };
}

define(['names'], function() {

    describe("names.js", function() {

        it("adds 'applyNamed' to Function's prototype", function() {
            var test = function() {};
            expect(typeof test.applyNamed).toBe('function');
        });

    });

    describe("Function#applyNamed", function() {

        function testScope() {
            return this;
        }

        function testArgs(foo, bar, baz) {
            return {
                foo: foo,
                bar: bar,
                baz: baz
            };
        }

        function testNameArgsArgs(foo, bar, baz) {
            return {
                foo: foo,
                bar: bar,
                baz: baz
            };
        }
        testNameArgsArgs.__names = {
            args: ['bar', 'foo', 'baz']
        };

        function testNameArgsDefaults(foo, bar, baz, bat) {
            return {
                foo: foo,
                bar: bar,
                baz: baz,
                bat: bat
            };
        }
        testNameArgsDefaults.__names = {
            defaults: {
                foo: 'ooze',
                baz: 'banjo'
            }
        };

        function testNameArgsTypes(foo, bar, baz, bat) {
            return {
                foo: foo,
                bar: bar,
                baz: baz,
                bat: bat
            };
        }
        testNameArgsTypes.__names = {
            types: {
                foo: 'function',
                bar: 'string',
                baz: 'number',
                bat: 'object'
            }
        };

        function testNameArgsValidation(foo, bar, baz, bat) {
            return {
                foo: foo,
                bar: bar,
                baz: baz,
                bat: bat
            };
        }
        testNameArgsValidation.__names = {
            validation: {
                foo: {
                    test: function(arg) {
                        return (arg < 50);
                    }
                },
                bar: {
                    test: /^[a-z]+$/
                },
                baz: {
                    test: function(arg) {
                        return !arg;
                    },
                    required: true
                },
                bat: {
                    test: /^.*burg$/,
                    required: false
                }
            }
        };

        it("uses the first argument as the scope if it is an object",
          function() {

            var returnedScope,
                scope = {
                    pudding: 'proof'
                };

            returnedScope = testScope.applyNamed(scope, {test:0});

            expect(returnedScope.pudding).toBe('proof');

          });

        it("uses Window as the scope if the scope is not specified",
          function() {

            var returnedScope = testScope.applyNamed(null, {test:0});

            expect(returnedScope).toBe(window);

          });

        it("applies the arguments to the function in the order specified in the " +
          "function definition, irrespective of the order defined in the arguments " +
          "object", function() {

            // test for some different argument positions
            returnedArgs = testArgs.applyNamed(null, {
                foo: '1test',
                baz: '2test',
                bar: '3test'
            });

            expect(returnedArgs.foo).toBe('1test');
            expect(returnedArgs.bar).toBe('3test');
            expect(returnedArgs.baz).toBe('2test');

            // test for completely different argument positions
            var returnedArgs = testArgs.applyNamed(null, {
                baz: 'test1',
                foo: 'test2',
                bar: 'test3'
            });
            expect(returnedArgs.foo).toBe('test2');
            expect(returnedArgs.bar).toBe('test3');
            expect(returnedArgs.baz).toBe('test1');

          });

        it("applies null to any missing arguments and applies the remaining arguments " +
          " to the correct argument as specified in the function definition",
          function() {

            var returnedArgs = testArgs.applyNamed(null, {
                baz: 'test1',
                foo: 'test2'
            });
            expect(returnedArgs.foo).toBe('test2');
            expect(returnedArgs.bar).toBe(null);
            expect(returnedArgs.baz).toBe('test1');

        });

        it("uses property '__names.args' to define argument order and " +
              "override automatic detection", function() {

            var returnedArgs = testNameArgsArgs.applyNamed(null, {
                foo: 'test1',
                bar: 'test2',
                baz: 'test3'
            });
            expect(returnedArgs.foo).toBe('test2'); // because it's switched in __names.args
            expect(returnedArgs.bar).toBe('test1');
            expect(returnedArgs.baz).toBe('test3');

        });

        it("uses property '__names.defaults' to provide default values " +
              " to missing arguments", function() {

            var returnedArgs = testNameArgsDefaults.applyNamed(null, {
                foo: 'flibble',
                bar: 'bonce'
            });
            expect(returnedArgs.foo).toBe('flibble'); // default + defined
            expect(returnedArgs.bar).toBe('bonce'); // no default + defined
            expect(returnedArgs.baz).toBe('banjo'); // default + undefined
            expect(returnedArgs.bat).toBe(null); // no default + undefined

        });

        it("type-checks arguments using property '__names.types' and throws on type mismatches", function() {
            expect(function() {
                testNameArgsTypes.applyNamed(null, {
                    foo: function() {},
                    bar: 'hello world',
                    baz: 42,
                    bat: {}
                });
            }).not.toThrow();

            expect(function() {
                testNameArgsTypes.applyNamed(null, {
                    foo: 'flibble',
                    bar: 'hello world',
                    baz: 42,
                    bat: {}
                });
            }).toThrow();

            expect(function() {
                testNameArgsTypes.applyNamed(null, {
                    foo: function() {},
                    bar: 0.113,
                    baz: 42,
                    bat: {}
                });
            }).toThrow();

            expect(function() {
                testNameArgsTypes.applyNamed(null, {
                    foo: function() {},
                    bar: 'hello world',
                    baz: 'banang',
                    bat: {}
                });
            }).toThrow();

            expect(function() {
                    testNameArgsTypes.applyNamed(null, {
                    foo: function() {},
                    bar: 'hello world',
                    baz: 42,
                    bat: 'hoopla'
                });
            }).toThrow();

        });

        describe('uses function "passesTypeCheck" and', function() {

            function TestObject(){}

            function testNameArgsType(foo, bar, baz) {
                return {
                    foo: foo,
                    bar: bar,
                    baz: baz
                };
            }

            beforeEach(function() {
                testNameArgsType.__names = {};
            });

            it("should throw when '__names.types' mentions a value that is not specified and there is no default", function() {
                var testFunction;

                testNameArgsType.__names.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        baz: 42
                    });
                };

                expect(testFunction).toThrow();
            });

            it("should throw when '__names.types' mentions a value that is not specified and there is an invalid default", function() {
                var testFunction;

                testNameArgsType.__names.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testNameArgsType.__names.defaults = { bar: 'flibble' };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        baz: 42
                    });
                };

                expect(testFunction).toThrow();
            });

            it("shouldn't throw when '__names.types' mentions a value that is not specified but there is a valid default", function() {
                var testFunction;

                testNameArgsType.__names.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testNameArgsType.__names.defaults = { bar: new TestObject() };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        baz: 42
                    });
                };

                expect(testFunction).not.toThrow();
            });

            it("can accept string values in '__names.types' for typeof comparisons, and function values for instanceof comparisons", function() {
                var testFunction;

                testNameArgsType.__names.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        bar: new TestObject(),
                        baz: 42
                    });
                };
                testFunction2 = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        bar: 'whoop',
                        baz: 42
                    });
                };
                testFunction3 = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: 'whoop',
                        bar: new TestObject(),
                        baz: 42
                    });
                };
                testFunction4 = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: 'whoop',
                        bar: new TestObject(),
                        baz: new TestObject()
                    });
                };

                expect(testFunction).not.toThrow();
                expect(testFunction2).toThrow();
                expect(testFunction3).toThrow();
                expect(testFunction4).toThrow();
            });

        });


        it("uses property '__names.validation' to validate arguments", function() {
            expect(function() {
                testNameArgsValidation.applyNamed(null, {
                    foo: 49,
                    bar: 'hello',
                    baz: 0
                });
            }).not.toThrow();
        });

        describe('uses function "passesValidation" and', function() {

            it("should not throw when all arguments are valid", function() {
                expect(function() {
                    testNameArgsValidation.applyNamed(null, {
                        foo: 49,
                        bar: 'hello',
                        baz: 0,
                        bat: 'battenburg'
                    });
                }).not.toThrow();
            });

            it("should throw if one or more tests fail", function() {
                expect(function() {
                    testNameArgsValidation.applyNamed(null, {
                        foo: 51,
                        bar: 'hello',
                        baz: 0,
                        bat: 'duckburg'
                    });
                }).toThrow();
            });

            it("should not throw if an argument is undefined, even if the test fails", function() {
                expect(function() {
                    testNameArgsValidation.applyNamed(null, {
                        bar: 'hello',
                        baz: 0,
                        bat: 'hamburg'
                    });
                }).not.toThrow();
            });

            it("should throw if an argument is undefined, the test fails and the test is marked as required", function() {
                expect(function() {
                    testNameArgsValidation.applyNamed(null, {
                        foo: 49,
                        bar: 'hello',
                        bat: 'iceburg'
                    });
                }).toThrow();
            });

        });

    });

    describe('Function#addValidation', function() {

        it('should add validation to the __names property of the function', function() {
            var testFunction = function(arg1) {},
                validation = function(){return true;};
            testFunction.__names = {
                args: ['arg1']
            };

            testFunction.addValidation({
                arg1: {
                    test: validation
                }
            });

            expect(testFunction.__names.validation.arg1.test).toBe(validation);
        });

        it('should also work with applyNamed', function() {
            var testFunction = function(arg1) {},
                validation = function(){return true;};
            testFunction.__names = {
                args: ['arg1']
            };

            testFunction.addValidation.applyNamed(testFunction, {
                validations: {
                    arg1: {
                        test: validation
                    }
                }
            });

            expect(testFunction.__names.validation.arg1.test).toBe(validation);
        });

        it('should throw back errors when using applyNamed and validations are incorrect', function() {
            var testFunction = function(arg1) {},
                validation = function(){return true;};
            testFunction.__names = {
                args: ['arg1']
            };

            expect(function() { testFunction.addValidation.applyNamed(null, {
                validations: {
                    arg1: {
                        test: 42
                    }
                }
            }); }).toThrow();

            expect(function() { testFunction.addValidation.applyNamed(null, {
                validations: {
                    arg1: {
                        test: validation,
                        required: 42
                    }
                }
            }); }).toThrow();

        });

        it('should, if validations already exist, not replace all of them but'+
          ' only validations of the same name', function() {
            var testFunction = function(arg1, arg2) {},
                validation1 = function(){return true;},
                validation2 = function(){return false;},
                validation3 = function(){return 'whatever';};
            testFunction.__names = {
                args: ['arg1', 'arg2']
            };

            testFunction.addValidation({
                arg1: {
                    test: validation1
                },
                arg2: {
                    test: validation2
                }
            });

            expect(testFunction.__names.validation.arg1.test).toBe(validation1);
            expect(testFunction.__names.validation.arg2.test).toBe(validation2);

            testFunction.addValidation({
                arg1: {
                    test: validation3
                }
            });

            expect(testFunction.__names.validation.arg1.test).toBe(validation3);
            expect(testFunction.__names.validation.arg2.test).toBe(validation2);
        });

        it('should create a __names property on the function if it doesn\'t'+
          ' already exist', function() {
            var testFunction = function(arg1) {},
                validation = function(){return true;};

            expect(testFunction.__names).toBe(undefined);

            testFunction.addValidation({
                arg1: {
                    test: validation
                }
            });

            expect(testFunction.__names).not.toBe(undefined);
        });

    });

    describe('Function.createNamed', function() {

        it('should return a function', function() {
            expect(typeof (Function.createNamed({
                args: [['arg1']],
                method: function(arg1) {}
            }))).toBe('function');
        });

        it('should construct a suitable __names object on the function', function() {
            var myFunc = Function.createNamed({
                args: [['arg1', 'string', 'foobar']],
                method: function(arg1) {}
            });

            expect(myFunc.__names).not.toBe(undefined);
            expect(myFunc.__names.args[0]).toBe('arg1');
            expect(myFunc.__names.types.arg1).toBe('string');
            expect(myFunc.__names.defaults.arg1).toBe('foobar');
        });

        it('should throw if the args are incorrect', function() {
            expect(function() { Function.createNamed({
                args: [[42, 'string', 'foobar']], // not a string
                method: function(arg1) {}
            }); }).toThrow();

            expect(function() { Function.createNamed({
                args: [['arg1', 42, 'foobar']], // not a string or a function
                method: function(arg1) {}
            }); }).toThrow();

            expect(function() { Function.createNamed({
                args: [['arg1', 'string', 42]], // not matching the type 'string'
                method: function(arg1) {}
            }); }).toThrow();

        });

        it('should throw if the method is not a function', function() {
            expect(function() { Function.createNamed({
                args: [['arg1', 'string', 'foobar']],
                method: 'I want to be a function, but I\'m just a string :('
            }); }).toThrow();
        });

    });

});