---
author: Lee Yunjin
---

# [Daily Tips] DOCKER: Share a host policy for your mounted volume

## Overview

If you have to build some packages via Docker, disk permission, SELinux, and many other problems make errors.

In many cases, this is caused by isolation.

### Docker container is isolated

Docker has different permissions, security policies, and many other system configurations with your host machine.
Of course, this is what containerization should do.

But it causes annoying bugs when your machine has strict SELinux policy.
Let's explain by merged PR that I wrote.

### Diff
```bash
- docker run -e VERSION="${VERSION}" -it --rm -v "$PWD:/out" -v "$PWD:/host" fedora:42 ./host/$TMP_SCRIPT
+ docker run -e VERSION="${VERSION}" -it --rm -v "$PWD:/out:z" -v "$PWD:/host:z" fedora:42 ./host/$TMP_SCRIPT
```


The only difference it shows, is ":z".
It failed to build a ARM64 wine before this patch.

Just a small part, makes a difference. This is important when you develop your toy projects. Contrary to worksites, these kinds of projects are not managed by strict development process. (e.g., Agile, Waterfall)


It is managed by bugfix and implementation.

A small part makes a big difference.

### Links

[Pull Request](github.com/lacamar/wine-arm64ec-rpm/pull/1)