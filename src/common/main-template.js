const mainTemplate = () => {
    return `<main>
    <aside>  
        <section></section>
        <footer>                                   
            <button class="user-settings secondary button" data-click="Users.menu.show"></button>
        </footer>
    </aside>
    <header>
        <div>
            <span class="menu-button hide-for-large"><button class="secondary button" data-click="Conversations.menu.toggle"></button></span>
            ${Notifications.templates.button()}                        
            <span class="conversation-name hide-for-large" data-content="currentConversation"></span>           
            <button class="light conversation button" data-click="Conversations.members.menu.show"></button>
        </div>       
    </header>
    <section>
        <div class="messages"></div>
        <div class="load-more">
            <button class="secondary button" data-click="Messages.loadMore"></button>
            <button class="light button" data-click="Messages.loadUnread"></button>
        </div>
    </section>
    <span class="add-button"><button class="button" data-click="Messages.message.dialog.show"></button></span>
</main>`;
};