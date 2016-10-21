var Images = {
    thumbnail: (src) => {
        return `<li data-src="${src}" style="background-image: url('${src}')"></li>`;
    },

    upload: (event, buttons) => {
        let fileList = event.target.files;
        if (!fileList.length) {
            // Notify user!
            return;
        }

        let template = `<ul class="thumbnails"></ul>`;
        buttons.insertAdjacentHTML('beforebegin', template);

        let thumbnails = document.querySelector('.message-dialog .thumbnails');

        for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i];

            thumbnails.insertAdjacentHTML('beforeend', Images.thumbnail(window.URL.createObjectURL(file)));
        }
    },

    values: () => {
        let images = document.querySelectorAll('.message-dialog .thumbnails li');
        let results = [];
        for (let i = 0; i < images.length; i++) {
            results.push(images[i].getAttribute('data-src'))
        }
        return results;
    }
};