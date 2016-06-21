var loginBox = document.forms.loginForm;
    var uname = loginBox.uname;
    var upwd = loginBox.upwd;
    var login = loginBox.login;
    var wraper = document.getElementById("mlogin");
    login.onclick = function(){
        var name = md5(uname.value.trim());
        var pwd = md5(upwd.value.trim());
        util.get(
                "http://study.163.com/webDev/login.htm",
                {userName: name, password:pwd},
                function(){
                    alert("登陆成功！");
                }
            );
    }

    var modal = new Modal({
        // 2. 动画设置
        animation: {
          enter: 'bounceIn',
          leave: 'bounceOut'
        }
    });

    var watchBtn = document.getElementById("watch");
    watchBtn.addEventListener('click', function(event){
        var isLogin = util.getCookie()['isLogin'];
        if(!isLogin){
            modal.show(wraper);
        }
    });

    function checkLogin(){
        var isLogin = util.getCookie()['isLogin'];
        var watch = document.getElementById("watch");
        var unwatch =document.getElementById("unwatch");
        if(!isLogin){
            return false;
        }else{
            watch.style.display = "none";
            unwatch.style.display = "inline-block";
        }
    }

    checkLogin();

    function showVideo(obj){
        var htmlstr = '<video src="'+ obj.dataset.link+'" width="890" height="500" controls="" autoplay></video>';
        modal.show(htmlstr);
    }
    

    var slider = new Slider({
      //视口容器
      container: document.getElementById('gslide'),
      // 图片列表
      images: [
        "../img/banner1.jpg",
        "../img/banner2.jpg",
        "../img/banner3.jpg",
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

    var $ = function(selector){
        return [].slice.call(document.querySelectorAll(selector));
    }

    var cursors = $('.cursor');
    var container = $('.g-slide')[0];
    var larrow = $('.u-larrow')[0];
    var rarrow = $('.u-rarrow')[0];

    cursors.forEach(function(cursor, index){
      cursor.addEventListener('click', function(){
        if(cursor.className.indexOf('z-active')===-1){
            slider.nav(index);
        }
      })
    })


    container.addEventListener('mouseover', function(){
            slider.stop();
    });

    container.addEventListener('mouseout',function(){
        slider.autoPlay();
    });

    larrow.addEventListener('click', function(){
        slider.prev();
    });

    rarrow.addEventListener('click', function(){
        slider.next();
    });

    slider.on('nav', function(ev){
        cursors.forEach(function(cursor, index){
            if(ev.pageIndex === index){
                cursor.className = "z-active";
            }else{
                cursor.className = "";
            }
        });
    });
    slider.nav(0);
    slider.autoPlay();

    //获取课程信息
    // var pager = new Paginator({
    //     currentPage: 1,
    //     totalPages: 10,
    //     container: document.getElementById("pwapper")
    // });
    // pager.show(1);

    var options = {
        container: document.getElementById("pwapper"),
        pageSize: 20,
        currentPage: 1
    };

    var pager;
    var htmlstr = "";
    var courseinfo = document.getElementById("courseinfo").getElementsByTagName('article')[0];
    var detail = document.getElementById("detail");
    
    // var courses = courseinfo.getElementsByClassName("course");
    //                     courses = [].slice.call(courses);
    //                     courses.forEach(function(course){
    //                         course.addEventListener("mouseenter", function(event){
    //                             console.log(event.target.offsetLeft);
    //                             console.log(event.target.offsetTop);
    //                             detail.style.left = event.target.offsetLeft + 'px';
    //                             detail.style.top = event.target.offsetTop + 'px';
    //                             detail.style.display = "block";
    //                         });
    //                     });

    util.get(
        'http://study.163.com/webDev/couresByCategory.htm', 
        {pageNo:options.currentPage,psize:options.pageSize,type:10},
        function(data){
            var obj = JSON.parse(data);
            options.totalPages = obj.totalPage;
            pager = new Paginator(options);
            pager.onPageClicked = function(){
                util.get(
                    'http://study.163.com/webDev/couresByCategory.htm', 
                    {pageNo:pager.currentPage,psize:pager.pageSize,type:10},
                    function(data){
                        var dataObj = JSON.parse(data);
                        var template='<section class="course" data-id="{ $id }" data-middle-photo-url="{ $middlePhotoUrl }"\
                                          data-name="{ $name }" data-provider="{ $provider }" data-learner-count="{ $learnerCount }"\
                                          data-category-name="{ $categoryName  }" data-description="{ $description }" >\
                                    <div class="course_link">\
                                        <div class="img f-oh">\
                                            <img class="pic" src="{ $middlePhotoUrl  }" alt=" { $name } ">\
                                        </div>\
                                        <h3 class="f-elipsis title">{ $name }</h3>\
                                    </div>\
                                    <div class="course_info">\
                                        <p><a href="#">{ $provider }</a></p>\
                                        <div class="like">\
                                            <span class="user_icon"></span>\
                                            <span class="like_sum">{ $learnerCount } </span>\
                                        </div>\
                                        <div class="price">&yen; { $price }</div>\
                                    </div>\
                                </section>';
                        var list = dataObj.list;
                        htmlstr = "";
                        for(var i=0,len=list.length; i<len; i++){
                            htmlstr += util.renderTemplate(template, list[i]);
                        }
                        courseinfo.innerHTML = htmlstr;

                        var detailTemplate =
                                '<div class="card f-cb">\
                                    <a class="f-fl" href="#"><img src="{ $middlePhotoUrl }" alt="" width="224" height="124"></a>\
                                    <div class="intro f-oh">\
                                        <h2><a class="title" href="#">{ $name }</a></h2>\
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


                        var courses = courseinfo.getElementsByClassName("course");
                        courses = [].slice.call(courses);
                        courses.forEach(function(course){
                            course.addEventListener("mouseenter", function(event){
                                console.log(event.target.offsetLeft);
                                console.log(event.target.offsetTop);
                                detail.innerHTML = util.renderTemplate(detailTemplate, event.target.dataset);
                                detail.style.left = event.target.offsetLeft + 'px';
                                detail.style.top = event.target.offsetTop + 'px';
                                detail.style.display = "block";
                            });
                        });

                    });
            }
            pager.show(1);

    });


    
    var liTemplate = 
        '<li class="list_item f-cb">  \
            <a href="http://study.163.com/course/introduction/{ $id }.htm" target="_blank" title="{ $name }" class="f-fl"><img src="{ $smallPhotoUrl  }" alt="" width="50" height="50"></a> \
            <div class="item_info f-oh"> \
                <a href="http://study.163.com/course/introduction/{ $id }.htm" title={ $name }><h3 class="f-elipsis">{ $name }</h3></a> \
                <div class="like"> \
                    <span class="user_icon"></span> \
                    <span class="like_sum">{ $learnerCount  }</span> \
                </div> \
            </div> \
        </li>';
    var ulstr = "";
    var hostlist = document.getElementById("hostlist");
    // var hostlist2 = document.getElementById("hostlist2");
    var hotscroll = document.getElementById("hotscroll");
    util.get(
        'http://study.163.com/webDev/hotcouresByCategory.htm',
        {},
        function(data){
            var dataList = JSON.parse(data);
            for(var i=0,len=dataList.length; i<len;i++){
                ulstr += util.renderTemplate(liTemplate, dataList[i]);
            }
            ulstr += ulstr;
            hostlist.innerHTML = ulstr;

            function animate (offset) {
                if (offset == 0) {
                    return;
                }
                hostlist.style.top = hostlist.style.top || 0;
                var time = 300;
                var inteval = 10;
                var speed = offset/(time/inteval);
                var top = parseInt(hostlist.style.top) + offset;
                
                var go = function (){
                    if ( (speed > 0 && parseInt(hosthost.style.top) < top) || (speed < 0 && parseInt(hostlist.style.top) > top)) {
                        hostlist.style.top = parseInt(hostlist.style.top) + speed + 'px';
                        setTimeout(go, inteval);
                    }
                    else {
                        hostlist.style.top = top + 'px';
                        if(top<-1387){
                            hostlist.style.top = 0 + 'px';
                        }
                        // if(top<(-600 * len)) {
                        //     hostlist.style.top = '-600px';
                        // }
                        // animated = false;
                    }
                }
                go();
            }
            // setInterval(function(){animate(-73)}, 5000);
             // var speed=65
             //  hosthostlist2.innerHTML=hostlist.innerHTML
             //    function Marquee2(){
             //      if(hostlist2.offsetTop-hotscroll.scrollTop<=0)
             //         hotscroll.scrollTop-=hostlist.offsetHeight;
             //           else{
             //            hotscroll.scrollTop++;
             //               }
             //                  }
             //                     var MyMar2=setInterval(Marquee2,speed)
             //                        hotscroll.onmouseover=function() {clearInterval(MyMar2)}
             //                           hotscroll.onmouseout=function() {MyMar2=setInterval(Marquee2,speed)}


        });
