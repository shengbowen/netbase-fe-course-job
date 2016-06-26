/*网页的初始化脚本*/

(function(_){
    //方便后面复用
    var $ = function(id){
        return document.getElementById(id);
    };

    //用来初始化提示条和关注按钮
    (function initHeader(){
        var watch = $("watch"),
            unwatch = $("unwatch"),
            tips = $("tips");
            cookies = _.getCookie();
        if(cookies["noMention"] === undefined){
            tips.style.display = "block";
        }

        if(cookies["followSuc"] !== undefined){
            watch.style.display = "none";
            unwatch.style.display = "inline-block";
        }
    })();


    //设置不再提醒按钮事件
    var noMention = $("noMention"),
        tips = $("tips");
    noMention.onclick = function(){
        tips.style.display = "none";
        _.setCookie('noMention', 'true'); //本次会话有效的cookie
    };

    //模态对象，登陆和视频弹窗会用到
     var modal = new Modal({
        // 2. 动画设置
        animation: {
          enter: 'bounceIn',
          leave: 'bounceOut'
        }
    });

    //登陆表单验证
    var loginBox = document.forms.loginForm;
    var uname = loginBox.uname,
        upwd = loginBox.upwd,
        login = loginBox.login;
    var loginWraper = $("mlogin");
    var fans = $("fans");
    login.onclick = function(){
        if(uname.value.trim()==="") alert("用户名为空！");
        if(uname.value.trim()==="") alert("密码为空！");
        var name = md5(uname.value.trim());
        var pwd = md5(upwd.value.trim());
        _.get(
                "http://study.163.com/webDev/login.htm",
                {userName: name, password:pwd},
                function(data){
                    if(!data){
                        alert("用户名或密码错误！");
                        return;
                    }
                    var date = new Date();
                    date = +date + 7*24*60*60*1000;//设置cookie7天有效
                    date = new Date(date);
                    _.setCookie("loginSuc", 'true', date);
                    alert("登陆成功！");
                    watchBtn.click();
                    modal.hide();
                }
            );
    };

   

    var watchBtn = $("watch");//关注按钮
    var unwatchBtn = $("unwatch");//取消按钮
    _.addEvent(watchBtn, 'click', function(event){
        var isLogin = _.getCookie()['loginSuc'];
        if(isLogin === undefined){
            modal.show(loginWraper);//没有登陆就显示登陆弹窗
        }else{
            _.get('http://study.163.com/webDev/attention.htm', {},
                    function(data){
                        if(!data){
                            alert("关注失败！");
                            return;
                        }
                        watchBtn.style.display = "none";
                        unwatchBtn.style.display = "inline-block";
                        var date = new Date();
                        date = +date + 7*24*60*60*1000;
                        date = new Date(date);
                        _.setCookie("followSuc", 'true', date);
                        fans.innerHTML = "46";
                    });
        }
    });

    _.addEvent(unwatchBtn, 'click', function(){
        watchBtn.style.display = "inline-block";
        unwatchBtn.style.display = "none";
        _.removeCookie("followSuc");
        fans.innerHTML = "45";
    });

    //显示视频弹窗
    var videoBtn = $("videoBtn");
    _.addEvent(videoBtn, 'click', function(){
        var htmlstr = '<p style="margin-bottom:10px; color:black">观看下面的视频了解吧：</p><video src="' + 
                          _.getDataSet(videoBtn).link + '" width="890" height="500" controls="" autoplay></video>';
        modal.show(htmlstr);
    });


    /* 头部图片轮播的初始化和事件绑定 */

    //调用轮播组件构造函数
    var slider = new Slider({
      //视口容器
      container: $('gslide'),
      // 图片列表
      images: [
        "dist/img/banner1.jpg",
        "dist/img/banner2.jpg",
        "dist/img/banner3.jpg"  //这里如果有，号在ie8下数组length会 是4，导致bug
      ],

      //banner的链接地址
      links: [
        "http://open.163.com/",
        "http://study.163.com/",
        "http://www.icourse163.org/",
      ],

      //fadein动画的时常，ms为单位；
      animateTime: 500,
      //自动播放的时间间隔, ms为单位
      interval: 5000
    });

    var getNodes = function(selector){
        return _.slice(document.querySelectorAll(selector));
    };

    var cursors = getNodes('.cursor'); //轮播指示器
    var container = getNodes('.g-slide')[0];//视口容器
    var larrow = getNodes('.u-larrow')[0];//左箭头
    var rarrow = getNodes('.u-rarrow')[0];//右滚动箭头

    cursors.forEach(function(cursor, index){
      _.addEvent(cursor, 'click', function(){
        if(cursor.className.indexOf('z-active') === -1){ //如果指示器不是选中状态，执行轮播
            slider.nav(index);
        }
      });
    });


    _.addEvent(container,'mouseover', function(){ //鼠标移入轮播停止动画
            slider.stop();  
    });

    _.addEvent(container,'mouseout',function(){
        slider.autoPlay();
    });

    _.addEvent(larrow, 'click', function(){ //左翻箭头事件
        slider.prev();
    });

    _.addEvent(rarrow, 'click', function(){
        slider.next();
    });

    //更新指示器样式的处理函数
    slider.on('nav', function(ev){
        cursors.forEach(function(cursor, index){
            if(ev.pageIndex === index){
                cursor.className = "z-active";
            }else{
                cursor.className = "";
            }
        });
    });
    slider.nav(0);  //初始显示第一张图
    slider.autoPlay(); //自动播放
    /* --轮播器--end */


    /* 分页器初始化，及事件处理函数 */

    //新建分页器对象
    var pager = new Paginator({
        container: $("pwapper"), //分页器容器
        pageSize: 20,  //每页的条目数
        currentPage: 1 //当前页索引
    });
    //课程信息的模板字符串，用来根据数据渲染最终得 innerHTML
    var template='<section class="course" data-id="{ $id }" data-middle-photo-url="{ $middlePhotoUrl }"\
                            data-name="{ $name }" data-provider="{ $provider }" data-learner-count="{ $learnerCount }"\
                            data-category-name="{ $categoryName  }" data-description="{ $description }" >\
                        <div class="course_link">\
                            <div class="img f-oh">\
                            <a href="http://study.163.com/course/introduction/{ $id }.htm" target="_blank" title="{ $name }"><img class="pic" src="{ $middlePhotoUrl  }" alt=" { $name } "></a>\
                            </div>\
                            <h3><a href="http://study.163.com/course/introduction/{ $id }.htm" target="_blank" title="{ $name }" class="f-elipsis title">{ $name }</a></h3>\
                        </div>\
                        <div class="course_info">\
                            <p><a>{ $provider }</a></p>\
                            <div class="like">\
                                <span class="user_icon"></span>\
                                <span class="like_sum">{ $learnerCount } </span>\
                            </div>\
                            <div class="price">&yen; { $price }</div>\
                        </div>\
                  </section>';
    //课程详情的模板字符串
    var detailTemplate =
            '<div class="card f-cb">\
                <a class="f-fl" href="http://study.163.com/course/introduction/{ $id }.htm" target="_blank" title="{ $name }"><img src="{ $middlePhotoUrl }" alt="" width="224" height="124"></a>\
                <div class="intro f-oh">\
                    <h2><a class="title" href="http://study.163.com/course/introduction/{ $id }.htm" title="{ $name }" target="_blank">{ $name }</a></h2>\
                    <p class="learn">\
                        <span class="user_icon"></span>\
                        <span class="like_sum">{ $learnerCount }</span>在学\
                    </p>\
                    <p class="provider">发布者：<span>{ $provider }</span></p>\
                    <p>分类：<span>{ $categoryName }</span></p>\
                </div>\
            </div>\
            <div class="descript">\
                <p>{ $description }</p>\
            </div>';

    // var htmlstr = "";
    var courseinfo = $("courseinfo").getElementsByTagName('article')[0];
    var detail = $("detail"); //课程详情浮层
    var delayTimer = null; //设置一个延迟定时器，当hover到卡片一定时间才显示浮层

    /**
     * [pageClickHandler 点击页码的事件处理函数，渲染课程列表，并为课程卡片添加mouse事件]
     * @param  {[number]} type          [课程类型]
     * @param {paginator 对象}  pager [description]
     * @param  {[Dom node]} listContainer [课程列表的父容器]
     * @param  {[Dom node]} detail        [课程详情浮层节点]
     * @param {模板字符串} template [渲染列表的模板]
     * @param {模板字符串} detailTemplate [渲染详情浮层的模板]
     * @return {[type]}               [description]
     */
    var pageClickHandler = function(type, pager, listContainer, detail, template, detailTemplate){
        _.get(
            'http://study.163.com/webDev/couresByCategory.htm', 
            {pageNo:pager.currentPage, psize:pager.pageSize, type: type},
            function(data){                
                var list = JSON.parse(data).list; //课程列表数据
                //渲染课程列表
                var htmlstr = "";
                for(var i=0,len=list.length; i<len; i++){
                    htmlstr += _.renderTemplate(template, list[i]);
                }
                listContainer.innerHTML = htmlstr;

                //为课程列表绑定事件
                var courses = listContainer.querySelectorAll(".course");
                courses = _.slice(courses);
                //模拟悬停效果
                var delayTrigger = function(target){
                    clearTimeout(delayTimer);
                    delayTimer = setTimeout(function(){
                        detail.innerHTML = _.renderTemplate(detailTemplate, _.getDataSet(target));
                        detail.style.left = target.offsetLeft + 'px';
                        detail.style.top =  target.offsetTop + 'px';
                        detail.style.display = "block";
                    }, 500);
                };
                courses.forEach(function(course){
                    //为课程卡片添加 mouseenter事件，显示卡片详情
                    _.addEvent(course, "mouseenter", function(event){
                        //延迟显示浮层
                       delayTrigger(course);
                        
                    });
                    _.addEvent(course, "mousemove", function(event){
                        //延迟显示浮层
                        delayTrigger(course);
                    });
                    _.addEvent(course, 'mouseleave', function(){
                        clearTimeout(delayTimer);
                    });
                    //为浮层添加mouseleave
                    _.addEvent(detail, 'mouseleave', function(event){
                        detail.style.display = "none";
                    });
                });

            });
    };


    /**
     * [chagePaginator 不同的tab(课程信息)项 重新获取数据，并渲染分页器]
     * @param  {[number]} type  [课程类型]
     * @param  {[paginator]} pager [分页器对象]
     * @param  {[Dom node]} detail        [课程详情浮层节点]
     * @param {模板字符串} template [渲染列表的模板]
     * @param {模板字符串} detailTemplate [渲染详情浮层的模板]
     */
    var chagePaginator = function(type, pager, listContainer, detail, template, detailTemplate){
        //获取总的页码数
        _.get(
            'http://study.163.com/webDev/couresByCategory.htm', 
            {pageNo: 1,psize: pager.pageSize, type:type}, 
            function(data){
                var obj = JSON.parse(data);
                //给分页器设置总的页码数
                pager.totalPages = obj.totalPage;
                //页码按钮点击处理函数
                pager.onPageClicked = function(){
                    pageClickHandler(type, pager, listContainer, detail, template, detailTemplate);
                };
                pager.show(1);//显示第一页
        });
    };
    /*-- 分页器 end--*/

    /* 为tab项添加事件*/
    var tabs = $("tabs");
    var tabList = _.slice(tabs.querySelectorAll(".tab"));
    function clearTabClass(tabList){
        tabList.forEach(function(tab){_.delClass(tab, 'z-selected');});
    }
    tabList.forEach(function(tab){
        _.addEvent(tab, "click", function(event){
            clearTabClass(tabList);
            _.addClass(tab, "z-selected");
            var type = parseInt(_.getDataSet(tab).type);
            chagePaginator(type, pager, courseinfo, detail, template, detailTemplate);
        });
    });

    tabList[0].click();
    /*-- tab  end--*/



    /*最热课程列表*/

    //hotlist模板
    var liTemplate = 
        '<li class="list_item f-cb">  \
            <a href="http://study.163.com/course/introduction/{ $id }.htm" target="_blank" title="{ $name }" class="f-fl"><img src="{ $smallPhotoUrl  }" alt="" width="50" height="50"></a> \
            <div class="item_info f-oh"> \
                <a href="http://study.163.com/course/introduction/{ $id }.htm " target="_blank" title={ $name }><h3 class="f-elipsis">{ $name }</h3></a> \
                <div class="like"> \
                    <span class="user_icon"></span> \
                    <span class="like_sum">{ $learnerCount }</span> \
                </div> \
            </div> \
        </li>';

    var ulstr = "";
    var hotscroll = $("hotscroll");//hotlist外层包裹容器
    var hotlist = $("hotlist"); //
    var hotTimer = null; //定时器索引

    _.get(
        'http://study.163.com/webDev/hotcouresByCategory.htm',
        {},
        function(data){
            var dataList = JSON.parse(data);
            for(var i=0,len=dataList.length; i<len;i++){
                ulstr += _.renderTemplate(liTemplate, dataList[i]);
            }

            ulstr += ulstr; //将原始列表复制一份，实现无缝滚动
            hotlist.innerHTML = ulstr;

            function animate (offset) {
                if (offset === 0) {
                    return;
                }
                hotlist.style.top = hotlist.style.top || 0;
                var time = 300; //动画时长
                var inteval = 10; //动画帧数
                var speed = offset/(time/inteval); //动画速度
                var top = parseInt(hotlist.style.top) + offset;
                // var timer = null;
                var go = function (){
                    if (speed < 0 && parseInt(hotlist.style.top) > top) {
                        hotlist.style.top = parseInt(hotlist.style.top) + speed + 'px';
                        hotTimer = setTimeout(go, inteval);
                    }else {
                        clearTimeout(hotTimer);
                        hotlist.style.top = top + 'px';
                        if(top<-1387){ //当滚到交界处，列表移回头部
                            hotlist.style.top = 0 + 'px'; 
                        }
                    }
                };
                go();
            }

            //解决Chrome切换tab页导致动画暂停，切换回来后动画错误的问题
            var scroll_control = setInterval(function(){animate(-73);}, 5000); //每隔5秒执行一次滚动动画
            浏览器tab页获得焦点时重新执行动画
            _.addEvent(window,'focus', function(){
                clearInterval(scroll_control);
                scroll_control = setInterval(function(){animate(-73);}, 5000);
            });
            //浏览器tab页失去焦点时停止动画
            _.addEvent(window,'blur', function(){
                clearInterval(scroll_control);
            });
        });  

})(util);

