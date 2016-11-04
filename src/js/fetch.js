var Fetch = {
    processFetchStatus: (response) => {
        if (response.ok && response.status === 200) {
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    }
};