const ChangePassword = {

    submitForm: (form) => {
        let button = form.querySelector('button[type=submit]');
        ChangePassword.submit(button);
    },
    submit: (button) => {
        console.log(button)
        if (!button.classList.contains('progress') && !button.classList.contains('done')
            && ChangePassword.dialog.validations.validate()) {

            button.classList.remove('active');
            button.classList.remove('error');
            button.classList.add('progress');

            let changePasswordForm = new FormData(document.querySelector('.changePassword-dialog form'));

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
            document.body.insertAdjacentHTML('beforeEnd', ChangePasswordDialog.template());
            Buttons.init(document.querySelectorAll('.changePassword-dialog .button'));
            Buttons.initForms(document.querySelectorAll('.changePassword-dialog form'));
        },
        show: () => {
            let dialog = document.querySelector('.changePassword-dialog');
            if (!dialog) {
                ChangePassword.dialog.init();
            }

            document.querySelector('.changePassword-dialog').classList.add('active');
            document.querySelector('.content').classList.add('dialog');
        },
        hide: () => {
            document.querySelector('.changePassword-dialog').classList.remove('active');
            document.querySelector('.content').classList.remove('dialog');

            setTimeout(ChangePassword.dialog.validations.reset, 300);
        },
        reset: () => {

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