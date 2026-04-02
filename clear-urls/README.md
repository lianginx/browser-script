# URL 追踪清理

清理 URL 追踪参数（支持规则匹配 + 域名策略 + SPA）

## 使用方式

[点击安装](https://raw.githubusercontent.com/lianginx/browser-script/refs/heads/master/clear-urls/clear-urls.user.js)

1. 在 Tampermonkey、Violentmonkey 等用户脚本管理器中安装脚本
2. 脚本将自动在所有网站运行
3. 访问带追踪参数的链接时，参数会被自动清理

## 功能

- 精确匹配清理常见的追踪参数（如 `vd_source`、`trackid` 等）
- 正则匹配清理具有模式的追踪参数（如 `utm_*`、`spm`、`from_*` 等）
- 支持按域名启用/禁用策略
- 支持单页应用（SPA），通过 hook History API 检测 URL 变化
- 点击链接前自动清理链接中的追踪参数

## 配置

脚本内置了以下配置：

- **精确匹配参数**：`vd_source`、`trackid`、`ved`、`ei`、`sca_esv` 等
- **正则匹配规则**：`^utm_`、`^spm`、`^from_`、`^share_`、`^ref_`
- **域名策略**：默认全局启用，可配置特定域名

如需自定义规则，可编辑脚本中的 `config` 对象。

## 适用页面

- `*://*/*`（所有网站）

## 注意事项

- 脚本在 `document-start` 时运行，确保最早生效
- 使用 `history.replaceState` 清理 URL，不会产生额外历史记录
- 清理过程在微任务队列中执行，不影响页面性能