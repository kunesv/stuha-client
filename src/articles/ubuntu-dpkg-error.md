---
title: "Ubuntu apt-get error \"E: Sub-process /usr/bin/dpkg returned an error code (1)\""
date: 2012-06-28
layout: article.html
summary:  I've just tried to upgrade my Ubuntu with stated error. The solution was nowhere to found. But valuable hint was to actually read the error ...
---
I've just tried to upgrade my Ubuntu with stated error. The solution was nowhere to found. But valuable hint was to read whole output :).

![](/images/ubuntu.jpg)

Try to find something like following in the output of your apt-get command.

    failed in buffer_write(fd) (10, ret=-1): backend dpkg-deb during `some.package': No space left on device dpkg-deb: subprocess paste killed by signal (Broken pipe)

If your search was positive execute `df -h` and look through the output for a partition with no (or very little) space left (it was `/boot` in my case). Then free it.