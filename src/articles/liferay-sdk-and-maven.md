---
title: "Liferay SDK + Portlets as Maven Project With Modules"
date: 2012-11-06
layout: article.html
summary: From time to time I want to create some Liferay plugins. Maven being the tool for that job, could take only few steps to create new project environment.
---

From time to time I want to create some Liferay plugins. Maven being the tool for that job, could take only few steps to create new project environment.

## Create parent project

In parent folder to your sdk (parent) project folder run

    mvn archetype:create -DgroupId=cz.sprinters -DartifactId=sdk

Start Eclipse and create New > Project > General > Project (for project name I use good old "sdk")

Delete /sdk/src folder inside the newly created folder.

Still in Eclipse open /sdk/pom.xml and

change

    <packaging>pom</packaging>

remove (whole block)

    <dependencies>
    ...
    </dependencies>

and finally add

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <liferay.auto.deploy.dir>/path/to/bundles/deploy</liferay.auto.deploy.dir>
        <liferay.version>6.1.1</liferay.version>
    </properties>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <configuration>
                        <source>1.7</source>
                        <target>1.7</target>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

In Eclipse you can press Ctrl+Shift+F to format pom.xml.

Last step would be to convert this project to Maven project. (Right click on project > Configure > Convert to Maven project)

## Liferay Portlet Project as Maven Module

Let's add one new portlet inside the parent project. We will use archetype for liferay portlet.

Change directory to your parent project folder (/sdk).

    cd sdk

Create module

    mvn archetype:generate -DarchetypeGroupId=com.liferay.maven.archetypes -DarchetypeArtifactId=liferay-portlet-archetype -DgroupId=cz.sprinters -DartifactId=test-portlet

Generate eclipse files

    mvn eclipse:eclipse

You could exclude following files from versioning system.

    target
    .classpath
    .project
    .wtpmodules

Import project to Eclipse

Eclipse > Import ... > Existing Maven Project (will find all modules)

In case of error "Unsupported IClasspathEntry kind=4":

* Disable Maven Nature
* `mvn eclipse:clean` (while your project is open in STS/eclipse)
* Re-enable Maven nature

Package

    mvn package

To deploy portlet run

    mvn liferay:deploy

The End.