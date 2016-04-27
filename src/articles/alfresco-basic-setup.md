---
title: Basic setup of Alfresco on Tomcat and PostgreSQL
date: 2012-08-24
layout: article.html
summary:  From time to time I need to install myself some Alfresco CMS. In this article I will show you how to do just that, using Apache Tomcat and PostgreSQL database.
---
From time to time I need to install myself some Alfresco CMS. In this article I will show you how to do just that, using Apache Tomcat and PostgreSQL database.

## Download

### Alfresco

On [Dowload and Install Alfresco wiki page](http://wiki.alfresco.com/wiki/Download_and_Install_Alfresco) follow the link "Custom Installs & Optional Modules", which leads to latest version of Alfresco. File you are searchin for will look similar to this (but propably some newer version)

alfresco-community-4.0.e.zip [alfresco zip]

### Tomcat

Go to [Apache Tomcat Homepage](http://tomcat.apache.org/) and find yourself some nice (propably latest) version of Tomcat application server. I ended with this file

apache-tomcat-7.0.29.zip

## Putting Things Together

### Tomcat

Unpack Tomcat to following directory structure.

    . alfresco
    +-- data [data dir]
    +-- tomcat [tomcat dir]

### Alfresco WAR's

Delete unnecessary applications from `[tomcat dir]/webapps` directory (I removed all) and copy war files from downloaded Alfresco installation zip file on path `[alfresco zip]/web-server/webapps/`.

    . webapps
    +-- alfresco.war
    +-- share.war

### Lib

Copy file `[alfresco zip]/web-server/lib/postgresql-9.0-801.jdbc4.jar` to `[tomcat dir]/lib/`.

## Configuration

### Create Shared folder

All Alfresco configuration files can be put in shared directory to override those packed inside above mentioned WARs, - the tomcat/shared folder. Create new folder `[tomcat dir]/shared/classes` and place inside files and directories from `[alfresco zip]/web-server/shared/classes/`.

    . shared
    +-- classes
        +-- alfresco
        +-- alfresco-global.properties.sample

### Alfresco Configuration

Create new file `[tomcat dir]/shared/classes/alfresco-global.properties`

    # (line 5)
    # Sample custom content and index data location
    #
    dir.root=/path/to/[data dir]

    # (line 59)
    # PostgreSQL connection (requires postgresql-8.2-504.jdbc3.jar or equivalent)
    #
    db.driver=org.postgresql.Driver
    db.url=jdbc:postgresql://localhost:5432/alfresco

### More Tomcat Settings

To make Tomcat interested in our shared dir, edit file `[tomcat dir]/conf/catalina.properties`. Change value

    shared.loader=

to

    shared.loader=[tomcat dir]/shared/classes

To increase memory add in file `[tomcat dir]/bin/setenv.bat` (for Windows)

    set "JAVA_OPTS=%JAVA_OPTS% -Xmx1024m -XX:MaxPermSize=256m"

or `[tomcat dir]/bin/setenv.sh` (for Linux)

    JAVA_OPTS="$JAVA_OPTS -Xmx1024m -XX:MaxPermSize=256m"

### Database setup

Create database alfresco, user alfresco (with password alfresco) and create schema in this database controlled by that user.

    CREATE USER alfresco WITH PASSWORD 'alfresco';
    \du
    CREATE DATABASE alfresco ENCODING = 'UNICODE';
    \c alfresco
    CREATE SCHEMA AUTHORIZATION alfresco;
    \dn

Alfresco will populate database table structure by itself.

## Go!

Run `[tomcat dir]/bin/startup.bat` (Windows) or `[tomcat dir]/bin/startup.sh &` (Linux).
