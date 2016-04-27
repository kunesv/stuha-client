---
title: Liferay, Site name as the web page title
date: 2012-04-23
summary: Default Liferay site title ends with company name. To replace that, you'll have to update (or create new) custom theme.
layout: article.html
---

Default Liferay site title ends with company name. To replace that, you'll have to update (or create new) custom theme.

In *templates/portal_normal.vm* replace line

`<title>$the_title - $company_name</title>`

with

`<title>$the_title - $site_name</title>`

