var Images = {

    upload: (event) => {

        let fileList = event.target.files;

        if (!fileList.length) {
            // FIXME: Notify user?
            return;
        }

        let thumbnails = document.querySelector('.message-dialog .thumbnails');
        thumbnails.classList.add('active');

        for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i];

            Images.values.push({
                name: file.name
            });

            thumbnails.insertAdjacentHTML('beforeend', `<li id="thumb${i}" class="placeholder">
    <span class="close-button"><a class="button" data-click="Images.removeOne"></a></span>
</li>`);


            setTimeout(() => {
                let reader = new FileReader();
                reader.onload = (event) => {
                    let img = new Image();
                    img.onload = function () {

                        // let canvas = Images.resizeImage(img, 1200);
                        let thumbnailCanvas = Images.resizeImage(img, 240);

                        let thumbnail = thumbnails.querySelector('.placeholder#thumb' + i);
                        thumbnail.style.backgroundImage = `url(${thumbnailCanvas.toDataURL()})`;
                        thumbnail.classList.remove('placeholder');

                        // Load canvas Image

                        Messages.message.dialog.validations.all();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }, 100);
        }

        let imageForm = new FormData(document.querySelector('.message-dialog form#images'));
        imageForm.append('conversationId', Conversations.lastConversation.load().id);

        fetch('/api/image', {
            headers: Fetch.headers(),
            method: 'POST',
            body: imageForm
        }).then(Fetch.processFetchStatus).then((response) => {
            return response.json().then((images) => {
                images.forEach((image) => {
                    for (let i = 0; i < Images.values.length; i++) {
                        if (!Images.values[i].id && Images.values[i].name === image.name) {
                            Images.values[i].id = image.id;
                        }
                    }
                });
            });
        }).catch((response) => {
            // FIXME: Handle errors.
        });

        Buttons.init(thumbnails.querySelectorAll('.button'));
    },

    resizeImage: (image, max) => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dimensions = Images.newDimensions(image.width, image.height, max);
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
        return canvas;
    },

    newDimensions: (width, height, max) => {
        if (height > width) {
            if (height > max) {
                width = max / height * width;
                height = max;
            }
        } else {
            if (width > max) {
                height = max / width * height;
                width = max;
            }
        }

        return {'height': height, 'width': width};
    },

    removeAll: () => {
        while (Images.values.length) {
            Images.remove(0);
        }
        document.querySelector('.message-dialog #uploadImage').value = '';
    },

    remove: (i) => {
        let thumbnail = document.querySelectorAll('.message-dialog .thumbnails li')[i];
        thumbnail.parentNode.removeChild(thumbnail);

        Images.values.splice(i, 1);
    },

    removeOne: (button) => {
        console.log(button)
    },

    values: []
};