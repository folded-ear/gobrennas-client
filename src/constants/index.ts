export const APP_BASE_URL = window.location.origin;
export const IS_BETA = APP_BASE_URL.includes("beta");
export const API_BASE_URL = import.meta.env.DEV
    ? "http://localhost:8080"
    : IS_BETA
    ? "https://beta.api.gobrennas.com"
    : "https://api.gobrennas.com";
export const API_IS_SECURE = API_BASE_URL.indexOf("https:") === 0;
export const COOKIE_AUTH_TOKEN = "FTOKEN";
export const LOCAL_STORAGE_ACCESS_TOKEN = "accessToken";
export const LOCAL_STORAGE_PREFERENCES = "preferences";
export const SESSION_STORAGE_POST_LOGIN = "postLogin";

export const MAX_UPLOAD_BYTES = 1024 * 1024;

export const OAUTH2_REDIRECT_URI = APP_BASE_URL + "/post-oauth2/redirect";
export const GOOGLE_AUTH_URL =
    API_BASE_URL +
    "/oauth2/authorize/google?redirect_uri=" +
    OAUTH2_REDIRECT_URI;
