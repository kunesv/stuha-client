var Messages = {
    template: () => {
        return `<main>
    <aside>  
        <section></section>
        <footer>           
            <a class="logout secondary button" data-click="Login.logout">Logout</a>
            <a class="user-settings light button" data-click="Users.menu.show"></a>
        </footer>
    </aside>
    <header>
        <div>
            <span class="menu-button hide-for-large"><button class="secondary button" data-click="Conversations.menu.toggle"></button></span>
            ${Notifications.templates.button()}
            <span class="conversation"><button class="light button" data-click="Conversations.conversation.menu.show"></button></span>           
            <span class="members"><button class="light button" data-click="Conversations.members.menu.show"></button></span>
            <span class="add-button"><button class="button" data-click="Messages.message.dialog.show"></button></span>
        </div>
        <div class="conversation-name">
            <span class="conversation-name " data-content="currentConversation"></span>
        </div>
    </header>
    <section>
        <div class="messages"></div>
        <div class="load-more"><a class="secondary button" data-click="Messages.loadMore"></a></div>
    </section>
</main>`;
    },
    init: () => {
        document.querySelector('.content').insertAdjacentHTML('beforeEnd', Messages.template());

        let dialogs = `
<section class="conversation-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Conversations.conversation.menu.hide"></a></span>
    </header>
    <main>
        <form>
            <label>Tady taky ještě nic. Bude tu vyhledávání a archiv.</label>
        </form>
    </main>
</section>

<section class="conversation-members-menu">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Conversations.members.menu.hide"></a></span>
    </header>
    <ul class="compact menu">       
        <li class="conversation-member-add">
            <button class="light button" data-click="Conversations.conversation.member.add"></button>
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
</section>

<section class="image-dialog">
    <main>
        <span class="close-button"><a class="translucent button" data-click="Messages.image.dialog.hide"></a></span>
        <span class="previous-button"><a class="translucent button" data-click="Messages.image.dialog.previous"></a></span>
        <span class="next-button"><a class="translucent button" data-click="Messages.image.dialog.next"></a></span>
        <section></section>
    </main>
</section>

<section class="user-dialog">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Conversations.conversation.menu.hide"></a></span>
    </header>
    <main>
        Change password, etc ......
    </main>
</section>
`;
        document.body.appendChild(Templates.toElement(Templates.messageDialog()));
        document.body.insertAdjacentHTML('beforeEnd', dialogs);


        Buttons.init(document.querySelectorAll('.button'));
        Buttons.initForms(document.querySelectorAll('form'));

        Messages.placeholders.add();

        Messages.loadEverything();

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

    markNewAsRead: () => {
        let newMessages = document.querySelectorAll('.messages .icon.new');
        for (let i = 0; i < newMessages.length; i++) {
            newMessages[i].classList.remove('new');
        }
    },

    loadEverything: () => {
        return Users.loadUserDetails().then(() => {
            Messages.message.dialog.init();
            return Conversations.load();
        }).then(() => {
            return Messages.load();
        }).catch(Messages.error);
    },

    load: () => {
        document.querySelector('[data-content="currentConversation"]').textContent = Conversations.lastConversation.load().title;

        Conversations.menu.active();

        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/load`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((last10Messages) => {
                Messages.placeholders.removeAll();

                if (!last10Messages.messages.length) {
                    Messages.empty.add();
                } else {
                    Messages.message.add(last10Messages.messages);
                    if (last10Messages.moreToLoad) {
                        Messages.message.loadMore.show(last10Messages.remainingUnreadCount);
                    }
                }

                Conversations.unreadCounts();

                document.querySelector('.content').classList.remove('loading');
            });
        });
    },

    loadNew: (messageId) => {
        return fetch(`/api/message/?messageId=${messageId}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((message) => Messages.message.addToTop(message));
        }).catch((error) => {
            // FIXME: And what about some serious error handling ?
            console.log('Load-new failed', error);
        });
    },

    loadMore: (button) => {
        if (button.classList.contains('progress')) {
            return;
        }

        button.classList.add('progress');
        let firstArticle = document.querySelector('.messages > article:last-child');

        return fetch(`/api/messages/${Conversations.lastConversation.conversation.id}/loadMore/${firstArticle.id}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((moreMessages) => {
                if (!moreMessages.moreToLoad) {
                    Messages.message.loadMore.hide();
                }

                Messages.message.add(moreMessages.messages);

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
            return Messages.load();
        }
    },

    error: (error) => {
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

        template: (message) => {
            let article = Templates.toElement(Templates.message(message));
            let contentElement = article.querySelector('.formatted');

            if (message.pictures && message.pictures.length) {
                let thumbnails = document.createElement('section');

                thumbnails.classList.add('thumbnails');

                for (let i = 0; i < message.pictures.length; i++) {
                    thumbnails.appendChild(Templates.toElement(Templates.thumbnailTemplate(message.pictures[i])));
                }

                contentElement.parentNode.insertBefore(thumbnails, contentElement);
            }

            if (message.formatted) {
                if (message.formatted.replyTos) {
                    for (let i = 0; i < message.formatted.replyTos.length; i++) {
                        article.querySelector('.replyTos').appendChild(Messages.message.replyTo.template(message.formatted.replyTos[i]));
                    }
                }

                let currentParagraph = document.createElement('p');

                for (let p = 0; p < message.formatted.textNodes.length; p++) {
                    let node = message.formatted.textNodes[p];

                    switch (node.type) {
                        case 'PLAIN_TEXT':
                            currentParagraph.classList.add('plain-text');
                            let span = document.createElement('span');
                            span.textContent = node.text;
                            currentParagraph.appendChild(span);
                            if (p === message.formatted.textNodes.length - 1 || message.formatted.textNodes[p + 1].type === 'REPLY_TO') {
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
                            if (p === message.formatted.textNodes.length - 1 || message.formatted.textNodes[p + 1].type === 'REPLY_TO') {
                                contentElement.appendChild(currentParagraph);
                                currentParagraph = document.createElement('p');
                            }
                            break;
                        case 'NEW_LINE':
                            if (message.formatted.textNodes[p - 1].type === 'PLAIN_TEXT') {
                                let br = document.createElement('br');
                                currentParagraph.appendChild(br);
                            }
                            break;
                    }
                }
            }

            Buttons.init(article.querySelectorAll('.button'));

            return article;
        },
        add: (messages) => {
            let messagesList = document.querySelector('.messages');
            for (let i = 0; i < messages.length; i++) {
                let message = messages[i];
                message.createdOn = Datetime.arrayToDate(message.createdOn);

                if (i > 0 && Datetime.formatDate(messages[i - 1].createdOn) !== Datetime.formatDate(message.createdOn)) {
                    messagesList.appendChild(Templates.toElement(Templates.messageSeparator(Datetime.formatDate(message.createdOn))));
                }

                messagesList.appendChild(Messages.message.template(message))
            }

            // if (placeOnTop) {
            //     let newestAlreadyDisplayed = document.querySelector('.messages div:first-child article:first-child');
            //     if (newestAlreadyDisplayed && newestAlreadyDisplayed.dataset.date && newestAlreadyDisplayed.dataset.date !== Datetime.formatDate(messages[messages.length - 1].createdOn)) {
            //         newMessages.insertAdjacentHTML('beforeEnd', Messages.message.separator(newestAlreadyDisplayed.dataset.date));
            //     }
            //     document.querySelector('.messages').insertBefore(newMessages, document.querySelector('.messages').firstChild);
            // } else {
            //     let oldestAlreadyDisplayed = document.querySelector('.messages div:last-child article:last-child');
            //     if (oldestAlreadyDisplayed && oldestAlreadyDisplayed.dataset.date !== Datetime.formatDate(messages[0].createdOn)) {
            //         newMessages.insertAdjacentHTML('afterBegin', Messages.message.separator(Datetime.formatDate(messages[0].createdOn)));
            //     }
            //     document.querySelector('.messages').appendChild(newMessages);
            // }

            // setTimeout(() => {
            //     newMessages.classList.remove('loading');
            // }, 100);

            Messages.image.loadSome();
        },

        addToTop: (message) => {
            let messagesList = document.querySelector('.messages');

            message.createdOn = Datetime.arrayToDate(message.createdOn);

            messagesList.insertBefore(Messages.message.template(message), messagesList.firstChild);


            // if (placeOnTop) {
            //     let newestAlreadyDisplayed = document.querySelector('.messages div:first-child article:first-child');
            //     if (newestAlreadyDisplayed && newestAlreadyDisplayed.dataset.date && newestAlreadyDisplayed.dataset.date !== Datetime.formatDate(messages[messages.length - 1].createdOn)) {
            //         newMessages.insertAdjacentHTML('beforeEnd', Messages.message.separator(newestAlreadyDisplayed.dataset.date));
            //     }
            //     document.querySelector('.messages').insertBefore(newMessages, document.querySelector('.messages').firstChild);
            // } else {
            //     let oldestAlreadyDisplayed = document.querySelector('.messages div:last-child article:last-child');
            //     if (oldestAlreadyDisplayed && oldestAlreadyDisplayed.dataset.date !== Datetime.formatDate(messages[0].createdOn)) {
            //         newMessages.insertAdjacentHTML('afterBegin', Messages.message.separator(Datetime.formatDate(messages[0].createdOn)));
            //     }
            //     document.querySelector('.messages').appendChild(newMessages);
            // }

            // setTimeout(() => {
            //     newMessages.classList.remove('loading');
            // }, 100);

            Messages.image.loadSome();
        },

        submitForm: (form) => {
            let button = form.querySelector('.submit.button');
            Messages.message.submit(button);
        },
        submit: (button) => {
            if (!button.classList.contains('progress') && !button.classList.contains('done')) {
                if (!Messages.message.dialog.validations.all()) {
                    return;
                }

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

                button.classList.remove('active');
                button.classList.add('progress');

                fetch('/api/message', {
                    headers: Fetch.headers(),
                    method: 'POST',
                    body: messageForm
                }).then(Fetch.processFetchStatus).then((response) => {
                    button.classList.remove('progress');
                    button.classList.add('done');

                    setTimeout(() => {
                        Messages.message.dialog.hide();
                        setTimeout(Messages.message.dialog.messageReset, 300);

                        // Messages.message.add(messages);

                        // document.querySelector('.messages').parentNode.scrollTop = 0;

                        Messages.markNewAsRead();
                    }, 300);
                }).catch((response) => {
                    button.classList.remove('progress');
                    button.classList.add('error');
                });
            }
        },

        replyTo: {
            template: (node) => {
                let replyTo = Templates.toElement(Templates.replyTo(node, 'Messages.message.replyTo.show'));
                replyTo.querySelector('.caption').textContent = node.caption || '[ ... ]';
                return replyTo;
            },
            show: (button) => {
                if (button.classList.contains('opened')) {
                    let replyTo = button.offsetParent.offsetParent.previousSibling;
                    if (replyTo && replyTo.classList.contains('replyTo')) {
                        Messages.message.replyTo.close(replyTo.querySelector('.close-button'));
                    }
                } else {
                    let replyTo = button.offsetParent.offsetParent.previousSibling;
                    if (replyTo && replyTo.classList.contains('replyTo')) {
                        Messages.message.replyTo.close(replyTo.querySelector('.close-button'));
                        setTimeout(() => Messages.message.replyTo.load(button), 500);
                    } else {
                        Messages.message.replyTo.load(button);
                    }
                }
            },
            load: (button) => {
                let replyToArticle = button.offsetParent.offsetParent;

                button.classList.remove('error');
                if (!button.classList.contains('progress')) {

                    button.classList.add('progress');

                    fetch(`/api/message/?messageId=${button.dataset.id}`, {
                        headers: Fetch.headers()
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((message) => {
                            message.createdOn = Datetime.arrayToDate(message.createdOn);

                            button.classList.remove('progress');
                            button.classList.add('opened');

                            let replyTo = Messages.message.template(message);
                            replyTo.classList.add('replyTo');
                            replyTo.classList.add('progress');
                            replyToArticle.parentNode.insertBefore(replyTo, replyToArticle);

                            let closeTemplate = `<button class="secondary button close-button" data-click="Messages.message.replyTo.close"></button>`;
                            replyTo.appendChild(Templates.toElement(closeTemplate));
                            Buttons.init(replyTo.querySelectorAll('.close-button'));

                            setTimeout(() => {
                                replyTo.classList.remove('progress');

                                Messages.image.loadSome(replyTo);
                            }, 20);
                        });
                    }).catch((error) => {
                        button.classList.remove('progress');
                        button.classList.add('error');
                    });
                }
            },
            close: (button) => {
                let replyTo = button.offsetParent;
                if (replyTo) {
                    replyTo.classList.add('progress');
                    replyTo.nextSibling.querySelector('.replyTos .opened').classList.remove('opened');

                    setTimeout(() => {
                        replyTo.parentNode.removeChild(replyTo);
                    }, 300);
                }
            }
        },

        loadMore: {
            show: (remainingUnreadCount = 0) => {
                document.querySelector('.messages + .load-more').classList.add('active');
                document.querySelector('.messages + .load-more a').textContent = remainingUnreadCount;
            },
            hide: () => {
                document.querySelector('.messages + .load-more').classList.remove('active');
            }
        },

        removeAll: () => {
            Messages.message.loadMore.hide();
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
                    let node = {
                        replyToId: replyToId,
                        iconPath: button.offsetParent.dataset.iconPath
                    };
                    let replyTo = Templates.toElement(Templates.replyTo(node, 'Messages.message.dialog.replyTos.remove'));
                    let caption = '[ ... ]';
                    let plainText = button.offsetParent.querySelector('.plain-text');
                    if (plainText) {
                        caption = plainText.textContent.substr(0, 25) + (plainText.textContent.length > 25 ? '...' : '');
                    }

                    replyTo.querySelector('.caption').textContent = caption;
                    Buttons.init([replyTo]);

                    document.querySelector('.message-dialog .replyTos').appendChild(replyTo);

                    Messages.message.dialog.message.replyTo.push({replyToId: replyToId});
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
                return `<li class="button ${icon.hiddenOnLoad ? 'hidden' : ''}" tabindex="0" data-click="Messages.message.dialog.selectIcon" data-path="${icon.path}" style="background-image: url('/images/icons/${icon.path}')"></li>`;
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

            replyTos: {
                remove: (button) => {
                    let i = 0;
                    let sibling = button.previousSibling;
                    while (sibling) {
                        i++;
                        sibling = sibling.previousSibling;
                    }
                    Messages.message.dialog.message.replyTo.splice(i, 1);
                    button.parentNode.removeChild(button);
                }
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
        dialog: {
            show: (thumbnail) => {
                let imageDialog = document.querySelector('.image-dialog');
                imageDialog.classList.add('active');

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
                    // FIXME: No more swipe, until dealt with weird behaviour.
                    // let content = document.querySelector('.content');
                    Messages.swipe = new Swipe(img, Messages.image.dialog.previous, Messages.image.dialog.next);
                }).catch(() => {
                    imageDialog.classList.add('error');
                });
            },
            hide: () => {
                let imageDialog = document.querySelector('.image-dialog');
                imageDialog.classList.remove('active');
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