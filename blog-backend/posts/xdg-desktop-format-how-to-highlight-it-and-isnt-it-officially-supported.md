---
author: Lee Yunjin
---

# XDG Desktop format: How to Highlight it - and isn't it officially supported?

## What is XDG Desktop format?
As a Desktop Linux(or \*BSD) user, you are undoubtedly familiar with XDG Desktop shortcuts.
Users create, and delete many shortcuts during daily use.
You can obviously see highlighted syntax from open-source editors, but it's annoying to see shared shortcuts in blog posts without syntax highlighting.
For those less familiar with open-source environments, let me explain it to you.

### X Desktop Environment

The foundations of many open-source desktop environments were laid by the X.Org Project. Although many projects have switched to Wayland, X.Org Graphical Server is still prominent, as evidenced by XWayland, a compatibility layer between X.Org and Wayland. The X Desktop Group (XDG) developed foundational elements for GUIs (graphical user interfaces).
The necessity of the X.Org Server remains crucial, as you still can't have a fully integrated desktop experience without X.Org or XWayland.

#### Reason
- Proprietary Graphics Hardware (e.g., NVIDIA GeForce)
- Legacy Application Support
- Compatibility for older, lightweight Graphical Front-end applications
- Wayland is still a symbol for open-source purists

Wayland is a great choice for running desktops on open-source hardware, but not every developer has a computer without an NVIDIA GPU.
So, until Wayland is fully adopted (and effectively replaces X.Org), we'll need to use X.Org/XWayland due to various industry-related factors (e.g., lack of full corporate investment or established profit models for Wayland). Until Wayland truly becomes the standard window system in the free software ecosystem, X.Org/XWayland will remain the primary window system.
### Then, should I skip this if I use Wayland?

The answer is, **No**. Wayland also uses XDG Desktop shortcuts to support the same functionality.
The shortcut format itself has no significant flaws. The problem was the perspective that 'X11 is too heavy and old-fashioned so developers needed to make some new GUI server'.
Although I think X11 is not that flawed (after all, many types of Window Managers (WMs) were built for the X11 server).
After all, Wayland also uses the same shortcut.

### The Problem: The web Blog does not recognize my Code block!

**Now, let's get into a key point.**
Let us compare by two examples.

#### With desktop tag inside Markdown

I coded a custom highlighter for this format, so you can see some colors.
But, it is originally unsupported.
```desktop
[Desktop Entry]
Name=The text is NOT highlighted
Exec=/usr/bin/myapp
Type=Application
Terminal=False
Icon=application-x-executable
Comment=Originally it does not support highlighting
StartupNotify=false
```

#### With ini tag inside Markdown

```ini
[Desktop Entry]
Name=The text IS highlighted
Exec=/usr/bin/myapp
Type=Application
Terminal=False
Icon=application-x-executable
Comment=You can see colors here. right?
StartupNotify=false
```


For colorblind readers, I should explain which parts are highlighted.
In many cases, `ini` tag **works well**(also here, `desktop` tag **DIDN'T** work).
However, XDG Shortcuts have more extensive syntax.

### Conclusion

Even today, the XDG Desktop Shortcut format is still not supported by popular highlighting libraries. This is bad news for Linux and BSD users.
The IT market should focus more on open-source software.
Open-source software is not merely a raw material for big-tech driven products (like Cloud Infrastructure and LLMs).
