Templates.message = (message) => `<article id="${message.id}" class="${Users.currentUser.userName === message.userName ? 'my' : ''} ${message.robo ? 'robot' : ''}" 
        data-date="${Datetime.formatDate(message.createdOn)}" data-icon-path="${message.iconPath}">
    <header>
        <div class="icon ${!message.robo ? 'button' : ''} ${message.unread ? 'new' : ''}" data-click="Messages.message.dialog.show" data-reply-to-name="${message.userName}" 
            style="background-image: url('/images/icons/${Messages.message.validations.icon(message.iconPath)}')"></div>
    </header>
    <main>        
        <ul class="replyTos"></ul>         
        <section class="formatted"></section>
            
        <footer>${Datetime.formatDate(new Date()) !== Datetime.formatDate(message.createdOn) ? Datetime.formatDate(message.createdOn) + ',' : ''} <b>${Datetime.formatTime(message.createdOn)}</b></footer>
    </main>
</article>`;

Templates.messageSeparator = (createdOn) => `<div class="seperator"><span>${createdOn}</span></div>`;
Templates.replyTo = (replyTo) => `<li class="button" data-click="Messages.message.replyTo.show" data-id="${replyTo.replyToId}" data-icon-path="${replyTo.iconPath}">
    <span class="replyToIcon" style="background-image: url('/images/icons/${replyTo.iconPath}')"></span><span class="caption"></span>
</li>`;