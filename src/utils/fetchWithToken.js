export async function fetchWithToken(input, init={}) {
    const token = sessionStorage.getItem('token');

    const BASEURL = 'https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev';

    let authRequest;
    try {
        if (input instanceof Request) {
            if (input.url === 'undefined') { throw new Error('Request url is not defined'); }
            authRequest = new Request(input.url, {
                ...input,
                headers: new Headers({
                    ...Object.fromEntries(input.headers),
                    'Authorization': 'Bearer ' + token
                })
            });

        } else {
            if (input === 'undefined') { throw new Error('Request url is not defined'); }
            const url = BASEURL + input;
            init.headers = new Headers(init.headers || {});
            init.headers.set('Authorization', 'Bearer ' + token);
            authRequest = new Request(url, init);
        }
        const response = await fetch(authRequest);
        if (!response.ok) {
            const data = await response.json();
            if (response.status == 401) {
                if (data.message == "Unauthorized") {
                    window.location.href = '/signin';
                    return null;
                } else if (data.message == "Account not verified") {
                    window.location.href = '/email-verification';
                    return null;
                }
            }

            if (response.statusText == "Unauthorized") {
                window.location.href = '/signin';
                return null;
            } else if (response.statusText == "Account not verified") {
                window.location.href = '/email-verification';
                return null;
            }

            throw new Error("No matching response:", data.message);
        }
        return response;
    } catch (error) {
        console.error("Error while fetching api: " + error.message);
        console.error("Request url: " + authRequest.url);
        throw new Error("End of fetchWithToken");
    }
}