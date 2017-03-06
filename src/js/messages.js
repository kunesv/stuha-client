var Messages = {
    init: () => {
        let template = `<header>
    <span class="menu-button"><a class="button" data-click="Messages.menu.toggle"></a></span>
    <span data-content="currentConversation"></span>
    <span class="add-button"><a class="button" data-click="Messages.message.dialog.add"></a></span>
</header>

<main>
    <aside>
        <header></header>
        <section></section>
    </aside>
    <section class="messages"></section>
</main>`;

        document.querySelector('.content').insertAdjacentHTML('afterBegin', template);

        let headerButtons = document.querySelectorAll('.content > header .button');
        Buttons.init(headerButtons);

        Messages.placeholders.add();

        Users.loadUserDetails(); // FIXME: Promise!


        let content = document.querySelector('.content');
        Messages.swipe = new Swipe(content);


    },
    ticking: false,

    load: (pageNo = 1) => {
        document.querySelector('[data-content="currentConversation"]').textContent = Conversations.lastConversation.conversation.title;

        fetch(`/api/message?conversationId=${Conversations.lastConversation.conversation.id}&pageNo=${pageNo}`, {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((messages) => {
                Messages.placeholders.removeAll();

                for (let i = 0; i < messages.length; i++) {
                    Messages.message.add(messages[i]);
                }

                if (!messages.length) {
                    Messages.empty.add();
                }
            });
        }).catch((error) => {
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
        });
    },

    reload: () => {
        Messages.message.removeAll();
        Messages.placeholders.add();

        Messages.load(1);
    },

    message: {
        add: (message) => {
            message.createdOn = Datetime.arrayToDate(message.createdOn);

            let template =
                `<article class="${Users.currentUser.userName} ? ${message.userName} ${Users.currentUser.userName == message.userName ? 'my' : ''} ${message.robo ? 'robot' : ''}" data-date="${Datetime.formatDate(message.createdOn)}">
    
    
    
    <header>
        <div class="icon ${!message.robo ? 'button' : ''}" data-click="Messages.message.dialog.add" data-reply-to="${message.id}" style="background-image: url('/images/${message.iconPath}.png')"></div>
    </header>
    <main>                 
        <section data-content="message.formatted"></section>
        
        ${Messages.message.images(message.images)}
            
        <footer>${Datetime.formatDate(new Date()) != Datetime.formatDate(message.createdOn) ? Datetime.formatDate(message.createdOn) + ',' : ''} <b>${Datetime.formatTime(message.createdOn)}</b></footer>
    </main>
</article>`;

            let messages = document.querySelector('.messages');
            if (messages.querySelector('article:first-child')
                && messages.querySelector('article:first-child').hasAttribute('data-date')
                && messages.querySelector('article:first-child').dataset.date != Datetime.formatDate(message.createdOn)) {
                messages.insertAdjacentHTML('afterbegin', Messages.message.separator(messages.querySelector('article:first-child').dataset.date));
            }

            messages.insertAdjacentHTML('afterbegin', template);

            let contentElement = messages.querySelector('[data-content="message.formatted"]');
            if (message.formatted) {
                TextProcessor.process([{'element': contentElement, 'text': message.formatted}]);
                contentElement.removeAttribute('data-content');
            } else {
                contentElement.parentNode.removeChild(contentElement);
            }

            Buttons.init(messages.querySelectorAll('article:first-child .button'));
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

                button.classList.add('progress');

                let messageForm = new FormData();
                messageForm.append('replyTo', document.querySelector('.message-dialog').dataset.replyTo || '');
                messageForm.append('rough', Messages.message.dialog.values.content());
                messageForm.append('iconPath', Messages.message.dialog.values.icon());
                messageForm.append('images', Messages.message.dialog.values.images());
                messageForm.append('conversationId', Conversations.lastConversation.conversation.id);

                fetch('/api/message', {
                    headers: Fetch.headers(),
                    method: 'POST',
                    body: messageForm
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.json().then((message) => {
                        button.classList.add('done');

                        setTimeout(() => {
                            Messages.message.dialog.remove();
                            Messages.message.add(message);
                            document.querySelector('.messages').scrollTop = 0;

                            // check if images got loaded, if not, note the user that images are being loaded.
                        }, 200);

                        if (Images.values.length) {
                            Messages.message.submitImages(message.id);
                        }
                    });
                }).catch((response) => {
                    console.log('ERRORRR, (...)');
                    console.log(response);
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

        replyTo: (id) => {
            return (id) ? `<header data-reply-to="${id}">
    <div class="icon button" data-click="Messages.message.dialog.add" data-reply-to="${id}" style="background-image: url('/images/2_1.png')"></div>
</header>` : '';
        },

        removeAll: () => {
            document.querySelector('.messages').innerHTML = '';
        },

        dialog: {
            add: (button) => {
                let template =
                    `<section class="message-dialog" ${button.dataset.replyTo ? 'data-reply-to="' + button.dataset.replyTo + '"' : ''}>
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
            <textarea class="textarea" rows="1"></textarea>
            <ul class="buttons">
                <li class="image button" data-click="Messages.message.dialog.clickImageInput"><input type="file" multiple="multiple" accept="image/*"/></li>
                <!--<li class="gps button"></li>-->
            </ul>           
        </section>              
        <p><a class="submit button" tabindex="0" data-click="Messages.message.submit"></a></p>
    </form>
</section>`;

                document.body.insertAdjacentHTML('beforeend', template);

                setTimeout(() => {
                    document.querySelector('.message-dialog').classList.add('active');

                    Buttons.init(document.querySelectorAll('.message-dialog .button'));

                    let textarea = document.querySelector('.message-dialog .textarea');
                    textarea.addEventListener('focus', Messages.message.dialog.validations.icons);
                    textarea.addEventListener('blur', Messages.message.dialog.validations.content);

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
                    })
                }, 100);
            },
            remove: () => {
                let dialog = document.querySelector('.message-dialog');

                dialog.classList.remove('active');

                setTimeout(() => {
                    dialog.parentNode.removeChild(dialog);
                }, 300);
            },

            icons: () => {
                return Users.currentUser.icons.map(Messages.message.dialog.icon).join('');
            },
            icon: (icon) => {
                return `<li class="button ${icon.hiddenOnLoad ? 'hidden' : ''}" tabindex="0" data-click="Messages.message.dialog.selectIcon" data-path="${icon.path}" style="background-image: url('/images/${icon.path}.png')"></li>`;
            },
            selectIcon: (li) => {
                let icons = li.parentNode.querySelectorAll('li');
                for (let i = 0; i < icons.length; i++) {
                    let icon = icons[i];

                    icon.classList.remove('active');
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
                    dialog.parentNode.removeChild(dialog);
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
            <p><b>Stuha:</b> ${message}</p>
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
            <p><b>Stuha:</b> ${errorMessage}</p>
            <p class="button-row">
                <a class="button" data-click="Messages.reload">Zkusit znovu</a>
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
        add: () => {
            let template = `<nav>
<ul class="conversations"></ul>
<ul>    
    <li><a class="button" data-click="Login.logout"><span>Logout</span><span class="progress">...</span></a></li>
</ul></nav>`;

            document.body.insertAdjacentHTML('afterBegin', template);

            let conversations = document.querySelector('nav .conversations');
            Conversations.currentConversations.forEach((conversation) => {
                let li = document.createElement('li');
                let a = document.createElement('a');
                a.classList.add('button');
                a.setAttribute('data-click', 'Conversations.select');
                a.setAttribute('data-conversation-id', conversation.id);
                a.textContent = conversation.title;
                li.appendChild(a);
                conversations.appendChild(li);
            });

            Buttons.init(document.body.querySelectorAll('nav .button'));

            document.querySelector('.content').classList.add('moved');
        },
        remove: () => {

            document.querySelector('.content').classList.remove('moved');

            setTimeout(() => {
                document.body.removeChild(document.body.querySelector('nav'));
            }, 300);
        },
        toggle: () => {
            if (document.querySelector('.content').classList.contains('moved')) {
                Messages.menu.remove();
            } else {
                Messages.menu.add();
            }
        }
    },
};