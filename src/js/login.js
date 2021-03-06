var Users = {
    currentUser: {},
    notifications: {
        poll: true
    },
    init: () => {
        let signedIn = Users.loadFromStorage();
        if (signedIn === 'TRUE') {
            Messages.init();
            WebSock.init();
        } else {
            Login.init();
        }
    },
    saveToken: (token) => {
        Users.currentUser.userId = token.userId;
        Users.currentUser.token = token.token;

        Users.saveToStorage();
    },
    refreshToken: (newToken) => {
        Users.currentUser.token = newToken;
        Users.saveToStorage();
    },
    saveToStorage: () => {
        localStorage.setItem('userId', Users.currentUser.userId);
        localStorage.setItem('token', Users.currentUser.token);
        localStorage.setItem('signedIn', 'TRUE');
    },
    loadFromStorage: () => {
        Users.currentUser.userId = localStorage.getItem('userId');
        Users.currentUser.token = localStorage.getItem('token');
        return localStorage.getItem('signedIn');
    },
    clean: () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('signedIn');

        Users.currentUser = {};
    },
    loadUserDetails: () => {
        return fetch('/api/currentUser', {
            headers: Fetch.headers()
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((user) => {
                Users.currentUser.userName = user.name;
                Users.currentUser.icons = user.icons;
            });
        });
    },
    menu: {
        show: () => {
            alert('Tohle ještě není zcela hotové, zdá se. No nevadí, vyzkouším zatím ostatní knoflíky.')
        }
    }
};

var Login = {
    template: () => {
        return `
<main>   
    <section id="login">   
        <header></header>
        <form data-click="Login.submit">                       
            <p>
                <label>Přihlašovací jméno</label>
                <span><input name="username" type="text" autocomplete="off" autocapitalize="none" autofocus="autofocus"/></span>
                <span class="error">Sem dám přihlašovací jméno.</span>
            </p>
            <p>
                <label>Heslo</label>
                <span><input name="password" type="password"/></span>
                <span class="error">Sem dám heslo.</span>
            </p>
            
            <p>
                <label>
                    <input type="checkbox" name="remember"/> 
                    <span class="check-box"><span></span></span>
                    <span>Zapamatovat přihlášení</span>
                </label>
            </p>
            
            <p class="button-row"><input type="hidden" name="damnIE" value=""/> <button type="submit"></button></p>     
            
            <footer>
                <span>Tak to raději zamhouřím jedno oko.</span>
            </footer>      
        </form>
        
    </section>
</main>`;
    },
    init: () => {
        // FIXME: Eventually refactor to separate method.
        clearInterval(Messages.intervalLoadNew);

        document.querySelector('.content').insertAdjacentHTML('beforeEnd', Login.template());

        let username = document.querySelector('input[name=username]');
        username.addEventListener('blur', Login.validations.username);
        username.addEventListener('input', Login.validations.username);

        let password = document.querySelector('input[name=password]');

        password.addEventListener('focus', Login.validations.username);
        password.addEventListener('blur', Login.validations.password);
        password.addEventListener('input', Login.validations.password);

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
                return response.json().then((token) => {
                    Users.saveToken(token);

                    Content.clean();

                    Users.init();
                });
            }).catch((error) => {
                let errorMessage = 'Se mi nepodařilo se přihlásit. Tak to zkusím ještě jednou.';
                if (error.status === 401) {
                    errorMessage = 'Se mi nepodařilo přihlásit. Radši zkontroluju jméno a heslo.';
                } else {
                    if (!Online.isOnline()) {
                        errorMessage = 'Zdá se, že jsem mimo signál Internetu.';
                    } else {
                        if (error.status === 500) {
                            errorMessage = 'Zdá se, že na serveru se objevily nějaké potíže.';
                        }
                    }
                }
                Login.errorMessage.add(errorMessage);
                button.classList.remove('progress');
            });
        }
    },
    errorMessage: {
        add: (message) => {
            let template = `<p class="error-message">${message}</p>`;
            let form = document.querySelector('#login form');
            form.querySelector('.button-row').insertAdjacentHTML('beforeBegin', template);
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
            if (document.body.querySelector('.login-dialog')) {
                return;
            }

            let dialog = document.createElement('section');
            dialog.classList.add('login-dialog');
            document.body.appendChild(dialog);

            dialog.insertAdjacentHTML('beforeEnd', Login.template());

            setTimeout(() => {
                let dialogs = document.body.querySelectorAll('.login-dialog');
                let dialog = dialogs[dialogs.length - 1];
                dialog.classList.add('active');
                Buttons.initForms(dialog.querySelectorAll('form'));
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
        document.querySelector('.content').classList.remove('moved');

        Content.clean();

        Users.clean();

        Conversations.lastConversation.clean();

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
            let valid = Login.values.username();
            let section = document.querySelector('input[name=username]').offsetParent;
            let error = section.classList.contains('error');

            if (!valid && !error) {
                section.classList.add('error');
            }

            if (valid && error) {
                section.classList.remove('error');
            }

            return valid;
        },
        password: () => {
            let valid = Login.values.password();
            let section = document.querySelector('input[name=password]').offsetParent;
            let error = section.classList.contains('error');

            if (!valid && !error) {
                section.classList.add('error');
            }

            if (valid && error) {
                section.classList.remove('error');
            }

            return valid;
        }
    }
};

let Content = {
    clean: () => {
        let content = document.querySelector('.content');
        content.classList.remove('dialog');
        content.innerHTML = '';

        let dialogs = document.querySelectorAll('body > section');

        for (let i = 0; i < dialogs.length; i++) {
            dialogs[i].classList.remove('active');
            // dialogs[i].style.zIndex = 10000;
            // setTimeout(() => {
            document.body.removeChild(dialogs[i]);
            // }, 300);
        }
    }
};

Users.init();