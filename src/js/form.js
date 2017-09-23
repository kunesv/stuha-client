var Form = {
    checkbox: {
        initOne: (checkbox) => {
            if (checkbox.checked) {
                checkbox.parentNode.querySelector('.check-box').classList.add('active');
            }
            checkbox.addEventListener('change', (event) => event.target.parentNode.querySelector('.check-box').classList.toggle('active'));
        }
    }
};