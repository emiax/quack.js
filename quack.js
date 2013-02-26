QUACK = (function () {

    var $ = {};
    
    /**
     * convert an object with a length to an array!
     */

    $.toArray = function (pseudoArray) {
        var a = new Array(pseudoArray.length),
        n = pseudoArray.length,
        i;

        for (i = 0; i < n; i++) {
            a[i] = pseudoArray[i];
        }
        return a;
    }
    
    /**
     * Create class
     * 
     * usage example:
     *
     * createClass({
     *      init: function () { <---- 'constructor'
     *         ...
     *      }
     * });
     * createClass(Parent, {
     *      foo: function () {
     *         ...
     *      }
     * });
     */

    $.createClass = function () {

        var args = $.toArray(arguments), parent, implementation, init;

        if (arguments.length > 1) {
            parent = arguments[0].prototype;
            implementation = arguments[1];
        } else {
            parent = {};
            implementation = arguments[0];
        }

        // default constructor
        var C = function () {};

        if (typeof implementation.init === 'function') {
            C = function () {
                // use new constructor implemention
                implementation.init.apply(this, arguments);
            };
        } else if (typeof parent.init === 'function') {
            C = function () {
                // inherit constructor from parent
                parent.init.apply(this, arguments);
            };
        }

        C.prototype = parent;

        // Inherit from parent
        Object.keys(parent).forEach(function (k) {
            C[k] = C.prototype[k]; // = parent[k];
        });

        // Add own implementation
        Object.keys(implementation).forEach(function (k) {
            C[k] = C.prototype[k] = implementation[k];
        });

        return C;
    };

    return $;

}());
