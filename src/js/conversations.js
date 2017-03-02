var Conversations = {
    lastConversation: {
        conversation: null,
        load: () => {
            if (!Conversations.lastConversation.conversation) {
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
        }
    },
    currentConversations: [],
    save: (conversations) => {
        Conversations.currentConversations = conversations;

        if (!Conversations.lastConversation.conversationId) {
            Conversations.lastConversation.save(conversations[0]);
        }
    },
    load: () => {
        return fetch('/api/userConversations', {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((conversations) => {
                Conversations.save(conversations);

                Messages.load(Conversations.lastConversation.load());
            });
        });
    }
};