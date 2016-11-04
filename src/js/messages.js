var Messages = {
    init: () => {
        let template = `<header>
    <span class="menu-button"><a class="button" data-click="Messages.menu.toggle"></a></span>
    <span>Originals</span>
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

        Messages.load();

        let content = document.querySelector('.content');
        Messages.swipe = new Swipe(content);
    },
    ticking: false,

    load: () => {
        fetch('/api/message', {
            headers: {
                'Accept': 'application/json'
            }
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
            console.log(error);
            Messages.failed.add();
        });
    },

    reload: () => {
        Messages.failed.remove();
        Messages.placeholders.add();

        Messages.load();
    },

    message: {
        add: (message) => {
            message.createdOn = Datetime.arrayToDate(message.createdOn);

            let template =
                `<article class="${Users.currentUser.userId == message.userId ? 'my' : ''}" data-date="${Datetime.formatDate(message.createdOn)}">
    <header>
        <div class="icon button" data-click="Messages.message.dialog.add" data-reply-to="${message.id}" style="background-image: url('/images/${message.iconPath}.png')"></div>
    </header>
    <main>          
              
        ${Messages.message.formatted(message)}
        
        ${Messages.message.images(message.images)}
            
        <footer>${Datetime.formatDate(new Date()) != Datetime.formatDate(message.createdOn) ? Datetime.formatDate(message.createdOn) + ',' : ''} <b>${Datetime.formatTime(message.createdOn)}</b></footer>
    </main>
</article>`;

            let messages = document.querySelector('.messages');
            if (messages.querySelector('article:first-child')
                && messages.querySelector('article:first-child').hasAttribute('data-date')
                && messages.querySelector('article:first-child').getAttribute('data-date') != Datetime.formatDate(message.createdOn)) {
                messages.insertAdjacentHTML('afterbegin', Messages.message.separator(messages.querySelector('article:first-child').getAttribute('data-date')));
            }

            messages.insertAdjacentHTML('afterbegin', template);

            Buttons.init(messages.querySelectorAll('article:first-child .button'));
        },

        submitForm: (form) => {
            let button = form.querySelector('.submit.button');
            Messages.message.submit(button);
        },
        submit: (button)=> {
            if (!button.classList.contains('progress')) {
                if (!Messages.message.dialog.validations.all()) {
                    return;
                }

                button.classList.add('progress');

                let messageForm = new FormData();
                messageForm.append('replyToId', document.querySelector('.message-dialog').getAttribute('data-reply-to'));
                messageForm.append('userName', Users.currentUser.userName);
                messageForm.append('userId', Users.currentUser.userId);
                messageForm.append('rough', Messages.message.dialog.values.content());
                messageForm.append('iconPath', Messages.message.dialog.values.icon());
                messageForm.append('images', Messages.message.dialog.values.images());


                fetch('/api/message', {
                    headers: {
                        'Accept': 'application/json'
                    },
                    method: 'POST',
                    body: messageForm
                }).then(Fetch.processFetchStatus).then((response) => {
                    return response.json().then((message) => {
                        Messages.message.add(message);

                        Messages.message.dialog.remove();
                        button.classList.remove('progress');

                        document.querySelector('.messages').scrollTop = 0;
                    });
                }).catch((response) => {
                    console.log('ERRORRR, (...)');
                    console.log(response);
                });
            }
        },

        images: (images) => {
            if (!images.length) {
                return '';
            }

            return `<section class="image">${images.map(Messages.message.image).join('')}</section>`;
        },
        image: (image)=> {
            return `<span class="button thumbnail placeholder" data-click="Messages.image.dialog.add" data-id="${image.id}"></span>`;
        },

        formatted: (message) => {
            if (!message.formatted) {
                return '';
            }

            return `<section><p><b>${message.userName}:</b> ${message.formatted}</p></section>`;
        },

        separator: (createdOn) => {
            return `<div class="seperator"><span><b>${createdOn}</b></div>`;
        },

        dialog: {
            add: (button) => {
                let template =
                    `<section class="message-dialog" data-reply-to="${button.getAttribute('data-reply-to')}">
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
            <p class="textarea" contenteditable="true"></p>
            <ul class="buttons">
                <li class="image button"><input name="image" type="file" multiple="multiple" accept="image/*"/></li>
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
                    textarea.addEventListener('paste', () => {
                        setTimeout(() => {
                            textarea.innerHTML = textarea.textContent;
                        }, 1);
                    });
                    textarea.addEventListener('focus', Messages.message.dialog.validations.icons);
                    textarea.addEventListener('blur', Messages.message.dialog.validations.content);

                    let validationTimeout;
                    textarea.addEventListener('input', () => {
                        if (validationTimeout) {
                            clearTimeout(validationTimeout);
                        }
                        validationTimeout = setTimeout(Messages.message.dialog.validations.content, 200);
                    });

                    let buttons = document.querySelector('.message-dialog .buttons');
                    buttons.querySelector('.image.button').addEventListener('change', (event) => {
                        Images.upload(event, buttons);
                        Messages.message.dialog.validations.icons();
                    });
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
            icon: (icon)=> {
                return `<li class="button ${icon.hiddenOnLoad ? 'hidden' : ''}" tabindex="0" data-click="Messages.message.dialog.selectIcon" data-path="${icon.path}" style="background-image: url('/images/${icon.path}.png')"></li>`;
            },
            selectIcon: (li)=> {
                let icons = li.parentNode.querySelectorAll('li');
                for (let i = 0; i < icons.length; i++) {
                    let icon = icons[i];

                    icon.classList.remove('active');
                }

                li.classList.add('active');

                Messages.message.dialog.validations.icons();
            },

            values: {
                icon: () => {
                    let activeIcon = document.querySelector('.message-dialog .icons .active');
                    return activeIcon ? activeIcon.getAttribute('data-path') : null;
                },
                content: () => {
                    return document.querySelector('.message-dialog .textarea').textContent;
                },
                images: () => {
                    return Images.values();
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

                    Messages.message.dialog.validations.iconsTooManyAttempts.anotherTry(section, valid);

                    return valid;
                },
                iconsTooManyAttempts: {
                    anotherTry: (section, valid) => {
                        if (valid) {
                            section.setAttribute('data-count', 0);
                        } else {
                            let count = section.getAttribute('data-count');
                            if (count == 3) {
                                document.querySelector('.message-dialog .icons').insertAdjacentHTML('beforeend', Messages.message.dialog.icon({
                                    path: '0_0',
                                    hiddenOnLoad: true
                                }));

                                let icon = document.querySelectorAll('.message-dialog .icons .button:last-child');
                                Buttons.init(icon);

                                setTimeout(() => {
                                    icon[0].classList.remove('hidden');
                                }, 100);
                            }
                            section.setAttribute('data-count', ++count);
                        }
                    }
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
                image.src = thumbnail.getAttribute('data-url');
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
            let placeholders = document.getElementsByClassName('messages')[0].getElementsByClassName('placeholder');
            for (let i = placeholders.length; i--;) {
                let placeholder = placeholders[i];
                document.querySelector('.messages').removeChild(placeholder);
            }
        }
    },

    empty: {
        add: () => {
            let template =
                `<article>Tak tady se asi ještě diskuse moc nerozjela.</article>`;

            document.querySelector('.messages').insertAdjacentHTML('beforeend', template);
        }
    },
    failed: {
        add: () => {
            let template =
                `<div class="overlay alert">
    <span class="button" data-click="Messages.reload">Zatím se nepodařilo nic nahrát. <br/> Zkuste to prosím ještě jednou.</span>
</div>`;

            document.body.insertAdjacentHTML('beforeend', template);
            Buttons.init(document.querySelectorAll('.overlay .button'));
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
        add: (button) => {
            let template = `<nav><ul>
    <li><a class="button" data-click="Login.logout"><span>Logout</span><span class="progress">...</span></a></li>
</ul></nav>`;

            document.body.insertAdjacentHTML('afterBegin', template);
            Buttons.init(document.body.querySelectorAll('nav .button'));

            document.querySelector('.content').classList.add('moved');
        },
        remove: () => {

            document.querySelector('.content').classList.remove('moved');

            setTimeout(() => {
                document.body.removeChild(document.body.querySelector('nav'));
            }, 300);
        },
        toggle: (button) => {
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                Messages.menu.add();
            } else {
                Messages.menu.remove();
            }
        }
    },
};