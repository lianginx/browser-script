# 京东猫粮单价计算

在京东购物车页面自动识别猫粮商品，并根据标题中的重量信息计算单价，便于横向比较不同商品的价格。

## 使用方式

- [点击安装](https://raw.githubusercontent.com/lianginx/browser-script/main/jd-cat-food-unit-price/jd-cat-food-uni-price.user.js)

1. 在 Tampermonkey、Violentmonkey 等用户脚本管理器中安装脚本
2. 打开京东购物车页面
3. 等待购物车内容加载完成后查看每个猫粮商品旁的单价结果

## 功能

- 扫描购物车中的商品标题，仅处理包含“猫粮”的商品
- 自动提取标题中的重量信息，支持 `kg`、`g`、`斤`
- 计算并展示每公斤和每 `500g` 的价格
- 将单价直接插入到商品价格区域附近，比较时无需手动换算

## 适用页面

- `https://cart.jd.com/cart_index*`

## 注意事项

- 依赖商品标题中存在明确重量信息
- 当前只处理标题包含“猫粮”的商品
- 如果京东购物车页面 DOM 结构发生变化，脚本可能需要同步调整选择器
