let Users = {
    currentUser: {
        userId: 2,
        userName: 'Houba',
        icons: [{path: '2_1'}, {path: '2_2'}, {path: '2_3'}, {path: '2_4'}]
    },
    init: () => {
        let signedIn = localStorage.getItem('signedIn');
        Users.currentUser.userName = localStorage.getItem('userName');

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
    <section id="login">   
         <form data-click="Login.submit">
            <section>
                <p><label>Přihlašovací jméno</label><span><input name="username" type="text" autocomplete="off"/></span></p>
                <p><label>Heslo</label><span><input name="password" type="password"/></span></p>
            </section>
            <p><button type="submit"><span class="progress">...</span></button></p>           
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

        if (!button.classList.contains('progress')) {
            if (!Login.validations.all()) {
                return;
            }

            button.classList.add('progress');
            setTimeout(() => {
                Users.currentUser.userName = form.querySelector('input[name=username]').value;

                localStorage.setItem('signedIn', 'true');
                localStorage.setItem('userName', Users.currentUser.userName);

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

                localStorage.removeItem('signedIn');
                localStorage.removeItem('userName');

                Login.init();
            }, 300);
        }
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


