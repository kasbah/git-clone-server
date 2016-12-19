module.exports = {
    //where the cloned repos are put
    SESSION_DIR           : './session-data',
    //maximum time spent on clone before cancelling (in milliseconds)
    MAX_CLONE_DURATION_MS : 30 * 1000,
    //maximum number of POST requests allowed to be sent per IP during window
    MAX_CLONES_PER_IP     : 10,
    //duration after which to clear countng of MAX_CLONES_PER_IP (in milliseconds)
    MAX_CLONES_WINDOW_MS  : 60 * 60 * 1000,
    //trust x-forward headers for IP limiting above (when behind trusted proxy, e.g.
    //Heroku or own Nginx setup)
    TRUST_PROXY           : true,
    //maximum time session is kept after last request (in milliseconds)
    SESSION_MAX_AGE_MS    : 60 * 60 * 1000,
    //domains allowed to make requests (other than the domain this is served on)
    ALLOWED_CORS_DOMAINS  : [/* 'https://example.com' */],
    //salt used for cookie-session hashing
    SESSION_SECRETS       : ['secret squirrel'],
}
