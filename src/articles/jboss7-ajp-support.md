---
title: Adding AJP support to JBoss7
date: 2012-03-08
summary: JBoss 7 does not start AJP connector anymore in the default configuration.
layout: article.html
---

Since JBoss version 7, AJP connector is not provided by default any more.

To find out, whether default AJP port is in use, run:

`netstat -an | grep "LISTEN "`

If you do not see the line like this:

`tcp6   0   0 x.x.x.x:8009   :::*    LISTEN`

then you would have to add AJP connector.

To do that add this line:

`<connector name="ajp" protocol="AJP/1.3" socket-binding="ajp"/>`

to standalone.xml:

    <subsystem xmlns="urn:jboss:domain:web:1.0" default-virtual-server="default-host">
        ...
        <connector name="http" protocol="HTTP/1.1" socket-binding="http" scheme="http"/>
        <connector name="ajp" protocol="AJP/1.3" socket-binding="ajp"/>
        ...
    </subsystem>
