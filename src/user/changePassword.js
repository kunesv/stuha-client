const ChangePassword = {

    submitForm: (form) => {
        let button = form.querySelector('button[type=submit]');
        ChangePassword.submit(button);
    },
    submit: (button) => {
        if (!button.classList.contains('progress') && !button.classList.contains('done')
            && ChangePassword.dialog.validations.validate()) {

            button.classList.remove('active');
            button.classList.remove('error');
            button.classList.add('progress');

            let changePasswordForm = new FormData(document.querySelector('.change-password form'));

            fetch('/api/changePassword', {
                headers: Fetch.headers(),
                method: 'POST',
                body: changePasswordForm
            }).then(Fetch.processFetchStatus).then((response) => {
                button.classList.remove('progress');
                button.classList.add('done');

                setTimeout(() => {
                    ChangePassword.dialog.hide();
                    setTimeout(() => {
                            ChangePassword.dialog.reset();
                            button.classList.remove('done');

                            Users.menu.hide();
                        }, 300
                    );
                }, 300);
            }).catch((response) => {
                button.classList.remove('progress');
                button.classList.add('error');
            });
        }
    },
    dialog: {
        init: () => {
            document.querySelector('.change-password').insertAdjacentHTML('beforeEnd', changePasswordDialogTemplate());

            // Buttons.init(document.querySelectorAll('.change-password form .button'));
            Buttons.initForms(document.querySelectorAll('.change-password form'));
        },
        toggle: () => {
            console.log('active',document.querySelector('.change-password').classList.contains('active'))
            if (document.querySelector('.change-password').classList.contains('active')) {
                ChangePassword.dialog.hide();
            } else {
                ChangePassword.dialog.show();
            }
        },
        show: () => {
            console.log('SHOW!')
            console.log('form',document.querySelector('.change-password form'))
            if (!document.querySelector('.change-password form')) {
                ChangePassword.dialog.init();
            }
            document.querySelector('.change-password').classList.add('active');
            document.querySelector('.change-password input').focus();
        },
        hide: () => {
            console.log('HIDE!')
            document.querySelector('.change-password').classList.remove('active');

            setTimeout(ChangePassword.dialog.reset, 300);
        },
        reset: () => {
            let inputs = document.querySelectorAll('.change-password input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = '';
            }
        },
        validations: {
            validate: () => {
                return true;
            },
            reset: () => {

            }
        }
    }
};