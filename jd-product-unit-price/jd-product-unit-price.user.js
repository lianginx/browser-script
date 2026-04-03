// ==UserScript==
// @name        京东商品单价计算
// @namespace   @lianginx/jd-product-unit-price
// @match       https://cart.jd.com/cart_index*
// @icon        https://storage.360buyimg.com/retail-mall/mall-common-component/favicon.ico
// @grant       none
// @version     0.3.6
// @author      lianginx
// @description 在京东购物车中识别猫粮、大米、小米商品并自动计算每公斤和每 500g 的单价，方便快速比较性价比。
// @downloadURL https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/jd-product-unit-price/jd-product-unit-price.user.js
// @updateURL   https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/jd-product-unit-price/jd-product-unit-price.user.js
// @run-at      document-idle
// ==/UserScript==

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  main();
}

async function main() {
  const state = {
    cartList: await waitForElement('[class*="_infiniteScroll_center_"]'),
    cartObserver: null,
  };

  renderGoodsUnitPrice();
  observeCartChanges(state);
  observePageChanges(state);
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
      if (!isSupportedProduct(goodName)) return;
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

function isSupportedProduct(goodName) {
  if (/手机|REDMI|充电宝|电视|平板/i.test(goodName)) {
    return false;
  }

  return /猫粮|狗粮|猫砂|(.)米/.test(goodName);
}

function observeCartChanges(state) {
  state.cartObserver?.disconnect();

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

  observer.observe(state.cartList, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  state.cartObserver = observer;
}

function observePageChanges(state) {
  const observer = new MutationObserver(mutations => {
    const dirtyGoods = new Set();
    let nextCartList = null;

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (isSelfMutation(node)) return;

        const cartList = node.matches?.('[class*="_infiniteScroll_center_"]')
          ? node
          : node.querySelector?.('[class*="_infiniteScroll_center_"]');
        if (cartList) {
          nextCartList = cartList;
        }

        const good = getGoodElement(node);
        if (good) {
          dirtyGoods.add(good);
          return;
        }

        node.querySelectorAll?.('[class*="_product-item_"]').forEach(item => {
          dirtyGoods.add(item);
        });
      });
    });

    if (nextCartList && nextCartList !== state.cartList) {
      state.cartList = nextCartList;
      observeCartChanges(state);
      renderGoodsUnitPrice(nextCartList);
    }

    dirtyGoods.forEach(good => {
      renderGoodsUnitPrice(good);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
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
  const normalizedName = goodName.replace(/[／｜]/g, '/');

  const segmentWeights = normalizedName
    .split(/[\/]/)
    .map(extractWeightFromSegment)
    .filter(weight => weight !== null);

  if (segmentWeights.length > 0) {
    return Math.max(...segmentWeights);
  }

  return extractWeightFromSegment(normalizedName);
}

function convertWeightToKg(value, unit) {
  const normalizedUnit = unit.toLowerCase();

  if (normalizedUnit === 'g') {
    return value / 1000;
  }

  if (normalizedUnit === '斤') {
    return value * 0.5;
  }

  return value;
}

function extractWeightFromSegment(segment) {
  let maxWeight = null;

  const multipliedPattern = /(\d+(?:\.\d+)?)\s*(kg|g|斤)\s*[*x×X]\s*(\d+(?:\.\d+)?)/g;
  let multipliedMatch;
  while ((multipliedMatch = multipliedPattern.exec(segment)) !== null) {
    const value = Number.parseFloat(multipliedMatch[1]);
    const unit = multipliedMatch[2];
    const count = Number.parseFloat(multipliedMatch[3]);
    if (!Number.isFinite(value) || !Number.isFinite(count)) continue;

    const totalKg = convertWeightToKg(value, unit) * count;
    maxWeight = maxWeight === null ? totalKg : Math.max(maxWeight, totalKg);
  }

  const packagePattern = /(\d+(?:\.\d+)?)\s*(kg|g|斤)\s*(?:款\s*)?(\d+(?:\.\d+)?)\s*(?:包装|包)/g;
  let packageMatch;
  while ((packageMatch = packagePattern.exec(segment)) !== null) {
    const value = Number.parseFloat(packageMatch[1]);
    const unit = packageMatch[2];
    const count = Number.parseFloat(packageMatch[3]);
    if (!Number.isFinite(value) || !Number.isFinite(count)) continue;

    const totalKg = convertWeightToKg(value, unit) * count;
    maxWeight = maxWeight === null ? totalKg : Math.max(maxWeight, totalKg);
  }

  const singlePattern = /(\d+(?:\.\d+)?)\s*(kg|g|KG|G|斤)/g;
  let singleMatch;
  while ((singleMatch = singlePattern.exec(segment)) !== null) {
    const value = Number.parseFloat(singleMatch[1]);
    const unit = singleMatch[2];
    if (!Number.isFinite(value)) continue;

    const totalKg = convertWeightToKg(value, unit);
    maxWeight = maxWeight === null ? totalKg : Math.max(maxWeight, totalKg);
  }

  return maxWeight;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isSupportedProduct,
    extractWeightKg,
    convertWeightToKg,
    extractWeightFromSegment,
  };
}
