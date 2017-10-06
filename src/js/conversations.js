var Conversations = {
    lastConversation: {
        conversation: {},
        load: () => {
            if (!Conversations.lastConversation.conversation.id) {
                Conversations.lastConversation.conversation = {
                    'id': localStorage.getItem('conversationId'),
                    'title': localStorage.getItem('conversationTitle')
                };
            }
            return Conversations.lastConversation.conversation;
        },
        save: (conversation) => {
            Conversations.lastConversation.conversation = conversation;
            localStorage.setItem('conversationId', conversation.id);
            localStorage.setItem('conversationTitle', conversation.title);
        },
        clean: () => {
            Conversations.lastConversation.conversation = {};
            localStorage.removeItem('conversationId');
            localStorage.removeItem('conversationTitle');
        }
    },
    currentConversations: [],
    save: (conversations) => {
        Conversations.currentConversations = conversations;

        if (!Conversations.lastConversation.load().id || !Conversations.conversationExists(Conversations.lastConversation.load(), conversations)) {
            Conversations.lastConversation.save(conversations[0]);
        }
    },
    conversationExists: (conversation, conversations) => {
        if (!conversation || !conversation.id) {
            return false;
        }

        for (let i = 0; i < conversations.length; i++) {
            if (conversations[i].id === conversation.id) {
                return true;
            }
        }
        return false;
    },
    load: () => {
        return fetch('/api/conversations', {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((conversation) => {
                Conversations.save(conversation);
            });
        });
    },
    select: (button) => {
        let conversationId = button.getAttribute('data-conversation-id');

        Conversations.currentConversations.some((conversation) => {
            if (conversation.id === conversationId) {
                Conversations.lastConversation.save(conversation);
                return true;
            }
        });

        Messages.reload();

        Messages.menu.hide();
    },
    status: () => {
        return fetch(`/api/conversations/status`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((status) => {
                console.log(status)
            });
        });
    }
};