# X 推文自动展开

自动展开 X/Twitter 时间线中被折叠的长推文，无需手动点击"显示更多"。

## 使用方式

[点击安装](https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/twitter-expand-tweets/twitter-expand-tweets.user.js)

1. 在 Tampermonkey、Violentmonkey 等用户脚本管理器中安装脚本
2. 打开 X/Twitter 首页
3. 脚本会自动展开所有被折叠的长推文

## 功能

- 自动点击时间线中所有"显示更多"按钮
- 监听动态加载的新推文并自动展开
- 兼容 x.com 和 twitter.com

## 适用页面

- `https://x.com/*`
- `https://twitter.com/*`

## 注意事项

- 依赖 X/Twitter 的 `data-testid` 属性，若平台 DOM 结构变化可能需要调整选择器
