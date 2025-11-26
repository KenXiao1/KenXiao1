---
description: 部署 Astro 博客到 Netlify
---

# 部署到 Netlify 教程

本教程将指导您如何将 Astro 博客部署到 Netlify 平台。

## 前提准备

1. 确保您的项目已经推送到 GitHub 仓库
2. 拥有一个 Netlify 账号（可以使用 GitHub 账号登录）

## 部署步骤

### 方法一：通过 Netlify 网站部署（推荐）

#### 1. 注册/登录 Netlify

访问 [Netlify](https://www.netlify.com/) 并使用您的 GitHub 账号登录

#### 2. 创建新站点

- 点击 "Add new site" → "Import an existing project"
- 选择 "GitHub" 作为 Git 提供商
- 授权 Netlify 访问您的 GitHub 仓库
- 选择您的博客项目仓库（ken-blog）

#### 3. 配置构建设置

在部署配置页面，填写以下信息：

**构建设置：**
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 或更高版本

**环境变量：**

如果您使用了 Cloudinary 或其他需要环境变量的服务，需要添加环境变量：

- 点击 "Show advanced" → "New variable"
- 添加您在 `.env` 文件中的所有环境变量，例如：
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - 等等...

#### 4. 部署

- 检查所有设置无误后，点击 "Deploy site"
- Netlify 会自动开始构建和部署您的网站
- 等待几分钟，构建完成后您的网站就上线了

#### 5. 配置自定义域名（可选）

- 进入站点设置 → Domain management
- 点击 "Add custom domain"
- 输入您的域名并按照指引配置 DNS 记录

### 方法二：使用 Netlify CLI 部署

#### 1. 安装 Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. 登录 Netlify

// turbo
```bash
netlify login
```

这会打开浏览器进行授权

#### 3. 初始化项目

在项目根目录运行：

// turbo
```bash
netlify init
```

按照提示选择：
- "Create & configure a new site"
- 选择 team
- 输入站点名称（或留空使用随机名称）

#### 4. 手动部署

构建项目：

```bash
npm run build
```

部署到 Netlify：

// turbo
```bash
netlify deploy --prod
```

### 配置文件部署（推荐用于生产）

创建 `netlify.toml` 配置文件在项目根目录：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

# 可选：设置重定向规则
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 可选：设置头部
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

## 重要注意事项

### 1. 适配器配置

您当前的 `astro.config.mjs` 配置了 Cloudflare 适配器：

```javascript
output: 'static',
adapter: cloudflare()
```

对于 Netlify 部署，您应该：

**选项 A：使用静态输出（推荐）**

移除 Cloudflare 适配器，只使用 static 输出：

```javascript
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    keystatic(),
    mdx()
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkObsidianImages],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  output: 'static'
  // 移除 adapter: cloudflare()
});
```

**选项 B：使用 Netlify 适配器（如需 SSR）**

如果需要服务器端渲染功能：

```bash
npm install @astrojs/netlify
```

然后修改配置：

```javascript
import netlify from '@astrojs/netlify';

export default defineConfig({
  // ... 其他配置
  output: 'server', // 或 'hybrid'
  adapter: netlify()
});
```

### 2. 环境变量安全

- **永远不要**将 `.env` 文件提交到 Git 仓库
- 在 Netlify 网站的项目设置中配置所有环境变量
- 确保 `.gitignore` 包含 `.env` 文件

### 3. 自动部署

一旦配置完成，Netlify 会自动：
- 监听您的 GitHub 仓库
- 当您推送代码到主分支时自动重新部署
- 为 Pull Request 创建预览部署

### 4. 构建日志

如果部署失败：
- 查看 Netlify 的构建日志
- 确保所有依赖都在 `package.json` 中
- 检查环境变量是否正确配置

## 常见问题

### 构建失败

1. 检查 Node 版本：在 Netlify 设置中指定 Node 18+
2. 查看构建日志中的错误信息
3. 本地运行 `npm run build` 确保能成功构建

### 环境变量不生效

1. 确保在 Netlify 网站设置中添加了所有必要的环境变量
2. 变量名必须完全匹配（区分大小写）
3. 修改环境变量后需要手动触发重新部署

### 页面 404

1. 检查 `netlify.toml` 中的重定向规则
2. 确保 publish directory 设置为 `dist`

## 持续集成/持续部署 (CI/CD)

Netlify 提供了完整的 CI/CD 流程：

1. **开发分支**：推送到非主分支时，Netlify 会创建预览部署
2. **主分支**：推送到主分支时，自动部署到生产环境
3. **回滚**：在 Netlify 控制台可以轻松回滚到之前的版本

## 下一步

部署完成后，您可以：

1. 配置自定义域名
2. 启用 HTTPS（Netlify 自动提供）
3. 设置部署通知
4. 查看分析数据
5. 配置表单处理（如果需要）

## 有用的链接

- [Netlify 文档](https://docs.netlify.com/)
- [Astro Netlify 部署指南](https://docs.astro.build/en/guides/deploy/netlify/)
- [Netlify CLI 文档](https://docs.netlify.com/cli/get-started/)
