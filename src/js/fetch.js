var Fetch = {
    processFetchStatus: (response) => {
        if (response.status === 200) {
            return Promise.resolve(response);
        } else if (response.status === 403) {
            Login.dialog.add();
        } else {
            return Promise.reject(response);
        }
    }
};