export const APP_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://gobrennas.com";
export const API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://api.gobrennas.com";
export const API_IS_SECURE = API_BASE_URL.indexOf("https:") === 0;
export const COOKIE_AUTH_TOKEN = "FTOKEN";
export const LOCAL_STORAGE_ACCESS_TOKEN = "accessToken";
export const LOCAL_STORAGE_PREFERENCES = "preferences";
export const SESSION_STORAGE_POST_LOGIN = "postLogin";

export const MAX_UPLOAD_BYTES = 1048576;

export const OAUTH2_REDIRECT_URI = APP_BASE_URL + "/post-oauth2/redirect";
export const GOOGLE_AUTH_URL = API_BASE_URL + "/oauth2/authorize/google?redirect_uri=" + OAUTH2_REDIRECT_URI;
