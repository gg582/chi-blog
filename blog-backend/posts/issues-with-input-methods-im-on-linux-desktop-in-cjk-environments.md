---
author: Lee Yunjin
---

# Issues with Input Methods (IM) on Linux Desktop in CJK Environments

## Overview

When using a Linux desktop in East Asian (CJK) language environments, you might want to use a modern input method (IM) but find building shared objects for each application cumbersome. Here, I’d like to share a small tip to address this issue.

### Option 1: Use IBus (Not Recommended)

IBus offers excellent compatibility with legacy and proprietary applications. However, it’s plagued by bugs and feels relatively conservative as an IM. Despite its overwhelming compatibility advantage, issues like browser crashes and the "last character" bug present significant hurdles.

### Option 2: Use a Modern IM with an IBus Shortcut (Recommended Compromise)

This is my preferred approach. I use a modern IM like Fcitx5 for daily tasks and switch to IBus only when running legacy or closed-source applications by launching a shortcut. For closed-source apps, I set environment variables like `env GTK_IM_MODULE=ibus QT_IM_MODULE=ibus XMODIFIERS=@im=ibus`. After finishing tasks with closed-source apps, I clean up by running `pkill ibus-daemon`. You don’t need to memorize `.desktop` file syntax; just look it up as needed. Unless you’re a Linux app developer, stick to simple options like `OneShot` or `forking` for startup settings.

### Example .desktop Files

Below are example `.desktop` files to create shortcuts for toggling between Fcitx5 and IBus, as well as launching closed-source applications with IBus.

#### 1. Toggle IBus (Stop Fcitx5 and Start IBus)

```ini
[Desktop Entry]
Name=Toggle IBus
Exec=sh -c "ibus-daemon -drx"
Type=Application
Terminal=false
Icon=input-keyboard
Comment=Start IBus and stop Fcitx5
StartupNotify=false
```
#### 2. Stop IBus
```ini
[Desktop Entry]
Name=Restart Fcitx5
Exec=sh -c "pkill ibus-daemon"
Type=Application
Terminal=false
Icon=input-keyboard
Comment=Stop IBus and restart Fcitx5
StartupNotify=false
```
#### 3. Launch Closed-Source Application with IBus
```ini
[Desktop Entry]
Name=Closed Source App
Exec=env GTK_IM_MODULE=ibus QT_IM_MODULE=ibus XMODIFIERS=@im=ibus /path/to/closed-source-app
Type=Application
Terminal=false
Icon=application-x-executable
Comment=Launch closed-source app with IBus
StartupNotify=true
```
### Usage Notes
- Save these files in ~/.local/share/applications/ with appropriate names (e.g., ibus-toggle.desktop, fcitx5-restart.desktop, closed-source-app.desktop).
- Replace /path/to/closed-source-app with the actual path to your application’s executable.

These shortcuts make it easy to switch between Fcitx5 and IBus, ensuring compatibility with legacy or proprietary software while keeping a modern IM for daily use.
