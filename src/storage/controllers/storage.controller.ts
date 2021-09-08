import { Post, Body, Get, Query, Param,
  Response, Controller, HttpStatus,
  UseInterceptors, UsePipes, ValidationPipe, UploadedFiles, Request,
} from '@nestjs/common'
import { Response as ExpressResponse } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiConsumes,
  ApiQuery,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
  ApiPayloadTooLargeResponse,
  ApiUnsupportedMediaTypeResponse,
  ApiBody,
} from '@nestjs/swagger'
import { extension } from 'mime-types'
import { isEmpty, unset } from 'lodash'
import { Readable } from 'stream'

import { config                } from 'src/config/app-config'
import { LoggingLevel, log     } from 'src/utils/log'
import { BucketManagersService } from 'src/storage/services/bucket-managers.service'
import { FileManagerService    } from 'src/storage/services/file-manager.service'
import { FileScaningService    } from 'src/storage/services/file-scaning.service'
import { toKiloByte            } from 'src/utils/dimention_convertor'
import { ImageProcessor, ImageOperation } from 'src/utils/image'
import { ImageDeliveryDto,
  InternalOperationDto, OperationResponseDto,
  UploadNewFileRequestDto  } from 'src/storage/dtos'


@ApiTags('file')
// @ApiUnauthorizedResponse({ description: 'unauthorized' })
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller('file')
export class StorageController {
  
  constructor(
    private readonly _fileManagerService: FileManagerService,
    private readonly _bucketManagersService: BucketManagersService,
    private readonly _fileScaning: FileScaningService
    ) {}

