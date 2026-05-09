# AGENTS.md

## 仓库概述

浏览器用户脚本（Tampermonkey/Violentmonkey）集合，无构建系统、无依赖、无 CI。

## 结构

- 每个脚本一个目录：`{name}/{name}.user.js` + `README.md`
- 脚本通过 `@downloadURL` / `@updateURL` 指向 `master` 分支的 raw 文件，发布即推送
- `jd-product-unit-price/test.js` 是唯一的测试文件，使用 Node.js 直接运行

## 关键命令

```bash
# 运行单价计算脚本的测试（唯一有测试的脚本）
node jd-product-unit-price/test.js
```

## 开发规范

- 脚本头部必须包含完整的 `==UserScript==` 元数据块（`@name`、`@namespace`、`@match`、`@version`、`@downloadURL`、`@updateURL`）
- 纯函数需通过 `module.exports` 导出以支持 Node.js 测试（参考 `jd-product-unit-price.user.js` 末尾的条件导出）
- 版本号遵循 semver，修改脚本时同步更新 `@version`
- 中文注释和文档

## 注意事项

- 无 linter / formatter / typecheck，代码风格靠约定
- 无 package.json，不能用 npm 命令
- 脚本直接在浏览器环境运行，测试文件用 Node.js，注意环境差异（`typeof window`、`typeof module`）
