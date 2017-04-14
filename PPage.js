(function(win) {
  var loc = win.location,
    his = win.history,
    storagePre = "PPage-",
    storage = win.localStorage,
    hashMark = '#',
    hashAry = [], //hash记录列表
    handles = [], //hash对应的数据列表
    Page = Page || {};

  /**
   * @desc 注册hash以及对应的回调或者执行hash对应的回调,模拟新页面跳转使用
   *
   * Page.forward('user',function(ctx){})  注册无参数hash
   * Page.forward('user:id',function(ctx){}) 注册传参hash，适用于传参情况
   * Page.forward('user') 执行无参数hash回调
   * Page.forward('user/123') 执行传参hash回调
   *
   * @arg {string} hash 自定义的hash值
   * @arg {function} fn 自定义hash对应的回调
   */
  Page.forward = function(hash, fn) {
    var tempHash = arguments[0];

    if (arguments.length == 1) {
      //主动触发对应hash对应回调
      if (tempHash.indexOf('/') > -1) {
        //执行带参hash
        var hashArgs = tempHash.split('/'),
          count = hashArgs && hashArgs.length,
          hashStr = hashArgs[0],
          hashObj = _getHandleByHash(hashStr);

        if (!hashObj.hash) {
          alert("当前hash没有注册！");
        } else {
          for (var i = 1; i < count; i++) {
            hashObj.forwardArgs[i - 1].value = hashArgs[i];
          }

          loc.hash = hashMark + hashArgs[0];
        }

      } else {
        //执行无参hash
        var hashObj = _getHandleByHash(tempHash);

        if (!hashObj.hash) {
          alert("当前hash没有注册！");
        } else {
          loc.hash = hashMark + tempHash;
        }
      }
      hashAry.push(loc.hash);
    } else if (arguments.length == 2) {
      // 注册hash对应回调
      var fn = arguments[1],
        args = [],
        hashStr = '';

      if (tempHash.indexOf(':') > -1) {
        //注册带参hash
        var hashArgs = tempHash.split(':'),
          count = hashArgs && hashArgs.length;

        for (var i = 1; i < count; i++) {
          args.push({
            name: hashArgs[i]
          });
        }

        hashStr = hashArgs[0];
      } else {
        hashStr = tempHash;
      }

      var tempObj = {
          hash: hashMark + hashStr,
          forwardArgs: args,
          forward: fn
        },
        hashObj = _getHandleByHash(tempObj.hash);

      if (!hashObj.hash) {
        handles.push(tempObj);
      } else {
        hashObj.forwardArgs = tempObj.forwardArgs;
        hashObj.forward = tempObj.forward;
      }

      _addHashCallback();
    } else {
      alert("参数不正确！");
    }
  };
  /**
   * @desc 注册hash以及对应的回调或者执行hash对应的回调,模拟页面回退使用
   *
   * Page.back('user',function(ctx){})  注册无参数hash
   * Page.back('user:id',function(ctx){}) 注册传参hash，适用于传参情况
   * Page.back('user') 页面事件触发回退操作（非浏览器返回按钮触发），执行无参数hash回调
   * Page.back('user/123') 页面事件触发回退操作（非浏览器返回按钮触发），执行传参hash回调
   *
   * @arg {string} hash 自定义的hash值
   * @arg {function} fn 自定义hash对应的回调
   */
  Page.back = function(hash, fn) {
    var tempHash = arguments[0];

    if (arguments.length == 1) {
      //主动触发hash对应回调
      if (tempHash.indexOf('/')) {
        //执行带参hash
        var hashArgs = tempHash.split('/'),
          count = hashArgs && hashArgs.length,
          hashStr = hashArgs[0],
          hashObj = _getHandleByHash(hashStr);

        if (!hashObj.hash) {
          alert("当前hash没有注册！");
        } else {
          for (var i = 1; i < count; i++) {
            hashObj.backArgs[i - 1].value = hashArgs[i];
          }
          his.back();
        }

      } else {
        //执行无参hash
        var hashObj = _getHandleByHash(tempHash);

        if (!hashObj.hash) {
          alert("当前hash没有注册！");
        } else {
          his.back();
        }
      }
    } else if (arguments.length == 2) {
      // 注册hash对应回调
      var fn = arguments[1],
        args = [],
        hashStr = '';

      if (tempHash.indexOf(':') > -1) {
        //注册带参hash
        var hashArgs = tempHash.split(':'),
          count = hashArgs && hashArgs.length;

        for (var i = 1; i < count; i++) {
          args.push({
            name: hashArgs[i]
          });
        }

        hashStr = hashArgs[0];
      } else {
        hashStr = tempHash;
      }

      var tempObj = {
          hash: hashMark + hashStr,
          backArgs: args,
          back: fn
        },
        hashObj = _getHandleByHash(tempObj.hash);

      if (!hashObj.hash) {
        handles.push(tempObj);
      } else {
        hashObj.backArgs = tempObj.backArgs;
        hashObj.back = tempObj.back;
      }

      _addHashCallback();

    } else {
      alert("参数不正确！");
    }
  };
  /**
   * @desc 注册刷新页面后hash对应的回调
   *
   * Page.refresh('user',function(cxt){})
   *
   * @arg {string} hash 自定义的hash值
   * @arg {function} fn 自定义的hash对应的回调
   */
  Page.refresh = function(hash, fn) {
    var tempHash = arguments[0];
    if (arguments.length == 2) {
      // 注册hash对应回调

      var tempObj = {
          hash: hashMark + tempHash,
          refresh: arguments[1]
        },
        hashObj = _getHandleByHash(tempObj.hash);

      if (!hashObj.hash) {
        handles.push(tempObj);
      } else {
        hashObj.refresh = tempObj.refresh;
      }

    } else {
      alert("参数不正确！");
    }
  }

  /**
   * @desc 系统返回键或者浏览器返回按钮触发页面后退时，向页面注册的hash回调传参，在Page.back()方法之后调用
   *
   * Page.sysback('user/123') 页面事件触发回退操作（浏览器返回按钮触发），给hash对应回调传参
   *
   * @arg {string} hash 自定义的hash值
   */
  Page.sysback = function(hash) {

    if (hash.indexOf('/') > -1) {
      var hashArgs = hash.split('/'),
        count = hashArgs && hashArgs.length,
        hashStr = hashArgs[0],
        hashObj = _getHandleByHash(hashStr);

      if (!hashObj.hash) {
        alert("当前hash没有注册！");
      } else {
        for (var i = 1; i < count; i++) {
          hashObj.backArgs[i - 1].value = hashArgs[i];
        }
      }
    }
  };

  /**
   * @desc 保存页面状态依赖的数据，还原hash对应的页面时使用
   * @arg {string} hash 自定义的hash值,不能包含'#','/',':'字符
   * @arg {object}  data  需要保存的数据对象
   */
  Page.save = function(hash, data) {
    var tempStr = storage.getItem(storagePre + hashMark + hash);

    if (!tempStr) {
      storage.setItem(storagePre + hashMark + hash, JSON.stringify(data));
    } else {
      var tempObj = JSON.parse(tempStr);
      for (attr in data) {
        Object.defineProperty(tempObj, attr, {
          value: data[attr]
        });
      }
      storage.setItem(storagePre + hashMark + hash, JSON.stringify(tempObj));
    }
  };

  /**
   * @desc 有hash状态的页面，需要刷新还原现场时使用，在Page.refresh()方法调用之后调用
   *
   */
  Page.reload = function() {
    var hash = loc.hash,
      hashObj = _getHandleByHash(hash);
    if (!hash) {
      return;
    } else {
      var tempStr = storage.getItem(storagePre + hash);
      if (!tempStr) {
        hashObj.refresh();
      } else {
        hashObj.refresh(JSON.parse(tempStr));
      }
    }
  };

  /**
   * @desc 从当前路由回到首页
   */
  Page.home = function(fn) {
    var hash = loc.hash;
    if (!hash) return;

    var hashObj = _getHandleByHash(hashAry[0]);
    hashObj.home = fn;
    his.go('-' + hashAry.length);
  }

  /**
   * @desc 把注册的hash回调绑定到onhashchange事件中
   *
   */
  function _addHashCallback() {
    win.onhashchange = function(event) {
      var newHash = event.newURL.split(hashMark).length > 1 ? hashMark +
        event.newURL.split(hashMark)[1] : '',
        oldHash = event.oldURL.split(hashMark).length > 1 ? hashMark +
        event.oldURL.split(hashMark)[1] : '',
        direct = _judgeHashDirect(newHash, oldHash),
        hashObj = {},
        tempArg = {};


      if (direct > 0) {
        // 跳转到新的hash,模拟打开新页面
        hashObj = _getHandleByHash(newHash);
        var length = hashObj.forwardArgs && hashObj.forwardArgs.length;
        for (var i = 0; i < length; i++) {
          Object.defineProperty(tempArg, hashObj.forwardArgs[i].name, {
            value: hashObj.forwardArgs[i].value
          });
        }
        if (!!hashObj.forward && typeof hashObj.forward == 'function') {
          hashObj.forward(tempArg);
        }

      } else {
        if (!newHash && hashAry.length > 1) {
          // 从当前hash返回首页
          hashObj = _getHandleByHash(hashAry[0]);
          if (!!hashObj.home && typeof hashObj.home == 'function') {
            hashObj.home();
          }
          hashAry = [];
        } else {
          // 从当前hash返回，模拟页面回退
          hashObj = _getHandleByHash(oldHash);
          var length = hashObj.backArgs && hashObj.backArgs.length;
          for (var i = 0; i < length; i++) {
            Object.defineProperty(tempArg, hashObj.backArgs[i].name, {
              value: hashObj.backArgs[i].value
            });
          }
          if (!!hashObj.back && typeof hashObj.back == 'function') {
            hashObj.back(tempArg);
          }
          hashAry.splice(lxUtil.getAryIndex(hashAry, oldHash), 1);
        }
      }
    }
  }

  /**
   * @desc 根据newHash，oldHash判断页面是否后退
   * @arg {string} newHash hashchage事件的newURL属性中的hash值
   * @arg {string} oldHash hashchage事件的oldURL属性中的hash值
   * @return {number} 1 新开页面；-1页面后退
   */
  function _judgeHashDirect(newHash, oldHash) {
    if (lxUtil.getAryIndex(hashAry, newHash) > lxUtil.getAryIndex(hashAry,
        oldHash)) {
      return 1;
    } else {
      return -1;
    }
  }
  /**
   * @desc 根据hash值获取对应数据以及回调
   * @arg {string} hash hash值
   * @return {object}
   * @private
   */
  function _getHandleByHash(hash) {
    var length = handles && handles.length;
    if (hash.indexOf(hashMark) == -1) {
      hash = hashMark + hash;
    }
    for (var i = 0; i < length; i++) {
      if (handles[i].hash == hash) {
        return handles[i];
      }
    }
    return {};
  }


  var lxUtil = (function() {
    return {
      /**
       * @desc 返回给定的项在数组中的索引值，仅适用简单数组
       * @arg {array} arys 数组，项是数字或者字符串
       * @arg {string} item 数组项
       * @return {number} 索引值；-1 数组中未找到给定的项；
       * @public
       */
      getAryIndex: function(arys, item) {
        var length = arys && arys.length;
        for (var i = 0; i < length; i++) {
          if (arys[i] == item) {
            return i;
          }
        }
        return -1;
      }
    }
  }());

  win['PPage'] = Page;

}(window));
