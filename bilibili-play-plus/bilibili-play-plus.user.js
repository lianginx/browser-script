// ==UserScript==
// @name        优化哔哩哔哩播放体验
// @namespace   @lianginx/bilibili-play-plus
// @match       https://www.bilibili.com/video/*
// @icon        https://i0.hdslb.com/bfs/static/jinkela/long/images/favicon.ico
// @grant       none
// @version     0.3.0
// @author      lianginx
// @description 优化 B 站视频页播放体验。
// @downloadURL https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/bilibili-play-plus/bilibili-play-plus.user.js
// @updateURL   https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/bilibili-play-plus/bilibili-play-plus.user.js
// ==/UserScript==

'use strict';

main();

function main() {
  const tasks = [
    { action: autoWide, status: false },
    { action: adjustPosition, status: false },
  ];
  const observer = new MutationObserver(() => {
    for (const task of tasks) {
      if (task.status) return;
      task.status = task.action();
    }
    if (tasks.every(task => task.status))
      observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

// 自动宽屏
function autoWide() {
  const targetSelector = '.bpx-player-ctrl-btn.bpx-player-ctrl-wide';
  const btn = document.querySelector(targetSelector);
  if (!btn) return false;
  btn.click();
  return true;
}

// 调整标题、UP 信息位置
function adjustPosition() {
  const title = document.querySelector('#viewbox_report')
  const container = document.querySelector('.left-container.scroll-sticky')
  const action = document.querySelector('#arc_toolbar_report')
  const play = document.querySelector('#playerWrap')
  const danmukuBox = document.querySelector('#danmukuBox')

  play.style.marginTop = '1.2rem'
  danmukuBox.style.marginTop = 0

  // 移动标题栏到视频下方
  container.moveBefore(title, action)

  // 宽屏模式下，调整 UP 信息位置
  const upPanelContainer = document.querySelector('.up-panel-container')
  const playHeightObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      upPanelContainer.style.marginTop = `${entry.target.scrollHeight + 20}px`
    }
  });

  // 宽屏模式下，调整右栏顶部外边距
  const playWidthObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      if (entry.target.scrollWidth > title.scrollWidth) {
        playHeightObserver.observe(play)
      } else {
        playHeightObserver.unobserve(play)
        upPanelContainer.style.marginTop = 0
      }
    }
  });
  playWidthObserver.observe(play)

  return true
}
