const messageDialogTemplate = () => {

    return `<section class="overlay message-dialog">
    <header>
        <span class="close-button"><a class="secondary button" data-click="Messages.message.dialog.hide"></a></span>
    </header>
    <form enctype="multipart/form-data" id="images">
        <input type="file" id="uploadImage" name="images" multiple="multiple" accept="image/*"/>
    </form>
    <form id="message">       
        <section>           
            <textarea class="textarea" name="rough"></textarea>
            <ul class="thumbnails"></ul>
            <ul class="buttons">
                <li class="image secondary button">              
                    <label for="uploadImage"></label>                   
                </li>
                <!--<li class="gps button"></li>-->
            </ul>     
            <p>
                <span class="error">A co nějaký obsah?</span>
            </p>      
        </section>     
        <section>
            <p><span>A vybráním ikonky odešlu.</span></p>
            <ul class="icons"></ul>
            <p>
                <span class="error">Ještě vyberu ikonku.</span>
            </p>           
        </section>                
    </form>
</section>`;

};