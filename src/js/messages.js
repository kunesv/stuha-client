[1, 2, 3, 4].map(messagePlaceholder);

// TEST DATA preparation

let currentUser = {userId: 2, userName: 'Houba'};

let sampleMessages = [
    'Tady scanuju celej byt.',
    'Houba si balí na čundr: dva obří spacáky po prababičce a další pravou zálesáckou výbavu. Počítám, že asi tak po půl kilometru omdlí pod tou vahou únavou a povezete ho k tábořišti na kárce.',
    'S Jendou případně jel já.',
    'Já to včera u vás viděl, slušná nálož. Má aspoň ten bráchuv batoh? Kárku teda budeme muset vyrobit, asi z kulatin a klacků. :-)',
    'Pche, to je všecko jen vzduch. To se nese samo.'
];
let sampleUsers = [
    {
        iconPath: '20_1',
        userId: 20,
        userName: 'Mokl'
    },
    {
        iconPath: '3_4',
        userId: 3,
        userName: 'Sovička'
    },
    {
        iconPath: '3_1',
        userId: 3,
        userName: 'Sovička'
    },
    {
        iconPath: '2_2',
        userId: 2,
        userName: 'Houba'
    }
];
let sampleImages = [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
    [{url: 'img1.jpg'}],
    [{url: 'img2.jpg'}],
    [{url: 'img1.jpg'}, {url: 'img2.jpg'}],
    [{url: 'img2.jpg'}, {url: 'img1.jpg'}],
    [{url: 'img1.jpg'}, {url: 'img2.jpg'}, {url: 'img1.jpg'}]
];


let messages = [];
let noOfMessages = Math.random() < .2 ? 0 : 10;
for (let i = 0; i < noOfMessages; i++) {
    let user = sampleUsers[Math.floor(Math.random() * 4)];
    let date = new Date();
    date.setMilliseconds(date.getMilliseconds() - i * 10000000);

    let imagesId = Math.floor(Math.random() * 31);

    messages.push({
        id: i,
        iconPath: user.iconPath,
        userId: user.userId,
        userName: user.userName,
        formatted: imagesId != 30 ? sampleMessages[Math.floor(Math.random() * 5)] : '',
        images: sampleImages[imagesId],
        createdOn: date
    });
}
messages.reverse();


setTimeout(messagesLoadResult, 200);

function messagesLoadResult() {
    if (Math.random() > .2) {
        messagePlaceholdersRemove();

        for (let message of messages) {
            messageAdd(message);
        }

        if (!messages.length) {
            // Show Empty Discussion notice & Message Add form
        }

    } else {
        messageLoadFailedOverlayAdd();
    }
}


function reload() {
    messageLoadFailedOverlayRemove();

    setTimeout(messagesLoadResult, 500);
}

function messageLoadFailedOverlayAdd() {
    let template =
        `<div class="overlay">
            <span onclick="reload()">Load failed. <br/> Please reload.</span>
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

function messagePlaceholder() {
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
    let placeholders = document.getElementsByClassName('messages')[0].getElementsByClassName('placeholder')
    for (let i = placeholders.length; i--;) {
        let placeholder = placeholders[i];
        document.getElementsByClassName('messages')[0].removeChild(placeholder);
    }
}

function messageAdd(message) {
    let template =
        `<article class="${currentUser.userId == message.userId ? 'my' : ''}" data-id="${message.id}" data-date="${formatDate(message.createdOn)}">
            <header>
                <h1><img src="/images/${message.iconPath}.png" /></h1>
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