'use strict';

const {
  isSupportedProduct,
  extractWeightKg,
} = require('./jd-cat-food-uni-price.user.js');

const weightCases = [
  ['盘锦大米 蟹田大米 东北大米10斤*2/箱装 珍珠米 20斤', 10],
  ['福临门 东北大米 盘锦大米 10斤*4 40斤整箱装', 20],
  ['芭迈香泰国香米丝苗米 长粒香米 进口一级大米20斤家庭装 5斤*4整箱', 10],
  ['黄小米 山西小米 2.5kg*4 袋装', 10],
  ['猫粮 2kg*6', 12],
  ['猫粮 10kg/20斤', 10],
  ['香米 5kg', 5],
  ['pidan经典混合猫砂 豆腐膨润土混合 2.4kg款8包装', 19.2],
  ['pidan经典混合猫砂 豆腐膨润土混合 2.4kg款4包装', 9.6],
];

const unitPriceCases = [
  ['福临门 东北大米 盘锦大米 10斤*4 40斤整箱装', 97.11, 4.8555, 2.42775],
  ['芭迈香泰国香米丝苗米 长粒香米 进口一级大米20斤家庭装 5斤*4整箱', 71.51, 7.151, 3.5755],
];

const productMatchCases = [
  ['黄小米 山西小米 2.5kg*4 袋装', true],
  ['小米（MI）REDMI K80 至尊版 天玑9400+ 7410mAh大电池 月岩白 12GB+512GB 红米5G手机 国家补贴', false],
  ['紫米Z5【3C认证可上飞机】笔记本充电宝145W大功率25000毫安大容量适用苹果华为小米联想电脑移动电源 【Z5】145W充电宝25000mAh 单口140W快充|100W自充|可上飞机高铁', false],
  ['福临门 东北大米 盘锦大米 10斤*4 40斤整箱装', true],
  ['猫粮 2kg*6', true],
];

runTest();

function runTest() {
  let failed = false;

  console.log('运行权重提取用例...');
  weightCases.forEach(([name, expectedKg]) => {
    const actualKg = extractWeightKg(name);
    const passed = nearlyEqual(actualKg, expectedKg);
    logResult(passed, name, `expected ${expectedKg}kg, got ${actualKg}kg`);
    failed ||= !passed;
  });

  console.log('\n运行单价用例...');
  unitPriceCases.forEach(([name, price, expectedPerKg, expectedPer500g]) => {
    const totalKg = extractWeightKg(name);
    const actualPerKg = totalKg ? price / totalKg : null;
    const actualPer500g = totalKg ? price / (totalKg * 2) : null;
    const perKgPassed = nearlyEqual(actualPerKg, expectedPerKg);
    const per500gPassed = nearlyEqual(actualPer500g, expectedPer500g);

    logResult(
      perKgPassed && per500gPassed,
      name,
      `预期 ${expectedPerKg}/kg, ${expectedPer500g}/500g；得到 ${actualPerKg}/kg, ${actualPer500g}/500g`
    );

    failed ||= !(perKgPassed && per500gPassed);
  });

  console.log('\n运行产品匹配用例...');
  productMatchCases.forEach(([name, expected]) => {
    const actual = isSupportedProduct(name);
    const passed = actual === expected;
    logResult(passed, name, `expected match=${expected}, got ${actual}`);
    failed ||= !passed;
  });

  if (failed) {
    process.exitCode = 1;
    console.error('\n部分测试用例失败');
    return;
  }

  console.log('\n所有测试用例均已通过');
}

function logResult(passed, name, detail) {
  const prefix = passed ? 'PASS' : 'FAIL';
  console.log(`[${prefix}] ${name}`);
  if (!passed) {
    console.log(`  ${detail}`);
  }
}

function nearlyEqual(actual, expected, epsilon = 1e-9) {
  if (actual === null || actual === undefined) return false;
  return Math.abs(actual - expected) < epsilon;
}
