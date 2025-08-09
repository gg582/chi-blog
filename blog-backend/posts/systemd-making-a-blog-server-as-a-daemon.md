---
author: Lee Yunjin
---

# [Systemd] Making a Blog Server as a Daemon

## Overview

*This guide is intended for developers and power users who want to better manage server processes. Casual users can skip this if they don’t need daemon management.*

This kind of knowledge is not needed for traditional office work.

**Systemd is a modern service manager used by most Linux distributions. It simplifies daemon management by turning it into a task-based approach with minimal configuration.**

This is more managed than SysV init. Although some developers opposed abstraction, it is commonly used in many distributions. It is not structured as SysV init, but it simplified daemon management into concise tasks.
So, you don't need to be an expert to manage a daemon.
If you have studied computer software management, and a bit of computer science, you can understand it. Even a new learner from some developer boot camps can understand.

### Actual Scenario

This blog's backend was executed by this script:

```bash
cd /opt/chi-blog/blog-backend;
nohup ./blog-backend
```

However, it is hard to restart the server when you need to check it.

#### Famous Service Types

##### Detached Background
- forking (parent process executes a forked child. parent exits after forking it)
- oneshot (systemd executes a one-shot command while expecting it to exit)

##### Systemd-managed Foreground
- simple (simply launch a process while expecting it to persist)

**This fits my purpose.**
Let's use this type.

Some features like `systemctl kill` are available, but let the stop command kill it.

#### This task's characteristics
- Continuous Running
- Single Process
- Simple HTTPS Back-end


So, let's write a service file to manage this.

### Service File

```desktop
[Unit]
Description=Chi-blog service
After=network.target

[Service]
Type=simple # Assume this application is continuously running without normal exit
User=root
ExecStart=/opt/chi-blog/blog-backend/blog-backend 
WorkingDirectory=/opt/chi-blog/blog-backend/ # Define a working directory to use relative path
ExecReload=kill -HUP $MAINPID # Gracefully kill the task
ExecStop=kill $MAINPID
StandardOutput=append:/opt/chi-blog/server.log
StandardError=append:/opt/chi-blog/error.log
KillMode=process
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Key Points

- Systemd
- Simple Process
- Graceful exit
- Proper Working Directory

### Result

I can easily restart a back-end server.
If I develop an application to manage server activity, this method makes it much easier to control via shell commands.

### Target Readers

- Developers
- Advanced Users

### Less Recommended Readers

- Ordinary Linux Desktop Users
- Linux Tablet Owners
- Mobile GNU/Linux(Ubports, KDE Mobile) users

Linux does not require advanced IT knowledge.

You don’t need to study computer science or take college-level courses.

People are afraid of Linux, mistakenly thinking it requires expert knowledge.
And unfortunately, some developers *unintentionally* reinforce this perception.
Although many developers are using it as a development laptop's main OS, tasks other than coding do not need expert knowledge. 
 You can use GUI-based package managers like Synaptic or Dnfdragora—or simply install your favorite apps via the command line once and forget about it.

*You can use Linux normally-being an ordinary user is perfectly fine.*