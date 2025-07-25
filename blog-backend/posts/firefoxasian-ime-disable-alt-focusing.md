---
author: Lee Yunjin
---

# [Firefox][Asian IME] Disable Alt Focusing

## Problem
Asian Linux users have to use an additional IME. Due to the delayed availability of PCs, many users have switched to Linux from Windows, where the IME used the Right Alt key as the language toggle. However, if you use Firefox, the Alt key toggles the browser’s menu toolbar.  
This is a short tip to avoid key conflict.

### Disable Menu Access Key

Enter URI `about:config`.  
**This can be potentially dangerous, so don't try to adjust unknown options without proper instructions.**

Search for `ui.key.menuAccessKeyFocuses`.

Set this value to False.  
This disables this functionality.

### Change Keycode

Search for `ui.key.menuAccessKey`, and change its value to `1`.  
This sets the `Control` key as the Menu Access Key. This has no known conflict with Linux desktops using Asian IMEs.

## Linux IME and its Integration: Is it problematic?

If you want to use the menu toggler, you can change either Firefox’s or the IME’s toggle key. I first mentioned the faster and simpler method; however, it is just personal preference. Linux IMEs are rather smart and have fewer minor bugs than macOS IME.  
For example, Apple Korean IME has a Hangul bug. Hangul stacks letters similarly to Aztec syllabic letters, but sometimes the stacking function fails when toggling languages. The desired text is `안녕하세요`, but the IME outputs `ㅇㅏㄴㄴㅕㅇㅎㅏㅅㅔㅇㅛ`. Fcitx, IBus, and even SCIM don't have this problem. Fcitx offers more than just simple keymap toggling; it includes advanced features that help with extensive writing. It is exciting to see better input support from ARM64 Linux, rather than fully integrated macOS.

## Resolution

- Disable browser toggle key  
- (Advanced) Change Keycode
