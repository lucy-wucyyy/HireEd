const BASE_URL = "http://localhost:3000";

const handle = async (res: Response) => {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
    }
    return res.json();
};

export const apiSignUp = (body: any) =>
    fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    }).then(handle);

export const apiSignIn = (body: any) =>
    fetch(`${BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    }).then(handle);

export const apiMe = () =>
    fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
    }).then(handle);

export const apiSignOut = () =>
    fetch(`${BASE_URL}/auth/signout`, {
        method: "POST",
        credentials: "include",
    }).then(handle);
