let Users = {
    currentUser: {

        userId: 2,
        userName: 'Houba',
        icons: [{url: '2_1'}, {url: '2_2'}, {url: '2_3'}, {url: '2_4'}]
    },
    init: () => {
        let signedIn = false;

        if (signedIn) {
            Messages.init();
        } else {
            Login.init();
        }
    },
};


let Login = {
    init: () => {
        let template = `<header>
    
</header>

<main>
    <aside>
        <header></header>
        <section></section>
    </aside>
    <section class="login">
        <a class="button" data-click="Login.submit"><span>&gt;</span><span class="progress">...</span></a>
    </section>
</main>`;

        document.querySelector('.content').insertAdjacentHTML('afterBegin', template);

        Buttons.init(document.querySelectorAll('.button'));
    },
    submit: (button) => {
        if (!button.classList.contains('progress')) {
            button.classList.add('progress');
            setTimeout(() => {
                Content.clean();

                Messages.init();
            }, 500);
        }
    },
    logout: (button) => {
        if (!button.classList.contains('progress')) {
            button.classList.add('progress');
            setTimeout(() => {
                Content.clean();
                Messages.menu.remove();

                Login.init();
            }, 300);
        }
    }
};

let Content = {
    clean: () => {
        let content = document.querySelector('.content');

        while (content.hasChildNodes()) {
            content.removeChild(content.lastChild);
        }


    }
}

Users.init();

