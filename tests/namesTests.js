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
        testNameArgsArgs.__namesArgs = {
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
        testNameArgsDefaults.__namesArgs = {
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
        testNameArgsTypes.__namesArgs = {
            types: {
                foo: 'function',
                bar: 'string',
                baz: 'number',
                bat: 'object'
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

        it("uses static property '__namesArgs.args' to define argument order and " +
              "override automatic detection", function() {

            var returnedArgs = testNameArgsArgs.applyNamed(null, {
                foo: 'test1',
                bar: 'test2',
                baz: 'test3'
            });
            expect(returnedArgs.foo).toBe('test2'); // because it's switched in __namesArgs.args
            expect(returnedArgs.bar).toBe('test1');
            expect(returnedArgs.baz).toBe('test3');

        });

        it("uses static property '__namesArgs.defaults' to provide default values " +
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

        it("type-checks arguments using static property '__namesArgs.types' and throws on type mismatches", function() {
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

        describe('uses function #checkType which', function() {

            function TestObject(){}

            function testNameArgsType(foo, bar, baz) {
                return {
                    foo: foo,
                    bar: bar,
                    baz: baz
                };
            }

            beforeEach(function() {
                testNameArgsType.__namesArgs = {};
            });

            it("should throw when '__namesArgs.types' mentions a value that is not specified and there is no default", function() {
                var testFunction;

                testNameArgsType.__namesArgs.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        baz: 42
                    });
                };

                expect(testFunction).toThrow();
            });

            it("should throw when '__namesArgs.types' mentions a value that is not specified and there is an invalid default", function() {
                var testFunction;

                testNameArgsType.__namesArgs.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testNameArgsType.__namesArgs.defaults = { bar: 'flibble' };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        baz: 42
                    });
                };

                expect(testFunction).toThrow();
            });

            it("shouldn't throw when '__namesArgs.types' mentions a value that is not specified but there is a valid default", function() {
                var testFunction;

                testNameArgsType.__namesArgs.types = { foo: 'object', bar: TestObject, baz: 'number' };
                testNameArgsType.__namesArgs.defaults = { bar: new TestObject() };
                testFunction = function() {
                    testNameArgsType.applyNamed(null, {
                        foo: {},
                        baz: 42
                    });
                };

                expect(testFunction).not.toThrow();
            });

            it("can accept string values in '__namesArgs.types' for typeof comparisons, and function values for instanceof comparisons", function() {
                var testFunction;

                testNameArgsType.__namesArgs.types = { foo: 'object', bar: TestObject, baz: 'number' };
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


        xit("uses static property '__namesArgs.validate' to validate arguments", function() { });

    });

});