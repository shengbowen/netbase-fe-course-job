var util = (function(){

    if ( !Array.prototype.forEach ) {

      Array.prototype.forEach = function forEach( callback, thisArg ) {

        var T, k;

        if ( this == null ) {
          throw new TypeError( "this is null or not defined" );
        }
        var O = Object(this);
        var len = O.length >>> 0; 
        if ( typeof callback !== "function" ) {
          throw new TypeError( callback + " is not a function" );
        }
        if ( arguments.length > 1 ) {
          T = thisArg;
        }
        k = 0;

        while( k < len ) {

          var kValue;
          if ( k in O ) {

            kValue = O[ k ];
            callback.call( T, kValue, k, O );
          }
          k++;
        }
      };
    }

    if (!Function.prototype.bind) { 
            Function.prototype.bind = function (oThis) { 
            if (typeof this !== "function") {       
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable"); 
            } 
            var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {}, 
            fBound = function () { 
            return fToBind.apply(this instanceof fNOP && oThis 
            ? this 
            : oThis, 
            aArgs.concat(Array.prototype.slice.call(arguments))); 
            }; 
            fNOP.prototype = this.prototype; 
            fBound.prototype = new fNOP(); 
            return fBound; 
            }; 
    }

    if(!String.prototype.trim){
        String.prototype.trim = function ()  
        {  
            return this.replace(/(^\s*)|(\s*$)/g, "");  
        }  
    }

   
    return {
        /**
         * 将对象o2的属性扩展到对象o1中
         * @param  {[obj]} o1 
         * @param  {[obj]} o2 
         */
        extend: function(o1, o2){
            for(var i in o2){
                if(o1[i] == undefined){
                    o1[i] = o2[i];
                }
            }
        },
        addClass: function(node, className){
            var current = node.className || "";
            if((" "+current+" ").indexOf(" "+className+" ") === -1){
                node.className = current? (current+" "+className) : className;
            }
        },
        delClass: function(node, className){
            var current = node.className || "";
            node.className = (" "+current+" ").replace(" "+className+" ", " ").trim();
        },
        /**
         * 利用观察者模式，写的事件注册监听对象
         */
        emitter: {
            //注册事件
            on: function(event, fn) {
                var handles = this._handles || (this._handles = {}),
                    calls = handles[event] || (handles[event] = []);
                //将事件处理函数加入对应事件的处理队列
                calls.push(fn);
                return this; //方便链式操作
            },
            //解绑事件
            off: function(event, fn){
                if(!event || !this._handles) this._handles = {};
                if(!this._handles) return;

                var handles = this._handles, calls;

                if(calls = handles[event]){
                    if(!fn){
                        handles[event] = [];
                        return this;
                    }
                }
                //找到对应的listener 并移除
                for(var i=0,len=calls.length; i<len; i++){
                    if(fn === calls[i]) {
                        calls.splice(i, 1);
                        return this;
                    }
                }
                return this;
            },
            //触发事件
            emit: function(event){
                var args = [].slice.call(arguments, 1),
                    handles = this._handles, calls;

                if(!handles || !(calls = handles[event])) return this;
                // 触发所有对应名字的listeners
                for(var i=0, len=calls.length; i<len; i++){
                    calls[i].apply(this, args);
                }
                return this;
            }

        },

        //ajax相关函数
        serialize: function(data){
            if(!data) return '';
            var pairs = [];
            for(var name in data){
                if(!data.hasOwnProperty(name)) continue;
                if(typeof data[name] === "function") continue;
                var value = data[name].toString();
                name = encodeURIComponent(name);
                value = encodeURIComponent(value);
                pairs.push(name + '=' + value);
            }
            return pairs.join('&');
        },

        //兼容IE8Cors的请求
        createCORSRequest: function(method, url){
            var xhr = new XMLHttpRequest();
              if ("withCredentials" in xhr) {
                // XHR for Chrome/Firefox/Opera/Safari.
                xhr.open(method, url, true);
              } else if (typeof XDomainRequest != "undefined") {
                // XDomainRequest for IE.
                xhr = new XDomainRequest();
                xhr.open(method, url);
              } else {
                // CORS not supported.
                xhr = null;
              }
              return xhr;
        },
        get: function(url, options, callback){
            var xhr = this.createCORSRequest("GET", url+"?"+this.serialize(options));
            if(!xhr){
                throw new Error("not support CORS!");
            }
            xhr.onload = function(){
                callback(xhr.responseText);
            };
            xhr.onerror = function(){
                console.log(" ajax has some error!");
            };
            xhr.send(null);
        },

        post: function(url, options, callback){
            var xhr = this.createCORSRequest("POST", url);
            // xhr.onreadystatechange = function(){
            //     if(xhr.readyState === 4){
            //         if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304){
            //             callback(xhr.responseText);
            //         }else{
            //             alert("Error:" + xhr.status);
            //         }
            //     }
            // }
            // xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(this.serialize(options));
        },

        slice: function(nodes){
            var aNodes=null;
            try{
               aNodes=Array.prototype.slice.call(nodes,0);
            }catch(err){
               aNodes=new Array();
               for(var i=0;i<nodes.length;i++){
                   aNodes.push(nodes[i]);
               }
            }
            return aNodes;
       },

        //将对象数据渲染进template
        //dataObj = {data:2}
        //如模板为<div>{ $data }</div>被渲染成<div>2</div>
        renderTemplate: function(tempStr, dataObj){
            if(!dataObj) return;
            return tempStr.replace(/\{\s+\$([^\s]+)\s+\}/g, function(a, b){
                return dataObj[b]!==undefined ? dataObj[b] : "";
            });
        },

        //cookie相关
        setCookie: function(name, value, expires, path, domain, secure){
            var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
            if(expires)
                cookie += '; expires=' + expires.toGMTString();
            if(path)
                cookie += '; path=' + path;
            if(domain)
                cookie += '; domain=' +domain;
            if(secure)
                cookie += '; secure=' + secure;
            document.cookie = cookie;
        },

        getCookie: function(){
            var cookie = {};
            var all = document.cookie;
            if(all === "")
                return cookie;
            var list = all.split("; ");
            for(var i=0;i<list.length; i++){
                var item = list[i];
                var p = item.indexOf('=');
                var name = item.substring(0, p);
                name = decodeURIComponent(name);
                var value = item.substring(p+1);
                value = decodeURIComponent(value);
                cookie[name] = value;
            }
            return cookie;
        },

        removeCookie: function(name){
            document.cookie = name + '='
            + '; max-age=0';
        },
        
        //事件处理相关
        addEvent: function(ele, type, listener, useCapture){
            if(document.addEventListener){
                ele.addEventListener(type, listener, useCapture);
            }else{
                ele.attachEvent('on'+type, listener);
            }
        },

        removeEvent: function(ele, type, listener, useCapture){
            if(document.removeEventListener){
                ele.removeEventListener(type, listener, useCapture);
            }else{
                ele.detachEvent('on'+type, listener);
            }
        },

        //兼容ie8的target
        getTarget: function(e){
            var event = e || window.event;
            return event.target || event.srcElement;
        },

        //将index-name类型的字符串转换为驼峰indexName
        transformCambel: function (name){
            var arrs = name.split("-");
            var results = arrs[0]? arrs[0].toLowerCase() : "";
            for(var i=1; i<arrs.length; i++){
                results += arrs[i].replace(/(\w)(\w*)/, function(v, v1, v2){
                    return v1.toUpperCase() + v2.toLowerCase();
                });
            }
            return results;
        },
        //ie8 兼容dataset的方法
        getDataSet: function (ele){
            if (ele.dataset){
                return ele.dataset;
            }else{
                var dataSet = {};
                var attrSet = ele.attributes;
                for(var i=0; i<attrSet.length;i++){
                    if(/^data-.*/.test(attrSet[i].name)){
                        name = this.transformCambel(attrSet[i].name.substr(5));
                        //dataSet[name] = ele.getAttribute(attrSet[i].name);
                        dataSet[name] = attrSet[i].value;
                    }
                }
                return dataSet;
            }
        },
    };
})();