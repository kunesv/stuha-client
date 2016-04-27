---
title: "Sass Plugin in Play 2.2"
date: 2013-10-19
layout: article.html
summary: "Once in a while, I want to have Sass support in a Play Framework project. Let's see how to get one."
---
All you have to do to enable Sass support in Play 2.x framework is to install a Sass plugin. But when I [searched Sass in available plugins for Play framework](http://www.playframework.com/modules/sass), only plugin for version 1.x framework series was listed. And then I found this [Sass asset handling plugin for Play 2.x](https://github.com/jlitola/play-sass).

## Install play-sass

Installation is well described [on the project page](https://github.com/jlitola/play-sass), so I will not repeat it here. Just be prepared to install these [two](http://www.rubyinstaller.org/) [apps](http://sass-lang.com/install).

## Configuration

There are two config files you are going to modify.

### project/plugins.sbt

Add those two lines suggested in installation instructions, but dont't forget to keep blank lines between them.

### build.sbt

Add text is in **bold**.

<pre>
<b>import net.litola.SassPlugin</b>

name := "project-name"

version := "1.0-SNAPSHOT"

...

play.Project.playScalaSettings <b>++ SassPlugin.sassSettings</b>
</pre>


And that's it.