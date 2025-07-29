---
author: Lee Yunjin
---

# [highlight.js] Custom Highlighter: Develop a highlighter for XDG Desktop Shortcut

## Overview

First, you should read this article to understand the purpose well.

[What is XDG Desktop Shortcut](https://chi-blog-seven.vercel.app/posts/xdg-desktop-format-how-to-highlight-it-and-isnt-it-officially-supported)

XDG Desktop Shortcut is not a universal configuration format.

This is a custom, platform-oriented document, so highlighting should be focused on keyword highlighting.

## Plans

### Highlight Keywords

This has a purpose that is not general.
So, keywords like `Exec`, `Icon` should be highlighted.

### Highlight optional arguments

Applications usually include optional arguments.

If a browser has section like `Exec=browser %U`, %U should be highlighted.

### Supports for *.service

This follows the same naming conventions, and philosophy.
And it is hard to distinguish two file's difference.
So just add a few keywords like `forking`, `oneshot`, etc.

`simple` keyword is too general and less frequently used.
It is better to exclude this; the word itself is too legible without highlighter.


### This is a simple config file

Do not overly highlight it. Minimal highlighting will be fine.

## Implementation

[My Implementation](https://github.com/gg582/highlight.js)

Let's see ./src/languages/desktop.js file.

```javascript
/*
Language: XDGDesktop
Description: XDG Desktop Entry Specification file format.
Contributors: Lee Yunjin <gzblues61@daum.net>
Category: common, config
Website: https://www.freedesktop.org/wiki/Specifications/desktop-entry-spec/
*/

export default function(hljs) {
  const LITERALS = {
    className: 'literal',
    begin: /\b(true|false|Application|Link|Directory|forking|oneshot|OneShot)\b/,
    relevance: 0
  };

  const FIELD_CODES = {
    className: 'variable',
    match: /%[fFuUcCiIkKvV]/
  };

  const QUOTED_STRING = {
    className: 'string',
    begin: /"/,
    end: /"/,
    contains: [ hljs.BACKSLASH_ESCAPE ],
    relevance: 0
  };

  const COMMENT_MODE = {
    className: 'comment',
    begin: /#/,
    end: /$/,
    relevance: 0
  };

  const SECTION_HEADER = {
    className: 'section',
    begin: /^\[(Desktop Entry|Desktop Action\s+[A-Za-z0-9_-]+)\]/,
    relevance: 10
  };

  const KEY_VALUE_PAIR = {
    begin: /^[A-Za-z0-9_-]+(\[[A-Za-z0-9_@.]+\])?\s*=/,
    end: /$/,
    returnBegin: true,
    contains: [
      {
        className: 'attribute',
        begin: /^[A-Za-z0-9_-]+(\[[A-Za-z0-9_@.]+\])?/,
        relevance: 10
      },
      {
        className: 'operator',
        match: /=/,
        relevance: 0
      },
      COMMENT_MODE,
      LITERALS,
      QUOTED_STRING,
      FIELD_CODES,
      {
        className: 'punctuation',
        match: /;/,
        relevance: 0
      }
    ]
  };

  return {
    name: 'Desktop',
    aliases: ['desktop'],
    case_insensitive: false,
    contains: [
      COMMENT_MODE,
      SECTION_HEADER,
      KEY_VALUE_PAIR
    ]
  };
}

```

- Simple Regular Expressions
- Concise codes

## Result

```desktop
[Desktop Entry]
# This is a comment.
Version=1.0
Type=Application
Name=My Custom App
Name[ko]=나의 사용자 지정 앱
Comment=A simple application for testing Highlight.js with desktop files.
Exec=bash -c "echo Hello World! && sleep 1"
Icon=utilities-terminal
Terminal=true
Categories=Utility;Development;System;
OnlyShowIn=GNOME;KDE;
NotShowIn=XFCE;
NoDisplay=false
StartupNotify=true
StartupWMClass=MyCustomAppWindow
MimeType=text/plain;image/png;application/pdf;
Keywords=test;highlight;custom;
Actions=NewWindow;ShowAbout;
DBusActivatable=false
Hidden=false
```
You should declare ```desktop``` into your Markdown code block.
You can use ```<code class="language-desktop">``` for HTML.
