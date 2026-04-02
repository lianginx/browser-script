// ==UserScript==
// @name         Clear URL Tracking Params (Enhanced)
// @namespace    @lianginx/clearUrls
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=clearurls.dev
// @grant        none
// @version      1.0.0
// @author       lianginx
// @description  清理 URL 追踪参数（支持规则匹配 + 域名策略 + SPA）
// @downloadURL  https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/clear-urls/clear-urls.user.js
// @updateURL    https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/clear-urls/clear-urls.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  /** ========================
   * ⚙️ 配置区
   * ======================== */

  const config = {
    debug: false,

    // 精确匹配参数
    exactParams: new Set([
      // bilibili
      'vd_source', 'trackid',

      // google（保守版）
      'ved', 'ei', 'sca_esv', 'ved', 'ei', 'iflsig', 'gs_lp', 'sca_esv',
      'uact', 'source', 'sclient', 'oq',
    ]),

    // 正则规则（推荐核心）
    patterns: [
      /^utm_/,
      /^spm/,
      /^from_/,
      /^share_/,
      /^ref_/,
    ],

    // 按域名控制（为空表示全局启用）
    domains: {
      // 示例：
      // 'bilibili.com': true,
      // 'google.com': true,
    },
  };

  /** ========================
   * 🧠 工具函数
   * ======================== */

  function log(...args) {
    if (config.debug) {
      console.log('[clear-url]', ...args);
    }
  }

  function isEnabledForDomain(hostname) {
    const { domains } = config;
    if (!domains || Object.keys(domains).length === 0) return true;

    return Object.keys(domains).some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }

  function shouldRemove(param) {
    if (config.exactParams.has(param)) return true;
    return config.patterns.some(reg => reg.test(param));
  }

  function cleanURL(url) {
    let changed = false;

    for (const key of [...url.searchParams.keys()]) {
      if (shouldRemove(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }

    return changed;
  }

  /** ========================
   * 🚀 核心逻辑
   * ======================== */

  function cleanCurrentURL() {
    try {
      const url = new URL(window.location.href);

      if (!isEnabledForDomain(url.hostname)) return;

      const changed = cleanURL(url);

      if (changed && url.toString() !== window.location.href) {
        log('Cleaned:', window.location.href, '→', url.toString());
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (e) {
      log('Error:', e);
    }
  }

  /** ========================
   * 🔄 Hook History（替代 MutationObserver）
   * ======================== */

  function hookHistory() {
    const rawPush = history.pushState;
    const rawReplace = history.replaceState;

    history.pushState = function (...args) {
      const ret = rawPush.apply(this, args);
      queueMicrotask(cleanCurrentURL);
      return ret;
    };

    history.replaceState = function (...args) {
      const ret = rawReplace.apply(this, args);
      queueMicrotask(cleanCurrentURL);
      return ret;
    };

    window.addEventListener('popstate', cleanCurrentURL);
  }

  /** ========================
   * 🖱 点击前清理（可选增强）
   * ======================== */

  function hookLinkClick() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || !a.href) return;

      try {
        const url = new URL(a.href);

        if (!isEnabledForDomain(url.hostname)) return;

        const changed = cleanURL(url);

        if (changed) {
          a.href = url.toString();
          log('Link cleaned:', a.href);
        }
      } catch { }
    }, true);
  }

  /** ========================
   * 🟢 初始化
   * ======================== */

  cleanCurrentURL();
  hookHistory();
  hookLinkClick();

})();