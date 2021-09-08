import { Injectable } from "@nestjs/common";
import { Client } from "minio";
import { log, LoggingLevel } from "./utils/log";

import { minioClient } from "./utils/minio";

@Injectable()
export class AppService {

    private minio: Client;

    constructor() {
        this.minio = minioClient()
    }

    /**
     * @returns string
     */
    ping(): string {
        return "pong"
    }
    
    /**
     * @returns Promise
     */
    async aliveness(): Promise<boolean> {
        return await this.minio.listBuckets()
            .then( _ => {
                log( LoggingLevel.Info, 'The instance of minio is online.')
                return true;
            })
            .catch( error => {
                log( LoggingLevel.Error, error.message)
                return false
            })
    }
}
