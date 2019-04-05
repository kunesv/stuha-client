const Messages = {
    init: () => {
        document.querySelector('.content').insertAdjacentHTML('beforeEnd', mainTemplate());

        document.querySelector('aside section').insertAdjacentHTML('beforeEnd', conversationsTemplate());
        document.body.querySelector('.dated-conversations-control').addEventListener('change', Conversations.dated.refresh);
        document.body.querySelector('.dated-conversations-control').addEventListener('mouseup', Conversations.dated.dialog.hide);

        document.body.insertAdjacentHTML('beforeEnd', conversationMembersMenuTemplate());
        document.body.insertAdjacentHTML('beforeEnd', conversationMenuTemplate());
        document.body.insertAdjacentHTML('beforeEnd', imageDialogTemplate());
        document.body.insertAdjacentHTML('beforeEnd', messageDialogTemplate());
        document.body.insertAdjacentHTML('beforeEnd', ranicekDialogTemplate());
        document.body.insertAdjacentHTML('beforeEnd', userMenuTemplate());

        Buttons.init(document.querySelectorAll('.button'));
        Buttons.initForms(document.querySelectorAll('form'));

        Messages.placeholders.add();

        Messages.loadEverything().then(() => {

            const eventSource = new EventSource(`/api/msg?userId=${Users.currentUser.userId}&token=${Users.currentUser.token}`);

            eventSource.onmessage = e => {
                const msg = JSON.parse(e.data);
                console.log(e)

                if (msg.conversationId === Conversations.lastConversation.conversation.id) {
                    Messages.message.add([msg], true, true);
                } else {
                    Conversations.reload();
                }
            };

            eventSource.onopen = e => {
                console.log(e, 'open');
                Messages.e = e;
            };

            eventSource.onerror = e => {
                if (e.readyState === EventSource.CLOSED) {
                    console.log('close');
                }
                else {
                    console.log(e.error);
                }
            };
            // }
        });

        let scrollingTimeout;
        document.querySelector('.content > main > section').addEventListener('scroll', () => {
            if (scrollingTimeout) {
                clearTimeout(scrollingTimeout);
            }
            scrollingTimeout = setTimeout(() => {
                Messages.image.loadSome();
                Messages.markNewAsRead();
            }, 100);
        });

        // setInterval(() => {
        //     if (!document.hidden) {
        //         let d = document.createElement('div');
        //         d.textContent = (new Date()).getSeconds();
        //         document.querySelector('.content > main > section').appendChild(d);
        //     }
        // }, 1000)

    },

    markRead: () => {
        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/markRead/${document.querySelector('.messages article').id}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            let newMessages = document.querySelectorAll('.messages .icon.new');

            for (let i = 0; i < newMessages.length; i++) {
                newMessages[i].classList.remove('new');
            }
        });
    },

    markNewAsRead: () => {
        if (document.querySelectorAll('.messages .icon.new').length) {
            Messages.markRead();
        }
    },

    loadEverything: () => {
        return Users.loadUserDetails().then(() => {
            Messages.message.dialog.init();
            return Conversations.init();
        })
            .then(Messages.loadInitial)
            .then(Users.revalidateToken)
            .catch((response) => {
                Messages.error(response);
                console.error(response);

            });
    },

    remainingCounts: {
        total: 0,
        unread: 0,
        update: (messagesLength) => {
            Messages.remainingCounts.total = Messages.remainingCounts.total > messagesLength ? Messages.remainingCounts.total - messagesLength : 0;
            Messages.remainingCounts.unread = Messages.remainingCounts.unread > messagesLength ? Messages.remainingCounts.unread - messagesLength : 0;
        }
    },

    loadInitial: () => {
        document.querySelector('[data-content="currentConversation"]').textContent = Conversations.lastConversation.load().title;
        document.querySelector('.conversation.button').style.backgroundImage =
            Conversations.lastConversation.load().iconPath ?
                `url('/img/${Conversations.lastConversation.load().iconPath}')` : 'none';


        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/loadInitial`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((messages) => {
                Messages.placeholders.removeAll();

                Messages.remainingCounts.total = messages.totalCount;
                Messages.remainingCounts.unread = messages.unreadCount;

                if (!messages.messages.length) {
                    Messages.empty.add();
                } else {
                    Messages.message.add(messages.messages, true, false, messages.unreadCount);

                    Messages.remainingCounts.update(messages.messages.length);
                }

                Messages.message.loadMore.display();

                document.querySelector('.content').classList.remove('loading');

                Messages.markNewAsRead();
            });
        });
    },

    loadRecent: () => {
        // FIXME: Ask to enable notifications when first clicked .., then show auto-update icon, ask to switch off when

        let lastMessage = document.querySelector('.messages > div:first-child > article:first-child');

        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/loadRecent/${lastMessage.id}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((messages) => Messages.message.add(messages, true, true));
        }).catch((error) => {
            // FIXME: And what about some serious error handling ?
            console.log('Load-recent failed', error);
        });
    },

    loadMore: (button) => {
        if (button.classList.contains('progress')) {
            return;
        }

        button.classList.add('progress');
        let firstArticle = document.querySelector('.messages > div:last-child > article:last-child');

        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/loadMore/${firstArticle.id}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((messages) => {

                Messages.message.add(messages, false, false, Messages.remainingCounts.unread);

                Messages.remainingCounts.update(messages.length);
                Messages.message.loadMore.display();

                button.classList.remove('progress');

            });
        }).catch((error) => {
            // FIXME: And what about some serious error handling here?
            console.log('Load-more failed', error);
        });
    },

    loadUnread: (button) => {
        if (button.classList.contains('progress')) {
            return;
        }

        button.classList.add('progress');
        let firstArticle = document.querySelector('.messages > div:last-child > article:last-child');

        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/loadUnread/${firstArticle.id}/${Messages.remainingCounts.unread}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((messages) => {

                Messages.message.add(messages, false, true);

                Messages.remainingCounts.update(messages.length);
                Messages.message.loadMore.display();

                button.classList.remove('progress');

            });
        }).catch((error) => {
            // FIXME: And what about some serious error handling here?
            console.log('Load-more failed', error);
        });

    },

    reload: () => {
        Messages.message.removeAll();
        Messages.placeholders.add();

        if (!document.querySelector('aside .conversations')) {
            return Messages.loadEverything();
        } else {
            return Messages.loadInitial();
        }
    },

    error: (error) => {
        if (console) {
            console.error(error);
        }
        let errorMessage = 'Nepodařilo se načíst příspěvky, zkuste to prosím ještě jednou.';
        if (!Online.isOnline()) {
            errorMessage = 'Zdá se, že jste mimo signál Internetu. <br/><small>Po jeho obnovení by se měly příspěvky samy nahrát.</small>';
        } else {
            if (error.status === 500) {
                errorMessage = 'Zdá se, že na serveru se objevily nějaké potíže.';
            }
        }
        Messages.placeholders.removeAll();

        Messages.failed.add(errorMessage);
    },

    message: {
        thumbnailTemplate: (picture) => {
            return `<span class="thumbnail button toLoad ${picture.name.match(/gif$/) ? 'gif' : ''}" data-image-id="${picture.id}" data-image-height="${picture.height}" data-image-width="${picture.width}" data-click="Messages.image.dialog.show">
        <span class="thumbnail-gif"></span>
        <span class="button-gif"></span>
</span>`;
        },
        template: (parent, message) => {
            let template = `<article id="${message.id}" class="${Users.currentUser.userName === message.userName ? 'my' : ''} ${message.robo ? 'robot' : ''}" data-date="${Datetime.formatDate(message.createdOn)}">
    <header>
        <div class="icon ${!message.robo ? 'button' : ''} ${message.isNew ? 'new' : ''}" data-click="Messages.message.dialog.show" data-reply-to-name="${message.userName}" 
            style="background-image: url('/img/icons/${Messages.message.validations.icon(message.iconPath)}')"></div>
        <ul class="awards"></ul>
    </header>
    <main>                 
       
        <section class="formatted"></section>
            
        <footer>${Datetime.formatDate(new Date()) !== Datetime.formatDate(message.createdOn) ? Datetime.formatDate(message.createdOn) + ',' : ''} <b>${Datetime.formatTime(message.createdOn)}</b></footer>
    </main>
</article>`;

            parent.insertAdjacentHTML('beforeEnd', template);
            let article = parent.querySelector('article:last-child');

            let contentElement = article.querySelector('.formatted');

            if (message.pictures && message.pictures.length) {
                let thumbnails = document.createElement('section');

                thumbnails.classList.add('thumbnails');

                for (let i = 0; i < message.pictures.length; i++) {
                    thumbnails.insertAdjacentHTML('beforeend', Messages.message.thumbnailTemplate(message.pictures[i]));
                }

                contentElement.parentNode.insertBefore(thumbnails, contentElement);
            }

            if (message.formatted) {
                let currentParagraph = document.createElement('p');

                for (let i = 0; i < message.formatted.textNodes.length; i++) {
                    let node = message.formatted.textNodes[i];

                    switch (node.type) {
                        case 'PLAIN_TEXT':
                            currentParagraph.classList.add('plain-text');
                            let span = document.createElement('span');
                            span.textContent = node.text;
                            currentParagraph.appendChild(span);
                            if (i === message.formatted.textNodes.length - 1 || message.formatted.textNodes[i + 1].type === 'REPLY_TO') {
                                contentElement.appendChild(currentParagraph);
                                currentParagraph = document.createElement('p');
                            }
                            break;
                        case 'LINK':
                            currentParagraph.classList.add('plain-text');
                            let a = document.createElement('a');
                            a.classList.add('link');
                            // FIXME: URL validation
                            a.href = encodeURI(node.url);
                            a.textContent = node.label + (node.shortened ? ' …' : '');
                            currentParagraph.appendChild(a);
                            if (i === message.formatted.textNodes.length - 1 || message.formatted.textNodes[i + 1].type === 'REPLY_TO') {
                                contentElement.appendChild(currentParagraph);
                                currentParagraph = document.createElement('p');
                            }
                            break;
                        case 'NEW_LINE':
                            if (message.formatted.textNodes[i - 1] && message.formatted.textNodes[i - 1].type === 'PLAIN_TEXT') {
                                let br = document.createElement('br');
                                currentParagraph.appendChild(br);
                            }
                            break;
                        case 'REPLY_TO':
                            Messages.message.replyTo.add(node, currentParagraph);
                            currentParagraph.classList.add('replyTo');
                            contentElement.appendChild(currentParagraph);
                            currentParagraph = document.createElement('p');
                            break;
                    }
                }

                if (message.formatted.awards) {
                    for (let i = 0; i < message.formatted.awards.length; i++) {
                        let award = message.formatted.awards[i];

                        switch (award) {
                            case 'RANICEK':
                                article.querySelector('.awards').insertAdjacentHTML('beforeEnd', '<li class="ranicek award button" data-click="Ranicek.dialog.show"></li>');
                                break;
                        }
                    }
                }
            }

            let gifs = article.querySelectorAll('.gif.thumbnail');
            for (let i = 0; i < gifs.length; i++) {
                let thumbnail = gifs[i];
                let button = thumbnail.querySelector('.button-gif');

                let isTouch = ('ontouchstart' in window);
                if (isTouch) {
                    button.addEventListener('touchstart', (event) => {
                        event.stopPropagation();
                    });
                    button.addEventListener('mousedown', (event) => {
                        event.stopPropagation();
                    });
                    button.addEventListener('click', (event) => {
                        event.stopPropagation();
                    });

                    button.addEventListener('touchend', (event) => {
                        Messages.image.inBackground.toggle(event.target.parentNode);
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    });
                } else {
                    thumbnail.addEventListener('mouseenter', (event) => {
                        Messages.image.inBackground.show(event.target);
                    });
                    thumbnail.addEventListener('mouseleave', (event) => {
                        Messages.image.inBackground.hide(event.target);
                    });
                }
            }

            Buttons.init(article.querySelectorAll('.button'));

            return article;
        },
        add: (messages, placeOnTop = true, allNew = false, unreadCount = 0) => {
            if (!messages.length) {
                return;
            }
            let newMessages = document.createElement('div');
            newMessages.classList.add('loading');

            let messageAlreadyAdded = false;
            let someMessageIsMine = false;

            for (let i = 0; i < messages.length; i++) {
                let message = messages[i];

                if (message.userName === Users.currentUser.userName) {
                    someMessageIsMine = true;
                }

                let duplicate = document.querySelector(`.messages article[id='${message.id}']`);
                if (!duplicate) {
                    message.createdOn = Datetime.arrayToDate(message.createdOn);

                    if (i > 0 && Datetime.formatDate(messages[i - 1].createdOn) !== Datetime.formatDate(message.createdOn)) {
                        newMessages.insertAdjacentHTML('beforeEnd', Messages.message.separator(Datetime.formatDate(message.createdOn)));
                    }

                    message.isNew = (allNew || i < unreadCount) && message.userName !== Users.currentUser.userName;

                    Messages.message.template(newMessages, message);
                }
            }

            if (newMessages.querySelectorAll('article').length) {
                if (placeOnTop) {
                    let newestAlreadyDisplayed = document.querySelector('.messages div:first-child article:first-child');
                    if (newestAlreadyDisplayed && newestAlreadyDisplayed.dataset.date && newestAlreadyDisplayed.dataset.date !== Datetime.formatDate(messages[messages.length - 1].createdOn)) {
                        newMessages.insertAdjacentHTML('beforeEnd', Messages.message.separator(newestAlreadyDisplayed.dataset.date));
                    }
                    document.querySelector('.messages').insertBefore(newMessages, document.querySelector('.messages').firstChild);
                } else {
                    let oldestAlreadyDisplayed = document.querySelector('.messages div:last-child article:last-child');
                    if (oldestAlreadyDisplayed && oldestAlreadyDisplayed.dataset.date !== Datetime.formatDate(messages[0].createdOn)) {
                        newMessages.insertAdjacentHTML('afterBegin', Messages.message.separator(Datetime.formatDate(messages[0].createdOn)));
                    }
                    document.querySelector('.messages').appendChild(newMessages);
                }
            }

            if (someMessageIsMine) {
                Messages.markRead();
            }

            setTimeout(() => {
                newMessages.classList.remove('loading');
            }, 100);

            Messages.image.loadSome();
        },

        submitForm: (form) => {
            let button = form.querySelector('.submit.button');
            Messages.message.submit(button);
        },
        submit: (button) => {
            if (!button.classList.contains('progress') && !button.classList.contains('done')
                && Messages.message.dialog.validations.all()) {

                let errors = document.querySelectorAll('.message-dialog .icons li.error');
                for (let i = 0; i < errors.length; i++) {
                    errors[i].classList.remove('error');
                }

                let messageForm = new FormData(document.querySelector('.message-dialog form#message'));
                messageForm.append('iconPath', Messages.message.dialog.values.icon());
                for (let i = 0; i < Messages.message.dialog.values.images().length; i++) {
                    messageForm.append(`images[${i}].id`, Messages.message.dialog.values.images()[i].id);
                    messageForm.append(`images[${i}].name`, Messages.message.dialog.values.images()[i].name);
                }
                messageForm.append('conversationId', Conversations.lastConversation.load().id);
                messageForm.append('replyTo', JSON.stringify(Messages.message.dialog.message.replyTo));
                let lastMessage = document.querySelector('.messages > div:first-child > article:first-child');
                messageForm.append('lastMessageId', lastMessage.id);

                button.classList.remove('active');
                button.classList.add('progress');

                fetch('/api/message', {
                    headers: Fetch.headers(),
                    method: 'POST',
                    body: messageForm
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.json().then((messages) => {
                        button.classList.remove('progress');
                        button.classList.add('done');

                        setTimeout(() => {
                            Messages.message.dialog.hide();
                            setTimeout(Messages.message.dialog.messageReset, 300);
                        }, 300);
                    });
                }).catch((response) => {
                    button.classList.remove('progress');
                    button.classList.add('error');
                });
            }
        },

        separator: (createdOn) => {
            return `<div class="seperator"><span>${createdOn}</span></div>`;
        },

        replyTo: {
            add: (node, currentParagraph) => {
                let id = Messages.message.validations.uuid(node.replyToId);
                let iconPath = Messages.message.validations.icon(node.iconPath) || '';

                let template = `<a class="button" data-click="Messages.message.replyTo.show" data-id="${id}" data-icon-path="${iconPath}">
    <span class="replyToIcon" style="background-image: url('/img/icons/${iconPath}')"></span><span class="caption"></span>
</a>`;

                currentParagraph.insertAdjacentHTML('beforeEnd', template);
                currentParagraph.querySelector('a:last-child .caption').textContent = node.caption || '[ ... ]';
            },
            show: (button) => {
                let replyToArticle = button.offsetParent.offsetParent;
                let replyTo = button.parentNode;

                replyTo.classList.remove('error');
                if (!button.classList.contains('progress')) {

                    button.classList.add('progress');

                    fetch(`/api/message/?messageId=${button.dataset.id}`, {
                        headers: Fetch.headers()
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((message) => {
                            message.createdOn = Datetime.arrayToDate(message.createdOn);

                            button.classList.remove('progress');
                            replyTo.classList.add('opened');
                            replyToArticle.classList.add('openedReplyTo');

                            let replyToWrapper = document.createElement('div');
                            // TODO: This might be thought out little nicer ...

                            replyToWrapper.classList.add('progress');
                            replyToWrapper.classList.add('replyToWrapper');

                            Messages.message.template(replyToWrapper, message);
                            let article = replyToWrapper.querySelector('article:last-child');

                            replyTo.parentNode.insertBefore(replyToWrapper, replyTo.nextSibling);

                            let closeTemplate = `<span class="close-button">
    <a class="secondary button" data-click="Messages.message.replyTo.close"></a>
</span>`;

                            replyToWrapper.insertAdjacentHTML('afterBegin', closeTemplate);
                            Buttons.init(replyToWrapper.querySelectorAll('.close-button .button'));

                            article.classList.add('replyTo');

                            setTimeout(() => {
                                article.classList.remove('progress');
                                replyToWrapper.classList.remove('progress');

                                Messages.image.loadSome(article);
                            }, 20);
                        });
                    }).catch((error) => {
                        button.classList.remove('progress');
                        replyTo.classList.add('error');
                    });
                }
            },
            close: (button) => {
                let replyToWrapper = button.parentNode.parentNode;
                replyToWrapper.classList.add('progress');

                setTimeout(() => {
                    let replyTo = replyToWrapper.previousSibling;
                    replyTo.classList.remove('opened');

                    let parentArticle = replyToWrapper.offsetParent;

                    if (parentArticle.querySelectorAll('.replyToWrapper').length <= 1) {
                        parentArticle.classList.remove('openedReplyTo');
                    }

                    replyToWrapper.parentNode.removeChild(replyToWrapper);
                }, 200);
            }
        },

        loadMore: {
            display: () => {
                if (Messages.remainingCounts.total) {
                    document.querySelector('.messages + .load-more .button:first-child').classList.add('active');
                } else {
                    document.querySelector('.messages + .load-more .button:first-child').classList.remove('active');
                }

                if (Messages.remainingCounts.unread) {
                    document.querySelector('.messages + .load-more .button:last-child').classList.add('active');
                } else {
                    document.querySelector('.messages + .load-more .button:last-child').classList.remove('active');
                }

            }
        },

        removeAll: () => {
            document.querySelector('.messages').innerHTML = '';
            document.querySelector('.content').classList.add('loading');
        },

        dialog: {
            message: {},
            messageReset: () => {
                Messages.message.dialog.message = {
                    replyTo: []
                };
                let activeIcon = document.querySelector('.message-dialog .icons .done');
                if (activeIcon) {
                    activeIcon.classList.remove('progress');
                    activeIcon.classList.remove('done');
                }
                let textarea = document.querySelector('.message-dialog .textarea');
                textarea.value = '';
                Textarea.reset(textarea);

                Images.removeAll();
            },
            init: () => {
                document.querySelector('.message-dialog .icons').insertAdjacentHTML('afterBegin', Messages.message.dialog.icons());

                Buttons.init(document.querySelectorAll('.message-dialog .button'));
                let textarea = document.querySelector('.message-dialog .textarea');

                let validationTimeout;
                Textarea.reset(textarea);
                textarea.addEventListener('input', () => {
                    Textarea.resize(textarea);

                    if (validationTimeout) {
                        clearTimeout(validationTimeout);
                    }
                    validationTimeout = setTimeout(Messages.message.dialog.validations.content, 200);
                });

                document.querySelector('.message-dialog #uploadImage').addEventListener('change', Images.upload);

                // FIXME: reset or load?
                Messages.message.dialog.messageReset();

                // textarea.addEventListener('focus', Messages.message.dialog.validations.icons);
                // textarea.addEventListener('blur', () => setTimeout(Messages.message.dialog.validations.icons, 300));
                textarea.addEventListener('blur', () => setTimeout(Messages.message.dialog.validations.content, 300));
            },
            show: (button) => {
                document.querySelector('.message-dialog').classList.add('active');
                document.querySelector('.content').classList.add('dialog');

                let replyToId = button.offsetParent.id;
                let textarea = document.querySelector('.message-dialog .textarea');

                if (replyToId) {
                    let tag = `@${button.dataset.replyToName}`;
                    let tagWithNo = tag;
                    let text = textarea.value;
                    let i = 1;
                    if (text.includes(tag)) {
                        tagWithNo = `${tag}(${i})`;
                        i++;
                    }
                    while (text.includes(tagWithNo)) {
                        tagWithNo = `${tag}(${i})`;
                        i++;
                    }

                    textarea.value = `${textarea.value}${tagWithNo}`;
                    Textarea.reset(textarea);

                    Messages.message.dialog.message.replyTo.push({replyToId: replyToId, key: tagWithNo});
                }

                textarea.focus();
            },
            hide: () => {
                document.querySelector('.message-dialog').classList.remove('active');
                document.querySelector('.content').classList.remove('dialog');

                setTimeout(Messages.message.dialog.validations.reset, 300);
            },

            icons: () => {
                return Users.currentUser.icons.map(Messages.message.dialog.icon).join('');
            },
            icon: (icon) => {
                return `<li class="button ${icon.hiddenOnLoad ? 'hidden' : ''}" tabindex="0" data-click="Messages.message.dialog.selectIcon" data-path="${icon.path}" style="background-image: url('/img/icons/${icon.path}')"></li>`;
            },
            selectIcon: (li) => {
                let active = li.parentNode.querySelector('.active');
                if (active) {
                    active.classList.remove('active');
                }
                if (li) {
                    li.classList.add('active');
                }
                // Messages.message.dialog.validations.icons();
                Messages.message.submit(li);
            },

            values: {
                icon: () => {
                    let activeIcon = document.querySelector('.message-dialog .icons .active');
                    return activeIcon ? activeIcon.dataset.path : null;
                },
                content: () => {
                    return document.querySelector('.message-dialog .textarea').value;
                },
                images: () => {
                    return Images.values;
                },
                replyTo: () => {

                }
            },

            validations: {
                all: () => {
                    let valid = Messages.message.dialog.validations.icons();
                    valid = Messages.message.dialog.validations.content() && valid;

                    return valid;
                },
                reset: () => {
                    let errors = document.querySelectorAll('.message-dialog section.error');
                    for (let i = 0; i < errors.length; i++) {
                        errors[i].classList.remove('error');
                    }
                },
                icons: () => {
                    let valid = Messages.message.dialog.values.icon();

                    let section = document.querySelector('.message-dialog .icons').parentNode;
                    if (valid) {
                        section.classList.remove('error');
                    } else {
                        section.classList.add('error');
                    }
                    return valid;
                },
                content: () => {
                    let valid = Messages.message.dialog.values.content() || (Messages.message.dialog.values.images() && Messages.message.dialog.values.images().length);
                    let section = document.querySelector('.message-dialog .textarea').parentNode;

                    if (valid) {
                        section.classList.remove('error');
                    } else {
                        section.classList.add('error');
                    }
                    return valid;
                }
            }
        },
        validations: {
            uuid: (uuid) => {
                return uuid && uuid.match(/^[\da-f-]+$/i) ? uuid : '';
            },
            icon: (iconPath) => {
                return iconPath && iconPath.match(/^\d+_\d+\.\w{3}$/) ? iconPath : '';
            }
        }
    },

    image: {
        inBackground: {
            toggle: (thumbnail) => {
                if (thumbnail.querySelector('.thumbnail-gif').classList.contains('active')) {
                    Messages.image.inBackground.hide(thumbnail);
                } else {
                    Messages.image.inBackground.show(thumbnail);
                }
            },
            show: (thumbnail) => {
                let thumbnailGif = thumbnail.querySelector('.thumbnail-gif');
                thumbnailGif.classList.add('active');

                if (!thumbnailGif.classList.contains('loaded')) {
                    return fetch(`/api/image/${thumbnail.dataset.imageId}`, {
                        headers: Fetch.headers()
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.blob();
                    }).then((myBlob) => {
                        thumbnailGif.style.backgroundImage = `url(${URL.createObjectURL(myBlob)})`;
                        thumbnailGif.classList.add('loaded');
                    }).catch((error) => {
                        console.log(error)
                    });
                }
            },
            hide: (thumbnail) => {
                thumbnail.querySelector('.thumbnail-gif').classList.remove('active');
            }
        },
        dialog: {
            show: (thumbnail) => {
                Messages.image.inBackground.hide(thumbnail);

                let imageDialog = document.querySelector('.image-dialog');
                imageDialog.classList.add('active');
                document.querySelector('.content').classList.add('dialog');

                window.addEventListener('keydown', Messages.image.dialog.keydown);

                imageDialog.classList.add('progress');
                Messages.image.dialog.load(thumbnail).then(() => {
                    imageDialog.classList.remove('progress');
                });
            },
            load: (thumbnail) => {
                let imageDialog = document.querySelector('.image-dialog');
                thumbnail.classList.add('active');

                let img = new Image();
                img.src = thumbnail.style.backgroundImage.slice(5, -2);
                img.height = thumbnail.dataset.imageHeight;
                img.width = thumbnail.dataset.imageWidth;
                imageDialog.querySelector('main > section').appendChild(img);

                return fetch(`/api/image/${thumbnail.dataset.imageId}`, {
                    headers: Fetch.headers()
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.blob();
                }).then((myBlob) => {
                    img.src = URL.createObjectURL(myBlob);
                    Messages.swipe = new Swipe(img, Messages.image.dialog.previous, Messages.image.dialog.next);
                }).catch(() => {
                    imageDialog.classList.add('error');
                });
            },
            hide: () => {
                let imageDialog = document.querySelector('.image-dialog');
                imageDialog.classList.remove('active');
                document.querySelector('.content').classList.remove('dialog');

                imageDialog.querySelector('main > section').innerHTML = '';

                document.querySelector('.thumbnail.active').classList.remove('active');

                window.removeEventListener('keydown', Messages.image.dialog.keydown);
            },
            previous: () => {
                Messages.image.dialog.changeImage(-1);
            },
            next: () => {
                Messages.image.dialog.changeImage(1);
            },
            changeImage: (delta) => {
                let imageDialog = document.querySelector('.image-dialog');
                if (imageDialog.classList.contains('progress')) {
                    return;
                }

                let thumbnails = document.querySelectorAll('.thumbnail');
                for (let i = 0; i < thumbnails.length; i++) {
                    if (thumbnails[i].classList.contains('active')) {

                        if (i + delta < 0 || i + delta === thumbnails.length) {
                            return;
                        }

                        thumbnails[i].classList.remove('active');

                        let img = document.querySelector('.image-dialog main > section img');
                        img.classList.add(delta > 0 ? 'progress-next' : 'progress-previous');
                        setTimeout(() => {
                            let img = document.querySelector('.image-dialog main > section img');
                            img.parentNode.removeChild(img);
                        }, 300);

                        imageDialog.classList.add('progress');
                        Messages.image.dialog.load(thumbnails[i + delta]).then(() => {
                            imageDialog.classList.remove('progress');
                        });
                        break;
                    }
                }
            },
            keydown: (e) => {
                switch (e.keyCode) {
                    case 37:
                        Messages.image.dialog.previous();
                        break;
                    case 39:
                        Messages.image.dialog.next();
                        break;
                    case 27:
                        Messages.image.dialog.hide();
                        break;
                }
            }
        },
        loadSome: (article) => {
            let thumbnails = article ? article.querySelectorAll('.thumbnail.toLoad') : document.querySelectorAll('.messages .thumbnail.toLoad');
            let messagesScroll = document.querySelector('.content > main > section').scrollTop;
            let messagesHeight = document.querySelector('.content > main > section').clientHeight;
            for (let i = 0; i < thumbnails.length; i++) {
                let thumbnail = thumbnails[i];
                if (!article && Math.abs(messagesScroll - thumbnail.offsetTop - thumbnail.offsetParent.offsetTop) > messagesHeight) {
                    continue;
                }

                thumbnail.classList.remove('toLoad');

                fetch(`/api/thumbnail/${thumbnail.dataset.imageId}`, {
                    headers: Fetch.headers()
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.blob();
                }).then((myBlob) => {
                    let url = URL.createObjectURL(myBlob);
                    thumbnail.style.backgroundImage = `url(${url})`;
                }).catch(() => {
                    thumbnail.classList.add('error');
                });
            }
        }
    },

    placeholders: {
        template: () => {
            return `<article class="placeholder">
                    <header><div class="icon"></div></header>
                    <main>          
                        <section><p class="plain-text"></p></section>
                        <footer></footer>
                    </main>
                </article>`;
        },
        add: () => {
            let placeholders = document.createElement('div');
            placeholders.classList.add('placeholders');

            for (let i = 0; i < 4; i++) {
                placeholders.insertAdjacentHTML('beforeEnd', Messages.placeholders.template());
            }
            document.querySelector('.messages').appendChild(placeholders);
        },
        removeAll: () => {
            let placeholders = document.querySelector('.messages .placeholders');
            if (placeholders) {
                document.querySelector('.messages').removeChild(placeholders);
            }
        }
    },

    empty: {
        add: () => {
            let template =
                `<div class="hide-when-second">
    <article class="bot">
        <header><div class="icon"></div></header>
        <main>
            <section>
                <p class="plain-text"><span>Sem asi přidám první příspěvek ...</span></p>
            </section>
        </main>
    </article>
</div>`;

            document.querySelector('.messages').insertAdjacentHTML('beforeend', template);
        }
    },
    failed: {
        add: (errorMessage) => {
            let template = `<div>
    <article class="bot">
        <header><div class="icon"></div></header>
        <main>
            <section>
                <p class="plain-text">${errorMessage}</p>
                <p class="button-row">
                    <button class="secondary reload button" data-click="Messages.reload"></button>
                </p>
            </section>
        </main>
    </article>
</div>`;

            document.querySelector('.messages').insertAdjacentHTML('afterbegin', template);
            Buttons.init(document.querySelectorAll('.messages article:first-child .button'));
        },
        remove: () => {
            let overlays = document.getElementsByClassName('overlay');
            for (let i = overlays.length; i--;) {
                let overlay = overlays[i];
                document.body.removeChild(overlay);
            }
        }
    }

    // FIXME: for many messages, introduce some dynamic hide/show.
    // inView: (message) => {
    //     var elemTop = message.getBoundingClientRect().top;
    //     var elemBottom = message.getBoundingClientRect().bottom;
    //
    //     return (elemTop > -200) && (elemBottom < window.innerHeight + 200);
    // },


};