    @ApiOperation({
      summary: 'Get file statistic',
      description: '',
    })
    @ApiParam({ name: 'file_name', type: 'string' })
    @Get('/stat/*/:file_name')
    async getFileStatistics(
      @Param('file_name'  ) file_name: string,
      @Response() res: ExpressResponse,
      @Request()  req: any
    ) {
      if ( !file_name ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'No file selected!'))
      }
      let bucket_name = config.MINIO.main_bucket_title
      let filePath = req.params[0] + '/' + file_name
      return await this._fileManagerService.getFileStat(bucket_name, filePath)
        .then( (o: InternalOperationDto) => {
          if ( !o.success ) return Promise.reject( o.data )
          return res.status(HttpStatus.OK)
            .json(new OperationResponseDto(HttpStatus.OK, true, 'File statistics is ready', o.data))
        })
        .catch( error => {
          log( LoggingLevel.Error, 'Getting file statistics failed!', error)
          return res.status(HttpStatus.NOT_FOUND)
            .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'Getting file statistics failed!', error))
        })
    }

    @ApiOperation({
      summary: 'Get single file',
      description: '',
    })
    @ApiParam({ name: 'file_name', type: 'string' })
    // @UseGuards(IsGuestUserGuard)
    @Get('/*/:file_name')
    async getFile(
      @Param('file_name'  ) file_name: string,
      @Query('start'      ) start: number,
      @Query('end'        ) end: number,
      @Response() res: ExpressResponse,
      @Request()  req: any
    ) {
      if ( !file_name ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Invalid file format'))
      }
      let bucket_name = config.MINIO.main_bucket_title
      let filePath = req.params[0] + '/' + file_name
      if ( !start && !end ) {
        return await this._fileManagerService.getFile(bucket_name, filePath)
          .then( (o: any) => {
            res.contentType(o['headers']['content-type'])
            res.setHeader('Content-Length', o['headers']['content-length'])
            res.status(200)
            return res.end(o.file)
          })
          .catch( error => {
            log( LoggingLevel.Error, 'File not found', error)
            return res.status(HttpStatus.NOT_FOUND)
              .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'File not found'))
          })
      } else {
        this._fileManagerService.getStreamFileByteRange(bucket_name, filePath, start, end)
          .then( (o: Readable) => {
            // 
            // Refrence: https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
            // 
            // FIXME: update `416 Range Not Satisfiable`
            res.setHeader('Accept-Ranges', 'bytes')
            res.setHeader('Content-Type',  'application/octet-stream')
            res.setHeader('Content-Range', `bytes ${ start }-${ end }/*`)
            res.status(HttpStatus.PARTIAL_CONTENT)
            o.pipe(res)
          })
          .catch( error => {
            log( LoggingLevel.Error, 'File not found', error)
            return res.status(HttpStatus.NOT_FOUND)
              .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'File not found'))
          })
      }
    }

    @ApiOperation({
      summary: 'Upload file',
      description: '',
    })
    @ApiCreatedResponse({ type: OperationResponseDto })
    @ApiBadRequestResponse({ type: OperationResponseDto })
    @ApiUnauthorizedResponse({ type: OperationResponseDto })
    @ApiForbiddenResponse({ type: OperationResponseDto })
    @ApiPayloadTooLargeResponse({ type: OperationResponseDto })
    @ApiUnsupportedMediaTypeResponse({ type: OperationResponseDto })
    @ApiTooManyRequestsResponse({ type: OperationResponseDto })
    @ApiQuery({ name: 'width', required: false })
    @ApiQuery({ name: 'thm_width', required: false })
    @ApiQuery({ name: 'format', required: false })
    @ApiQuery({ name: 'compress', required: false })
    @ApiQuery({ name: 'operation', required: false })
    @ApiQuery({ name: 'param', required: false })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadNewFileRequestDto })
    @UseInterceptors(FilesInterceptor('file', 1))
    // @UseGuards(IsUserGuard)
    @UsePipes(ValidationPipe)
    @Post('/')
    async uploadFiles(
      @Body()             dto: UploadNewFileRequestDto,
      @UploadedFiles()    file,
      @Response()         res: ExpressResponse,
      @Query('width')     width: number,
      @Query('thm_width') thm_width: number,
      @Query('format')    format: string,
      @Query('compress')  compress: boolean = false,
      @Query('operation') operation: ImageOperation,
      @Query('onlyRoot')  onlyRoot: boolean,
      @Query('param')     param: any,
    ): Promise<any> { 
      if ( dto.bucket ) {
        let { success } = await this._bucketManagersService.bucketFilesList(dto.bucket, '', {
          exclude: null,
          onlyRoot,
          showFiles: false
        })
        if ( !success ) {
          return res.status(HttpStatus.NOT_FOUND)
            .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'This bucket dose not exists.'))
        }
      } else {
        dto.bucket = config.MINIO.main_bucket_title
      }
      if ( isEmpty(file) ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Attachement is empty'))
      } 
      file = file[0] 
      let result = new ImageDeliveryDto()
      result.original_filename = file.originalname,
      result.name              = '',
      result.size              = toKiloByte(+file.size),
      result.file_url          = '',
      result.thumbnail_url     = '',
      result.type              = file.mimetype,
      result.status            = 'waiting'

      // Acceptable file format
      if ( !this._fileManagerService.isFileFormatAcceptable(file.mimetype) ) {
        log(LoggingLevel.Error, 'Illegal format in file ' + file.originalname )
        unset(result, 'status')
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Illegal format', result))
      }

      // Legal file size
      if ( !this._fileManagerService.isFileSizeAcceptable(extension(file.mimetype).toString(), +file.size) ) {
        log(LoggingLevel.Error, 'Illegal file size in ' + file.originalname + ' size:' + +file.size )
        unset(result, 'status')
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Illegal size', result))
      }

      // TODO: uncompress incoming file
      // if (  ) {
      //   file = this._fileManagerService.uncompressFile(file.buffer, 'gz')
      // }
      
      // Convert image file
      if ( ImageProcessor.isImageFile(extension(file.mimetype).toString()) &&  format ) {
        file = await ImageProcessor.convertFormat(file, format)
        result.type = extension(file.mimetype).toString()
        result.size = toKiloByte(+file.size)
      }

      // Image operations
      if ( ImageProcessor.isImageFile(extension(file.mimetype).toString()) && operation ) {
        operation === ImageOperation.resize ? param = +width : null
        file.buffer = await ImageProcessor.manipulation(file.buffer, operation, param)
      }

      // Color operations
      if ( ImageProcessor.isImageFile(extension(file.mimetype).toString()) && operation ) {
        operation === ImageOperation.resize ? param = +width : null
        file.buffer = await ImageProcessor.color(file.buffer, operation, param)
      }

      //  Check safty
      if ( this._fileScaning.isFileSafe(file) ) {
        // check prefix
        dto.prefix.search(/.*[\/]+$/ig) === -1 ? dto.prefix += '/' : null
        await this._fileManagerService.uploadFile(dto.bucket, file, {
          width: +thm_width,
          path:  dto.prefix
        })
          .then( (o: InternalOperationDto) => {
            if ( !o.success ) 
              return Promise.reject(o)
            result.status   = 'uploaded'
            result.name     = o.data['orginal']
            if ( dto.prefix ) {
              result.file_url = config.url + '/' + dto.prefix + o.data['orginal']
              result.thumbnail_url = config.url + '/' + dto.prefix + o.data['thumbnail']
            } else {
              result.file_url = config.url + '/' + o.data['orginal']
              result.thumbnail_url = config.url + '/' + o.data['thumbnail']
            }
            if ( !o.data['thumbnail']  ) {
              unset(result, 'thumbnail_url')
            }
            return res.status(HttpStatus.CREATED)
              .json(new OperationResponseDto(HttpStatus.CREATED, true, 'File uploaded completely.', result))
          })
          .catch( error => {
            log( LoggingLevel.Error, 'Unable upload file.', error)
            if ( error.message ) {
              result.status = error.message
              return res.status(HttpStatus.BAD_REQUEST)
                .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Unable upload file.', result))
            } else {
              result.status = 'upload failed'
              return res.status(HttpStatus.BAD_REQUEST)
                .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Unable upload file.', result))
            }
          })
      } else {
        result.status = 'harmful file' 
        log(LoggingLevel.Error, 'Harmful file ' + file.originalname )
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false,  'harmful file', result))
      }
    }

}
