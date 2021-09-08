import { Injectable } from '@nestjs/common'
import { Readable   } from 'stream'
import { Client     } from "minio"
import * as streamToPromise from 'stream-to-promise'
import * as uniqid from 'uniqid'
import { isEmpty, unset           } from 'lodash'
import { v4 as uuidv4      } from 'uuid'
import { lookup, extension } from 'mime-types'

import { minioClient              } from "src/utils/minio"
import { color, LoggingLevel, log } from "src/utils/log"
import { InternalOperationDto     } from "src/storage/dtos"
import { config , fileFormatSize  } from 'src/config/app-config'
import { ImageProcessor           } from 'src/utils/image'
import { toKiloByte               } from 'src/utils/dimention_convertor'

@Injectable()
export class FileManagerService {

    private minio: Client

    constructor() {
        this.minio = minioClient()
    }

    /**
     * Get file 
     * @param {string} bucketName
     * @param {string} filePath
     * @returns
     */
    async getFile (bucketName: string, filePath: string) {
        return await this.minio.getObject(bucketName, filePath)
            .then(async (done) => {
                let fileBuffer = await streamToPromise(done)
                let result     = {}
                result['file'] = Buffer.from(fileBuffer, 'base64')
                result['headers']                 = done['headers']
                result['headers']['content-type'] = lookup(filePath)
                let msg = `Get file content-type:"${ color.redBright(result['headers']['content-type']) }" and length:"${ color.redBright(Math.round(+result['headers']['content-length']/1024)) } kb"`
                log(LoggingLevel.Info, msg, filePath) 
                return result
            })
            .catch((err) => {
                log(LoggingLevel.Error, err)
                return { message: 'Download Failed!' }
            })
    }

    
    /**
     * Get file statistic
     * @param {string} bucketName
     * @param {string} filePath 
     * @returns
     */
    async getFileStat (bucketName: string, filePath: string) {
        return await this.minio.statObject(bucketName, filePath)
            .then(async (done: any) => {
                done.size = toKiloByte(done.size)
                done.type = lookup(filePath)
                unset(done, 'metaData')
                return new InternalOperationDto(true, done)
            })
            .catch((err) => {
                log(LoggingLevel.Error, err)
                return new InternalOperationDto(false, err, 'Fetch file statistc failed!')
            })
    }

    /**
     * @param  {string} bucketName
     * @param  {string} filePath
     * @param  {number} startRange
     * @param  {number} endRange
     * @returns Promise
     */
    async getStreamFileByteRange (bucketName: string, filePath: string, startRange: number, endRange: number): Promise<Readable> {
        let length = Math.round(endRange - startRange);
        let offset = Math.round(startRange / length);
        if ( length < 0 ) length = 1000
        if ( offset < 0 ) length = 0
        log( LoggingLevel.Info, `Request stream file ${ filePath } in range ${ startRange }-${ endRange }, total byte: ${ endRange-startRange }`)
        return await this.minio.getPartialObject(bucketName, filePath, offset, length);
    }

    /**
     *
     * @param bucketName
     * @param objectName
     * @param expiry
     */
    public async getObjectByTemporaryLink(bucketName: string, objectName: string, expiry: number) {
        if ( !expiry ) expiry = 7 * 24 * 60 * 60
        return await this.minio.presignedGetObject(bucketName, objectName, expiry)
    }

    /**
     *
     * @param bucketTitle
     * @param directory
     */
    public async getFileMetadata (bucketTitle: string, directory: string) {
        const filePath = this.pathGenerator(bucketTitle, directory)
        return await this.minio.statObject(bucketTitle, filePath)
       // if (stat && stat.metaData) {
       //      return {
       //        filename: Buffer.from(stat.metaData['file-name'], 'base64').toString('utf8'),
       //        contentType: stat.metaData['content-type'],
       //      }
       //    }
    }

