export const APP_BASE_URL = window.location.origin;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_IS_SECURE = API_BASE_URL.indexOf("https:") === 0;
export const COOKIE_AUTH_TOKEN = "FTOKEN";
export const LOCAL_STORAGE_ACCESS_TOKEN = "accessToken";
export const LOCAL_STORAGE_PREFERENCES = "preferences";
export const SESSION_STORAGE_POST_LOGIN = "postLogin";

export const MAX_UPLOAD_BYTES = 1024 * 1024;

const OAUTH2_REDIRECT_URI = APP_BASE_URL + "/post-oauth2/redirect";
export const GOOGLE_AUTH_URL =
    API_BASE_URL +
    "/oauth2/authorize/google?redirect_uri=" +
    OAUTH2_REDIRECT_URI;
