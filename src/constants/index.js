export const APP_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'http://cook.brennaswitzer.com';
export const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'http://cook.brennaswitzer.com';
export const ACCESS_TOKEN = 'accessToken';

export const OAUTH2_REDIRECT_URI = APP_BASE_URL + '/oauth2/redirect';
export const GOOGLE_AUTH_URL = API_BASE_URL + '/oauth2/authorize/google?redirect_uri=' + OAUTH2_REDIRECT_URI;