    /**
     * 
     * upload new file to storage engine
     * 
     * @param bucketTitle
     * @param file
     * 
     */
    public async uploadFile(bucketTitle: string, file: any, options?: {
        width:  number,
        path:   string
    }): Promise<any> {
        //
        // TODO: check for creating bucket automatically
        //

        // upload orginal image
        let uuidName      = this.createNewName('uuid')
        const fileName    = file['originalname']
        const fileExt     = this.getExtension(fileName)
        const newFileName = uuidName + '.' + fileExt
        const pathOrginal = !isEmpty( options.path) ? options.path + newFileName : newFileName
        await this.putObject(bucketTitle , pathOrginal, file.buffer)

        // upload thumbnail image
        let thumbnailName;
        if ( ImageProcessor.isImageFile(extension(file.mimetype).toString()) ) {
            thumbnailName        = uuidName + '-thumbnail.' + fileExt
            let thumbnail        = await ImageProcessor.resizeImage(file.buffer, +options.width)
            const pathThumbnail  = !isEmpty( options.path) ? options.path + thumbnailName : thumbnailName
            await this.putObject(bucketTitle, pathThumbnail, thumbnail)
        }

        return new InternalOperationDto(true, {
            orginal: newFileName,
            thumbnail: thumbnailName || null
        })
    }

    /**
     * @param  {string} bucketTitle
     * @param  {string} file
     * @param  {string} destionation
     */
    public async duplicate(bucketTitle: string, file: string, destionation: string) {
        let fileExists: any = await this.getFile(bucketTitle, destionation)
        if ( fileExists.message !== 'Download Failed!' ) {
            log(LoggingLevel.Error, 'File ' + destionation + ' exists, therefor you can not duplicate by this name.')
            return false
        }
        return await this.minio.copyObject(bucketTitle, destionation, '/' + bucketTitle + '/' + file, null)
            .then(() => true)
            .catch( error => {
                log(LoggingLevel.Error, error)
                return false
            })
    }

    /**
     *
     * @param bucketTitle {string}
     * @param fileName {string}
     */
    async removeFile(bucketTitle: string, fileName: string){
        return await this.minio.removeObject(bucketTitle, fileName)
            .then(() => true)
            .catch( error => {
                log(LoggingLevel.Error, error)
                return false
            })
    }

    async removeMultipleFiles(bucketTitle: string, fileList: string[]){
        return await this.minio.removeObjects(bucketTitle, fileList)
            .then(() => true)
            .catch( error => {
                log(LoggingLevel.Error, error)
                return false
            })
    }

    /**
     * Get file extension from file name
     * @param {string} filename
     * @returns
     */
    private getExtension(filename: any) {
        return filename.split(".").pop()
    }

    /**
     * 
     * @param {string} fileFormat 
     * @returns boolean
     */
    public isFileFormatAcceptable(fileFormat: string): boolean {
        let a = config.validFormat()
        if ( a.includes(fileFormat) ) {
            return true
        } else {
            false
        }
    }

    /**
     * 
     * @param {string} fileExtention 
     * @param {number} fileSize 
     * @returns boolean
     */
    public isFileSizeAcceptable(fileExtention: string, fileSize: number): boolean {
        let extList = Object.keys(fileFormatSize)
        if ( !extList.includes(fileExtention) ) 
            return false
        if ( fileSize <= fileFormatSize[fileExtention] ) {
            return true
        }
        return false
    }

    /**
     * 
     * @param bucketTitle 
     * @param fileName 
     * @param fileBuffer 
     * @returns 
     */
    private async putObject(bucketTitle: string, fileName: string, fileBuffer: string) {
        return await this.minio.putObject(bucketTitle, fileName, fileBuffer)
            .then( (done: any) =>{
                log(LoggingLevel.Info, 'Successfully uploaded file!')
                return new InternalOperationDto(true, {
                    code: done,
                    name: fileName
                })
            })
            .catch(error=>{
                log(LoggingLevel.Error, 'Unsuccessfully upload file', error)
                return new InternalOperationDto(false, error)
            })
    }

    /**
     *
     * @param type
     */
    private createNewName(type: string) {
        if ( type == 'uuid' ) {
            return uuidv4()
        } else if ( type == 'unique' ) {
            return uniqid()
        } else {
            return 'example'
        }
    }

    /**
     *
     * @param bucketTitle
     * @param directory
     */
    private pathGenerator(bucketTitle: string, directory: string) {
        return`${directory}/${bucketTitle}`
    }
}
