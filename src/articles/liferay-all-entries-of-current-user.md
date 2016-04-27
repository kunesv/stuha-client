---
title: How To Get All Entries of Current User in Liferay
date: 2012-06-05
layout: article.html
summary: To get all entries of some user, you would not use common getEntries/getArticles methods, but special methods made only for this purpose.
---

 It doesn't matter if you work with AnnouncementsEntry, BlogsEntry, JournalArticle, or other Entry class of Liferay Portal. For each of them you will probably use matching util class (AnnouncementsEntryLocalServiceUtil, BlogsEntryLocalServiceUtil, JournalArticleLocalServiceUtil, ...).

So what method would you use to get all entries of some user? The name is similar all around: getUserEntries, getGroupUserEntries, or not so similar: getJournalArticleByUuidAndGroupId. But it is allways there.

## In-code example

Here is the code that lists all the announcements of signed in user.

    int total = AnnouncementsEntryLocalServiceUtil.getUserEntriesCount(user.getUserId());

    List<AnnouncementsEntry> results = AnnouncementsEntryLocalServiceUtil.getUserEntries(user.getUserId(), searchContainer.getStart(), searchContainer.getEnd());

Description how to put together searchContainer can be found on [Liferay Search Container Wiki page](http://www.liferay.com/community/wiki/-/wiki/Main/SearchContainer).