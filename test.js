(function(){
  var root = typeof self == 'object' && self.self === self && selft || typeof global == 'object' && global.global === global && global || this;
  var previousUnderscore = root._;
  var ArrayProto = Array.prototype,
      ObjProto = Object.prototype;

  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  var Ctor = function(){};

  var _ = function(obj) {
    if(obj instanceof _) return obj;
    if(!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }

  if (typeof exports != 'undefined' && !exports.nodeType) {
    if(typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  _.VERSION = '1.8.3';

//...
//...

//工具函数 Utility
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  _.noop = function(){};

  _.random = function(min,max){
    if(max == null){
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  _.now = Date.now || function(){
    return new Date().getTime();
  };

  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

//...
//...

//Objects 对象
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  _.isNull = function(obj) {
    return obj === null;
  };

  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'],function(name){
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  }

  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  }

  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  }

  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  }

  // var property = function(key) {
  //   return function(obj) {
  //     return obj == null ? void 0 : obj[key];
  //   };
  // };

  var MAX_ARRAY_INDEX = Math.pow(2,53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'Number' && length >= 0 && length <= MAX_ARRAY_INDEX
  }

  _.contains = _.includes = _.include = function(obj,item,fromIndex,guard) {
    if(!isArrayLike(obj)) obj = _.values(obj);
    if(typeof fromIndex != 'Number' || guard) fromIndex = 0;
    return _.indexOf(obj,item,fromIndex) >= 0;
  }

  _.keys = function(obj) {
    if(!_.isObject(obj)) return [];
    if(nativeKeys) return nativeKeys(obj);
    var keys = [];
    for(var key in obj) if(_.has(obj,key)) keys.push(key);
    if(hasEnumBug) collectNonEnumProps(obj,keys);
    return keys;
  }

  _.allKeys = function(obj) {
    if(!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);

    if(hasEnumBug) collectNonEnumProps(obj,keys);
    return keys;
  }

  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i =0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for(var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  }

  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  }

  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if(_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  }

  _.tap = function(obj,interceptor) {
    interceptor(obj);
    return obj;
  };

  _.isMatch = function(object,attrs) {
    var keys = _.keys(attrs),length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for(var i = 0; i < length; i++) {
      var key = keys[i];
      if(attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };

  _.isEmpty = function(obj) {
    if(obj == null) return true;
    if(isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  }

  _.extend = createAssigner(_.allKeys);

  _.extendOwn = _.assign = createAssigner(_.keys);

  var createAssigner = function(keysFunc,defaults) {
    return function(obj) {
      var length = arguments.length;
      if(defaults) obj = Object(obj);
      if(length < 2 || obj == null) return obj;
      for(var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for(var i = 0; i < l; i++) {
          var key = keys[i];
          if(!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  _.create = function(prototype,props) {
    var result = baseCreate(prototype);
    if(props) _.extendOwn(result,props);
    return result;
  }

  var baseCreate = function(prototype) {
    if(!_.isObject(prototype)) return {};
    if(nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  }

  _.clone = function(obj) {
    if(!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  _.property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj(key);
    }
  }

  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({},attrs);
    return function(obj) {
      return _.isMatch(obj,attrs);
    }
  }

  _.iteratee = builtinIteratee = function(value,context) {
    return cb(value,context,Infinity);
  }

  var builtinIteratee;

  var cb = function(value,context,argCount) {
    if(_.iteratee !== builtinIteratee) return _.iteratee(value,context);
    if(value == null) return _.identity;
    if(_.isFunction(value)) return optimizeCb(value,coentext,argCount);
    if(_.isObject(value)) return _.matcher(value);
    return _.property(value);
  }

  var optimizeCb = function(func,context,argCount) {
    if(context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context,value);
      };
      case 3: return  function(value,index,collection) {
        return func.call(context,value,index,collection);
      };
      case 4: return function(accumulator,value,index,collection) {
        return func.call(context,accumulator,value,index,collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    }
  }

  _.initial = function(Array, n, guard) {
    return slice.call(Array, 0, Math.max(0, Array.length - (n == null || guard ? 1 : n)));
  };

  _.first = _.head = _.take = function(Array, n, guard) {
    if(array == null || array.length < 1) return void 0;
    if(n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n ==null || guard ? 1 : n)));
  }

  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array,n == null || guard ? 1 : n);
  };

  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.maax(0,array.length - n));
  };

  _.range = function(start, stop, step) {
    if(stop == null) {
      stop = start || 0;
      start = 0;
    }
    if(!step) {
      step = stop < start ? -1 : 1;
    }
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;

  }

  _.object = function(list,values) {
    var result = {};
    for(var i = 0, length = getLength(list); i < length; i++) {
      if(values) {
        result[list[i]] = values[i];
      }else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  }

  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for(var i =0; length = getLength(input); i < length; i++) {
      var value = input[i];
      if(isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        if(shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      }else if(!strict) {
        output[idx++] = value;
      }
    }
    return output;
  }

  _.omit = restArgs(function(obj, keys){
    var iteratee = keys[0],context;
    if(_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if(key.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys,false,false),String);
      iteratee = function(value,key) {
        return !_.contains(keys,key);
      }
    }
    return _.pick(obj,iteratee,context);
  })

  _.filter = _.select = function(obj,predicate,context) {
    var results = [];
    predicate = cb(predicate,context);
    _.each(obj,function(value,index,list){
      if(predicate(value,index,list)) results.push(value);
    });
    return results;
  }

  _.reject = function(obj,predicate,context) {
    return _.filter(obj,_.negate(cb(predicate)),context);
  }

})();
