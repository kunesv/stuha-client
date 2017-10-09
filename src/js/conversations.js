var Conversations = {
    template: () => {
        let template = `
<ul class="conversations menu">
    <li class="add">
        <a class="button" data-click="Conversations.conversation.new.add">       
            <span class="add"></span>
            <span>Začít novou konverzaci</span>
        </a>
        <form data-click="Conversations.conversation.new.submitForm">           
            <p class="step1"><input type="text" name="title"/></p>            
            <a class="submit button" data-click="Conversations.conversation.new.submit"></a>
        </form>       
    </li>
</ul>`;
        return document.createRange().createContextualFragment(template);
    },

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
    load: () => {
        return fetch('/api/conversations', {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((conversations) => {
                if (document.querySelector('aside .conversations')) {
                    document.querySelector('aside section').innerHTML = '';
                }

                document.querySelector('aside section').appendChild(Conversations.template());

                let conversationsMenu = document.querySelector('aside .conversations');
                conversations.forEach((conversation) => {
                    conversationsMenu.appendChild(Conversations.conversation.template(conversation));
                });

                Buttons.init(conversationsMenu.querySelectorAll('.button'));
                Buttons.initForms(conversationsMenu.querySelectorAll('form'));

                if (!Conversations.lastConversation.load().id) {
                    Conversations.lastConversation.save(conversations[0]);
                }
            });
        });
    },
    one: (conversation) => {
        let li = Conversations.conversation.template(conversation);
        Buttons.init(li.querySelectorAll('.button'));

        document.querySelector('aside .conversations').appendChild(li);
    },
    select: (button) => {
        let conversationId = button.dataset.conversationId;
        let conversationTitle = button.querySelector('span:last-child').textContent;

        Conversations.lastConversation.save({id: conversationId, title: conversationTitle});

        Conversations.conversation.new.reset();

        Messages.reload();

        Conversations.menu.hide();
    },
    status: () => {
        return fetch(`/api/conversations/status`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((status) => {
                console.log(status)
            });
        });
    },
    menu: {
        show: () => {
            document.querySelector('.content').classList.remove('moved-down');
            document.querySelector('.content').classList.add('moved');
        },
        hide: () => {
            document.querySelector('.content').classList.remove('moved');
        },
        toggle: () => {
            if (document.querySelector('.content').classList.contains('moved')) {
                Conversations.menu.hide();
            } else {
                Conversations.menu.show();
            }
        },
        active: () => {
            let conversations = document.querySelector('aside .conversations');
            let active = conversations.querySelector('.active');
            if (active) {
                active.classList.remove('active');
            }
            conversations.querySelector(`[data-conversation-id="${Conversations.lastConversation.load().id}"]`).classList.add('active');
        }
    },
    conversation: {
        template: (conversation) => {
            let template = `<li>
    <a class="button" data-click="Conversations.select" data-conversation-id="${conversation.id}">
        <span></span>
        <span></span>
    </a>
</li>`;
            let li = document.createRange().createContextualFragment(template);
            li.querySelector('span:last-child').textContent = conversation.title;

            return li;
        },
        new: {
            add: (button) => {
                button.parentNode.classList.toggle('form');
                if (button.parentNode.classList.contains('form')) {
                    button.parentNode.querySelector('input[name=title]').focus();
                } else {
                    Conversations.conversation.new.reset();
                }
            },
            reset: () => {
                let li = document.querySelector('.conversations.menu .add');
                if (li.classList.contains('form')) {
                    li.classList.remove('form');
                    li.querySelector('input[name=title]').value = '';
                    li.querySelector('.submit.button').classList.remove('progress');
                    li.querySelector('.submit.button').classList.remove('error');
                    li.querySelector('.submit.button').classList.remove('done');
                }
            },
            submitForm: (form) => {
                let button = form.querySelector('.submit.button');
                Conversations.conversation.new.submit(button);
            },
            submit: (button) => {
                if (!button.classList.contains('progress')) {
                    button.classList.remove('error');
                    button.classList.add('progress');

                    let conversationForm = new FormData(document.querySelector('.conversations.menu .form form'));

                    fetch('/api/conversation', {
                        headers: Fetch.headers(),
                        method: 'POST',
                        body: conversationForm
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((conversation) => {
                            button.classList.add('done');

                            setTimeout(() => {
                                Conversations.conversation.new.reset();
                                Conversations.one(conversation);
                            }, 200);
                        });
                    }).catch((response) => {
                        if (response.status === 409) {
                            console.log('--!--', 'Error')
                        }
                        button.classList.remove('progress');
                        button.classList.add('error');
                    });
                }
            }
        },
        member: {
            add: (button) => {
                if (!button.parentNode.classList.contains('form')) {
                    Conversations.conversation.member.show();
                } else {
                    Conversations.conversation.member.hide();
                }
            },
            show: () => {
                document.querySelector('li.conversation-member-add .submit.button').classList.add('disabled');
                let searchField = document.querySelector('li.conversation-member-add input[name=userSearch]');
                searchField.offsetParent.parentNode.classList.add('form');
                searchField.addEventListener('input', Conversations.conversation.member.input);
                searchField.focus();
            },
            hide: () => {
                let searchField = document.querySelector('li.conversation-member-add input[name=userSearch]');
                searchField.removeEventListener('input', Conversations.conversation.member.input);
                searchField.value = '';

                searchField.offsetParent.parentNode.classList.remove('form');
            },
            timeout: null,
            input: (event) => {
                if (Conversations.conversation.member.timeout) {
                    clearTimeout(Conversations.conversation.member.timeout);
                }
                Conversations.conversation.member.timeout = setTimeout((function (ev) {
                    let autocomplete = ev.target.parentNode.parentNode.querySelector('.autocomplete');
                    autocomplete.innerHTML = '';
                    autocomplete.classList.add('active');
                    autocomplete.classList.add('loading');

                    return fetch(`/api/relatedUsers/${ev.target.value}`, {
                        headers: Fetch.headers()
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((users) => {
                            for (let i = 0; i < users.length; i++) {
                                let user = users[i];
                                let li = document.createElement('li');
                                li.id = user.id;
                                li.textContent = user.name;
                                li.dataset.click = 'Conversations.conversation.member.set';
                                autocomplete.appendChild(li);
                            }
                            autocomplete.classList.remove('loading');
                            Buttons.init(autocomplete.querySelectorAll('li'));
                        });
                    });
                }), 300, event);
            },
            set: (button) => {
                document.querySelector('li.conversation-member-add input[name=memberId]').value = button.id;
                document.querySelector('li.conversation-member-add input[name=userSearch]').value = button.textContent;
                document.querySelector('li.conversation-member-add .autocomplete').innerHTML = '';
                document.querySelector('li.conversation-member-add .submit.button').classList.remove('disabled');
            },
            submitForm: (form) => {
                let button = form.querySelector('.submit.button');
                Conversations.conversation.member.submit(button);
            },
            submit: (button) => {
                if (button.classList.contains('disabled')) {
                    document.querySelector('li.conversation-member-add input[name=userSearch]').focus();
                }
                if (!button.classList.contains('progress') && !button.classList.contains('disabled')) {
                    button.classList.remove('error');
                    button.classList.add('progress');

                    let memberForm = new FormData(document.querySelector('.conversation-member-add form'));
                    memberForm.append('conversationId', Conversations.lastConversation.load().id);

                    fetch('/api/conversation/member', {
                        headers: Fetch.headers(),
                        method: 'POST',
                        body: memberForm
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((conversation) => {
                            button.classList.add('done');

                            setTimeout(() => {
                                Conversations.conversation.member.hide();
                                button.classList.remove('progress');
                            }, 200);
                        });
                    }).catch((response) => {
                        if (response.status === 409) {
                            console.log('--!--', 'Error')
                        }
                        button.classList.remove('progress');
                        button.classList.add('error');
                    });
                }
            }
        },
        menu: {
            show: () => {
                document.querySelector('.content').classList.add('dialog');
                document.querySelector('.conversation-menu').classList.add('active');
            },
            hide: () => {
                console.log(document.querySelectorAll('.conversation-menu .form'))
                if (document.querySelectorAll('.conversation-menu .form').length > 0) {
                    Conversations.conversation.member.hide();
                    setTimeout(() => {
                        document.querySelector('.content').classList.remove('dialog');
                        document.querySelector('.conversation-menu').classList.remove('active');
                    }, 50);
                } else {
                    document.querySelector('.content').classList.remove('dialog');
                    document.querySelector('.conversation-menu').classList.remove('active');
                }
            }
        }
    }
};