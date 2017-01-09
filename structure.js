(function(){
  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;


  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  //解决_冲突
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // 创建一个chain函数，用来支持链式调用
   _.chain = function(obj) {
     var instance = _(obj);
     //是否使用链式操作
     instance._chain = true;
     return instance;
   };
   // 返回_.chain里是否调用的结果, 如果为true, 则返回一个被包装的Underscore对象, 否则返回对象本身
   var chainResult = function(instance, obj) {
     return instance._chain ? _(obj).chain() : obj;
   };
   // 用于扩展underscore自身的接口函数
   _.mixin = function(obj) {
     //通过循环遍历对象来浅拷贝对象属性
     _.each(_.functions(obj), function(name) {
       var func = _[name] = obj[name];
       _.prototype[name] = function() {
         var args = [this._wrapped];
         push.apply(args, arguments);
         return chainResult(this, func.apply(_, args));
       };
     });
   };
   _.mixin(_);
   // 将Array.prototype中的相关方法添加到Underscore对象中, 这样Underscore对象也可以直接调用Array.prototype中的方法
   _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
     //方法引用
     var method = ArrayProto[name];
     _.prototype[name] = function() {
       // 赋给obj引用变量方便调用
       var obj = this._wrapped;
       // 调用Array对应的方法
       method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
       //支持链式操作
       return chainResult(this, obj);
     };
   });

   // 同上，并且支持链式操作
   _.each(['concat', 'join', 'slice'], function(name) {
     var method = ArrayProto[name];
     _.prototype[name] = function() {
      //返回Array对象或者封装后的Array
       return chainResult(this, method.apply(this._wrapped, arguments));
     };
   });
  //返回存放在_wrapped属性中的underscore对象
   _.prototype.value = function() {
    return this._wrapped;
   };

  // 提供一些方法方便其他情况使用
   _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
   _.prototype.toString = function() {
     return '' + this._wrapped;
   };

   // 对AMD支持的一些处理
   if (typeof define == 'function' && define.amd) {
     define('underscore', [], function() {
       return _;
     });
   }

})()
