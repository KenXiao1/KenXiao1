# About 页面修改指南

## 如何修改 About 页面

About 页面的内容在 **`src/pages/about.astro`** 文件中。

### 文件位置
```
D:\kenxiao blog\ken-blog\src\pages\about.astro
```

### 页面结构（从上到下）

1. **About Me 简介** (第 6-15 行)
   - 包含自我介绍和兴趣领域
   - 使用 `glass-card` 样式的卡片

2. **Achievements 成就** (第 17-49 行)
   - Mathematics 数学成就
   - Robotics 机器人成就
   - Biology 生物成就

3. **Projects & Experience 项目经验** (第 51-70 行)
   - Momentum 项目
   - Community Leadership 社区领导

4. **Contact 联系方式** (第 72-82 行)
   - Email, Zhihu, GitHub, Linux.do

### 添加链接的方法

在 Astro 文件中添加外部链接：
```html
<a href="https://example.com" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">链接文字</a>
```

参数说明：
- `href`: 链接地址
- `class="text-accent hover:underline"`: 样式类（高亮色 + 悬停下划线）
- `target="_blank"`: 在新标签页打开
- `rel="noopener noreferrer"`: 安全属性

---

## 项目文件结构说明

### 核心目录结构

```
ken-blog/
├── src/                          # 源代码目录
│   ├── pages/                    # 页面文件（路由）
│   │   ├── index.astro          # 首页 (/)
│   │   ├── about.astro          # About 页面 (/about)
│   │   ├── blog/                # 博客相关页面
│   │   │   ├── index.astro      # 博客列表 (/blog)
│   │   │   └── [...slug].astro  # 博客文章详情 (/blog/文章名)
│   │   ├── photos/              # 照片相关页面
│   │   ├── recommendations/     # 推荐页面
│   │   └── tags/                # 标签页面
│   │
│   ├── layouts/                  # 布局组件
│   │   └── BaseLayout.astro     # 基础布局（包含 header、footer、dark mode）
│   │
│   ├── components/               # 可复用组件
│   │   ├── BackgroundEffect.astro    # 背景动画效果
│   │   ├── LikeButton.tsx            # 点赞按钮（React）
│   │   ├── EquationModal.astro       # 数学公式弹窗
│   │   └── ...                       # 其他组件
│   │
│   ├── content/                  # 内容集合（Astro Content Collections）
│   │   ├── config.ts            # 内容集合配置
│   │   ├── blog/                # 博客文章（Markdown）
│   │   ├── photos/              # 照片元数据（JSON）
│   │   ├── pdfs/                # PDF 元数据（JSON）
│   │   └── recommendations/     # 推荐内容（JSON）
│   │
│   ├── lib/                      # 工具函数库
│   │   ├── supabase.ts          # Supabase 数据库客户端
│   │   ├── remark-obsidian-images.mjs  # Obsidian 图片语法转换插件
│   │   └── ...
│   │
│   └── styles/                   # 样式文件
│       └── global.css           # 全局 CSS（包含 Tailwind）
│
├── public/                       # 静态资源（直接复制到输出）
│   ├── images/                  # 图片
│   │   └── posts/               # 博客文章图片
│   ├── pdfs/                    # PDF 文件
│   └── favicon.svg              # 网站图标
│
├── netlify/                      # Netlify 部署配置
│   └── functions/               # Netlify Functions（无服务器函数）
│       └── likes.js             # 点赞 API
│
├── functions/                    # Cloudflare Pages Functions
│   └── api/
│       └── likes.js             # 点赞 API（Cloudflare 版本）
│
├── scripts/                      # 工具脚本
│   ├── upload-photos.mjs        # 上传照片到 Cloudinary
│   └── migrate-content.mjs      # 内容迁移工具
│
├── keystatic.config.tsx          # Keystatic CMS 配置
├── astro.config.mjs              # Astro 配置文件
├── tailwind.config.mjs           # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖和脚本
└── .env                          # 环境变量（不提交到 Git）
```

---

## 主要文件作用详解

### 1. 页面文件 (`src/pages/`)

Astro 使用基于文件的路由系统：
- `index.astro` → `/` (首页)
- `about.astro` → `/about` (About 页面)
- `blog/index.astro` → `/blog` (博客列表)
- `blog/[...slug].astro` → `/blog/文章标题` (动态路由)

**关键点**：
- `.astro` 文件是 Astro 组件，可以包含 HTML、CSS、JavaScript
- 页面文件会自动生成对应的路由
- 动态路由使用 `[参数名]` 或 `[...参数名]` 语法

### 2. 布局文件 (`src/layouts/`)

**`BaseLayout.astro`**：所有页面的基础布局
- 包含网站 header（导航栏）
- 包含网站 footer（页脚）
- 实现 dark mode（深色模式）切换
- 提供代码块复制功能
- 定义页面的 `<head>` 元素（SEO、meta 标签）

### 3. 组件文件 (`src/components/`)

可复用的 UI 组件：
- **BackgroundEffect.astro**: 首页背景动画（Cellular Automata 和 Turbulence 效果）
- **LikeButton.tsx**: React 点赞按钮（带 localStorage 持久化）
- **EquationModal.astro**: LaTeX 数学公式弹窗
- **其他组件**: 导航栏、卡片、按钮等

### 4. 内容集合 (`src/content/`)

