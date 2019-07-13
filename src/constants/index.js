export const APP_BASE_URL = process.env.NODE_ENV === 'development' ? '//localhost:3001' : '//cook.brennaswitzer.com'
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? '//localhost:8080' : '//cook.brennaswitzer.com'
export const LOCAL_STORAGE_ACCESS_TOKEN = 'accessToken'
export const LOCAL_STORAGE_PREFERENCES = "preferences"
export const SESSION_STORAGE_POST_LOGIN = "postLogin"

export const OAUTH2_REDIRECT_URI = APP_BASE_URL + '/oauth2/redirect'
export const GOOGLE_AUTH_URL = API_BASE_URL + '/oauth2/authorize/google?redirect_uri=' + OAUTH2_REDIRECT_URI
