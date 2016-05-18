---
title: Bringing Second WYSIWYG Editor to Liferay Blogs Entry Form
date: 2012-05-16
layout: article.html
summary: If you are proper bloger, like me, than you surely love WYSIWYG. And if you publish that blog of yours through Liferay Blog portlet, you may be missing the WYSIWYG editor for the blog's abstract. Let's have a look how you can bring second WYSIWYG editor to blog entry form.
image: /images/wysiwyg.jpg
---

If you are proper bloger, like me, than you surely love WYSIWYG. And if you publish that blog of yours through Liferay Blog portlet, you may be missing the WYSIWYG editor for the blog's abstract. Let's have a look how you can bring second WYSIWYG editor to blog entry form.

![](/images/wysiwyg.jpg)

## Single WYSIWYG Editor

Before I get to the matter described in the head of this article, I want to show you how to add single WYSIWYG editor field to the form - there are few nice deaults to it, so I could not resist to show you how small the code could be. But if you only want add that second editor field your form, please jump few paragraphs down.

To add WYSIWYG editor functionality to the form use tag from Liferay UI tag library liferay-ui:input-editor. Also add one hidden field, thrue which we will send the data to server. The aui:field-wrapper tag is optional, but it is there for us to use.

    <aui:field-wrapper label="fieldLabel">
        <liferay-ui:input-editor editorImpl="<%= EDITOR_WYSIWYG_IMPL_KEY %>"/>
        <aui:input name="fieldName" type="hidden"/>
    </aui:field-wrapper>

Transfer of editor content to hidden field can be done when the form is submitted. Following code will add event listner to Liferay saveEntry event. If your form does not produce this kind of stuff, you can use AUI event (see one paragraph below).

    <aui:script>
    Liferay.provide(
        window,
        '<portlet:namespace />saveEntry',
        function(draft, ajax) {
            document.<portlet:namespace />fm.<portlet:namespace />description.value = window.<portlet:namespace />abstractEditor.getHTML();
        }
    );
    </aui:script>

And less complicated way with common event listener.

    <aui:script use="aui-base">
        A.one('#').on('submit', function () {
            document.<portlet:namespace />fm.<portlet:namespace />description.value = window.<portlet:namespace />abstractEditor.getHTML();
        }
    </aui:script>

Last, but actually the first step would be to fill the original value to editor field while editing once submitted form. Because the default value of initialization JavaScript function on liferay-ui:input-editor tag is initMethod="initEditor", the function will be named like so.

    <aui:script>
        <%
        String content = request.getAttribute("content");
        %>

        function <portlet:namespace />initEditor() {
            return "<%= UnicodeFormatter.toString(content) %>";
        }
    </aui:script>

There you go, we have form with single WYSIWYG editor. And now, when we understand the subject, let's put that second editor to Liferay Blog portlet entry editting form.

## Second WYSIWYG editor: Spiced up abstract of the Blog entry

We will be changing appearance of the Liferay Blogs portlet. Easiest way is to make new hook plugin. Most changes are made in file html\portlet\blogs\edit_entry.jsp

When we use input-editor tag only once, we can leave parameters initMethod and name to be filled with default values (initMethod="initEditor" & name="editor"). But for the second occurance in the same form, you'll have to supply them.

Around the line 169 in blogs_entry.jsp file, find line like this:

    <aui:input label="description" name="description" />

and replace it with these lines:

    <aui:field-wrapper label="description">
        <liferay-ui:input-editor initMethod="initAbstractEditor" editorImpl="<%= EDITOR_WYSIWYG_IMPL_KEY %>" name="abstractEditor" />
        <aui:input name="description" type="hidden" />
    </aui:field-wrapper>

Than, again, you need to make sure that contents of the editor is put to hidden field before you the form is submitted. In the same file (blogs_entry.jsp) somewhere around the line 410, find line like this:

    document.<portlet:namespace />fm.<portlet:namespace />content.value = content;

Just below that, put your own piece of code, which will save contents of the WYSIWYG editor to the sended form's field. It will look like so (original piece of code in italic):

    document.<portlet:namespace />fm.<portlet:namespace />content.value = content;
    document.<portlet:namespace />fm.<portlet:namespace />description.value = window.<portlet:namespace />abstractEditor.getHTML();

Then add the function to fill the previously saved content (updating time) to WYSIWIG editor. Go back to (blogs_entry.jsp) line 270 and find this pieceThis piece of JavaScript:

    function <portlet:namespace />initEditor() {
            return "<%= UnicodeFormatter.toString(content) %>";
    }

Under it, put your slightly different version, altered for the description field. (Original piece of code is in italic):

    function <portlet:namespace />initEditor() {
            return "<%= UnicodeFormatter.toString(content) %>";
    }

    <%
        String description = BeanParamUtil.getString(entry, request, "description");
    %>
    function <portlet:namespace />initAbstractEditor() {
        return "<%= UnicodeFormatter.toString(description) %>";
    }

That's the entry form part. Now you are able to create formatted text for Blog's abstract, but there are two more things which are needed to be accomplished before you can enjoy the beauty of markup in your abstracts. Database and presentation code.

## Change the Database

Blog's entry abstract is saved into the column description in Liferay portal database table called blogsentry. By default the type of this column is patheticly small varchar(75). The SQL command to make it something more reasonable will depend on the database server that you use. Below are SQL alter table statements for two most common servers, MySQL and Postgres.
MySQL

    ALTER TABLE blogsentry CHANGE description description TEXT;

PostgreSQL

    ALTER TABLE blogsentry ALTER COLUMN description TYPE TEXT;

## Change the presentation code

Finally, we have to touch the file html\portlet\blogs\view_entry_content.jsp on line 138 and find following piece of code, which shortens the abstract text and strips it of html tags. We want neither.

    <%= StringUtil.shorten(HtmlUtil.stripHtml(entry.getDescription()), pageAbstractLength) %>

Chop enclosing methods to transform it into the following.

    <%= entry.getDescription() %>

And thats all, we are done here.