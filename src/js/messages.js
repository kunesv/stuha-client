initMessagePlaceholers();

function initMessagePlaceholers() {
    [1, 2, 3, 4].map(messagePlaceholderAdd);
}

function messagesLoadResult() {
    if (Math.random() > .2) {
        messagePlaceholdersRemove();

        for (let i in messages) {
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

    document.getElementsByClassName('messages')[0].insertAdjacentHTML('beforeend', template);
}

function messageLoadFailedOverlayAdd() {
    let template =
        `<div class="overlay">
            <span onclick="reload()">Zatím se nepodařilo nic nahrát. <br/> Zkuste to prosím ještě jednou.</span>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', template);
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
            </main>
        </article>`;

    document.getElementsByClassName('messages')[0].insertAdjacentHTML('beforeend', template);
}

function messagePlaceholdersRemove() {
    let placeholders = document.getElementsByClassName('messages')[0].getElementsByClassName('placeholder');
    for (let i = placeholders.length; i--;) {
        let placeholder = placeholders[i];
        document.getElementsByClassName('messages')[0].removeChild(placeholder);
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


    if (document.getElementsByClassName('messages')[0].firstChild
        && document.getElementsByClassName('messages')[0].firstChild.hasAttribute('data-date')
        && document.getElementsByClassName('messages')[0].firstChild.getAttribute('data-date') != formatDate(message.createdOn)) {
        document.getElementsByClassName('messages')[0].insertAdjacentHTML('afterbegin', separator(document.getElementsByClassName('messages')[0].firstChild.getAttribute('data-date')));
    }


    document.getElementsByClassName('messages')[0].insertAdjacentHTML('afterbegin', template);
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
    return `<span style="background-image: url('/images/${image.url}')"></span>`;
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
                <span class="close_button"><a class="button" data-action="hideMessageDialog"><span>&#43;</span></a></span>
            </header>
            <form>
                <ul class="icons">
                    <li class="button" style="background-image: url('/images/3_1.png')"></li>
                    <li class="button" style="background-image: url('/images/3_4.png')"></li>
                </ul>
                <p>
                    <textarea ></textarea>
                </p>
            </form>
        </section>`;

    document.body.insertAdjacentHTML('beforeend', template);

    setTimeout(() => {
        document.getElementsByClassName('message-dialog')[0].classList.add('active');

        initButtons(document.getElementsByClassName('message-dialog')[0].getElementsByClassName('button'));
    }, 100);
}

function hideMessageDialog() {
    let dialog = document.getElementsByClassName('message-dialog')[0];
    dialog.classList.remove('active');

    setTimeout(() => {
        dialog.parentNode.removeChild(dialog);
    }, 300);
}