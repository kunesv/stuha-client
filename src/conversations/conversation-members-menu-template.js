const conversationMembersMenuTemplate = () => {
    return `<section class="overlay conversation-members-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Conversations.members.menu.hide"></a></span>
    </header>
    <ul class="compact menu">       
        <li class="editable conversation-member-add">
            <a class="light button" data-click="Conversations.conversations.member.add"></a>
            <form data-click="Conversations.conversations.member.submitForm">                       
                <div>
                    <label for="memberId">Jméno</label>
                </div>
                <div>
                    <p class="step1"><input id="memberId" type="hidden" name="memberId"/><input type="text" name="userSearch"/></p>            
                    <a class="submit button" data-click="Conversations.conversations.member.submit"></a>
                    <ul class="autocomplete"></ul>
                </div>               
            </form>          
        </li>
    </ul>
    <ul class="members">       
       
    </ul>
</section>`;
};