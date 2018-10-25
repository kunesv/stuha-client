const Conversations = {
    template: () => {
        return `
<ul class="conversationsNav menu compact notext">
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
</ul>
<ul class="conversations menu loading"></ul>`;
    },
    lastConversation: {
        conversation: {},
        load: () => {
            if (!Conversations.lastConversation.conversation.id) {
                Conversations.lastConversation.conversation = {
                    'id': localStorage.getItem('conversationId'),
                    'title': localStorage.getItem('conversationTitle'),
                    'iconPath': localStorage.getItem('conversationIconPath')
                };
            }
            return Conversations.lastConversation.conversation;
        },
        save: (conversation) => {
            Conversations.lastConversation.conversation = conversation;
            localStorage.setItem('conversationId', conversation.id);
            localStorage.setItem('conversationTitle', conversation.title);
            localStorage.setItem('conversationIconPath', conversation.iconPath);
        },
        clean: () => {
            Conversations.lastConversation.conversation = {};
            localStorage.removeItem('conversationId');
            localStorage.removeItem('conversationTitle');
            localStorage.removeItem('conversationIconPath');
        },
        conversationExists: (conversationId, conversations) => {
            if (!conversationId) {
                return false;
            }

            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i].id === conversationId) {
                    return true;
                }
            }
            return false;
        }
    },
    init: () => {
        document.querySelector('aside section').insertAdjacentHTML('beforeEnd', Conversations.template());
        let conversationsNavMenu = document.querySelector('aside .conversationsNav');
        Buttons.init(conversationsNavMenu.querySelectorAll('.button'));
        Buttons.initForms(conversationsNavMenu.querySelectorAll('form'));
        document.querySelector('.menu-button .button').classList.add('loading');
        return Conversations.load();
    },
    fill: (conversations) => {
        let conversationsMenu = document.querySelector('.conversations.menu');
        for (let i = 0; i < conversations.length; i++) {
            conversationsMenu.insertAdjacentHTML('beforeEnd', Conversations.conversation.template(conversations[i]));
            document.querySelector('aside .conversations li:last-child a > span:last-child').textContent = conversations[i].title;
        }

        Buttons.init(conversationsMenu.querySelectorAll('.button'));
        // Buttons.initForms(conversationsMenu.querySelectorAll('form'));

        let lastConversationId = Conversations.lastConversation.load().id;

        if (!lastConversationId || !Conversations.lastConversation.conversationExists(lastConversationId, conversations)) {
            Conversations.lastConversation.save(conversations[0]);
            Messages.reload();
        }

        Conversations.dated.refresh();

        Conversations.menu.active();
        conversationsMenu.classList.remove('loading');

        Conversations.refreshCurrentConversationUnreadCount();

        Conversations.menuButtonUnreadSignalization();

        document.querySelector('.menu-button .button').classList.remove('loading');
        console.log(document.querySelector('.menu-button .button').classList)

        // FIXME: Fix Notifications
        // Notifications.init();
    },
    get: () => {
        return fetch('/api/conversations', {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json();
        });
    },
    clean: () => {
        let conversations = document.querySelector('aside .conversations');
        conversations.classList.add('loading');
        conversations.innerHTML = '';
    },
    load: () => {
        Conversations.get().then(Conversations.fill);
    },
    // FIXME: Remove after WebSocket solution is introduced
    wsToBe: {
        refresh: () => {
            Conversations.get().then((conversations) => {
                let conversationsInMenu = document.querySelectorAll('.conversations.menu li a');
                let match = conversations.length === conversationsInMenu.length;

                for (let i = 0; match && i < conversations.length; i++) {
                    if (!Conversations.wsToBe.equals(conversations[i], conversationsInMenu[i])) {
                        match = false;
                    }
                }

                if (!match) {
                    Conversations.clean();
                    setTimeout(() => Conversations.fill(conversations), 100);
                }
            });
        },
        equals: (obj, el) => {
            let unreadText = el.querySelector('.unread').textContent;
            return obj.id === el.dataset.conversationId && obj.unreadCount === (unreadText === '' ? 0 : parseInt(unreadText));
        }
    },
    reload: () => {
        if (!document.querySelector('.conversations.menu').classList.contains('loading')) {
            Conversations.clean();
            Conversations.load();
        }
    },
    all: (conversations) => {

    },
    one: (conversation) => {
        document.querySelector('aside .conversations').insertAdjacentHTML('beforeEnd', Conversations.conversation.template(conversation));
        let c = document.querySelector('aside .conversations li:last-child');
        c.querySelector('a > span:last-child').textContent = conversation.title;
        Buttons.init(c.querySelectorAll('.button'));
    },
    select: (button) => {
        let conversationId = button.dataset.conversationId;
        let conversationTitle = button.parentNode.querySelector('a > span:last-child').textContent;
        button.querySelector('.unread').textContent = '';

        Conversations.selectConversation({
            id: conversationId,
            title: conversationTitle,
            iconPath: button.dataset.iconPath
        });
    },
    selectConversation: (conversation) => {
        Conversations.lastConversation.save({
            id: conversation.id,
            title: conversation.title,
            iconPath: conversation.iconPath
        });

        Conversations.menu.active();

        Conversations.conversation.new.reset();

        Messages.reload();

        Conversations.menu.hide();

        Conversations.members.menu.refreshIfOpen();

        Conversations.menuButtonUnreadSignalization();
    },
    refreshCurrentConversationUnreadCount: () => {
        let unread = document.querySelector(`.conversations.menu a.active .unread`);
        if (parseInt(unread.textContent) > 0) {
            Messages.loadRecent();
            unread.textContent = '';
        }
    },
    menuButtonUnreadSignalization: () => {

        console.log(document.querySelectorAll('.conversations.menu .unread:not(:empty)').length)
        if (document.querySelectorAll('.conversations.menu .unread:not(:empty)').length) {
            document.querySelector('.menu-button').classList.add('unread-conversations');
        } else {
            document.querySelector('.menu-button').classList.remove('unread-conversations');
        }
    },
    dated: {
        range: 604800000, // 1 week default
        refresh: () => {
            let conversations = document.querySelectorAll('.conversations.menu li a[data-last-message-on]');
            for (let i = 0; i < conversations.length; i++) {
                if (new Date().getTime() - Datetime.arrayToDate(conversations[i].dataset.lastMessageOn).getTime() > Conversations.dated.range) {
                    conversations[i].parentNode.classList.add('dated');
                }
            }
        },
        showAll: (button) => {
            document.querySelector('.conversations.menu').classList.toggle('showDated');
            button.classList.toggle('active');
        },
        settings: {
            show: () => {
                alert("Jeste ne ...")
            }
        }
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
            let active = conversations.querySelector('.button.active');
            if (active) {
                active.classList.remove('active');
            }

            if (Conversations.lastConversation.load().id) {
                conversations.querySelector(`[data-conversation-id="${Conversations.lastConversation.load().id}"]`).classList.add('active');
            }

            // Notifications.active();
        }
    },
    conversation: {
        template: (conversation) => {
            let backgroundImage = conversation.iconPath ? `background-image: url('/images/${conversation.iconPath}')` : '';

            return `<li>
    <a class="button" data-click="Conversations.select" data-icon-path="${conversation.iconPath}" data-conversation-id="${conversation.id}" data-last-message-on="${conversation.lastMessageOn}">
        <span style="${backgroundImage}">
            <span class="unread">${conversation.unreadCount > 0 ? conversation.unreadCount : ''}</span>
        </span>
        <span></span>
    </a>
</li>`;
        },
        new: {
            dialog: {
                toggle: (button) => {
                    button.parentNode.classList.toggle('active');
                    if (button.parentNode.classList.contains('active')) {
                        button.parentNode.querySelector('input[name=title]').focus();
                    } else {
                        Conversations.conversation.new.reset();
                    }
                }
            },
            reset: () => {
                let addButton = document.querySelector('.conversationsNav .add.button');
                if (addButton.parentNode.classList.contains('active')) {
                    addButton.parentNode.classList.remove('active');
                    addButton.parentNode.querySelector('input[name=title]').value = '';
                    addButton.parentNode.querySelector('.submit.button').classList.remove('progress');
                    addButton.parentNode.querySelector('.submit.button').classList.remove('error');
                    addButton.parentNode.querySelector('.submit.button').classList.remove('done');
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

                    let conversationForm = new FormData(document.querySelector('.conversationsNav .add+form'));

                    fetch('/api/conversation', {
                        headers: Fetch.headers(),
                        method: 'POST',
                        body: conversationForm
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((conversation) => {
                            button.classList.add('done');

                            setTimeout(() => {
                                Conversations.one(conversation);
                                Conversations.selectConversation(conversation);
                            }, 200);
                        });
                    }).catch((response) => {
                        switch (response.status) {
                            case 409:
                                document.querySelector('.conversationsNav .error.ConversationExists').classList.add('active');
                                break;
                            default:
                                document.querySelector('.conversationsNav .error.Default').classList.add('active');
                        }

                        button.classList.remove('progress');
                        button.classList.add('error');
                    });
                }
            }
        },
        member: {
            add: (button) => {
                if (!button.parentNode.classList.contains('active')) {
                    Conversations.conversation.member.show(button);
                } else {
                    Conversations.conversation.member.hide(button);
                }
            },
            show: (button) => {
                button.parentNode.querySelector('.submit.button').classList.add('disabled');
                button.parentNode.classList.add('active');
                let searchField = button.parentNode.querySelector('input[type=text]');
                searchField.addEventListener('input', Conversations.conversation.member.input);
                searchField.focus();
            },
            hide: (button) => {
                let searchField = button.parentNode.querySelector('input[type=text]');
                searchField.removeEventListener('input', Conversations.conversation.member.input);
                searchField.value = '';
                button.parentNode.querySelector('.autocomplete').innerHTML = '';

                button.parentNode.classList.remove('active');
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

                    return fetch(`/api/conversation/${Conversations.lastConversation.load().id}/addMember/${ev.target.value}`, {
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
                        return response.json().then(() => {
                            button.classList.add('done');

                            setTimeout(() => {
                                Conversations.conversation.member.hide(document.querySelector('.conversation-member-add .button'));
                                button.classList.remove('progress');

                                Conversations.members.menu.refreshIfOpen();
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
    },
    members: {
        menu: {
            show: () => {
                document.querySelector('.content').classList.add('dialog');
                document.querySelector('.conversation-members-menu').classList.add('active');
                Conversations.members.menu.loadUsers();
            },
            hide: () => {
                document.querySelector('.content').classList.remove('dialog');
                document.querySelector('.conversation-members-menu').classList.remove('active');
            },
            loadUsers: () => {
                return fetch(`/api/conversation/${Conversations.lastConversation.load().id}/members`, {
                    headers: Fetch.headers()
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.json().then((users) => {
                        let ul = document.querySelector('.conversation-members-menu ul.members');
                        ul.innerHTML = '';
                        for (let i = 0; i < users.length; i++) {
                            let user = users[i];
                            let li = document.createElement('li');
                            li.id = user.id;
                            li.textContent = user.name;
                            ul.appendChild(li);
                        }
                    });
                });
            },
            refreshIfOpen: () => {
                if (document.querySelector('.conversation-members-menu').classList.contains('active')) {
                    Conversations.members.menu.loadUsers();
                }
            }
        }
    },
    menus: {
        toggle: () => {
            document.querySelector('.content main header').classList.toggle('show-menus');
        }
    }
};