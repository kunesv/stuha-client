let buttons = document.getElementsByClassName('button');

initButtons(buttons);

function initButtons(buttons) {
    for (var i = 0; i < buttons.length; i++) {
        let button = buttons[i];

        button.addEventListener('mousedown', () => {
            button.classList.add('clicked');
        });

        button.addEventListener('mouseup', () => {
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');

                if (button.hasAttribute('data-action')) {

                    window[button.getAttribute('data-action')](button)

                }
            }, 300)

        });

        // button.addEventListener('mouseleave', () => {
        //     button.classList.remove('clicked');
        // });
    }


}