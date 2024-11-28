export async function fetchWithToken(input, init = {}) {
    const token = sessionStorage.getItem("token"); // 인증 토큰 가져오기
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjaGxla2RsZjEyMzRAZ21haWwuY29tIiwiaWF0IjoxNzMyNjc4NDcyLCJleHAiOjE3NjQyMTQ0NzJ9.lsNRSfDRiZUZMi0ApNBb_guJk-NTAu-M4tETJkwAGNk";

    if (!token) {
        throw new Error("Token is missing");
    }

    init.headers = new Headers(init.headers || {});
    init.headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(input, init);
    if (!response.ok) {
        throw new Error(
            `Error while fetching API: ${response.status} ${response.statusText}`
        );
    }

    return response;
}
