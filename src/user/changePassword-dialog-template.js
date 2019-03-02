const changePasswordDialogTemplate = () => {

    return `<form data-click="ChangePassword.submitForm" class="vertical">
        <div>
            <label for="password">Současné heslo</label>
            <p><input id="password" name="password" type="password"/></p>                
            <p>
                <span class="error">Sem přijde současné heslo.</span>
            </p>
        </div>
        <div>
            <label>Nové heslo</label>
            <p><input name="newPassword" type="password"/></p>                
            <p>
                <span class="error">Tu vložit nové heslo.</span>
            </p>
        </div>
        <div>
            <p><button type="submit"></button></p>
        </div>         
    </form>
`;

};