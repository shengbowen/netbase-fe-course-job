/**
 *      -------------------
 *      |     |     |     |  <- 只有三栏是常驻的,通过修改图片的url达到切换多于3张图片的效果
 * -------------------------------
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * |    |  1  |  2  |  3  |      |
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * |    |     |     |     |      |
 * -------------------------------
 *      |     |     |     |
 *      -------------------
 */


;(function(_){

    /**
     * 将html字符串转换为dom节点
     * @param  {[string]} str [html字符串]
     * @return {[dom]}     [dom节点]
     */
    function html2node(str){
        var container = document.createElement('div');
        container.innerHTML = str;
        return container.children[0];
    }

    var template = '<div class="m-slider">\
                        <div class="slide"></div>\
                        <div class="slide"></div>\
                        <div class="slide"></div>\
                    </div>';

    /**
     * [Slider 构造函数]
     * @param {[obj]} opt [一些自定义选项的对象]
     */
    function Slider(opt){

        _.extend(this, opt);

        //容器节点以及样式设置
        this.container = this.container || document.body;
        this.container.style.overflow = "hidden";

        //动画时长
        this.animateTime = this.animateTime || 500;
        //自动播放间隔
        this.interval = this.interval || 5000;

        //组件节点
        this.slider = this._layout.cloneNode(true);
        this.slides = [].slice.call(this.slider.querySelectorAll('.slide'));

        this.pageNum = this.images.length;

        //内部需要维护的数据结构，通过这些数据来控制UI显示
        this.slideIndex = 1; //当前常驻轮播图的索引，即.slider的索引,这里取[0~2]之间的值
        this.pageIndex = this.pageIndex || 0; //当前图片的下标
        this.lastIndex = 0; // 记录前一次次图片的下标

        this.timer = null; //定时器动画的引用
        this.autoTimer = null; //自动播放定时器的引用


        //this.pageNum 必须传入
        //初始化动作
        this.container.appendChild(this.slider);

    }

    //mixin将util里写的事件对象扩展进slider的原型上
    _.extend(Slider.prototype, _.emitter);

    _.extend(Slider.prototype, {

        _layout: html2node(template),

        //直接跳到指定的页
        nav: function(pageIndex){
            
            var offset = pageIndex - this.lastIndex || 0;//计算指定页与前一次图片下标的偏移量
            this._step(offset);
        },

        //自动播放
        autoPlay: function(){
            //clearInterval(this.autoTimer);
            var that = this;
            this.autoTimer = setInterval(function(){
                that.next();
            }, that.interval);
        },

        //停止自动播放
        stop: function(){
            clearInterval(this.autoTimer);
        },

        //下一页
        next: function(){
            this._step(1);
        },
        //上一页
        prev: function(){
            this._step(-1);
        },
        //移动
        _step: function(offset){
            this.pageIndex += offset;
            this.slideIndex += offset % 3; //由于slide只有3个，所以这里要处理一下
            this.lastIndex = this.pageIndex;// 记录当前图片下标，作为下次移动时的前次图片下标
            this._calcSlide();
        },

        _fadeIn: function(slide){
            var opacity = 0;
            var step = 0.1; //一次动画增加的opacity步长
            var count = 1/step; //总次数
            var speed = this.animateTime / count; 
            clearTimeout(this.timer);
            var that = this;
            var run = function(){
              if(opacity<1){
                  opacity += 0.1;
                  slide.style.opacity = opacity;
                  that.timer = setTimeout(run, speed);
              }else{
                  slide.style.opacity = 1;
                  // that.animating = false;
              }
            };
            run();
        },

        _calcSlide: function(){
            var slideIndex = this.slideIndex = this._normIndex(this.slideIndex, 3);
            var pageIndex = this.pageIndex = this._normIndex(this.pageIndex, this.pageNum);
            var pageNum = this.pageNum;

            var slides = this.slides;

            // for(var i=0, len=slides.length; i<len; i++){
            //     if(i === slideIndex){
            //         this._fadeIn(slides[i]);
            //     }else{
            //         slides[i].style.opacity = 0;
            //     }
            // }



            //当前slide添加'z-index'的className,并且进行淡入动画；设置显示元素的z-index 
            slides.forEach(function(node){
                _.delClass(node, 'z-active')
                node.style.opacity = 0;
                node.style.zIndex = 0;
            });
            this._fadeIn(slides[slideIndex]);
            slides[slideIndex].style.zIndex = 1;
            _.addClass(slides[slideIndex], 'z-active');


            this._onNav(this.pageIndex, this.slideIndex);

        },

        //标准化下标
        _normIndex: function(index, len){
            return (len+index) % len;
        },

        //跳转时完成的逻辑，这里是设置图片的url
        _onNav: function(pageIndex, slideIndex){
            var slides = this.slides;

            for(var i=-1; i<=1; i++){
                var index = (slideIndex+i+3)%3;
                var img = slides[index].querySelector('img');
                var a = slides[index].querySelector('a');
                if(!img){
                    a = document.createElement('a');
                    img = document.createElement('img');
                    a.appendChild(img);
                    slides[index].appendChild(a);
                }
                a.href = this.links[this._normIndex(pageIndex + i, this.pageNum)];
                a.target = "_blank";
                // console.log(this._normIndex(pageIndex + i, this.pageNum));
                img.src = img.src = this.images[this._normIndex(pageIndex + i, this.pageNum)];
            }
            this.emit('nav', {
                pageIndex: pageIndex,
                slideIndex: slideIndex
            });
        }


    });

    window.Slider = Slider;


})(util);