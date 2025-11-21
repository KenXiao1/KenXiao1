---
title: "使用Quick Latex和Completr插件在Obsidian中实现快速编辑数学公式-Blues的文章"
date: 2025-11-21T12:02:53.888Z
description: "--- tags: zhihu-article zhihu-link: https://zhuanlan.zhihu.com/p/695723899 --- **引子**  Obsidian is the private and flexible writing app that adapts to..."
category: "math"
tags: []
mathjax: true
---

---
tags: zhihu-article
zhihu-link: https://zhuanlan.zhihu.com/p/695723899
---
**引子**

Obsidian is the private and flexible writing app that adapts to the way you think.

![](https://pica.zhimg.com/v2-89b8452066d8416de98acb667fe9ca78_1440w.jpg)

Obsidian作为一个免费且强大的笔记软件而深受欢迎。其自动根据笔记生成知识图谱，双向链接等独特功能吸引越来越多人尝试将笔记电子化；其丰富的插件生态与高度可自定义性则使其上限极高而几乎可满足所有人的需要。最初吸引笔者使用Obsidian的是其作为一个MarkDown编辑器自带MathJax而能实时渲染LaTex代码的特性，这使其在众多不能实时渲染的传统编辑器（如VsCode）中脱颖而出。

**碎碎念**

简中互联网对Obsidian的讨论颇多。知乎、Obsidian中文论坛、CSDN和简书等平台上有许多优质资源。但总体上，重复啰嗦，指向性不强，笼统等问题广泛存在。笔者在检索如何在Obsidian中实现快速编辑数学公式时收获了了，故自己折腾摸索一番，在这里记录一下，也方便其他遇到相似问题的人。

*注：笔者并没有丰富的Latex使用经验，故对于老手，此配置可能并不适用。*

**Quick Latex**

[Obsidian 插件：Quick Latex for Obsidian (pkmer.cn)](https://link.zhihu.com/?target=https%3A//pkmer.cn/Pkmer-Docs/10-obsidian/obsidian%25E7%25A4%25BE%25E5%258C%25BA%25E6%258F%2592%25E4%25BB%25B6/readme/quick-latex_readme/)

由于一些原因，大陆使用Obsidian有诸多不便，如安装第三方插件时需科学上网。以上链接有该插件的中文介绍和下载镜像，但笔者是在科学上网的环境下配置的，所以该链接的有效性并没有保证。

Github仓库地址：[joeyuping/quick_latex_obsidian (github.com)](https://link.zhihu.com/?target=https%3A//github.com/joeyuping/quick_latex_obsidian)

![https://kimi.moonshot.cn/](https://pic1.zhimg.com/v2-e92c67488c0b21460d9653bb1f146e54_1440w.jpg)

Quick Latex 是一个为 Obsidian 编辑器设计的插件，旨在加速 LaTeX 数学公式的输入。以下是该插件的一些主要功能：

1.  **自动闭合美元符号**：输入单/双个美元符号 `$` 自动闭合为两/四个 `$$` 并将光标放置在中间。
2.  **自动闭合花括号**：输入 `{`、`[` 或 `(` 会自动闭合为 `}`、`]` 或 `)`。
3.  **自动添加 `\limits`**：输入 `\sum` 后，会自动添加 `\limits` 以简化求和符号的语法。
4.  **自动扩大括号**：在包含 `\sum`、`\int` 或 `\frac` 的表达式后按空格键，会将最外层括号替换为 `\left` 和 `\right` 以显示更大的括号。
5.  **自动用花括号括起上标和下标后的表达式**：在上标 `^` 和下标 `_` 后输入表达式并按空格键，会自动用 `{}` 括起表达式。
6.  **用数学符号括起选定的表达式**：选中表达式后按 `$` 键，会自动用数学符号括起。
7.  **自动分数**：输入 `/` 代替 `\frac{}{}`，例如 `$e/2$` 会变成 `\frac{e}{2}`。
8.  **对齐块的快捷方式**：使用 `Alt+Shift+A`（Mac 上是 `Option+Shift+A`）快速插入 `\begin{align*} ... \end{align*}` 块。
9.  **矩阵块的快捷方式**：使用 `Alt+Shift+M`（Mac 上是 `Option+Shift+M`）快速插入 `\begin{pmatrix} ... \end{pmatrix}` 块。
10.  **使用 Tab 和 Shift-Tab 在括号间跳转**：在数学表达式中使用 Tab 和 Shift-Tab 可以快速在不同的括号间跳转。
11.  **自定义简写**：可以使用多字母的自定义简写来代替常见的 LaTeX 片段。用户可以在插件设置中设置自己的简写。

笔者补充一点，这个插件可以实时渲染你正在打的公式，很方便我这种不熟练的。

![其对矩阵的支持也挺好](https://picx.zhimg.com/v2-8dcafbfd229e18face6e3be489013e1d_1440w.jpg)

**Completr**

[Obsidian 插件：Completr 自动补全插件 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/665102896)

这篇文章介绍的挺全的。Obsidian的补全插件主要有Completr，Various-Complements和Autocomplete。我没搞清楚Autocomplete怎么用，可能是与我安装的Completr，Latex Suite或Quick Latex插件冲突了吧，Various-Complements很强大，但学习成本很高。

![自动补全 LaTex](https://picx.zhimg.com/v2-52d89e488557d25b50a82cedacb257db_1440w.jpg)

在联想提示补全的同时，还会提示相关内容，**并可通过上下方向键选取，enter键选择。**

  

**综上所述，*对Quick Latex和Completr插件的配合使用能让我们在Obsidian中实现快速编辑数学公式。***

  

**一些吐槽**

1.  北印度真的抽象，感觉是在倒逼人人科学上网。我之前配置Lean4的时候也是，得改下环境变量才能绕过限制，浪费了我快4个小时（─.─||）挖个坑，以后可能会写Lean4配置教程
2.  Latex Suite这个插件很难用，会过度自动补全
3.  长期在双语环境里真的会降低母语水平，写这句话“最初吸引笔者使用Obsidian的是其作为一个MarkDown编辑器自带MathJax而能实时渲染LaTex代码的特性，这使其在众多不能实时渲染的传统编辑器（如VsCode）中脱颖而出。”的时候脑子里都是定语从句ヾ(´･ ･｀｡)ノ
4.  ( ︶︿︶)\_╭∩╮ >>> Zhihu编辑器

**附录**

官网：[Obsidian - Sharpen your thinking](https://link.zhihu.com/?target=https%3A//obsidian.md/)

LaTex教程：[LaTeX公式手册(全网最全) - 樱花赞 - 博客园 (cnblogs.com)](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/1024th/p/11623258.html)

MarkDown教程：[Markdown 官方教程](https://link.zhihu.com/?target=https%3A//markdown.com.cn/)

有Quick Latex和Completr插件加持，笔者从零到能用LaTex做数学笔记只用了不到一个半小时

本文颜文字来源：[汗颜文字表情 汗表情符号 汗颜文字大全 （─.─||） (emoticonfun.com)](https://link.zhihu.com/?target=https%3A//cn.emoticonfun.com/sweat/)

本文封面来源于BiliBili数学up主PiKaChu345动态中所展示的他使用Obsidian做数学笔记生成的思维导图，这体现了数学之间都是彼此关联的一个整体。[PiKaChu345的动态 - 哔哩哔哩 (bilibili.com)](https://link.zhihu.com/?target=https%3A//www.bilibili.com/opus/926224253043343392%3Fspm_id_from%3D333.1365.0.0)

一些有用的文章/专栏/论坛：

1.  [回归 Obsidian 的纯与真，写给普通人的入门指南 - 少数派 (sspai.com)](https://link.zhihu.com/?target=https%3A//sspai.com/post/72697%23%21)
2.  [[Obsidian]懒人必备插件附使用教程_obsidian插件-CSDN博客](https://link.zhihu.com/?target=https%3A//blog.csdn.net/sbsbsb666666/article/details/127924632%3Fspm%3D1001.2014.3001.5501)
3.  [用Obsidian写Latex公式比手写还快，教程来了_obsidian latex-CSDN博客](https://link.zhihu.com/?target=https%3A//blog.csdn.net/sbsbsb666666/article/details/129191140)
4.  [玩转Obsidian的保姆级教程 - 知乎 (zhihu.com)](https://www.zhihu.com/column/c_1413472005866266624)
5.  [Obsidian 中文论坛 - Obsidian 知识管理 笔记](https://link.zhihu.com/?target=https%3A//forum-zh.obsidian.md/)