/*
 * paginator
 */

;(function(_){

    function html2node(str){
        var container = document.createElement('div');
        container.innerHTML = str;
        return container.children[0];
    }

    // var template = ' <div class="m-pager"><a href="" class="pbn prev"></a> \
    //                 <a href="" class="u-page page1"></a> \ 
    //                 <span class="pleft pshow">...</span> \
    //                 <a href="" class="u-page page2"></a> \
    //                 <a href="" class="u-page page3"></a> \
    //                 <a href="" class="u-page page4"></a> \
    //                 <a href="" class="u-page page5"></a> \
    //                 <a href="" class="u-page page6"></a> \
    //                 <a href="" class="u-page page7"></a> \
    //                 <span class="pright pshow">...</span> \
    //                 <a href="" class="u-page page8"></a> \
    //                 <a href="" class="pbn next"></a></div> ' ;
    var template = '<div class="m-pager" style="display: none">\
                        <a href="#courseinfo" class="pbn prev">&lt</a>\
                        <a href="#courseinfo" class="u-page page1"></a> \
                        <span class="pleft">...</span> \
                        <a href="#courseinfo" class="u-page page2"></a> \
                        <a href="#courseinfo" class="u-page page3"></a> \
                        <a href="#courseinfo" class="u-page page4"></a> \
                        <a href="#courseinfo" class="u-page page5"></a> \
                        <a href="#courseinfo" class="u-page page6"></a> \
                        <a href="#courseinfo" class="u-page page7"></a> \
                        <span class="pright">...</span> \
                        <a href="#courseinfo" class="u-page page8"></a> \
                        <a href="#courseinfo" class="pbn next">&gt;</a>\
                    </div>';

    /**
     * [Paginator 构造函数]
     * @param {[obj]} opt [一些自定义选项的对象]
     */
    function Paginator(opt){
        _.extend(this, opt);

        //容器节点设置
        this.container = this.container || document.body;

        //组件节点
        this.pager = this._layout.cloneNode(true);
        this.pages = [].slice.call(this.pager.querySelectorAll('.u-page'));
        this.prev = this.pager.querySelector('.prev');
        this.next = this.pager.querySelector('.next');
        this.lellipsis = this.pager.querySelector('.pleft');
        this.rellipsis = this.pager.querySelector('.pright');

        //分页器的主要处理数据
        this.currentPage = this.currentPage || 1; //当前页数
        this.totalPages = this.totalPages || 1; //总页数
        this.pageSize = this.pageSize || 1; //每页的条目数
        this.itemTexts = this.itemTexts || {}; //按钮显示文字
        this.showEllipsisL = false; //判断是否显示左边省略号
        this.showEllipsisR = false; //判断是否显示右边省略号

        this.onPageClicked = null; //点击事件;

        this.container.appendChild(this.pager);
        this._init();
        
    }

    //扩展paginator原型对象
    _.extend(Paginator.prototype, {

        _layout: html2node(template),

        //直接显示指定的页
        show: function(pageIndex){
            this.pager.style.display = "inline-block";
            pageIndex = pageIndex < 1 ? 1 : pageIndex;
            pageIndex = pageIndex > this.totalPages ? this.totalPages : pageIndex; 
            this.currentPage = pageIndex;
            this._render();
            if(typeof this.onPageClicked === "function"){ //如果定义了点击处理函数则执行
                this.onPageClicked();
            }
        },

        showPrev: function(){
            if(this.currentPage === 1) return; //首页不操作
            this.show(this.currentPage - 1);
        },

        showNext: function(){
            if(this.currentPage === this.totalPages) return; //尾页不操作
            this.show(this.currentPage + 1);
        },

        showLast: function(){
            this.show(this.totalPages);
        },

        showFirst: function(){
            this.show(1);
        },

        _render: function(){
            var parray = this._genPageArray();
            var len = parray.length;
            for(var i=0; i< len; i++){
                this.pages[i].innerHTML = parray[i];
                _.delClass(this.pages[i], 'z-active');
                if(parray[i] === this.currentPage){
                    _.addClass(this.pages[i], 'z-active'); //当前页面添加选中状态
                }
            }
            //当总页数小于8时隐藏页码节点
            if(len < 8){
                for(var i=len-1; i<8;i++){
                    this.pages[i].style.display = "none";
                }
            }
            this.currentPage === 1 ? _.addClass(this.prev, "z-disabled") : _.delClass(this.prev, "z-disabled");
            this.currentPage === this.totalPages ? _.addClass(this.next, "z-disabled") : _.delClass(this.next, "z-disabled");
            //省略号的显示
            this.lellipsis.style.display = this.showEllipsisL ? "inline-block" : "none";
            this.rellipsis.style.display = this.showEllipsisR ? "inline-block" : "none";
        },
        /**
         * [_genPageArray 获得要显示的页码的数组，最多显示8个页码，同时设置是否需要省略号]
         * @return {[array]} [页码数组]
         */
        _genPageArray: function(){
            var result = [];
            //如果总页数小于等于8，则要显示的页数为[1,2,3,4,5,6,7,8],且两端没有省略号
            if(this.totalPages <= 8){
                for(var i=1; i<=this.totalPages; i++) result.push(i);
                this.showEllipsisL = this.showEllipsisR = false;
                return result;
            }else if(this.currentPage<=5){ //当前选中的页码在5及以内时，显示页数为[1,2,3,4,5,6,7,lastpage],且右端有省略号
                this.showEllipsisL = false;
                this.showEllipsisR = true;
                return [1,2,3,4,5,6,7,this.totalPages];
            }else if(this.currentPage >= this.totalPages-3){
                //当前选中的页码在总页码的最后四个页面内时，显示页数为[1,last-6,last-5...last],且左端有省略号
                this.showEllipsisL = true;
                this.showEllipsisR = false;
                var tp = this.totalPages;
                return [1, tp-6, tp-5, tp-4, tp-3, tp-2, tp-1, tp];
            }else{
                //除了上述情况，就是显示当前页码前的4个页码和当前页码后的3个页码，且左右都有省略号
                this.showEllipsisL = this.showEllipsisR = true;
                var cp = this.currentPage;
                return [1, cp-3,cp-2,cp-1,cp,cp+1,cp+2, this.totalPages];
            }
        },
        //为按钮添加事件
        _init: function(){
            var that = this;
            this.prev.addEventListener('click', function(event){
                if(that.currentPage === 1){
                    if(event && event.preventDefault){
                         event.preventDefault(); 
                    }else{
                        window.event.returnValue = false; 
                    }     
                }
                that.showPrev();
            });
            this.next.addEventListener('click', function(event){
                if(that.currentPage === that.totalPages){
                    if(event && event.preventDefault){
                         event.preventDefault(); 
                    }else{
                        window.event.returnValue = false; 
                    }     
                }
                that.showNext();
            });
            this.pages.forEach(function(page){
                page.addEventListener('click', function(event){
                    var event = event || window.event;
                    var target = event.target || event.srcElement;
                    var num = parseInt(target.innerHTML);
                    if(num){
                        that.show(num);
                    } 
                });
            });
        }

    });

    window.Paginator = Paginator;
})(util);