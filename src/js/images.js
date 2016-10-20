var Images = {
    thumbnail: (src) => {
        return `<li style="background-image: url('${src}')"></li>`;
    },

    upload: (event, buttons) => {
        let fileList = event.target.files;
        if(!fileList.length){
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
    }
};