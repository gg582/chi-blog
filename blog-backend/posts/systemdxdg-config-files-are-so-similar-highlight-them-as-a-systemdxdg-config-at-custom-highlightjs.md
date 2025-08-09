---
author: Lee Yunjin
---

# [Systemd][XDG] Config files are so similar: highlight them as a systemd/XDG config at custom highlight.js

## Overview

A Systemd service, socket, and even NetworkManager config file are quite similar to the XDG Desktop Shortcut format.

These are all influenced by **INI configuration format**.
Therefore, it is a good idea to provide a single highlight configuration for them.

## FreeDesktop's Naming Convention
**These are commonly found rules you can find in configurations.**
- Upper Camel Case
- Kebab Case
*Snake Case is unusual*

Let's break down by some examples, and see how efficient the custom highlighter is.
It highlights **keywords** instead of matching each syntax.

### XDG Desktop Shortcuts

```desktop
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

### Systemd Units

#### Service Units
```service
[Unit]
Description=My Awesome Background Service
After=network.target

[Service]
ExecStart=/usr/local/bin/my-service-daemon --config /etc/my-service/config.conf
Restart=on-failure
User=myuser
Group=mygroup
WorkingDirectory=/var/lib/my-service
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### Mount Units

```mount
[Unit]
Description=Mount External Data Drive
Requires=local-fs.target
After=local-fs.target

[Mount]
What=/dev/sdb1
Where=/mnt/external_data
Type=ext4
Options=defaults,noatime,nofail

[Install]
WantedBy=multi-user.target
```

#### Socket Units

```socket
[Unit]
Description=My Socket Activated Application

[Socket]
ListenStream=/run/my-app.sock
SocketUser=myuser
SocketGroup=mygroup
SocketMode=0660
Accept=true

[Install]
WantedBy=sockets.target
```

#### Timer Units
```timer
[Unit]
Description=Run My Daily Backup Service

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=1h

[Install]
WantedBy=timers.target
```

### NetworkManager Configuration

```nmconnection
[connection]
id=MyHomeWifi
uuid=abcdef12-3456-7890-abcd-ef1234567890
type=wifi
interface-name=wlp3s0
autoconnect=true
autoconnect-priority=10
timestamp=1678886400

[wifi]
ssid=MySecureHomeNetwork
mode=infrastructure
band=bg
mac-address-randomization=stable

[wifi-security]
key-mgmt=wpa-psk
psk=MySecretWiFiPassword123!
psk-flags=0

[ipv4]
method=auto

[ipv6]
method=auto
addr-gen-mode=stable-privacy
```

## Key Points
- They look similar to the INI format
- Naming Convention is consistent
- Syntax is simple
- Distinct Sections
- Platform-specific keywords
**Platform-specific keywords are more important than the syntax itself**

Those points are unique enough to warrant a specialized syntax highlighter.

## Implementation 

```javascript
/*
Language: Systemd
Description: Systemd/XDG Entry Specification file format.
Contributors: Lee Yunjin <gzblues61@daum.net>
Category: common, config
Website: https://www.freedesktop.org/
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
    begin: /^\[(Desktop Entry|Unit|Service|Install|Socket|Mount|Automount|Swap|Path|Timer|Slice|Scope|Manager|connection|ipv4|ipv6|802-3-ethernet|802-11-wireless|802-11-wireless-security|vpn|Journal|Bridge|Desktop Action\s+[A-Za-z0-9_-]+)\]/,
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
    name: 'Systemd',
    aliases: ['desktop', 'service', 'mount', 'socket', 'timer', 'nmconnection','systemd'],
    case_insensitive: false,
    contains: [
      COMMENT_MODE,
      SECTION_HEADER,
      KEY_VALUE_PAIR
    ]
  };
}
```

## Conclusion

It's preferable to use a dedicated highlighter for these formats rather than relying on a generic INI/TOML one.
Despite their technical differences, it's a well-established practice to unify similar configurations under a single highlighting scheme.
For instance, official highlight.js itself bundles INI and TOML, which also have subtle distinctions, into one highlighter.