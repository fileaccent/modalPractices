(function() { // 视频播放器
  let src=`https://v-cdn.zjol.com.cn/280443.mp4`;
  let video = document.querySelector('video');
  let play = document.querySelector('.play-pause > img[src="image/play.svg"]');
  let pause = document.querySelector('.play-pause > img[src="image/pause.svg"]');
  async function blobSrc (src) {
    let response = await fetch(src,{
      responseType: 'blob',
      withCredentials: true
    })
    let blob = await response.blob();
    video.src =  URL.createObjectURL(blob);
  }
  blobSrc(src);
  document.querySelector('.button').onclick = function () {
    blobSrc(document.querySelector('.input-src input[type="text"]').value);
  }
  video.addEventListener('error', function(){
    var error = video.error;
    switch(error.code){
        case 1 :
            console.log("视频的下载过程被中止");
            break;
        case 2 :
            console.log("网络发生故障，视频的下载过程被中止");
            break;
        case 3 :
            alert('解码失败');
            break;
        case 4 :
            console.log("媒体资源不可用或是媒体格式不被支持");
    }
  },false);
  video.onloadstart = function (event) {
    console.log('开始加载');
    console.log(event);
  }
  video.onloadedmetadata = function (event) {
    console.log('元数据加载完毕');
    console.log(event);
  }
  video.addEventListener('progress',function(event){
    var hint = document.getElementById('hint');
    console.log(event);
    if(video.networkState === 2){
        //计算已加载的字节数与总字节数
        hint.innerHTML = "加载中...[" + event.loaded + "/" + event.total + "byte]";
    }
    else if(video.networkState === 3){
        hint.innerHTML = "加载失败";
    }
  },false);
  video.addEventListener('canplay', function () { // 初始化
    // 重载时初始化,开始,暂停按钮
    play.style.display = 'block';
    pause.style.display = 'none';
    let totalTime = parseInt(video.duration / 60) + ':' + PrefixZero(parseInt(video.duration) % 60, 2);
    document.querySelector('.time').innerHTML = `0:00 / ${totalTime}`;
    // 初始化音量
    document.querySelector('.volume-range > input[type="range"]').value  = video.volume * 100;
    // 播放,暂停事件
    video.addEventListener('click', function () {
      if (!video.paused) {
        video.pause();
        play.style.display = 'block';
        pause.style.display = 'none';
      } else {
        video.play();
        play.style.display = 'none';
        pause.style.display = 'block';
      }
    })
    video.addEventListener('timeupdate', function () { // 实时更新数据
      // 实时更新时间
      let currentTime = parseInt(video.currentTime);
      let nowTime = parseInt(currentTime / 60) + ':' + PrefixZero(currentTime % 60, 2);
      document.querySelector('.time').innerHTML = `${nowTime} / ${totalTime}`;
      // 实时更新进度条
      rangePlayed.style.width = video.currentTime / video.duration * rangeBox.offsetWidth  + 'px';
      rangeNoplay.style.width = rangeBox.offsetWidth - (video.currentTime / video.duration * rangeBox.offsetWidth) + 'px';
    })
  })
  // 进度条部分
  let rangePlayed = document.querySelector('.range-line-played');
  let rangeNoplay = document.querySelector('.range-line-noplay');
  let rangePoint = document.querySelector('.range-point');
  let rangeBox = document.querySelector('.range-box');
  document.querySelector('.range-point').addEventListener('mousedown', function (event) {
    document.body.onmousemove = function (event) {
      let distanceX = event.clientX - rangeBox.getBoundingClientRect().left;
      rangePlayed.style.width = distanceX  + 'px';
      rangeNoplay.style.width = rangeBox.offsetWidth - distanceX  + 'px';
    }
    document.body.onmouseup = function () {
      document.body.onmousemove = null;
    }
  })

  document.querySelector('.range-box').onclick = function (event) {
    let distanceX = event.clientX - rangeBox.getBoundingClientRect().left;
    video.currentTime = distanceX * video.duration / rangeBox.offsetWidth;
    rangePlayed.style.width = distanceX  + 'px';
    rangeNoplay.style.width = rangeBox.offsetWidth - distanceX  + 'px';
  }

  play.addEventListener('click', function () {
    startPlay();
  })

  pause.addEventListener('click', function () {
    startPause();
  })

  document.querySelector('.speed').addEventListener('click', function () {
    if (video.playbackRate < 2) {
      video.playbackRate += 0.25;
    } else {
      video.playbackRate = 1;
    }
    document.querySelector('.speed > div').innerHTML = video.playbackRate + ' 倍速';
  })

  document.querySelector('.volume-img').onclick = function () {
    video.muted = !video.muted;
    if (video.muted) {
      document.querySelector('img[src="image/muted.svg"]').style.display = 'block';
      document.querySelector('img[src="image/volume.svg"]').style.display = 'none';
      document.querySelector('.volume-range > input[type="range"]').value = 0;
    } else {
      document.querySelector('img[src="image/muted.svg"]').style.display = 'none';
      document.querySelector('img[src="image/volume.svg"]').style.display = 'block';
      document.querySelector('.volume-range > input[type="range"]').value = video.volume * 100;
    }
  }

  document.querySelector('.volume-range > input[type="range"]').onchange = function () {
    video.volume = document.querySelector('.volume-range > input[type="range"]').value / 100;
  }

  document.querySelector('.fullscreen > img[src="image/fullscreen.svg"]').onclick = function (event) {
    document.querySelector('.video-window').webkitRequestFullScreen();
    // 进入全屏重新计算进度条
    setTimeout(()=> {
      rangePlayed.style.width = video.currentTime / video.duration * rangeBox.offsetWidth  + 'px';
      rangeNoplay.style.width = rangeBox.offsetWidth - (video.currentTime / video.duration * rangeBox.offsetWidth) + 'px';
    },100)
  }

  document.querySelector('.fullscreen > img[src="image/cancelFullscreen.svg"]').onclick = function () {
    document.webkitCancelFullScreen();
  }

  document.addEventListener("webkitfullscreenchange", function() {
    if (document.webkitIsFullScreen) {
      document.querySelector('.fullscreen > img[src="image/fullscreen.svg"]').style.display = 'none';
      document.querySelector('.fullscreen > img[src="image/cancelFullscreen.svg"]').style.display = 'block';
    } else {
      document.querySelector('.fullscreen > img[src="image/fullscreen.svg"]').style.display = 'block';
      document.querySelector('.fullscreen > img[src="image/cancelFullscreen.svg"]').style.display = 'none';
    }
    }, false);
  video.onended = function () {
    play.style.display = 'block';
    pause.style.display = 'none';
  }
  // 优化显示
  // 静止时,隐藏控制栏
  let isMove = false;
  let timer = null;
  video.onmousemove = function(){
    let controlPart = document.querySelector('.control-part');
    isMove = true;
    clearTimeout(timer);
    controlPart.style.display = 'block';
    timer = setTimeout(function(){
        isMove = false;
        controlPart.style.display = 'none';
    },2000);
  }
  // 在video上移动时, 显示控制栏,不在时隐藏控制栏
  document.body.onmousemove = function (event) {
    let controlPart = document.querySelector('.control-part');
    let videoWindow = document.querySelector('.video-window');
    let leftBorder = videoWindow.getBoundingClientRect().left;
    let rightBorder = videoWindow.getBoundingClientRect().left + videoWindow.offsetWidth;
    let topBorder = videoWindow.getBoundingClientRect().top;
    let bottomBorder = videoWindow.getBoundingClientRect().top + videoWindow.offsetHeight;
    let isInVideo = event.clientX >= leftBorder && event.clientX <= rightBorder && event.clientY >= topBorder && event.clientY <= bottomBorder;
    if (isInVideo) {
      controlPart.style.display = 'block';
    } else {
      controlPart.style.display = 'none';
    }
  }
  function startPlay () {
    video.play();
    play.style.display = 'none';
    pause.style.display = 'block';
  }
  function startPause () {
    video.pause();
    play.style.display = 'block';
    pause.style.display = 'none';
  }
  function PrefixZero(num, n) { // 在数字前面自动补零,补成相应位数
    return (Array(n).join(0) + num).slice(-n);
  }
})()