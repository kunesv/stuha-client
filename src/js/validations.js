let Validations = {
    ERROR_CLASS_NAME: 'error',

    refresh: (section, valid, template) => {
        let error = section.classList.contains(Validations.ERROR_CLASS_NAME);

        if (!valid && !error) {
            section.classList.add(Validations.ERROR_CLASS_NAME);
            section.insertAdjacentHTML('beforeend', template);
        }

        if (!valid && error) {
            section.classList.remove(Validations.ERROR_CLASS_NAME);
            setTimeout(() => section.classList.add(Validations.ERROR_CLASS_NAME), 100);
        }

        if (valid && error) {
            section.classList.remove(Validations.ERROR_CLASS_NAME);
            section.removeChild(section.querySelector('.' + Validations.ERROR_CLASS_NAME));
        }
    }
};