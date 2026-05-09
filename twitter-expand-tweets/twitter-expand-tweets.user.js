// ==UserScript==
// @name         X 推文自动展开
// @namespace    @lianginx/twitter-expand-tweets
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @grant        none
// @version      1.0.1
// @author       lianginx
// @description  自动展开 X/Twitter 时间线中被折叠的长推文
// @downloadURL  https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/twitter-expand-tweets/twitter-expand-tweets.user.js
// @updateURL    https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/twitter-expand-tweets/twitter-expand-tweets.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function clickShowMoreButtons() {
    const buttons = document.querySelectorAll(
      '[data-testid="tweet"] button[data-testid="tweet-text-show-more-link"]'
    );
    buttons.forEach(btn => btn.click());
    console.log(`已尝试点击 ${buttons.length} 个"显示更多"按钮`);
  }

  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldCheck = true;
        break;
      }
    }
    if (shouldCheck) {
      setTimeout(clickShowMoreButtons, 100);
    }
  });

  const container = document.querySelector('div[aria-label="时间线：你的主页时间线"]') || document.body;

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  clickShowMoreButtons();
})();
