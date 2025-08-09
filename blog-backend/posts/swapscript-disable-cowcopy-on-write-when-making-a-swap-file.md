---
author: Lee Yunjin
---

# [Swap][Script] Disable CoW(Copy on Write) when making a Swap file

## Script
```bash
# Delete the old file
sudo rm /swapfile

# Create a new, empty file with the no-cow attribute
sudo touch /swapfile

# Disable Copy-on-Write for the file
sudo chattr +C /swapfile

# Set the correct size and permissions
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile

# Set up the swap area and enable it
sudo mkswap /swapfile
sudo swapon /swapfile
## Set up the fstab for persistent use
echo "/swapfile      swap swap sw 0 0" >> /etc/fstab
```

## Key Points
- Do not execute mkswap before disabling CoW
- Correctly edit `/etc/fstab`


## Warning
Swap performs slower than RAMs.
It uses secondary storages(e.g., SSD, HDD) as a virtual RAM.
*Please don't use it when your RAMs are enough; it is unnecessary.*

