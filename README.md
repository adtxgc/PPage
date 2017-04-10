# PPage
移动端单页面库

### 提供的功能

 * 支持模拟新开页面，并且支持向新开页面回调传值；
 * 支持手动回退页面，并且支持向回退页面回调传值；
 * 支持浏览器回退时，向回退页面回调传值；
 * 支持保存新开页面的状态数据，刷新页面还原现场；
 

### 提供的api

 * **Page.forward()**  作用注册新开页面路由，执行路由
 * **Page.back()**     作用注册回退页面路由，执行路由
 * **Page.sysback()**  作用浏览器回退页面时，给回退页面路由传参
 * **Page.refresh()**  作用注册刷新页面路由
 * **Page.save()**     作用保存路由状态
 * **Page.reload()**   作用执行刷新页面路由

### 使用示例

#### 模拟新开页面

用到的api：`Page.forward()`。

*不需要传参*

```javascript
//注册新开页面路由，新开页面的逻辑在回调中完成
Page.forward('user',function(){
    
});

//执行新开页面路由回调
Page.forward('user');

```

*需要传参*

```javascript
//注册新开页面带参路由，可以在回调中通过cxt拿到参数值
Page.forward('user:id',function(cxt){
    var id = cxt.id;
});

//执行新开页面路由回调，此时回调中的cxt.id=1234
Page.forward('user/1234');


//多参数情况
Page.forward('user:id:name',function(cxt){
    var id = cxt.id,
        name = cxt.name;
});

Page.forward('user/1234/test');

```


#### 模拟回退页面

用到的api：`Page.back()`，`Page.sysback()`。


*不需要传参*

```javascript
//注册回退页面路由，页面回退的逻辑在回调中完成
Page.back('user',function(){
    
});
//页面主动执行回退路由回调，浏览器的返回按钮的作用和这个方法类似
Page.back('user');

```

*需要传参*

```javascript
//注册回退页面带参路由，可以在回调中通过cxt拿到参数值
Page.back('user:name',function(cxt){
   var name = cxt.name 
});

//页面主动执行回退路由时，给回调传值
Page.back('user/test');

//浏览器返回按钮回退页面时，回退页面路由需要参数，必须在浏览器返回按钮触发之前调用此方法
Page.sysback('user/test');

```

#### 刷新页面还原路由状态

用到的api：`Page.refresh()`，`Page.save()`，`Page.reload()`。

```javascript
//刷新页面时注册路由对应的回调，在回调函数中完成路由对应页面的状态还原，刷新之前的状态数据可以通过cxt参数获取，只有刷新页面时才会执行回调
Page.refresh('user',function(cxt){
    var id = cxt.id,
        name = cxt.name;
});

//保存路由对应的状态数据,对于同一个路由可以调用多次保存数据，相同的字段取最后一次保存的值，保存的状态数据，可以通过注册时的回调获取
Page.save('user',{
    id:'1234',
    name:'test'
});


//当页面刷新时，执行Page.refresh()中注册的回调，必须在Page.refresh()之后调用
Page.reload();

```
