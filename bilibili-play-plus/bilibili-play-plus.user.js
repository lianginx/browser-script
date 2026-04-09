// ==UserScript==
// @name        优化哔哩哔哩播放体验
// @namespace   @lianginx/bilibili-play-plus
// @match       https://www.bilibili.com/video/*
// @icon        https://i0.hdslb.com/bfs/static/jinkela/long/images/favicon.ico
// @grant       none
// @version     0.3.2
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
      if (!task.status)
        task.status = task.action();
    }
    if (tasks.every(task => task.status))
      observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

// 自动宽屏
function autoWide() {
  try {
    console.groupCollapsed('[优化哔哩哔哩播放体验] [自动宽屏]')
    console.log('前置检测中…')

    const wideBtn = document.querySelector('.bpx-player-ctrl-btn.bpx-player-ctrl-wide');
    if (!wideBtn) throw new Error('宽屏按钮未找到');

    wideBtn.click();
    console.log('宽屏已打开');

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  } finally {
    console.groupEnd();
  }
}

// 置顶播放器
function adjustPosition() {
  try {
    console.groupCollapsed('[优化哔哩哔哩播放体验] [置顶播放器]')
    console.log('前置检测中…')

    const title = document.querySelector('#viewbox_report')
    const container = document.querySelector('.left-container.scroll-sticky')
    const action = document.querySelector('#arc_toolbar_report')
    const play = document.querySelector('#playerWrap')
    const danmukuBox = document.querySelector('#danmukuBox')

    if (!title) throw new Error('标题栏未找到')
    if (!container) throw new Error('容器栏未找到')
    if (!action) throw new Error('操作栏未找到')
    if (!play) throw new Error("播放器元素未找到");
    if (!danmukuBox) throw new Error("弹幕栏未找到");

    console.log('开始优化…');

    // 移动标题栏到视频下方
    container.moveBefore(title, action)

    // 调整位置后优化样式
    play.style.marginTop = '1.2rem'
    danmukuBox.style.marginTop = 0

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

    console.log('优化完成');

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  } finally {
    console.groupEnd();
  }
}
