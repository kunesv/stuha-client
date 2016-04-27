---
title: Setting up Liferay Portal for development
date: 2012-06-24
layout: article.html
summary: Once in a while I need to create fresh new Liferay Portal development environment. Take a look at the steps I follow.
---
Once in a while I need to create fresh new Liferay Portal development environment. Here are the steps I follow.

## Downloads

On [Liferay Portal download page](http://www.liferay.com/downloads/liferay-portal/available-releases) get the bundle of your choice.

* For development I use bundle with Tomcat (Eclipse Liferay IDE Plugin seems to like it best).
* For production environment use what suits you best.

On [Additional Files download page](http://www.liferay.com/downloads/liferay-portal/additional-files) get the rest:

* Liferay Portal SQL Scripts
* Liferay Plugins SDK
* Liferay Portal JavaDocs
* Liferay Portal Source

## Directory Structure

This structure fits in as much default settings as possible.
Liferay Portal Project

    .   Project Directory [project dir]
    +-- bundles [portal runtime dir]
    |   +-- tomcat-0.0.00 [server dir]
    |   +-- portal-ext.properties [portal-ext.properties]
    +-- portal-0.0.0 [portal source dir]
    +-- sdk [portal sdk dir]
    +-- liferay-portal-tomcat-0.0.0-bundle.zip

## Remove sample plugins from bundle

Some sample plugins leave marks on the first Portal start, that are difficult to remove after. So let's get rid of them. Go to the server app dir (see directory structure above) and remove (at least) following directories: sevencogs-hook, sevencogs-theme. All except the ROOT folder can be removed and I usually remove them all - you can allways install them back.
Liferay Portal Tomcat Server

    .   tomcat-0.0.00 [server dir]
    +-- bin
    +-- conf
    +-- webapps
    |   +-- chat-portlet [online chat at the bottom of the page]
    |   +-- google-maps-portlet
    |   +-- kaleo-web [workflow]
    |   +-- knowledge-base-portlet
    |   +-- mail-portlet
    |   +-- opensocial-portlet
    |   +-- ROOT* [only one required]
    |   +-- sevencogs-hook
    |   +-- sevencogs-theme
    |   +-- social-networking-portlet
    |   +-- web-form-portlet
    |   +-- wsrp-portlet
    |   +-- RUNNING.txt

## Database Setup (PostgreSQL example)

Unzip file Liferay Portal SQL Scripts found on the Liferay download page and pick the right script form the folder create-minimal. I will use create-minimal-postgresql.sql.

### Create db user & create database

Sign in to psql console as admin (default admin user is postgres), create new user, create database lportal and create schema for the user.

    CREATE USER portal WITH PASSWORD 'password';
    \du
    CREATE DATABASE lportal ENCODING = 'UNICODE';
    or
    \c lportal
    CREATE SCHEMA AUTHORIZATION portal;
    \dn

Then sign in to database lportal as user portal and execute the sql script in file mentioned above, but with first few lines commented out:

    -- drop database lportal;
    -- create database lportal encoding = 'UNICODE';
    -- \c lportal;

    create table Account_ (
    ...

Executing script from file is done by \i command.

    \c lportal;
    \i 'path to the script/create-minimal-postgresql.sql';

## Adjust portal configuration file

Create file portal-ext.properties. This file will overwrite settings in portal.properties file inside the portal. Fill in some basics:

    ##
    ## JDBC (line 885)
    ##

        #
        # PostgreSQL
        #
        jdbc.default.driverClassName=org.postgresql.Driver
        jdbc.default.url=jdbc:postgresql://localhost:5433/lportal
        jdbc.default.username=portal
        jdbc.default.password=password

    ##
    ## Setup Wizard (line 4970)
    ##

        #
        # Set this property to true if the Setup Wizard should be displayed the
        # first the portal is started.
        #
        setup.wizard.enabled=false

There is a lot more in that file you can set. You should check other options in file `[portal source dir]/portal-impl/src/portal.properties`.

## Eclipse Configuration

### Install Liferay IDE

In Eclipse > Help > Eclipse Marketplace ... find: Liferay IDE and install it.

### Setup Liferay SDK

Then go to Window > Preferences > Liferay > Installed Plugin SDK. Press Add... and set Location to [portal sdk dir].

### Setup bundeled server

Go to File > New > Server >> Liferay, Inc. > Liferay v0.0 Server (Tomcat 0). Leave defaults here but Add.. new server runtime environment at [server dir].

You can use icons in Eclipse icon bar to call these actions directly.

### Start the Liferay Portal server

Just push start button in Servers view.

## Create new Liferay Portal plugin

File > New > Liferay Project. Fill in the project name (eg. Test) and pick the type of plugin you want to create.

## Deploy plugin

You should see build scripts in Ant view at bottom right of the Eclipse Liferay perspective. Double click one of them to build and deploy the plugin.

### Task cannot continue because ECJ is not installed

You may be presented with this error during the build time of your plugin. To solve it go to Eclipse > Window > Preferences > Ant > Runtime > Classpath (tab on right) > Ant Home Entries > (press button) Add External Jars and pick file [Eclipse home]/plugins/org.apache.ant_0.0.0/lib/ecj.jar.

Rerun the ant script and error should be solved.