const conversationsTemplate = () => {
    return `
<ul class="conversationsNav menu compact notext">
    <li class="editable">
        <a class="add light button" data-click="Conversations.conversations.new.dialog.toggle"></a>
        <form data-click="Conversations.conversations.new.submitForm">         
            <div><label for="conversationTitle">Název</label></div>
            <div>  
                <p class="step1"><input id="conversationTitle" type="text" name="title"/></p>            
                <a class="submit button" data-click="Conversations.conversations.new.submit"></a>
            </div>
            <div>
                <span class="error ConversationExists">Konverzace už existuje.</span>
                <span class="error Default">Zkuste to prosím ještě jednou.</span>
            </div>
        </form>       
    </li>
    <li>
        <button class="dated-conversations light button" data-click="Conversations.dated.dialog.toggle"></button>
        <span class="dated-conversations-control">                
            <span>
                <span>Jen poslední</span>                  
                <span>Vše</span>
            </span>
        </span>
        <span>
            <input type="range" min="0" max="100" value="${Conversations.dated.load()}"/>
        </span>
    </li>
</ul>
<ul class="conversations menu loading"></ul>`;
};