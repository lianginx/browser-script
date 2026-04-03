// ==UserScript==
// @name        猫粮单价计算
// @namespace   @lianginx/jd-cat-food-unit-price
// @match       https://cart.jd.com/cart_index*
// @icon        https://storage.360buyimg.com/retail-mall/mall-common-component/favicon.ico
// @grant       none
// @version     0.2.0
// @author      lianginx
// @description 在京东购物车中识别猫粮商品并自动计算每公斤和每 500g 的单价，方便快速比较性价比。
// @downloadURL https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/jd-cat-food-unit-price/jd-cat-food-uni-price.user.js
// @updateURL   https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/jd-cat-food-unit-price/jd-cat-food-uni-price.user.js
// @run-at      document-idle
// ==/UserScript==

main();

async function main() {
  const cartList = await waitForElement('[class*="_infiniteScroll_center_"]');

  renderGoodsUnitPrice();
  observeCartChanges(cartList);
}

function renderGoodsUnitPrice(scope = document) {
  const goods = scope.matches?.('[class*="_product-item_"]')
    ? [scope]
    : scope.querySelectorAll('[class*="_product-item_"]');
  console.log('goods count: ', goods.length);

  goods.forEach(good => {
    try {
      // 获取商品名称
      const goodName = good.querySelector('[class*="_goodTitle_"][title]')?.getAttribute('title')?.trim() || '';
      if (!goodName?.match(/猫粮/)) return;
      console.group(goodName);

      // 从商品名称中提取重量
      const totalKg = extractWeightKg(goodName);
      if (!totalKg) return;
      console.log('weight (kg): ', totalKg);

      // 获取价格
      const price = extractGoodPrice(good);
      console.log('price: ', price);
      if (!price) return;

      // 计算单价
      const unitPriceByKg = price / totalKg;
      const unitPriceByJin = price / (totalKg * 2);
      console.log('单价(公斤): ', unitPriceByKg);
      console.log('单价(市斤): ', unitPriceByJin);

      // 插入计算后的单价
      if (!good.querySelector('.jd-cat-food-unit-price')) {
        const priceAnchor = good.querySelector('[class*="_flexPriceAndPromotion_"] > div');
        if (!priceAnchor) return;
        const unitPrice = document.createElement('div');
        unitPrice.className = 'jd-cat-food-unit-price';
        unitPrice.style.fontSize = '12px';
        unitPrice.style.color = '#333';
        unitPrice.style.lineHeight = '1';
        unitPrice.style.marginBottom = '4px';
        unitPrice.innerHTML = `
<span class="kg" style="font-weight: 500;">¥${unitPriceByKg.toFixed(2)}</span><span style="font-size: 10px">/kg</span>
|
<span class="jin" style="font-weight: 500;">¥${unitPriceByJin.toFixed(2)}</span><span style="font-size: 10px">/500g</span>`;
        priceAnchor.before(unitPrice);
      }
      // 更新计算后的单价
      else {
        const kg = good.querySelector('.jd-cat-food-unit-price .kg');
        const kgText = `¥${unitPriceByKg.toFixed(2)}`;
        if (kg && kg.textContent !== kgText) {
          kg.textContent = kgText;
        }
        const jin = good.querySelector('.jd-cat-food-unit-price .jin');
        const jinText = `¥${unitPriceByJin.toFixed(2)}`;
        if (jin && jin.textContent !== jinText) {
          jin.textContent = jinText;
        }
      }
    } finally {
      console.groupEnd();
    }
  });
}

function extractGoodPrice(good) {
  const fullPrice = good.querySelector('[class*="_price-normal_"]')?.textContent?.trim();
  if (!fullPrice) return null;

  const price = parseFloat(fullPrice.replace(/￥|¥|,/g, ''));
  return Number.isFinite(price) ? price : null;
}

function observeCartChanges(cartList) {
  const observer = new MutationObserver(mutations => {
    const dirtyGoods = new Set();

    mutations.forEach(mutation => {
      if (isSelfMutation(mutation.target)) return;

      const changedNodes = [mutation.target, ...mutation.addedNodes, ...mutation.removedNodes];

      changedNodes.forEach(node => {
        const good = getGoodElement(node);
        if (good) {
          dirtyGoods.add(good);
          return;
        }

        if (!(node instanceof Element)) return;
        if (isSelfMutation(node)) return;

        if (node.matches?.('[class*="_product-item_"]')) {
          dirtyGoods.add(node);
        }
      });
    });

    dirtyGoods.forEach(good => {
      renderGoodsUnitPrice(good);
    });
  });

  observer.observe(cartList, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function getGoodElement(node) {
  if (node instanceof Element) {
    return node.closest('[class*="_product-item_"]');
  }

  const parent = node.parentElement;
  if (!parent) return null;
  return parent.closest('[class*="_product-item_"]');
}

function isSelfMutation(node) {
  if (node instanceof Element) {
    return node.classList.contains('jd-cat-food-unit-price')
      || Boolean(node.closest('.jd-cat-food-unit-price'));
  }

  const parent = node.parentElement;
  if (!parent) return false;
  return parent.classList.contains('jd-cat-food-unit-price')
    || Boolean(parent.closest('.jd-cat-food-unit-price'));
}

function extractWeightKg(goodName) {
  // 处理类似 "10kg/20斤" 的写法（避免重复计算）
  const primaryPart = goodName.split(/[\/|｜]/)[0];
  // 支持 g / kg / 斤 / 混合写法
  const weightMatch = primaryPart.match(/(\d+(?:\.\d+)?)\s*(kg|g|KG|G|斤)/g);
  if (!weightMatch) return null;

  let totalKg = 0;

  weightMatch.forEach(item => {
    const match = item.match(/(\d+(?:\.\d+)?)\s*(kg|g|KG|G|斤)/);
    if (!match) return;

    let value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 'g') {
      value = value / 1000;
    } else if (unit === '斤') {
      value = value * 0.5;
    }
    // kg 直接使用

    totalKg += value;
  });

  return totalKg;
}

function waitForElement(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
