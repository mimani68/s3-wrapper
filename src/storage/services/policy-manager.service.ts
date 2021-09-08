import {Injectable} from '@nestjs/common';
import {Client} from "minio";

import { minioClient } from "src/utils/minio";

@Injectable()
export class PolicyManagerService {

    private minio: Client;

    constructor() {
        this.minio = minioClient();
    }

}
