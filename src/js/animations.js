let buttons = document.getElementsByClassName('button');

for (var i = 0; i < buttons.length; i++) {
    let button = buttons[i];

    button.addEventListener('mousedown', () => {
        button.classList.add('clicked');
    });

    button.addEventListener('mouseup', () => {
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 300)

    });
}


