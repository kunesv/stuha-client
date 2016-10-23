var Images = {
    thumbnail: (src, thumbnailSrc) => {
        return `<li data-src="${src}" style="background-image: url('${thumbnailSrc}')"></li>`;
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


            var reader = new FileReader();
            reader.onload = (event) => {
                var img = new Image();
                img.onload = function () {
                    let thumbnailCanvas = document.createElement('canvas');
                    let thumbnailCtx = thumbnailCanvas.getContext('2d');
                    let thumbnailDimensions = Images.newdimensions(img.width, img.height, 240);
                    thumbnailCanvas.width = thumbnailDimensions.width;
                    thumbnailCanvas.height = thumbnailDimensions.height;
                    thumbnailCtx.drawImage(img, 0, 0, thumbnailDimensions.width, thumbnailDimensions.height);

                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    let dimensions = Images.newdimensions(img.width, img.height, 1200);
                    canvas.width = dimensions.width;
                    canvas.height = dimensions.height;
                    ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

                    thumbnails.insertAdjacentHTML('beforeend', Images.thumbnail(canvas.toDataURL(), thumbnailCanvas.toDataURL()));

                    Messages.message.dialog.validations.content();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    newdimensions: (width, height, max) => {
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

    values: () => {
        let images = document.querySelectorAll('.message-dialog .thumbnails li');
        let results = [];
        for (let i = 0; i < images.length; i++) {
            results.push({url: images[i].getAttribute('data-src')});
        }
        return results;
    }
};