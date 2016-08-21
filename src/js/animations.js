let buttons = document.getElementsByClassName('button');

for (var i = 0; i < buttons.length; i++) {
    let button = buttons[i];

    button.addEventListener('mousedown', () => {
        button.classList.add('clicked');
    });

    button.addEventListener('mouseup', () => {
        button.classList.remove('clicked')
    });
}


