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

export function withToken(url, token) {
    return fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(resp => {
            if (resp.status === 401 || resp.status === 403) {
                return {status: resp.status,
                        error: 'Unauthorized'}
            } else {
                return resp.json()
            }
        });
}

