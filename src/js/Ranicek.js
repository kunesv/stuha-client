const Ranicek = {
    dialog: {
        show: (button) => {
            document.querySelector('.ranicek-dialog').classList.add('active');
        },
        hide: () => {
            document.querySelector('.ranicek-dialog').classList.remove('active');
        }
    }
};