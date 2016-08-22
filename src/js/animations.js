let buttons = document.getElementsByClassName('button');

for (var i = 0; i < buttons.length; i++) {
    let button = buttons[i];

    button.addEventListener('click', () => {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked')
        }, 300)
    });
}


