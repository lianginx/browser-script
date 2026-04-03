// ==UserScript==
// @name        哔哩哔哩增强
// @namespace   @lianginx/bilibili-play-plus
// @match       https://www.bilibili.com/video/*
// @icon        https://i0.hdslb.com/bfs/static/jinkela/long/images/favicon.ico
// @grant       none
// @version     0.2.2
// @author      lianginx
// @description 优化 B 站视频页播放体验，自动宽屏、取消顶部栏固定，并在播放时自动滚动到播放器。
// @downloadURL https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/bilibili-play-plus/bilibili-play-plus.user.js
// @updateURL   https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/bilibili-play-plus/bilibili-play-plus.user.js
// ==/UserScript==

'use strict';

(function main() {
  const tasks = [
    { action: cancelHeaderFixed, status: false },
    { action: scrollToPlay, status: false },
    { action: autoWide, status: false },
  ];

  const observer = new MutationObserver(() => {
    tasks.forEach(task => {
      if (!task.status) {
        task.status = task.action();
      }
    });
    if (tasks.every(task => task.status)) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// 取消 header 固定
function cancelHeaderFixed() {
  const style = document.createElement('style');
  style.textContent = `
  .bili-header.fixed-header .bili-header__bar {
    position: static !important;
    box-shadow: none !important;
    border-bottom: 1px solid #ebebeb;
  }
  .v-popover {
    z-index: 99 !important;
  }
  `;
  document.head.appendChild(style);
  return true;
}

// 自动宽屏
function autoWide() {
  const targetSelector = '.bpx-player-ctrl-btn.bpx-player-ctrl-wide';
  const btn = document.querySelector(targetSelector);
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}

// 播放视频时滚动到合适位置
function scrollToPlay() {
  const videoSelector = '#bilibili-player video';
  const videoElement = document.querySelector(videoSelector);
  if (videoElement) {
    videoElement.addEventListener('play', scrollToVideo);
    return true;
  }
  return false;
}

// 滚动视频元素到合适位置
function scrollToVideo() {
  const videoSelector = '#bilibili-player';
  const videoElement = document.querySelector(videoSelector);
  if (videoElement) {
    setTimeout(() => videoElement.scrollIntoView({ block: 'center' }), 1000);
  }
}
