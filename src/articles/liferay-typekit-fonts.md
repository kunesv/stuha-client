---
title: Typekit fonts with Liferay
date: 2012-05-01
summary: To add real fonts to your web site, you can use font repository like Typekit. Adding this functionality to your Liferay Portal theme will require three easy steps.
layout: article.html
---

To add real fonts to your web site, you can use font repository like [Typekit](https://typekit.com/). Adding this functionality to your Liferay Portal theme will require three easy steps.

![Go Real Type written on cardboard](/images/go_real_type.jpg "Go")

## Create Typekit account

To get your `id`, look around the Typekit site to after something similar to `kgw2gjn`.

## Add Typekit JavaScript library

Add following code to header section of *portal_normal.vm* template of your custom theme. Replace `YOUR_ID` with your id from previous step.

    <script>
        AUI().use('aui-viewport');
        document.write(unescape("%3Cscript src='" + document.location.protocol + "//use.typekit.com/YOUR_ID.js'%3E%3C/script%3E"));
    </script>
    <script>
        try{Typekit.load();}catch(e){}
    </script>

There is some added functionality in this piece of code. Second line of the script detects whether the page is served thrue normal HTTP, or its secured version - HTTPS. Accordingly to that, matching Typekit script is linked. If you don't use HTTPS, or use it all the time, you would be fine with default script from Typekit webpage - watch out for the right protocol.

    <script src="//use.typekit.com/**YOUR_ID**.js"></script>
    <script>try{Typekit.load();}catch(e){}</script>

## Hide text with CSS while loading

We want to hide all texts on the page written with Typekit font until the font is available (it could take a while to download). Name of CSS class placed by JavaScript library from Typekit to our code during loading time is .wf-loading. So add something like this to your theme.

    .wf-loading p, .wf-loading **MORE SELECTORS HERE**, .wf-loading **AND HERE** {
        visibility: hidden;
    }

