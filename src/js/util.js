var util = (function(){
    
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

        get: function(url, options, callback){
            var xhr = window.XMLHttpRequest ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP"));
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304){
                        callback(xhr.responseText);
                    }else{
                        alert("Error:" + xhr.status);
                    }
                }
            }
            xhr.open("GET", url+"?"+this.serialize(options));
            xhr.send(null);
        },

        post: function(url, options, callback){
            var xhr = window.XMLHttpRequest ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP"));
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304){
                        callback(xhr.responseText);
                    }else{
                        alert("Error:" + xhr.status);
                    }
                }
            }
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(this.serialize(options));
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
        }
        

    }
})();