/**
 * 
 * All system configuration present here
 * 
 * @constant
 */
export const config = {

    PORT: process.env.PORT || 3000,
    
    WAIT_UNTIL_DB_BEING_REACHABLE: 120000,
    APPLICATION_GLOBAL_PREFIX: process.env.APP_PREFIX,

    DELAY_SHOW_MODULE_LODING_MESSAGE: 1000,

    VALID_FORMATS: process.env.VALID_FORMATS,

    url: process.env.DELIVERY_BASE_URL,

    SECRET: process.env.SECRET || 'HeL@W$xDD',
    TOKEN_EXPIRE_IN: '3w',
    AUTH_METHOD: process.env.AUTH_METHOD || 'public',

    IMAGE:{
        thumbnail:{
            quility: process.env.THUMBNAIL_IMAGE_QUILITY || 80,
            width:   process.env.THUMBNAIL_WIDTH || 300,
        }
    },

    SWAGGER: {
        enable:  process.env.SWAGGER_ENABLE === 'true',
        urlPath: process.env.SWAGGER_PATH || 'docs'
    },

    SENTRY: {
        enable:      process.env.SENTRY_ENABLE === 'true',
        url:         process.env.SENTRY_URL,
        sample_rate: 1.0
    },

    MINIO: {
        enable:      process.env.MINIO_ENABLE === 'true',
        endPoint:    process.env.MINIO_ENDPOINT,
        useSSL:      process.env.MINIO_HAS_SSL === 'true',
        port:        +process.env.MINIO_PORT,
        accessKey:   process.env.MINIO_ACCESS_KEY,
        secretKey:   process.env.MINIO_SECRET_KEY,
        setup_delay: 5000,
        main_bucket_title: process.env.MAIN_BUCKET_TITLE || 'example'
    },

    APM: {
        enable:      process.env.APM_ENABLE === 'true',
        serviceName: process.env.APM_SERVICE_NAME,
        secretToken: process.env.APM_SECRET_TOKEN,
        apiKey:      process.env.APM_API_KEY,
        serverUrl:   process.env.APM_SERVICE_URL
    },

    SLACK: {
        enable:    process.env.SLACK_ENABLE === 'true',
        secret:    process.env.SLACK_SIGNING_SECRET,
        bot_token: process.env.SLACK_BOT_TOKEN,
        bot_port:  process.env.SLACK_BOT_PORT || 3014
    },

    validFormat: function() {
        return this.VALID_FORMATS.split(',')
    }
}

/**
 * 
 * @description All number is in byte
 */
export const fileFormatSize = {
    png  : 10000 * 1024,
    gif  : 10000 * 1024,
    jpeg : 10000 * 1024,
    jpg  : 10000 * 1024,
    tiff : 10000 * 1024,
    pdf  : 10000 * 1024,
    doc  : 10000 * 1024,
    docx : 10000 * 1024,
    mp4  : 10000000 * 1024,
    mp3  : 1000000 * 1024,
    mpeg  : 10000000 * 1024,
    mpga  : 10000000 * 1024
}

/**
 * 
 * @description External user ip for access whole system
 * 
 */
export const whiteList = [
    '127.0.0.1',
    '172.26.0.1',
]