let headerButtons = document.querySelectorAll('body > header .button');
buttons.init(headerButtons);


initMessagePlaceholers();

function initMessagePlaceholers() {
    [1, 2, 3, 4].map(messagePlaceholderAdd);
}

function messagesLoadResult() {
    if (Math.random() > .2) {
        messagePlaceholdersRemove();

        for (let i = 0; i < messages.length; i++) {
            messageAdd(messages[i]);
        }

        if (!messages.length) {
            emptyDiscussionNoticeAdd();
        }

    } else {
        messageLoadFailedOverlayAdd();
    }
}

function reload() {
    messageLoadFailedOverlayRemove();

    setTimeout(messagesLoadResult, Math.round(Math.random() * 1500));
}

function emptyDiscussionNoticeAdd() {
    let template =
        `<article>Tak tady se asi ještě diskuse moc nerozjela.</article>`;

    document.querySelector('.messages').insertAdjacentHTML('beforeend', template);
}

function messageLoadFailedOverlayAdd() {
    let template =
        `<div class="overlay">
            <span class="button" data-click="reload">Zatím se nepodařilo nic nahrát. <br/> Zkuste to prosím ještě jednou.</span>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', template);
    buttons.init(document.querySelectorAll('.overlay .button'));
}

function messageLoadFailedOverlayRemove() {
    let overlays = document.getElementsByClassName('overlay');
    for (let i = overlays.length; i--;) {
        let overlay = overlays[i];
        document.body.removeChild(overlay);
    }
}

function messagePlaceholderAdd() {
    let template =
        `<article class="placeholder">
            <header><h1></h1></header>
            <main>          
                <section><p><b>&middot;&nbsp;&middot;&nbsp;&middot;</b></p></section>
                <footer></footer>
            </main>
        </article>`;

    document.querySelector('.messages').insertAdjacentHTML('beforeend', template);
}

function messagePlaceholdersRemove() {
    let placeholders = document.getElementsByClassName('messages')[0].getElementsByClassName('placeholder');
    for (let i = placeholders.length; i--;) {
        let placeholder = placeholders[i];
        document.querySelector('.messages').removeChild(placeholder);
    }
}

function messageAdd(message) {
    let template =
        `<article class="${currentUser.userId == message.userId ? 'my' : ''}" data-id="${message.id}" data-date="${formatDate(message.createdOn)}">
            <header>
                <h1 style="background-image: url('/images/${message.iconPath}.png')"></h1>
            </header>
            <main>          
                ${images(message.images)}
                
                ${formattedMessage(message)}
                    
                <footer>${formatDate(new Date()) != formatDate(message.createdOn) ? formatDate(message.createdOn) + ',' : ''} <b>${formatTime(message.createdOn)}</b></footer>
            </main>
        </article>`;

    let messages = document.querySelector('.messages');
    if (messages.querySelector('article:first-child')
        && messages.querySelector('article:first-child').hasAttribute('data-date')
        && messages.querySelector('article:first-child').getAttribute('data-date') != formatDate(message.createdOn)) {
        messages.insertAdjacentHTML('afterbegin', separator(messages.querySelector('article:first-child').getAttribute('data-date')));
    }

    messages.insertAdjacentHTML('afterbegin', template);
    buttons.init(messages.querySelectorAll('article:first-child .button'));

}

function images(images) {
    if (!images.length) {
        return '';
    }

    return `<section class="image">${images.map(image).join('')}</section>`;
}

function formattedMessage(message) {
    if (!message.formatted) {
        return '';
    }

    return `<section><p><b>${message.userName}:</b> ${message.formatted}</p></section>`;
}

function image(image) {
    return `<span class="button thumbnail" data-click="imageDialog" data-url="${image.url}" style="background-image: url('/images/${image.url}')"></span>`;
}

function separator(createdOn) {
    return `<div class="seperator"><span><b>${createdOn}</b></div>`;
}


function formatDate(date) {
    let dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

    return dayNames[date.getDay()] + ' ' + date.getDate() + '.' + (date.getMonth() + 1) + '. ' + date.getFullYear();
}

function formatTime(date) {
    return ('0' + date.getHours()).slice(-2) + '.' + ('0' + date.getMinutes()).slice(-2);
}


function messageDialog(button) {
    // let template =
    //     `<section class="overlay"></section>`;
    //
    // document.body.insertAdjacentHTML('beforeend', template);

    let template =
        `<section class="message-dialog">
            <header>
                <span></span>
                <span class="close_button"><a class="button" data-click="hideMessageDialog"><span>&#43;</span></a></span>
            </header>
            <form>
                <ul class="icons">
                    ${icons()}                                                                        
                </ul>
                
                <p class="textarea" contenteditable="true"></p>
                               
                <p><a class="button" data-click="submitMessage"><span>&gt;</span><span class="progress">..</span></a></p>
            </form>
        </section>`;

    document.body.insertAdjacentHTML('beforeend', template);

    setTimeout(() => {
        document.querySelector('.message-dialog').classList.add('active');

        buttons.init(document.querySelectorAll('.message-dialog .button'));

        let textarea = document.querySelector('.message-dialog .textarea');
        textarea.addEventListener('paste', () => {
            setTimeout(() => {
                textarea.innerHTML = textarea.textContent;
            }, 1);
        });
    }, 100);
}

function icons() {
    return currentUser.icons.map(icon).join('');
}

function icon(icon) {
    return `<li class="button" data-click="selectIcon" data-path="${icon.url}" style="background-image: url('/images/${icon.url}.png')"></li>`;
}

function hideMessageDialog() {
    let dialog = document.querySelector('.message-dialog');

    dialog.classList.remove('active');

    setTimeout(() => {
        dialog.parentNode.removeChild(dialog);
    }, 300);
}

function selectIcon(li) {
    let icons = li.parentNode.querySelectorAll('li');
    for (let i = 0; i < icons.length; i++) {
        let icon = icons[i];

        icon.classList.remove('active');
    }

    li.classList.add('active');
}

function imageDialog(image) {
    let template =
        `<section class="image-dialog" data-click="hideImageDialog">
            <img src="/images/${image.getAttribute('data-url')}" />
        </section>`;

    document.body.insertAdjacentHTML('beforeend', template);
    buttons.init(document.querySelectorAll('.image-dialog'));
}

function hideImageDialog(image) {
    image.parentNode.removeChild(image);
}

function submitMessage(button) {
    if (!button.classList.contains('progress')) {
        button.classList.add('progress');
        setTimeout(() => {
            let messageForm = document.querySelector('.message-dialog form');

            let message = {
                createdOn: new Date(),
                userName: currentUser.userName,
                userId: currentUser.userId,    
                formatted: messageForm.querySelector('.textarea').textContent,
                iconPath: messageForm.querySelector('.icons .active').getAttribute('data-path'),
                images: []
            };

            messageAdd(message);

            // icon
            // message || image
            // image, gps, date?

            // on success:
            hideMessageDialog();
            button.classList.remove('progress');
        }, 1500);
    }


}
