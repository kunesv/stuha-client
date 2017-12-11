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

        let dialogs = `<section class="message-dialog">
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
</section>

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

        document.body.insertAdjacentHTML('beforeEnd', dialogs);

        Buttons.init(document.querySelectorAll('.button'));
        Buttons.initForms(document.querySelectorAll('form'));

        Messages.placeholders.add();

        Messages.loadEverything().then(() => {
            if (Users.notifications.poll) {
                Messages.intervalLoadNew = setInterval(Conversations.unreadCounts, 10 * 1000);
            }
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
            return response.json().then((messages) => {
                Messages.placeholders.removeAll();

                if (!messages.messages.length) {
                    Messages.empty.add();
                } else {
                    Messages.message.add(messages.messages, true, false, messages.unreadCount);
                    if (messages.messages.length === 10) {
                        Messages.message.loadMore.show();
                    }
                }

                Conversations.unreadCounts();

                document.querySelector('.content').classList.remove('loading');
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
                if (messages.length < 10) {
                    Messages.message.loadMore.hide();
                }

                Messages.message.add(messages, false);

                button.classList.remove('progress');

                Conversations.unreadCounts();
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
        thumbnailTemplate: (picture) => {
            return `<span class="thumbnail button toLoad" data-image-id="${picture.id}" data-image-height="${picture.height}" data-image-width="${picture.width}" data-click="Messages.image.dialog.show"></span>`;
        },
        template: (parent, message) => {
            let template = `<article id="${message.id}" class="${Users.currentUser.userName === message.userName ? 'my' : ''} ${message.robo ? 'robot' : ''}" data-date="${Datetime.formatDate(message.createdOn)}">
    <header>
        <div class="icon ${!message.robo ? 'button' : ''} ${message.isNew ? 'new' : ''}" data-click="Messages.message.dialog.show" data-reply-to-name="${message.userName}" 
            style="background-image: url('/images/icons/${Messages.message.validations.icon(message.iconPath)}')"></div>
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
                            let br = document.createElement('br');
                            currentParagraph.appendChild(br);
                            if (p === message.formatted.textNodes.length - 1 || message.formatted.textNodes[p + 1].type === 'REPLY_TO') {
                                contentElement.appendChild(currentParagraph);
                                currentParagraph = document.createElement('p');
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

            for (let i = 0; i < messages.length; i++) {
                let message = messages[i];
                message.createdOn = Datetime.arrayToDate(message.createdOn);

                if (i > 0 && Datetime.formatDate(messages[i - 1].createdOn) !== Datetime.formatDate(message.createdOn)) {
                    newMessages.insertAdjacentHTML('beforeEnd', Messages.message.separator(Datetime.formatDate(message.createdOn)));
                }

                message.isNew = allNew || i < unreadCount;

                Messages.message.template(newMessages, message);
            }

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

                            Messages.message.add(messages);

                            document.querySelector('.messages').parentNode.scrollTop = 0;
                            Messages.markNewAsRead();
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
    <span class="replyToIcon" style="background-image: url('/images/icons/${iconPath}')"></span><span class="caption"></span>
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
                            let article;

                            if (replyToArticle.parentNode.parentNode.classList.contains('messages')) {

                                replyToWrapper.classList.add('progress');
                                replyToWrapper.classList.add('replyToWrapper');

                                Messages.message.template(replyToWrapper, message);
                                article = replyToWrapper.querySelector('article:last-child');

                                replyTo.parentNode.insertBefore(replyToWrapper, replyTo.nextSibling);

                                let closeTemplate = `<span class="close-button">
    <a class="secondary button" data-click="Messages.message.replyTo.close"></a>
</span>`;

                                replyToWrapper.insertAdjacentHTML('afterBegin', closeTemplate);
                                Buttons.init(replyToWrapper.querySelectorAll('.close-button .button'));
                            } else {
                                let div = document.createElement('div');
                                Messages.message.template(div, message);
                                article = div.querySelector('article');
                                article.classList.add('progress');
                                replyTo.parentNode.insertBefore(article, replyTo.nextSibling);
                            }
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
            show: () => {
                document.querySelector('.messages + .load-more').classList.add('active');
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