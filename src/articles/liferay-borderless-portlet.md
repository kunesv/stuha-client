---
title: Borderless portlet in Liferay
date: 2012-04-16
summary: Setting portlet to be seen without border by default. This took me while to find out.
layout: article.html
---

In `liferay-portlet.xml` add:


    <liferay-portlet-app>
        <portlet>
            <portlet-name>PortletName</portlet-name>
            <use-default-template>false</use-default-template>
            <instanceable>false</instanceable>
            <css-class-wrapper>PortletName-portlet</css-class-wrapper>
        </portlet>
        ...

    </liferay-portlet-app>

The End.