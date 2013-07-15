// Quack.js in require.js flavour. Feel free to modify!

define(function() {


    /**
     * Create a new class.
     */
    function createClass(parentClass, interfaces, methods, allowAbstract) {
        var c;
        if (!parentClass) {
            console.error("Parent class not defined");
        }
        
        if (typeof methods.constructor === 'function') {
            c = function () {
                methods.constructor.apply(this, arguments);
                this.getClass = function() {
                    return c;
                }
            }
        } else if (typeof parentClass.constructor === 'function') {
            c = function () {
                parentClass.constructor.apply(this, arguments);
                this.getClass = function() {
                    return c;
                }
            }
        } else {
            console.error("quack class must contain some base implementation. QUACK internal error.");
            c = function () {};
            this.getClass = function() {
                return c;
            }
        }
        
        linkPrototypeChain(parentClass, c);
        addMethods(parentClass, interfaces, methods, c);
        
        if (c.isAbstract()) {
            if (allowAbstract) {
                var abstractClass = c;
                c = function () {
                    console.error("Trying to instantiate abstract class. ");
                    console.error(abstractClass.prototype);
                }
                // Javascript has no way to change implementation of a function
                // without erasing its methods, so we have to add these again.
                linkPrototypeChain(parentClass, c);
                addMethods(parentClass, interfaces, methods, c);

            } else {
                console.error("Class contains abstract methods " + listAbstractMethods(c) + " , but not declared abstract. Use QUACK.createAbstractClass or implement abstract methods.");
                throw "error";
                return null;
            }
        }

        return c;
    }


    /**
     * List abstract methods.
     */
    function listAbstractMethods(c) {
        var str = "";
        if (c.isAbstract()) {
            str += "'";
            str += Object.keys(c.abstractMethods).join("', '");
            str += "'";
            return str;
        } else {
            return "";
        }
    }


    /**
     * Link prototype chain (to make instanceof operator work).
     */
    function linkPrototypeChain(parent, child) {
        child.prototype = Object.create(parent.prototype);
        child.subclasses = [];
        if (!parent.subclasses) parent.subclasses = [];
        parent.subclasses.push(child);
    }


    /**
     * Add implementation and interface from parent, interfaces and the
     * set of methods specified in 'implementation' to the class 'c'.
     */
    function addMethods(parent, interfaces, implementation, c) {
        c.abstractMethods = {};
        
        inheritClassMethods(parent, c);

        interfaces.forEach(function (i) {
            inheritInterfaceMethods(i, c);
        });
        
        
        addImplementation(implementation, c);
    }


    /**
     * Copy methods from class 'parent' to class 'child'
     */
    function inheritClassMethods(parent, child) {
        Object.keys(parent.prototype).forEach(function (k) {
            
            var method = parent.prototype[k];
            if (method instanceof AbstractMethod) {
                child.abstractMethods[k] = true;
            }
            child[k] = child.prototype[k] = method;
        });
    }


    /**
     * Copy interface methods from interface 'parent' to class 'child' (all methods must be abstract)
     */
    function inheritInterfaceMethods(parent, child) {
        Object.keys(parent).forEach(function (k) {
            var method = parent[k];
            if (method instanceof AbstractMethod) {
                child.abstractMethods[k] = true;
                child[k] = child.prototype[k] = method;
            } else {
                console.error();
                throw "interfaces cannot contain implementation!";
            }
        });
    }


    /**
     * Add implementation of methods from map 'implementation' to class 'c'
     */
    function addImplementation(implementation, c) {
        Object.keys(implementation).forEach(function (k) {
            var method = implementation[k];
            if (method instanceof AbstractMethod) {
                c.abstractMethods[k] = true;
            }

            c[k] = c.prototype[k] = method;
            if (c.abstractMethods[k] && !(method instanceof AbstractMethod)) {
                delete c.abstractMethods[k];
            }
        });
    }

    
    var AbstractMethod = function() {};
    var Ancestor = function() {};

    Ancestor.prototype = {
        isAbstract: function() {
            return Object.keys(this.abstractMethods).length > 0;
        }
    }


    return {
        Ancestor: Ancestor,

        AbstractMethod: AbstractMethod,


        toArray: function(pseudoArray) {
            var a = new Array(pseudoArray.length),
                n = pseudoArray.length,
                i;

            for (i = 0; i < n; i++) {
                a[i] = pseudoArray[i];
            }
            return a;
        },

        createClass: function () {
            var args, parentClass, interfaces, implementation;
            args = this.toArray(arguments);
            
            var className = args[0];
            var exports = args[1];

            if (args.length > 2) {
                parentClass = args[0];
                interfaces = args[1];
                implementation = args[2];
            } else if (args.length === 2) {
                parentClass = args[0];
                interfaces = [];
                implementation = args[1];
            } else {
                parentClass = Ancestor;
                interfaces = [];
                implementation = args[0];
            }

            return createClass(parentClass, interfaces, implementation, false);
        }, 

        createAbstractClass: function () {
            var args, parentClass, interfaces, implementation;
            args = this.toArray(arguments);
            
            if (args.length > 2) {
                parentClass = args[0];
                interfaces = args[1];
                implementation = args[2];
            } else if (args.length === 2) {
                parentClass = args[0];
                interfaces = [];
                implementation = args[1];
            } else {
                parentClass = Ancestor;
                interfaces = [];
                implementation = args[0];
            }

            return createClass(parentClass, interfaces, implementation, true);

        },


        createInterface: function () {
            var args = this.toArray(arguments);
            var abstractMethods = {};
            args.forEach(function (v) {
                abstractMethods[v] = new AbstractMethod();
            });

            return abstractMethods;
        }, 


        patch: function (c, methods) {
            addImplementation(methods, c);
            var scope = this;
            c.subclasses.forEach(function (v, k) {
                scope.patch(v, methods);
            });
        }
    }
    
});
