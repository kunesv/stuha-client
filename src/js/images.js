var Images = {

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

            thumbnails.insertAdjacentHTML('beforeend', `<li id="thumb${i}" class="placeholder"></li>`);

            let file = fileList[i];
            setTimeout(() => {
                var reader = new FileReader();
                reader.onload = (event) => {
                    var img = new Image();
                    img.onload = function () {


                        let canvas = Images.resizeImage(img, 1200);
                        let thumbnailCanvas = Images.resizeImage(img, 240);

                        let thumbnail = thumbnails.querySelector('.placeholder#thumb' + i);
                        thumbnail.style.backgroundImage = `url(${thumbnailCanvas.toDataURL()})`;
                        thumbnail.classList.remove('placeholder');

                        // Load canvas Image

                        // Images.values.push({name: file.name, file: canvas.toDataURL(), thumbnail: thumbnailCanvas.toDataURL()});

                        Messages.message.dialog.validations.all();


                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }, 100);
        }

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

    values: []
};