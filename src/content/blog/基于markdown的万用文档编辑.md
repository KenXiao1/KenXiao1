---
title: "基于markdown的万用文档编辑"
date: 2025-11-21T12:02:53.898Z
description: "**为什么使用markdown** 1.markdown作为一种轻量级标记语言允许人们使用易读易写的纯文本编写文档。你可以在任何设备上修改它而不用担心像word一样出现格式问题。 2.markdown对LaTex的支持非常好，方便你输入公式 3.通过pandoc，markdown可以转换为几乎所有的..."
category: "tech"
tags: []
mathjax: true
---

**为什么使用markdown**
1.markdown作为一种轻量级标记语言允许人们使用易读易写的纯文本编写文档。你可以在任何设备上修改它而不用担心像word一样出现格式问题。
2.markdown对LaTex的支持非常好，方便你输入公式
3.通过pandoc，markdown可以转换为几乎所有的文件格式，包括ppt、docx、epub、html、pdf……
4.markdown被广泛使用，尤其在IT领域内。某种程度上，你在zulip中的输入是一种markdown的“方言”
5.ChatGPT等AI工具是以markdown为格式输出的

**如何使用markdown**
*基本语法*：https://markdown.com.cn/
*LaTex语法*：https://www.cnblogs.com/1024th/p/11623258.html
*选择一个markdown编辑器*：推荐obsidian（原因：1.作为笔记软件，插件丰富，定制性高，易上手 2.开源，在不使用云功能的前提下是免费的 3.可以用来打开很多用obsidian编写的优质资源）*注：推荐搭配VPN使用，国内插件的镜像源有风险* 下载：https://obsidian.md/download

**使用Quick Latex和Completr插件在Obsidian中实现快速编辑数学公式**
https://zhuanlan.zhihu.com/p/695723899

**使用pandoc插件实现markdown格式转换**
https://www.bilibili.com/video/BV1eD421g77w

**在此基础上制作ppt的一些经验之谈**
1.使用PowerPoint或wps等软件在大多数情况下更加方便，因为对版面风格的设计等操作会在这些软件中更加直观
2.但当你有信息源时，情况会有些不一样。比如说，你要把一个word文档改成ppt。你先把文本粘贴到markdown编辑器，然后用“---”符号分隔文档。两个---中间的文本就会被输出为一页ppt。这样做可能会使你的ppt非常~~难看~~单调
3.鉴于在ppt中输入公式十分复杂，我会把ppt中要输入的公式打进markdown然后单独导出一个ppt，用的时候一个个复制粘贴在成品ppt合适的地方

