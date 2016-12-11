var Users = {
    currentUser: {
        userId: 2,
        userName: 'Houba',
        icons: [{path: '2_1'}, {path: '2_2'}, {path: '2_3'}, {path: '2_4'}]
    },
    init: () => {
        let signedIn = localStorage.getItem('signedIn');
        Users.currentUser.userName = localStorage.getItem('userName');
        Users.currentUser.userId = localStorage.getItem('userId');

        if (signedIn) {
            Messages.init();
        } else {
            Login.init();
        }
    },
};


var Login = {
    init: () => {


        let template = `<header>
    
</header>

<main>
    <aside>
        <header></header>
        <section></section>
    </aside>
    <section id="login">   
         <form data-click="Login.submit">
            <section>               
                <p><label>Přihlašovací jméno</label><span><input name="username" type="text" autocomplete="off"/></span></p>
                <p><label>Heslo</label><span><input name="password" type="password"/></span></p>
            </section>
            <p><button type="submit"></button></p>           
         </form>
    </section>
</main>`;

        document.querySelector('.content').insertAdjacentHTML('afterBegin', template);

        document.querySelector('input[name=username]').addEventListener('blur', Login.validations.username);

        let password = document.querySelector('input[name=password]');

        password.addEventListener('focus', Login.validations.username);
        password.addEventListener('blur', Login.validations.password);

        Buttons.initForms(document.querySelectorAll('form'));
    },
    submit: (form) => {
        let button = form.querySelector('button');
        Login.errorMessage.removeAll();

        if (!button.classList.contains('progress')) {
            if (!Login.validations.all()) {
                return;
            }

            button.classList.add('progress');

            fetch('/api/login', {
                headers: {
                    'Accept': 'application/json'
                },
                method: 'POST',
                body: new FormData(form)
            }).then(Fetch.processFetchStatus).then((response) => {
                return response.json().then((user) => {
                    localStorage.setItem('signedIn', 'true');
                    localStorage.setItem('userName', user.name);
                    localStorage.setItem('userId', user.id);



                    Content.clean();
                    Messages.init();
                });
            }).catch((error) => {
                console.log(error.headers);
                if (error.status === 401) {
                    Login.errorMessage.add('<b>Přihlášení se nezdařilo</b><br/>Zkontrolujte přihlašovací jméno a heslo.');
                } else {

                    // FIXME: Get inspired by message - read
                }
                button.classList.remove('progress');
            });
        }
    },
    errorMessage: {
        add: (message) => {
            let template = `<p class="error-message">${message}</p>`;
            let form = document.querySelector('#login form');
            form.querySelector('section').insertAdjacentHTML('afterEnd', template);
            setTimeout(() => {
                form.classList.add('show-errors');
            }, 10);
        },
        removeAll: () => {
            let form = document.querySelector('#login form');
            form.className = '';

            let errors = form.querySelectorAll('.error-message');
            for (let i = 0; i < errors.length; i++) {
                form.removeChild(errors[i]);
            }
        }
    },
    dialog: {
        add: () => {
            let template = `<div class="login-dialog">   
    <main>
        <section id="login">   
             <form data-click="Login.submit">
                <section>
                    <p>Vy jste tu ještě?<br/>Mohli byste se, prosím, znovu přihlásit?</p>
                    <p><label>Přihlašovací jméno</label><span><input name="username" type="text" autocomplete="off"/></span></p>
                    <p><label>Heslo</label><span><input name="password" type="password"/></span></p>
                </section>
                <p><button type="submit"></button></p>           
             </form>
        </section>
    </main>
</div>`;
            document.body.insertAdjacentHTML('beforeend', template);
            setTimeout(() => {
                document.body.querySelector('.login-dialog').classList.add('active');
                Buttons.initForms(document.querySelectorAll('.login-dialog form'));
            }, 100);
        }
    },
    logout: (button) => {
        if (!button.classList.contains('progress')) {
            button.classList.add('progress');
            setTimeout(() => {
                Login.logoff();
            }, 300);
        }
    },
    logoff: () => {
        Content.clean();
        Messages.menu.remove();

        localStorage.removeItem('signedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');

        Login.init();
    },
    values: {
        username: () => {
            return document.querySelector('input[name=username]').value;
        },
        password: () => {
            return document.querySelector('input[name=password]').value;
        }
    },
    validations: {
        all: () => {
            let valid = Login.validations.username();
            valid = Login.validations.password() && valid;

            return valid;
        },
        username: () => {
            let template = `<p class="error">Chybí přihlašovací jméno.</p>`;

            let valid = Login.values.username();
            let section = document.querySelector('input[name=username]').parentNode.parentNode.parentNode;
            let error = section.classList.contains('error');

            if (!valid && !error) {
                section.insertAdjacentHTML('beforeend', template);
                section.classList.add('error');
            }

            if (valid && error) {
                section.classList.remove('error');
                section.removeChild(section.querySelector('.error'));
            }

            return valid;
        },
        password: () => {
            let template = `<p class="error">A ještě heslo.</p>`;

            let valid = Login.values.password();
            let section = document.querySelector('input[name=password]').parentNode.parentNode.parentNode;
            let error = section.classList.contains('error');

            if (!valid && !error) {
                section.insertAdjacentHTML('beforeend', template);
                section.classList.add('error');
            }

            if (valid && error) {
                section.classList.remove('error');
                section.removeChild(section.querySelector('.error'));
            }

            return valid;
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