**`config.ts`**: 定义内容集合的结构和验证规则
- `blog`: 博客文章（Markdown 格式）
- `photos`: 照片元数据（JSON 格式）
- `pdfs`: PDF 文档元数据（JSON 格式）
- `recommendations`: 阅读推荐（JSON 格式）

**内容集合的优势**：
- 类型安全（TypeScript）
- 内容验证（Zod schema）
- 自动生成查询 API

### 5. 库文件 (`src/lib/`)

**`supabase.ts`**:
- Supabase 客户端初始化
- 点赞功能的数据库操作函数
- 使用环境变量配置

**`remark-obsidian-images.mjs`**:
- Remark 插件，转换 Obsidian 图片语法
- 将 `![[image.png]]` 转换为标准 Markdown `![]()`
- 在构建时自动处理

### 6. 样式文件 (`src/styles/`)

**`global.css`**:
- Tailwind CSS 导入
- 全局样式定义
- 自定义 CSS 变量
- Dark mode 样式覆盖

### 7. 静态资源 (`public/`)

直接复制到输出目录，不经过构建处理：
- `/images/posts/`: 博客文章图片
- `/pdfs/`: PDF 文件
- `favicon.svg`: 网站图标

### 8. 无服务器函数

**Netlify Functions** (`netlify/functions/`):
- `likes.js`: 处理点赞 API 请求（GET/POST）
- 与 Supabase 数据库交互

**Cloudflare Pages Functions** (`functions/`):
- `api/likes.js`: Cloudflare 版本的点赞 API
- 与 Netlify 版本功能相同

### 9. 配置文件

**`astro.config.mjs`**:
- Astro 框架配置
- 集成配置（React, Tailwind, Keystatic）
- 构建选项（静态输出）
- Markdown 插件（KaTeX, Obsidian 图片）

**`tailwind.config.mjs`**:
- Tailwind CSS 配置
- 自定义颜色、字体
- Dark mode 策略（class）
- 插件（typography）

**`keystatic.config.tsx`**:
- Keystatic CMS 配置
- 内容集合映射
- 存储模式（local）
- 管理界面路径 `/keystatic`

**`package.json`**:
- 项目依赖
- 构建脚本：
  - `npm run dev`: 开发服务器
  - `npm run build`: 生产构建
  - `npm run preview`: 预览构建结果

---

## 技术栈总结

### 前端框架
- **Astro 5.x**: 静态站点生成器（SSG）
- **React 19**: 交互组件（如点赞按钮）
- **Tailwind CSS**: 实用优先的 CSS 框架

### 内容管理
- **Keystatic**: 本地 CMS（访问 `/keystatic`）
- **Markdown**: 博客文章格式
- **Content Collections**: Astro 内容管理系统

### 数据与存储
- **Supabase**: PostgreSQL 数据库（点赞功能）
- **Cloudinary**: 图片存储和 CDN

### 部署
- **Netlify**: 主要部署平台（包含 Functions）
- **Cloudflare Pages**: 备用部署平台

### 其他工具
- **KaTeX**: LaTeX 数学公式渲染
- **Remark/Rehype**: Markdown 处理插件

---

## 开发工作流

### 本地开发
```bash
npm run dev       # 启动开发服务器（http://localhost:4321）
```

### 编辑内容
1. **使用 Keystatic CMS**（推荐新手）:
   - 访问 `http://localhost:4321/keystatic`
   - 可视化编辑博客、照片、推荐内容

2. **直接编辑文件**（推荐开发者）:
   - 博客文章：`src/content/blog/*.md`
   - 页面内容：`src/pages/*.astro`

### 构建和部署
```bash
npm run build     # 构建生产版本（输出到 dist/）
npm run preview   # 预览生产构建
```

部署会自动触发（推送到 Git 仓库）：
- Netlify 监听 `main` 分支
- Cloudflare Pages 监听 `main` 分支

---

## 修改 About 页面的步骤

1. 打开 `src/pages/about.astro`
2. 找到需要修改的部分（参考行号）
3. 编辑 HTML 内容
4. 保存文件
5. 在浏览器中查看效果（开发服务器会自动刷新）
6. 提交到 Git 并推送（自动部署）

---

## 常用 Tailwind 样式类

- `text-accent`: 高亮色（主题色）
- `hover:underline`: 悬停时显示下划线
- `glass-card`: 自定义类（玻璃态卡片效果）
- `dark:`: 深色模式前缀（如 `dark:bg-gray-900`）
- `space-y-6`: 垂直间距 1.5rem
- `rounded-2xl`: 大圆角
- `max-w-3xl`: 最大宽度 48rem

---

## 环境变量

需要在 `.env` 文件中配置：

```env
# Cloudinary（照片存储）
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PUBLIC_WEBP_SE_PROXY=your_webp_proxy_url

# Supabase（点赞功能）
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 总结

- **About 页面位置**: `src/pages/about.astro`
- **页面路由**: `/about`
- **使用的布局**: `src/layouts/BaseLayout.astro`
- **样式框架**: Tailwind CSS
- **修改后**: 无需手动刷新，开发服务器会自动更新
- **部署**: 推送到 Git 后自动部署到 Netlify

如有任何问题，可以：
1. 查看 Astro 官方文档：https://docs.astro.build
2. 查看 Tailwind CSS 文档：https://tailwindcss.com
3. 运行 `npm run dev` 启动开发服务器进行实时预览
