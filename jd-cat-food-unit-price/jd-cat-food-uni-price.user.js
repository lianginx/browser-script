// ==UserScript==
// @name        猫粮单价计算
// @namespace   @lianginx/jd-cat-food-unit-price
// @match       https://cart.jd.com/cart_index*
// @icon        https://storage.360buyimg.com/retail-mall/mall-common-component/favicon.ico
// @grant       none
// @version     0.1.0
// @author      lianginx
// @description 在京东购物车中识别猫粮商品并自动计算每公斤和每 500g 的单价，方便快速比较性价比。
// @run-at      document-idle
// ==/UserScript==

main();

async function main() {
  // 等待购物车加载
  await waitForElement('._infiniteScroll_center_jgvx9_52');

  // 获取商品列表
  const goods = document.querySelectorAll('._product-item_1s9zz_52')
  console.log('goods count: ', goods.length);

  // 筛选猫粮商品
  goods.forEach(good => {
    const goodName = good.querySelector('._goodTitle_1xhs4_52._title__hover_1xhs4_84')?.getAttribute('title')?.trim();
    if (!goodName) return;
    if (!goodName.includes('猫粮')) return;
    console.group(goodName)

    try {
      // 获取重量
      const totalKg = extractWeightKg(goodName);
      if (!totalKg) return;
      console.log('weight (kg): ', totalKg);

      // 获取价格
      const fullPrice = good.querySelector('._price-normal_czw0e_69')?.textContent.trim();
      const price = fullPrice ? parseFloat(fullPrice.replace(/￥|¥/, '')) : null;
      console.log('price: ', price);
      if (!price) return;

      // 计算猫粮单价
      const unitPriceByKg = price / totalKg;
      const unitPriceByJin = price / (totalKg * 2);
      console.log('单价(公斤): ', unitPriceByKg);
      console.log('单价(市斤): ', unitPriceByJin);

      // 插入单价到 DOM
      const unitPrice = document.createElement('div');
      unitPrice.innerHTML = `
<span style="font-weight: 500;">¥${unitPriceByKg.toFixed(2)}</span><span style="font-size: 10px">/kg</span>
|
<span style="font-weight: 500;">¥${unitPriceByJin.toFixed(2)}</span><span style="font-size: 10px">/500g</span>`;
      unitPrice.style.fontSize = '12px';
      unitPrice.style.color = '#333';
      unitPrice.style.lineHeight = '1';
      good.querySelector('._rowItem_1s9zz_97._flexPriceAndPromotion_1s9zz_112 > div')
        .before(unitPrice);
    } finally {
      console.groupEnd();
    }
  })
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
