---
title: Starting Application on System Startup
date: 2012-06-29
layout: article.html
summary: If you want to start your application (for example JBoss) in boot time, one way is to create the script in init.d directory. Let's see how it can be achieved both in Ubuntu and Centos.
---

If you want to start your application (for example JBoss) in boot time, one way is to create the script in init.d directory and register it to load on some run-level. Let's see how it can be achieved both in Ubuntu and Centos.

## Script file location

Create new file of the following file name. Change all occurences of jboss to name of your app.

    sudo vim /etc/init.d/jboss

Make it executable

    sudo chmod +x /etc/init.d/jboss

## Ubuntu

    #!/bin/sh
    #
    # Author: Vaclav Kunes, 2012
    #
    ### BEGIN INIT INFO
    # Provides:          jboss
    # Required-Start:    $local_fs $remote_fs $network $syslog
    # Required-Stop:     $local_fs $remote_fs $network $syslog
    # Default-Start:     2 3 4 5
    # Default-Stop:      0 1 6
    # Short-Description: Start/Stop JBoss server
    ### END INIT INFO

    case "$1" in
        start)
            echo "Starting JBoss server"
            sudo -u user sh /path/to/start.sh &
        ;;
        stop)
            echo "Stopping JBoss server"
            sudo -u user sh /path/to/stop.sh &
        ;;
        *)
            echo "Usage: /etc/init.d/jboss {start|stop}"
            exit 1
        ;;
    esac

    exit 0

And execute command

    sudo update-rc.d jboss defaults

With following output:

    Adding system startup for /etc/init.d/jboss ...
       /etc/rc0.d/K20jboss -> ../init.d/jboss
       /etc/rc1.d/K20jboss -> ../init.d/jboss
       /etc/rc6.d/K20jboss -> ../init.d/jboss
       /etc/rc2.d/S20jboss -> ../init.d/jboss
       /etc/rc3.d/S20jboss -> ../init.d/jboss
       /etc/rc4.d/S20jboss -> ../init.d/jboss
       /etc/rc5.d/S20jboss -> ../init.d/jboss

## Centos

    #!/bin/sh
    # Author: Vaclav Kunes, 2012
    #
    # /etc/init.d/jboss
    # Subsystem file for JBoss AS
    #
    # chkconfig: 2345 95 05 (1)
    # description: JBoss AS
    #
    # processname: JBoss

    case "$1" in
        start)
            echo "Starting JBoss AS"
            su - user -c /path/to/start.sh &
        ;;
        stop)
            echo "Stopping JBoss AS"
            su - user -c /path/to/stop.sh &
        ;;
        *)
            echo "Usage: /etc/init.d/jboss {start|stop}"
            exit 1
        ;;
    esac

    exit 0

And execute two commands.

    chkconfig --add jboss
    chkconfig jboss on