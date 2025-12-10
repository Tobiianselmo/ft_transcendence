const getAPIBaseURL = (): string => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ('localhost')
    }
    return (`${hostname}`)
}

 
export const API_BASE_URL = '/api';

 