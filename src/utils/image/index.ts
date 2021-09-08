import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import { lookup } from 'mime-types'
import * as stp from 'stream-to-promise'

import { config } from 'src/config/app-config'

export enum ImageOperation {
    rotate        = 'rotate',
    flip          = 'flip',
    flop          = 'flop',
    negate        = 'negate',
    normalize     = 'normalise',
    resize        = 'resize',
    sharpen       = 'sharpen',
    tint          = 'tint',
    greyscale     = 'greyscale',
    toColourspace = 'toColourspace'
}

@Injectable()
export class ImageProcessor {

    constructor() {}

    /**
     * Resize Image
     * 
     * @param {Buffer} imageBuffer
     * @param {number} width
     * @returns
     */
    static async resizeImage (imageBuffer: Buffer, width: number): Promise<any> {
        // if ( +width < 10 || isEmpty(+width) )
        if ( !width )
            width = +config.IMAGE.thumbnail.width
        return await sharp(imageBuffer)
            .resize(width)
            .jpeg({
                quality: +config.IMAGE.thumbnail.quility,
            })
            .toBuffer()
    }

    /**
     * Thumbnail creation
     * 
     * @param {Buffer} imageBuffer 
     * @returns 
     */
    static async createThumbnail (imageBuffer: Buffer): Promise<any> {
        return imageBuffer
    }

    /**
     * Generate new format for image
     * 
     * @param {any} inputImage 
     * @param {string} format 
     * @returns 
     */
    static async convertFormat (inputImage: any, format: string): Promise<any> {
        let imageBuffer = sharp(inputImage.buffer)
        if ( format === 'png' ) {
            imageBuffer
                .toFormat('png')
                .toBuffer()
        } else if ( format === 'jpg' ) {
            imageBuffer
                .toFormat('jpg')
                .toBuffer()
        }
        inputImage.buffer       = await stp(imageBuffer)
        inputImage.mimetype     = lookup(format)
        inputImage.size         = Buffer.byteLength(inputImage.buffer)
        inputImage.originalname = inputImage.originalname.split(".")[0] + '.' + format
        return inputImage
    }

    /**
     * 
     * Operation on image
     * 
     * @param {Buffer} imageBuffer 
     * @param {ImageOperation} type 
     * @param {any} parameter 
     * @returns Promise<any>
     */
    static async manipulation (imageBuffer: Buffer, type: ImageOperation, parameter: any ): Promise<any> {
        const image = sharp(imageBuffer)
        if ( type == ImageOperation.rotate && Number.isInteger(+parameter) ) {
            image.rotate(+parameter).toBuffer()
        } else if ( type == ImageOperation.resize ) {
            image.resize(+parameter).toBuffer()
        } else if ( type == ImageOperation.flip ) {
            image.flip().toBuffer()
        } else if ( type == ImageOperation.flop ) {
            image.flop().toBuffer()            
        } else if ( type == ImageOperation.negate ) {
            image.negate().toBuffer()
        } else if ( type == ImageOperation.normalize ) {
            image.normalise().toBuffer()
        } else if ( type == ImageOperation.sharpen ) {
            image.sharpen().toBuffer()
        }
        return await stp(image)
    }

    /**
     * 
     * @param imageBuffer 
     * @param type 
     * @param parameter 
     * @returns 
     */
    static async color(imageBuffer: Buffer, type: ImageOperation, parameter: any ): Promise<any> {
        const image = sharp(imageBuffer)
        if ( type == ImageOperation.tint && parameter ) {
            image.tint(parameter)
        } else if ( type == ImageOperation.greyscale ) {
            image.grayscale()
        } else if ( type == ImageOperation.toColourspace && parameter ) {
            image.toColourspace(parameter)
        }
        return await stp(image)
    }

    /**
     * 
     * @param {string} fileExtention 
     * @returns boolean
     */
    static isImageFile(fileExtention: string): boolean {
        let extList = ['jpeg', 'jpg', 'png', 'gif', 'tiff', 'psd', 'eps']
        if ( extList.includes(fileExtention) )  {
            return true
        }
        return false
    }
}
