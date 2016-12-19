module.exports = {
    //where the cloned repos are put
    SESSION_DIR                : './session-data',
    //maximum time spent on clone before cancelling (in milliseconds)
    MAX_CLONE_DURATION_MS      : 30 * 1000,
    //maximum number of POST requests allowed to be sent per IP per hour
    MAX_CLONES_PER_IP_PER_HOUR : 10,
    //maximum time session is kept after last request (in milliseconds)
    SESSION_MAX_AGE_MS         : 60 * 60 * 1000,
    //domains allowed to make requests (other than the domain this is served on)
    ALLOWED_CORS_DOMAINS       : [/* 'https://example.com' */],
    //salt used for cookie-session hashing
    SESSION_SECRETS            : ['secret squirrel'],
}
