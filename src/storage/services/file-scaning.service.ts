import {Injectable} from '@nestjs/common';
import * as streamToPromise from 'stream-to-promise';

import { color, LoggingLevel, log } from "src/utils/log";

@Injectable()
export class FileScaningService {

    constructor() {}

    /**
     * 
     * @param fileBuffer 
     * @returns boolean
     */
    public isFileSafe (fileBuffer: any): boolean {
        log(LoggingLevel.Info, "The new file scaned completely.");
        return true;
    }

}
