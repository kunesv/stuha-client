const conversationsTemplate = () => {
    return `<ul class="conversationsNav menu compact notext">
    <li class="editable">
        <a class="add light button" data-click="Conversations.conversation.new.dialog.toggle"></a>
        <form data-click="Conversations.conversation.new.submitForm">         
            <div><label for="conversationTitle">Název</label></div>
            <div>  
                <p class="step1"><input id="conversationTitle" type="text" name="title"/></p>            
                <a class="submit button" data-click="Conversations.conversation.new.submit"></a>
            </div>
            <div>
                <span class="error ConversationExists">Konverzace už existuje.</span>
                <span class="error Default">Zkuste to prosím ještě jednou.</span>
            </div>
        </form>       
    </li>
    <li class="editable">
        <a class="dated-conversations light button" data-click="Conversations.dated.dialog.toggle"></a>
        <form class="dated-conversations-control">                
            <div>
                <span>Jen poslední</span>                  
                <span>Vše</span>
            </div>
            <div>
                <input type="range" min="0" max="100" value="${Conversations.dated.load()}"/>
            </div>
        </form>
    </li>
</ul>
<ul class="conversations menu loading"></ul>`;
};