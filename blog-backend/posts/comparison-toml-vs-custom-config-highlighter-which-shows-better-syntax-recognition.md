---
author: Lee Yunjin
---

# [Comparison] TOML vs Custom Config Highlighter: Which shows better syntax recognition

## INI/TOML
```toml
[Desktop Entry]
Name=My Custom Application
Comment=A simple example application
Exec=/usr/bin/my-custom-app
Icon=/usr/share/icons/hicolor/scalable/apps/my-custom-app.svg
Type=Application
Categories=Utility;Development;
Terminal=false
StartupNotify=true
Actions=OpenTerminal;ShowHelp;

[Desktop Action OpenTerminal]
Name=Open Terminal Here
Exec=gnome-terminal

[Desktop Action ShowHelp]
Name=Show Application Help
Exec=/usr/bin/my-custom-app --help
```

```toml
[Desktop Entry]
Name=MyApp
Exec=/usr/bin/myapp %U
Icon=myapp-icon
Type=Application
Categories=Utility;Development;Multimedia
MimeType=application/x-myapp;audio/x-myapp
Path=/home/user/My Apps/MyAppFolder
X-Custom-Key=value_with_underscores_and-dashes

[Desktop Action SpecialRun]
Exec=/usr/bin/myapp --special-mode %u
Name=Run Special Mode
OnlyShowIn=GNOME;KDE

[Install]
WantedBy=multi-user.target

[wantedby]
WantedBy=multi-user.target
```

- No highlight for the `Application` Keyword
- `;` Delimiter is recognized as a comment mark

<b><font style="color:slateblue">`;`</font> is unlike <font style="color:coral">`#`</font></b>

This is an important difference.

## Custom FreeDesktop Highlighter

```freedesktop
[Desktop Entry]
Name=My Custom Application
Comment=A simple example application
Exec=/usr/bin/my-custom-app
Icon=/usr/share/icons/hicolor/scalable/apps/my-custom-app.svg
Type=Application
Categories=Utility;Development;
Terminal=false
StartupNotify=true
Actions=OpenTerminal;ShowHelp;

[Desktop Action OpenTerminal]
Name=Open Terminal Here
Exec=gnome-terminal

[Desktop Action ShowHelp]
Name=Show Application Help
Exec=/usr/bin/my-custom-app --help
```

```freedesktop
[Desktop Entry]
Name=MyApp
Exec=/usr/bin/myapp %U
Icon=myapp-icon
Type=Application
Categories=Utility;Development;Multimedia
MimeType=application/x-myapp;audio/x-myapp
Path=/home/user/My Apps/MyAppFolder
X-Custom-Key=value_with_underscores_and-dashes

[Desktop Action SpecialRun]
Exec=/usr/bin/myapp --special-mode %u
Name=Run Special Mode
OnlyShowIn=GNOME;KDE

[Install]
WantedBy=multi-user.target

# Testing Edge Case

[wantedby]
WantedBy=multi-user.target
```

- A highlight for some specific keywords
  - Wrong Keywords are not highlighted
- Texts after `;` is normal

A little change made a difference.