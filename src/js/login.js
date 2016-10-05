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
         <form data-click="Login.submit">
            <p><label>Přihlašovací jméno</label><span><input name="username" type="text" autocomplete="off"/></span><span class="error"></span></p>
            <p><label>Heslo</label><span><input type="password"/></span><span class="error"></span></p>
            <p><button type="submit" data-click="Login.submit"><span>&gt;</span><span class="progress">...</span></button></p>           
         </form>
    </section>
</main>`;

        document.querySelector('.content').insertAdjacentHTML('afterBegin', template);

        Buttons.initForms(document.querySelectorAll('form'));
    },
    submit: (form) => {
        let button = form.querySelector('button');

        if (!button.classList.contains('progress')) {
            button.classList.add('progress');
            setTimeout(() => {
                Users.currentUser.userName = form.querySelector('input[name=username]').value;

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
};

Users.init();

