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

        }
    }
})();