# Giscus 配置教程（从 0 到可用）

本文档用于把模板中的评论系统配置为你自己的 Giscus。

## 1. 前置条件

- 你有一个 GitHub 账号
- 你有一个公开仓库（建议单独创建一个用于评论，例如 `blog-comments`）
- 博客项目已能正常构建

## 2. 给仓库开启 Discussions

1. 打开你的评论仓库
2. 进入 `Settings` -> `General`
3. 找到 `Features`，勾选 `Discussions`
4. 保存并确认仓库已出现 `Discussions` 标签页

## 3. 安装 Giscus App

1. 打开 [Giscus App](https://github.com/apps/giscus)
2. 点击 `Install`
3. 选择你的账号
4. 选择 `Only select repositories`
5. 勾选你的评论仓库并完成安装

## 4. 在 Giscus 页面生成配置参数

1. 打开 [Giscus 官网](https://giscus.app/)
2. 在 `Repository` 输入：`你的用户名/评论仓库名`
3. 选择 Discussion 分类（建议 `Announcements`）
4. 页面会自动生成配置代码
5. 记录以下 4 个核心值：
   - `repo`
   - `repoId`
   - `category`
   - `categoryId`

## 5. 回填模板配置文件

编辑 `src/static/comments.json`，至少改成下面这样：

```json
{
  "enabled": true,
  "provider": "giscus",
  "repo": "your-github-username/your-comments-repo",
  "repoId": "REPO_ID_FROM_GISCUS",
  "category": "Announcements",
  "categoryId": "CATEGORY_ID_FROM_GISCUS",
  "mapping": "pathname",
  "strict": false,
  "reactionsEnabled": true,
  "emitMetadata": false,
  "inputPosition": "bottom",
  "lang": "zh-CN",
  "themeLight": "light",
  "themeDark": "dark",
  "loading": "lazy",
  "quoteMaxLength": 800
}
```

## 6. 参数建议

- `mapping: "pathname"`：最稳妥，URL 路径唯一对应一条讨论
- `lang: "zh-CN"`：中文站点建议
- `themeLight` / `themeDark`：与站点主题保持一致
- `inputPosition: "bottom"`：评论输入框在底部，阅读体验更自然

## 7. 本地验证

```bash
npm run build
npm run dev
```

打开任意文章页，检查：

- 页面底部是否出现评论组件
- 是否可点击 GitHub 登录
- 发表评论后，评论仓库 Discussions 是否自动生成对应讨论

## 8. 线上验证（部署后）

部署到 Cloudflare Pages / GitHub Pages 后，重复测试一次：

- 不同文章是否映射到不同讨论
- 明暗主题切换时评论主题是否同步
- 已登录用户头像、用户名是否显示正常

## 9. 常见问题排查

- 评论区不显示：先确认 `enabled` 是否为 `true`
- 显示 "Discussion not found"：通常是 `repoId` / `categoryId` 错误
- 无法登录评论：确认 Giscus App 已安装到正确仓库
- 某些文章评论串在一起：检查 `mapping` 配置，推荐 `pathname`
- 本地正常、线上异常：检查线上域名路径与路由规则，避免路径被重写

## 10. 安全建议

- 不要把不相关仓库开放给 Giscus App
- 建议专门用一个仓库承载评论，便于管理与迁移
