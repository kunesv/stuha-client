var Messages = {
    init: () => {
        let template = `<header>
    <span class="menu-button"><!--<a class="button"></a>--></span>
    <span class="conversation" >
        <span class="icon button" data-click="Messages.menu.toggle"></span>
    </span>
    <span class="add-button"><a class="button" data-click="Messages.message.dialog.add"></a></span>
</header>

<main>
    <aside> 
        <section></section>
    </aside>
    <section>
        <div class="conversation-name " data-content="currentConversation"></div>
        <div class="messages"></div>
        <div class="load-more">Load more</div>
    </section>
</main>`;

        document.querySelector('.content').insertAdjacentHTML('afterBegin', template);

        let headerButtons = document.querySelectorAll('.content > header .button');
        Buttons.init(headerButtons);

        Messages.placeholders.add();

        Messages.reload();

        let content = document.querySelector('.content');
        Messages.swipe = new Swipe(content);
    },

    load: (pageNo = 1) => {
        document.querySelector('[data-content="currentConversation"]').textContent = Conversations.lastConversation.conversation.title;

        Messages.menu.active();

        return fetch(`/api/messages?conversationId=${Conversations.lastConversation.conversation.id}&pageNo=${pageNo}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((messages) => {
                Messages.placeholders.removeAll();

                for (let i = 0; i < messages.length; i++) {
                    Messages.message.add(messages[i], 'beforeend');
                }

                if (!messages.length) {
                    Messages.empty.add();
                }
            });
        });
    },

    reload: () => {
        Messages.message.removeAll();
        Messages.placeholders.add();

        Users.loadUserDetails().then(() => {
            return Conversations.load();
        }).then(() => {
            Messages.menu.load();
            return Messages.load();
        }).catch(Messages.error);
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
            let template = `<article class="${Users.currentUser.userName === message.userName ? 'my' : ''} ${message.robo ? 'robot' : ''}" data-date="${Datetime.formatDate(message.createdOn)}">
    <header>
        <div class="icon ${!message.robo ? 'button' : ''}" data-click="Messages.message.dialog.add" data-reply-to-id="${message.id}" data-reply-to-name="${message.userName}" 
            style="background-image: url('/images/icons/${Messages.message.validations.icon(message.iconPath)}.png')"></div>
    </header>
    <main>                 
        <section class="formatted"></section>
            
        <footer>${Datetime.formatDate(new Date()) !== Datetime.formatDate(message.createdOn) ? Datetime.formatDate(message.createdOn) + ',' : ''} <b>${Datetime.formatTime(message.createdOn)}</b></footer>
    </main>
</article>`;
            let article = document.createRange().createContextualFragment(template);

            let contentElement = article.querySelector('.formatted');

            if (message.formatted) {
                let currentParagraph = document.createElement('p');

                for (let p = 0; p < message.formatted.textNodes.length; p++) {
                    let node = message.formatted.textNodes[p];

                    switch (node.type) {
                        case 'PLAIN_TEXT':
                            let span = document.createElement('span');
                            span.textContent = node.text;
                            currentParagraph.appendChild(span);
                            if (p === message.formatted.textNodes.length - 1 || message.formatted.textNodes[p + 1].type === 'REPLY_TO') {
                                contentElement.appendChild(currentParagraph);
                                currentParagraph = document.createElement('p');
                            }
                            break;
                        case 'LINK':
                            let a = document.createElement('a');
                            a.classList.add('link');
                            // FIXME: URL validation
                            a.href = encodeURI(node.url);
                            a.textContent = node.label;
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
            } else {
                contentElement.parentElement.removeChild(contentElement);
            }

            Buttons.init(article.querySelectorAll('.button'));

            return article;
        },
        add: (message, direction = 'afterbegin') => {
            message.createdOn = Datetime.arrayToDate(message.createdOn);

            let messages = document.querySelector('.messages');

            if (direction === 'afterbegin') {
                if (messages.querySelector('article:first-child')
                    && messages.querySelector('article:first-child').hasAttribute('data-date')
                    && messages.querySelector('article:first-child').dataset.date !== Datetime.formatDate(message.createdOn)) {
                    messages.insertAdjacentHTML('afterbegin', Messages.message.separator(messages.querySelector('article:first-child').dataset.date));
                }

                messages.insertBefore(Messages.message.template(message), messages.firstChild);
            }
            if (direction === 'beforeend') {
                if (messages.querySelector('article:last-child')
                    && messages.querySelector('article:last-child').hasAttribute('data-date')
                    && messages.querySelector('article:last-child').dataset.date !== Datetime.formatDate(message.createdOn)) {
                    messages.insertAdjacentHTML('beforeend', Messages.message.separator(Datetime.formatDate(message.createdOn)));
                }

                messages.appendChild(Messages.message.template(message));
            }
        },

        submitForm: (form) => {
            let button = form.querySelector('.submit.button');
            Messages.message.submit(button);
        },
        submit: (button) => {
            if (!button.classList.contains('progress')) {
                if (!Messages.message.dialog.validations.all()) {
                    return;
                }

                button.classList.remove('error');
                button.classList.add('progress');

                let messageForm = new FormData();
                messageForm.append('rough', Messages.message.dialog.values.content());
                messageForm.append('iconPath', Messages.message.dialog.values.icon());
                messageForm.append('images', Messages.message.dialog.values.images());
                messageForm.append('conversationId', Conversations.lastConversation.load().id);
                messageForm.append('replyTo', JSON.stringify(Messages.message.dialog.message.replyTo));


                fetch('/api/message', {
                    headers: Fetch.headers(),
                    method: 'POST',
                    body: messageForm
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.json().then((message) => {
                        button.classList.add('done');

                        setTimeout(() => {
                            Messages.message.dialog.remove();
                            Messages.message.dialog.messageReset();
                            Messages.message.add(message);
                            document.querySelector('.messages').parentNode.scrollTop = 0;

                            // check if images got loaded, if not, note the user that images are being loaded.
                        }, 200);

                        if (Images.values.length) {
                            Messages.message.submitImages(message.id);
                        }
                    });
                }).catch((response) => {
                    button.classList.remove('progress');
                    button.classList.add('error');
                });
            }
        },

        submitImages: (messageId) => {
            let imageForm = new FormData();
            for (let i = 0; i < Images.values.length; i++) {
                imageForm.append(`image[${i}].name`, Images.values[i].name);
                imageForm.append(`image[${i}].thumbnail`, Images.values[i].thumbnail);
                imageForm.append(`image[${i}].image`, Images.values[i].file);
            }

            fetch('/api/image', {
                headers: Fetch.headers(),
                method: 'POST',
                body: imageForm
            }).then(Fetch.processFetchStatus).then((response) => {
                return response.json().then((images) => {
                    // FIXME: ok message

                });
            }).catch((response) => {
                console.log('ERRORRR, (...)');
                console.log(response);
            });
        },

        images: (images) => {
            if (!images.length) {
                return '';
            }

            return `<section class="image">${images.map(Messages.message.image).join('')}</section>`;
        },
        image: (image) => {
            return `<span class="button thumbnail placeholder" data-click="Messages.image.dialog.add" data-id="${image.id}"></span>`;
        },

        separator: (createdOn) => {
            return `<div class="seperator"><span>${createdOn}</span></div>`;
        },

        replyTo: {
            add: (node, currentParagraph) => {
                let id = Messages.message.validations.uuid(node.replyToId);
                let iconPath = Messages.message.validations.icon(node.iconPath) || '';

                let template = `<a class="button" data-click="Messages.message.replyTo.show" data-id="${id}" data-icon-path="${iconPath}">
    <span class="replyToIcon" style="background-image: url('/images/icons/${iconPath}.png')"></span><span class="caption"></span>
</a>`;

                let replyTo = document.createRange().createContextualFragment(template);
                replyTo.querySelector('.caption').textContent = node.caption || '[ ... ]';

                currentParagraph.appendChild(replyTo);
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

                            let article = Messages.message.template(message).querySelector('article');
                            article.classList.add('replyTo');

                            let replyToWrapper = document.createElement('div');

                            if (replyToArticle.parentNode.classList.contains('messages')) {

                                replyToWrapper.classList.add('progress');
                                replyToWrapper.classList.add('replyToWrapper');

                                replyToWrapper.appendChild(article);
                                replyTo.parentNode.insertBefore(replyToWrapper, replyTo.nextSibling);

                                let closeTemplate = `<span class="close-button">
    <a class="button" data-click="Messages.message.replyTo.close"></a>
</span>`;

                                let close = document.createRange().createContextualFragment(closeTemplate);
                                replyToWrapper.insertBefore(close, replyToWrapper.firstChild);
                                Buttons.init(replyToWrapper.querySelectorAll('.close-button .button'));
                            } else {
                                article.classList.add('progress');
                                replyTo.parentNode.insertBefore(article, replyTo.nextSibling);
                            }

                            setTimeout(() => {
                                article.classList.remove('progress');
                                replyToWrapper.classList.remove('progress');
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

        removeAll: () => {
            document.querySelector('.messages').innerHTML = '';
        },

        dialog: {
            message: {},
            messageReset: () => {
                Messages.message.dialog.message = {
                    replyTo: []
                };
            },
            add: (button) => {
                let template =
                    `<section class="message-dialog">
    <header>
        <span class="close-button"><a class="button" data-click="Messages.message.dialog.remove"></a></span>
    </header>
    <form>
        <section>
            <ul class="icons">
                ${Messages.message.dialog.icons()}                                                                        
            </ul>           
        </section>       
        <section>           
            <textarea class="textarea"></textarea>
            <ul class="buttons">
                <li class="image button" data-click="Messages.message.dialog.clickImageInput"><input type="file" multiple="multiple" accept="image/*"/></li>
                <!--<li class="gps button"></li>-->
            </ul>           
        </section>              
        <p class="button-row"><a class="submit button" tabindex="0" data-click="Messages.message.submit"></a></p>
    </form>
</section>`;

                if (!document.querySelector('.message-dialog')) {
                    document.body.insertAdjacentHTML('beforeend', template);


                    setTimeout(() => {
                        document.querySelector('.message-dialog').classList.add('active');
                        document.querySelector('.content').classList.add('dialog');

                        Buttons.init(document.querySelectorAll('.message-dialog .button'));

                        let textarea = document.querySelector('.message-dialog .textarea');

                        let validationTimeout;
                        Textarea.resize(textarea);
                        textarea.addEventListener('input', () => {
                            Textarea.resize(textarea);

                            if (validationTimeout) {
                                clearTimeout(validationTimeout);
                            }
                            validationTimeout = setTimeout(Messages.message.dialog.validations.content, 200);
                        });

                        let buttons = document.querySelector('.message-dialog .buttons');
                        buttons.querySelector('.image.button input').addEventListener('change', (event) => Images.upload(event, buttons));
                        buttons.querySelector('.image.button input').addEventListener('click', (event) => {
                            event.stopPropagation();
                        });

                        // FIXME: reset or load?
                        Messages.message.dialog.messageReset();

                        Messages.message.dialog.activate(button, textarea);

                        textarea.addEventListener('focus', Messages.message.dialog.validations.icons);
                        textarea.addEventListener('blur', () => setTimeout(Messages.message.dialog.validations.icons, 300));
                        textarea.addEventListener('blur', () => setTimeout(Messages.message.dialog.validations.content, 300));
                    }, 100);
                } else {
                    Messages.message.dialog.activate(button);
                }
            },
            activate: (button, textarea) => {
                textarea = textarea || document.querySelector('.message-dialog .textarea');

                if (button.dataset.replyToId) {
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
                    Textarea.resize(textarea);

                    Messages.message.dialog.message.replyTo.push({replyToId: button.dataset.replyToId, key: tagWithNo});
                }

                textarea.focus();
            },
            remove: () => {
                let dialog = document.querySelector('.message-dialog');
                dialog.classList.remove('active');

                document.querySelector('.content').classList.remove('dialog');

                setTimeout(() => {
                    dialog.parentElement.removeChild(dialog);
                }, 300);
            },

            icons: () => {
                return Users.currentUser.icons.map(Messages.message.dialog.icon).join('');
            },
            icon: (icon) => {
                return `<li class="button ${icon.hiddenOnLoad ? 'hidden' : ''}" tabindex="0" data-click="Messages.message.dialog.selectIcon" data-path="${icon.path}" style="background-image: url('/images/icons/${icon.path}.png')"></li>`;
            },
            selectIcon: (li) => {
                let active = li.parentElement.querySelector('.active');
                if (active) {
                    active.classList.remove('active');
                }
                li.classList.add('active');

                Messages.message.dialog.validations.icons();
            },
            clickImageInput: () => {
                document.querySelector('.message-dialog .image.button input').click();
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
                icons: () => {
                    let template = `<p class="error">Vyberte ikonku.</p>`;

                    let valid = Messages.message.dialog.values.icon();
                    let section = document.querySelector('.message-dialog .icons').parentNode;

                    Validations.refresh(section, valid, template);

                    return valid;
                },
                content: () => {
                    let template = `<p class="error">A ještě připojte nějaký obsah ...</p>`;

                    let valid = Messages.message.dialog.values.content() || (Messages.message.dialog.values.images() && Messages.message.dialog.values.images().length);
                    let section = document.querySelector('.message-dialog .textarea').parentNode;

                    Validations.refresh(section, valid, template);

                    return valid;
                }
            }
        },
        validations: {
            uuid: (uuid) => {
                return uuid && uuid.match(/^[\da-f-]+$/i) ? uuid : '';
            },
            icon: (iconPath) => {
                return iconPath && iconPath.match(/^\d+_\d+$/) ? iconPath : '';
            }
        }
    },

    image: {
        dialog: {
            add: (thumbnail) => {
                let template = `<div class="image-dialog">
    <header>
        <span class="close-button"><a class="button" data-click="Messages.image.dialog.remove"><span>&#43;</span></a></span>
    </header>
    <main></main>
</div>`;

                thumbnail.insertAdjacentHTML('afterend', template);
                let imageDialog = document.querySelector('.image-dialog');
                Buttons.init([imageDialog]);

                let image = new Image();
                image.src = thumbnail.dataset.url;
                image.addEventListener('load', () => {
                    imageDialog.querySelector('main').appendChild(image);
                    imageDialog.classList.add('active');
                });

                setTimeout(() => {
                    thumbnail.classList.add('active');
                    Buttons.init(document.querySelectorAll('.image-dialog .button'));
                }, 100);
            },
            remove: (button) => {
                let dialog = document.querySelector('.image-dialog');
                let image = dialog.previousSibling;

                image.classList.remove('active');

                setTimeout(() => {
                    dialog.parentElement.removeChild(dialog);
                }, 300);
            }

        }
    },

    placeholders: {
        add: () => [1, 2, 3, 4].map(Messages.placeholders.addOne),
        addOne: () => {
            let template =
                `<article class="placeholder">
                    <header><div class="icon"></div></header>
                    <main>          
                        <section><p class=""></p></section>
                        <footer></footer>
                    </main>
                </article>`;

            document.querySelector('.messages').insertAdjacentHTML('beforeend', template);
        },
        removeAll: () => {
            let placeholders = document.querySelectorAll('.messages .placeholder');
            for (let i = placeholders.length; i--;) {
                let placeholder = placeholders[i];
                document.querySelector('.messages').removeChild(placeholder);
            }
        }
    },

    empty: {
        add: () => {
            let message = 'Tak tady snad ještě není ani jeden příspěvek!';
            let template =
                `<article class="bot">
    <header><div class="icon"></div></header>
    <main>
        <section>
            <p><span>${message}</span></p>
        </section>
    </main>
</article>`;

            document.querySelector('.messages').insertAdjacentHTML('beforeend', template);
        }
    },
    failed: {
        add: (errorMessage) => {
            let template =
                `<article class="bot">
    <header><div class="icon"></div></header>
    <main>
        <section>
            <p>${errorMessage}</p>
            <p class="button-row">
                <a class="secondary button" data-click="Messages.reload">Zkusit znovu</a>
            </p>
        </section>
    </main>
</article>`;

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
    },

    // FIXME: for many messages, introduce some dynamic hide/show.
    // inView: (message) => {
    //     var elemTop = message.getBoundingClientRect().top;
    //     var elemBottom = message.getBoundingClientRect().bottom;
    //
    //     return (elemTop > -200) && (elemBottom < window.innerHeight + 200);
    // },

    menu: {
        load: () => {
            if(document.querySelector('aside .conversations')) {
                return;
            }

            let template = `
<ul class="conversations">
    <li class="button">
        <a></a>
        <span class="conversation-name">Začít novou</span>
    </li>
</ul>
<ul>    
    <!-- Not HERE. <li><a class="button" data-click="Login.logout"><span>Logout</span></a></li>-->
</ul>`;
            let conversationTemplate = `<li class="button" data-click="Conversations.select">
    <a></a>
    <span class="conversation-name"></span>
</li>`;


            document.querySelector('aside section').insertAdjacentHTML('afterBegin', template);

            let conversations = document.querySelector('aside .conversations');

            Conversations.currentConversations.forEach((conversation) => {
                let c = document.createRange().createContextualFragment(conversationTemplate);
                c.querySelector('.button').setAttribute('data-conversation-id', conversation.id);
                c.querySelector('.conversation-name').textContent = conversation.title;


                conversations.appendChild(c);
            });

            Buttons.init(conversations.querySelectorAll('.button'));
        },
        show: () => {
            document.querySelector('.content').classList.add('moved');
        },
        hide: () => {
            document.querySelector('.content').classList.remove('moved');
        },
        toggle: () => {
            if (document.querySelector('.content').classList.contains('moved')) {
                Messages.menu.hide();
            } else {
                Messages.menu.show();
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
};