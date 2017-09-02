var Buttons = {
    CLICK: 'data-click',
    CLICKED_CLASSNAME: 'clicked',

    init: (btns) => {
        for (let i = 0; i < btns.length; i++) {
            let button = btns[i];

            button.addEventListener('mousedown', () => button.classList.add(Buttons.CLICKED_CLASSNAME));

            button.addEventListener('touchstart', () => button.classList.add(Buttons.CLICKED_CLASSNAME));

            button.addEventListener('click', (event) => Buttons.click(button, event));

            button.addEventListener('mouseleave', () => {
                button.classList.remove('clicked');
            });
            button.addEventListener('touchend', () => {
                button.classList.remove('clicked');
            });

            button.setAttribute('href', '#');
        }
    },

    initForms: (forms) => {
        for (let i = 0; i < forms.length; i++) {
            let form = forms[i];

            form.addEventListener('submit', (event) => {
                event.stopPropagation();
                event.preventDefault();
                Buttons.click(form, event)
            });
        }
    },

    click: (button, event) => {

        button.classList.remove(Buttons.CLICKED_CLASSNAME);

        if (button.hasAttribute(Buttons.CLICK)) {
            let functionName = button.getAttribute(Buttons.CLICK).split('.');
            if (functionName.length) {
                let fn = window;
                for (let i = 0; i < functionName.length; i++) {
                    fn = fn[functionName[i]];
                }
                fn(button);
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }

};