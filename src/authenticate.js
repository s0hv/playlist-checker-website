import Cookies from 'universal-cookie';

const cookies = new Cookies();

export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    return token;
}

export function getToken() {
    return cookies.get('token');
}

export function withToken(url, token, body, headers, method='GET') {
    console.log(url);
    return fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            ...headers
        },
        method: method,
        body: JSON.stringify(body)
    })
        .then(resp => {
            if (resp.status === 401 || resp.status === 403) {
                return {status: resp.status,
                        error: 'Unauthorized'}
            } else {
                return resp.json()
            }
        })
        .catch(err => { return {status: 500, error: 'Internal server error'} });
}

