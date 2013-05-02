module.exports = (function () {
    'use strict';

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
    * init: function () { <---- 'constructor'
    * ...
    * }
    * });
    * createClass(Parent, {
    * foo: function () {
    * ...
    * }
    * });
    */

    $.createClass = function () {

        var args = $.toArray(arguments), Parent, implementation, C;

        if (args.length > 1) {
            Parent = args[0];
            implementation = args[1];
        } else {
            Parent = function () {};
            implementation = args[0];
        }

        // default constructor
        C = function () {};

        if (typeof implementation.init === 'function') {
            C = function () {
                // use new constructor implemention
                implementation.init.apply(this, arguments);
            };
        } else if (typeof Parent.init === 'function') {
            C = function () {
                // inherit constructor from parent
                Parent.init.apply(this, arguments);
            };
        }

        C.prototype = Object.create(Parent.prototype);
        

        // Inherit from parent
        Object.keys(Parent).forEach(function (k) {
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
