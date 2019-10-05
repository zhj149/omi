!function() {
    'use strict';
    function obaa(target, arr, callback) {
        var eventPropArr = [];
        if (isArray(target)) {
            if (0 === target.length) target.S = {
                T: target,
                U: '#'
            };
            mock(target, target);
        }
        for (var prop in target) if (target.hasOwnProperty(prop)) if (callback) {
            if (isArray(arr) && isInArray(arr, prop)) {
                eventPropArr.push(prop);
                watch(target, prop, null, target);
            } else if (isString(arr) && prop === arr) {
                eventPropArr.push(prop);
                watch(target, prop, null, target);
            }
        } else {
            eventPropArr.push(prop);
            watch(target, prop, null, target);
        }
        if (!target.V) target.V = [];
        var propChanged = callback ? callback : arr;
        target.V.push({
            all: !callback,
            propChanged: propChanged,
            eventPropArr: eventPropArr
        });
    }
    function mock(target, root) {
        methods.forEach(function(item) {
            target[item] = function() {
                var old = Array.prototype.slice.call(this, 0);
                var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
                if (new RegExp('\\b' + item + '\\b').test(triggerStr)) {
                    for (var cprop in this) if (this.hasOwnProperty(cprop) && !isFunction(this[cprop])) watch(this, cprop, this.S.U, root);
                    onPropertyChanged('Array-' + item, this, old, this, this.S.U, root);
                }
                return result;
            };
            target['pure' + item.substring(0, 1).toUpperCase() + item.substring(1)] = function() {
                return Array.prototype[item].apply(this, Array.prototype.slice.call(arguments));
            };
        });
    }
    function watch(target, prop, path, root) {
        if ('__o_' !== prop) if (!isFunction(target[prop])) {
            if (!target.S) target.S = {
                T: root
            };
            if (void 0 !== path && null !== path) target.S.U = path; else target.S.U = '#';
            var currentValue = target.S[prop] = target[prop];
            if ('object' == typeof currentValue) {
                if (isArray(currentValue)) {
                    mock(currentValue, root);
                    if (0 === currentValue.length) {
                        if (!currentValue.S) currentValue.S = {};
                        if (void 0 !== path && null !== path) currentValue.S.U = path + '-' + prop; else currentValue.S.U = '#-' + prop;
                    }
                }
                for (var cprop in currentValue) if (currentValue.hasOwnProperty(cprop)) watch(currentValue, cprop, target.S.U + '-' + prop, root);
            }
        }
    }
    function onPropertyChanged(prop, value, oldValue, target, path, root) {
        if (value !== oldValue && (!nan(value) || !nan(oldValue)) && root.V) {
            var rootName = getRootName(prop, path);
            for (var i = 0, len = root.V.length; i < len; i++) {
                var handler = root.V[i];
                if (handler.all || isInArray(handler.eventPropArr, rootName) || 0 === rootName.indexOf('Array-')) handler.propChanged.call(target, prop, value, oldValue, path);
            }
        }
        if (0 !== prop.indexOf('Array-') && 'object' == typeof value) watch(target, prop, target.S.U, root);
    }
    function isFunction(obj) {
        return '[object Function]' === Object.prototype.toString.call(obj);
    }
    function nan(value) {
        return 'number' == typeof value && isNaN(value);
    }
    function isArray(obj) {
        return '[object Array]' === Object.prototype.toString.call(obj);
    }
    function isString(obj) {
        return 'string' == typeof obj;
    }
    function isInArray(arr, item) {
        for (var i = arr.length; --i > -1; ) if (item === arr[i]) return !0;
        return !1;
    }
    function getRootName(prop, path) {
        if ('#' === path) return prop; else return path.split('-')[1];
    }
    function getPath(obj) {
        if ('[object Array]' === Object.prototype.toString.call(obj)) {
            var result = {};
            obj.forEach(function(item) {
                if ('string' == typeof item) result[item] = !0; else {
                    var tempPath = item[Object.keys(item)[0]];
                    if ('string' == typeof tempPath) result[tempPath] = !0; else if ('string' == typeof tempPath[0]) result[tempPath[0]] = !0; else tempPath[0].forEach(function(path) {
                        return result[path] = !0;
                    });
                }
            });
            return result;
        }
        return getUpdatePath(obj);
    }
    function getUpdatePath(data) {
        var result = {};
        dataToPath(data, result);
        return result;
    }
    function dataToPath(data, result) {
        Object.keys(data).forEach(function(key) {
            result[key] = !0;
            var type = Object.prototype.toString.call(data[key]);
            if ('[object Object]' === type) _objToPath(data[key], key, result); else if ('[object Array]' === type) _arrayToPath(data[key], key, result);
        });
    }
    function _objToPath(data, path, result) {
        Object.keys(data).forEach(function(key) {
            result[path + '.' + key] = !0;
            delete result[path];
            var type = Object.prototype.toString.call(data[key]);
            if ('[object Object]' === type) _objToPath(data[key], path + '.' + key, result); else if ('[object Array]' === type) _arrayToPath(data[key], path + '.' + key, result);
        });
    }
    function _arrayToPath(data, path, result) {
        data.forEach(function(item, index) {
            result[path + '[' + index + ']'] = !0;
            delete result[path];
            var type = Object.prototype.toString.call(item);
            if ('[object Object]' === type) _objToPath(item, path + '[' + index + ']', result); else if ('[object Array]' === type) _arrayToPath(item, path + '[' + index + ']', result);
        });
    }
    function needUpdate(diffResult, updatePath) {
        for (var keyA in diffResult) {
            if (updatePath[keyA]) return !0;
            for (var keyB in updatePath) if (includePath(keyA, keyB)) return !0;
        }
        return !1;
    }
    function includePath(pathA, pathB) {
        if (0 === pathA.indexOf(pathB)) {
            var next = pathA.substr(pathB.length, 1);
            if ('[' === next || '.' === next) return !0;
        }
        return !1;
    }
    function fixPath(path) {
        var mpPath = '';
        var arr = path.replace('#-', '').split('-');
        arr.forEach(function(item, index) {
            if (index) if (isNaN(Number(item))) mpPath += '.' + item; else mpPath += '[' + item + ']'; else mpPath += item;
        });
        return mpPath;
    }
    function $(options) {
        var beforeCreate = options.beforeCreate;
        var destroyed = options.destroyed;
        var use = options.use;
        var useSelf = options.useSelf;
        options.computed = options.computed || {};
        if (options.store) {
            store = options.store;
            obaa(store.data, function(prop, val, old, path) {
                var patch = {};
                patch[fixPath(path + '-' + prop)] = !0;
                components.forEach(function(component) {
                    if (component.W && needUpdate(patch, component.W)) recUpdate(component);
                });
                updateSelfComponents.forEach(function(component) {
                    if (component.Y && needUpdate(patch, component.Y)) component.$forceUpdate();
                });
            });
        }
        options.beforeCreate = function() {
            this.$store = store;
            if (use) {
                this.W = getPath(use);
                components.push(this);
            }
            if (useSelf) {
                this.Y = getPath(useSelf);
                updateSelfComponents.push(this);
            }
            beforeCreate && beforeCreate.apply(this, arguments);
        };
        options.destroyed = function() {
            for (var i = 0, len = components.length; i < len; i++) if (components[i] === this) {
                components.splice(i, 1);
                break;
            }
            destroyed && destroyed.apply(this, arguments);
        };
        options.computed.state = function() {
            return this.$store.data;
        };
        options.computed.store = function() {
            return this.$store;
        };
        return options;
    }
    function recUpdate(root) {
        root.$forceUpdate();
        root.$children.forEach(function(child) {
            recUpdate(child);
        });
    }
    var triggerStr = [ 'concat', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'size' ].join(',');
    var methods = [ 'concat', 'copyWithin', 'entries', 'every', 'fill', 'filter', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'pop', 'push', 'reduce', 'reduceRight', 'reverse', 'shift', 'slice', 'some', 'sort', 'splice', 'toLocaleString', 'toString', 'unshift', 'values', 'size' ];
    obaa.add = function(obj, prop) {
        watch(obj, prop, obj.S.U, obj.S.T);
    };
    obaa.set = function(obj, prop, value) {
        watch(obj, prop, obj.S.U, obj.S.T);
        obj[prop] = value;
    };
    Array.prototype.size = function(length) {
        this.length = length;
    };
    var components = [];
    var updateSelfComponents = [];
    var store;
    var Omiv = {
        $: $
    };
    if ('undefined' != typeof module) module.exports = Omiv; else self.Omiv = Omiv;
}();
//# sourceMappingURL=omiv.js.map