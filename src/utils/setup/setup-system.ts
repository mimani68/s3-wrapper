import { LogLevel } from "@slack/bolt";

import { log, LoggingLevel } from "src/utils/log";
import { BucketManagersService } from "src/storage/services/bucket-managers.service";

/**
 * @param  {string} mainBucketName
 * @param  {number=1000} delay
 */
export async function callSetupApiEndPoint(mainBucketName: string, delay: number = 1000) {
    setTimeout(async () => {
        if ( !mainBucketName ) {
            log(LogLevel.INFO, 'No bucket selected!')
        }
        let e = new BucketManagersService()
        await e.createBucket(mainBucketName)
            .then( (o) => { 
                log( LoggingLevel.Info, 'Setup server done.')
            })
            .catch( error => {
                log( LoggingLevel.Error, 'Setup server failed!', error)
            })
    }, delay);
}