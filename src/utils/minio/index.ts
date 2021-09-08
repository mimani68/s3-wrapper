import { Client } from "minio";

import { config                   } from "src/config/app-config";
import { log, color, LoggingLevel } from "src/utils/log";

/**
 *
 * @var
 */
let con: Client;

/**
 *
 * @version 1.0.0
 * @return minioClient
 * @function
 */
export function minioClient (): Client {
    if ( config.MINIO.enable ) {
        if ( !con ) {
            con = new Client({
                endPoint:  config.MINIO.endPoint,
                useSSL:    config.MINIO.useSSL,
                port:      config.MINIO.port,
                accessKey: config.MINIO.accessKey,
                secretKey: config.MINIO.secretKey
            });
            setTimeout(() => {
                log(LoggingLevel.Info, 'module ' + color.greenBright('minio') + ' started');
            }, config.DELAY_SHOW_MODULE_LODING_MESSAGE);
        }
        return con
    } else {
        process.exit(1) 
    }
}
