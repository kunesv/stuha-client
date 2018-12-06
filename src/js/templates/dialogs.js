const Dialogs = {
    templates: {
        messageDialog: () => {
            return `<section class="overlay message-dialog">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Messages.message.dialog.hide"></a></span>
    </header>
    <form enctype="multipart/form-data" id="images">
        <input type="file" id="uploadImage" name="images" multiple="multiple" accept="image/*"/>
    </form>
    <form id="message">       
        <section>           
            <textarea class="textarea" name="rough"></textarea>
            <ul class="thumbnails"></ul>
            <ul class="buttons">
                <li class="image secondary button">              
                    <label for="uploadImage"></label>                   
                </li>
                <!--<li class="gps button"></li>-->
            </ul>     
            <p>
                <span class="error">A co nějaký obsah?</span>
            </p>      
        </section>     
        <section>
            <p><span>A vybráním ikonky odešlu.</span></p>
            <ul class="icons"></ul>
            <p>
                <span class="error">Ještě vyberu ikonku.</span>
            </p>           
        </section>                
    </form>
</section>`;
        },
        converstionMenu: () => {
            return `<section class="overlay conversation-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Conversations.conversation.menu.hide"></a></span>
    </header>
    <main>
        <form>
            <label>Tady taky ještě nic. Bude tu vyhledávání a archiv.</label>
        </form>
    </main>
</section>`;
        },
        userMenu: () => {
            return `<section class="overlay user-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Users.menu.hide"></a></span>
    </header>
    <main>       
        <a class="logout secondary button" data-click="Login.logout">Logout</a>
    </main>
</section>`;
        },
        conversationMembersMenu: () => {
            return `<section class="overlay conversation-members-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Conversations.members.menu.hide"></a></span>
    </header>
    <ul class="compact menu">       
        <li class="editable conversation-member-add">
            <a class="light button" data-click="Conversations.conversation.member.add"></a>
            <form data-click="Conversations.conversation.member.submitForm">                       
                <div>
                    <label for="memberId">Jméno</label>
                </div>
                <div>
                    <p class="step1"><input id="memberId" type="hidden" name="memberId"/><input type="text" name="userSearch"/></p>            
                    <a class="submit button" data-click="Conversations.conversation.member.submit"></a>
                    <ul class="autocomplete"></ul>
                </div>               
            </form>          
        </li>
    </ul>
    <ul class="members">       
       
    </ul>
</section>`;
        },
        imageDialog: () => {
            return `<section class="overlay image-dialog">
    <main>
        <span class="close-button"><a class="translucent button" data-click="Messages.image.dialog.hide"></a></span>
        <span class="previous-button"><a class="translucent button" data-click="Messages.image.dialog.previous"></a></span>
        <span class="next-button"><a class="translucent button" data-click="Messages.image.dialog.next"></a></span>
        <section></section>
    </main>
</section>`;
        },
        ranicekDialog: () => {
            return `<section class="overlay ranicek-dialog">
    <header>
        <span class="close-button"><a class="beige button" data-click="Ranicek.dialog.hide"></a></span>
    </header>
    <main>
        <ol></ol>
    </main>
</section>
`;
        }
    },
    allTemplates: () => {
        let dialogs = ``;
        let dialogNames = Object.keys(Dialogs.templates);
        for (let i = 0; i < dialogNames.length; i++) {
            dialogs += Dialogs.templates[dialogNames[i]]();
        }

        return dialogs;
    }
};