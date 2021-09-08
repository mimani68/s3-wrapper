import { dirname } from 'path';
import { Injectable } from '@nestjs/common';
import { Client     } from "minio";
import { isEmpty, remove, unset      } from 'lodash';
import * as stp from 'stream-to-promise'

import { minioClient              } from "src/utils/minio";
import { color, LoggingLevel, log } from "src/utils/log";
import { InternalOperationDto     } from "src/storage/dtos";
import { toKiloByte               } from 'src/utils/dimention_convertor';
import { LogLevel } from '@slack/bolt';
import { lookup } from 'mime-types';

@Injectable()
export class BucketManagersService {

    private minio: Client;

    constructor() {
        this.minio = minioClient();
    }

    /**
     * Print list of buckets
     *
     */
    public async listBuckets() {
        return await this.minio.listBuckets()
    }

    /**
     * Get bucket statistic
     * @param {string} bucketName
     * @param {string} prefix
     * @returns
     */
    async bucketFilesList (bucketName: string, prefix: string, options: {
        exclude: string,
        onlyRoot: boolean,
        showFiles: boolean
    }) {
        let o = this.minio.listObjects(bucketName, '', true)
        return await stp(o)
            .then( (done: any[]) => {
                let temp = 0
                let result = {
                    count_file: 0,
                    totalSize: ''
                }
                done.forEach(el => {
                    el.file = el.name
                    el.type = lookup(el.name)
                    unset(el, 'name')
                })
                if ( options.showFiles ) {
                    result['files'] = done
                }
                // filter excluded path
                if ( !isEmpty(options) && !isEmpty(options.exclude) ) {
                    let excludePath = options.exclude.split(',')
                    for (let e of excludePath ) {
                        remove(done, el => {
                            var pattern = new RegExp("(\/" + e + "\/|" + e + "\/)", "ig");
                            return pattern.test(el.file)
                        })
                    }
                }
                // filter files in root path
                if ( !isEmpty(options) && !isEmpty(options.onlyRoot) && !isEmpty(prefix) ) {
                    remove(done, el => {
                        var pattern = new RegExp(prefix, "i");
                        if ( !isEmpty(el.file) )
                            return !pattern.test(el.file)
                        return !pattern.test(el)
                    })
                }
                // Calculate the size
                done.forEach(el => {
                    temp += el.size
                })
                result.count_file = done.length
                result['totalSize'] = toKiloByte(+temp)
                return new InternalOperationDto(true, result)
            })
            .catch((err) => {
                log(LoggingLevel.Error, err)
                return new InternalOperationDto(false, err, 'Fetch bucket statistc failed!')
            })
    }

    /**
     *
     * @param {string} bucketName
     */
    public async isBucketExists (bucketName: string) {
        return await this.minio.bucketExists(bucketName)
            .then( (isExists: boolean) => {
                return new InternalOperationDto(true, isExists)
            })
            .catch(error=>{
                return new InternalOperationDto(false, false)
            })
    };

    /**
     *
     * @param {string} bucketName
     */
    public async createBucket(bucketName: string) : Promise<InternalOperationDto> {
        let a = await this.isBucketExists(bucketName)
        if ( a.success && ! a.data ) {
            let e = await this.minio.makeBucket(bucketName, 'ir-central');
            await this.changeBucketPolicy(bucketName)
            return new InternalOperationDto(true,e)
        }
        return new InternalOperationDto(false,null)
    }

    /**
     * @param  {string} bucketName
     * @param  {string} newBucketName
     * @returns Promise
     */
    public async cloneBucket(bucketName: string, newBucketName: string) : Promise<InternalOperationDto> {
        let self = this
        let a = await this.isBucketExists(newBucketName)
        if ( a.success && ! a.data ) {
            let e = await this.minio.makeBucket(newBucketName, 'ir-central');
            await this.changeBucketPolicy(newBucketName)
            let objectStream = this.minio.listObjects(bucketName, '', true)
            objectStream.on('data', async (item)=>{
                await self.minio.copyObject(newBucketName, item.name, '/' + bucketName + '/' + item.name, null)
                // console.log(item)
            })
            return new InternalOperationDto(true,e)
        }
        return new InternalOperationDto(false,null)
    }

    /**
     * @param  {string} bucketName
     * @param  {string} oldPath
     * @param  {string} newPath
     * @returns Promise
     */
    public async clonePath(bucketName: string, oldPath: string, newPath: string) : Promise<InternalOperationDto> {
        let self = this
        let a = await this.isBucketExists(bucketName)
        if ( a.success ) {
            let objectStream = this.minio.listObjects(bucketName, oldPath, true)
            return await stp(objectStream)
                .then( async (data: any) => {
                    if ( data.length < 1 ) {
                        return new InternalOperationDto(false, null)
                    }
                    for ( let item of data ) {
                        let newFile = newPath + '/' + item.name.replace(oldPath, '')
                        await self.minio.copyObject(bucketName, newFile.replace(/\/{2,}/ig, '/'), '/' + bucketName + '/' + item.name, null)
                    }
                    return new InternalOperationDto(true, null)
                })
                .catch(err => {
                    log(LogLevel.ERROR, 'Problme cloning path')
                    return new InternalOperationDto(false, null)
                })
        }
        return new InternalOperationDto(false, null)
    }

    /**
     *
     * @param {string} bucketName
     */
    public async removeBucket(bucketName: string) {
        return await this.minio.removeBucket(bucketName)
            .then( done => {
                return true;
            })
            .catch(error => {
                log(LoggingLevel.Error, "Unable to remove " + color.yellow(bucketName) )
            })
    }

    /**
     *
     * @param {string} bucketName
     */
    // public async bucketFilesList(bucketName: string) {
    //     let o = this.minio.listObjects(bucketName, '', true)
    //     return await stp(o)
    //         .then( (done: any[]) => {
    //             return new InternalOperationDto(true, done)
    //         })
    //         .catch((err) => {
    //             log(LoggingLevel.Error, err)
    //             return new InternalOperationDto(false, err, 'Fetchign bucket list failed!')
    //         })
    // }

    /**
     *
     * @param {string} bucketName
     */
        public async pathFilesList(bucketName: string, path: string) {
            let o = this.minio.listObjects(bucketName, path, true)
            return await stp(o)
                .then( (done: any[]) => {
                    return new InternalOperationDto(true, done)
                })
                .catch((err) => {
                    log(LoggingLevel.Error, err)
                    return new InternalOperationDto(false, err, 'Fetchign bucket list failed!')
                })
        }

    /**
     *
     * @param {string} bucketName
     */
    public async changeBucketPolicy(bucketName: string): Promise<InternalOperationDto> {
        const policy: object = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicRead",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [`arn:aws:s3:::${bucketName}/*`]
                }
            ]
        };
        await this.minio.setBucketPolicy(bucketName, JSON.stringify(policy));
        return new InternalOperationDto(true,null)
    }

}
