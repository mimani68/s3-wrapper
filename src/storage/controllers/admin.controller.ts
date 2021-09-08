import { Post, Param, Response, Controller, HttpStatus, ValidationPipe, UsePipes, Body, Delete, Request } from '@nestjs/common'
import { Response as ExpressResponse } from 'express'
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
  ApiUnsupportedMediaTypeResponse,
  ApiBody,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger'

import { LoggingLevel, log     } from 'src/utils/log'
import { BucketManagersService } from 'src/storage/services/bucket-managers.service'
import { FileManagerService    } from 'src/storage/services/file-manager.service'
import { DeleteFileRequestDto, InternalOperationDto, OperationResponseDto } from 'src/storage/dtos'
import { DuplicateFileRequestDto } from '../dtos/duplicateFileRequest.dto'
import { config } from 'src/config/app-config'

@ApiTags('admin')
// @ApiUnauthorizedResponse({ description: 'unauthorized' })
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  
  constructor(
    private readonly _fileManagerService: FileManagerService,
    private readonly _bucketManagersService: BucketManagersService,
  ) {}

    @ApiOperation({
      summary: 'Clone bucket',
      description: '',
    })
    @ApiCreatedResponse({ type: OperationResponseDto })
    @ApiBadRequestResponse({ type: OperationResponseDto })
    @ApiUnauthorizedResponse({ type: OperationResponseDto })
    @ApiForbiddenResponse({ type: OperationResponseDto })
    @ApiUnsupportedMediaTypeResponse({ type: OperationResponseDto })
    @ApiTooManyRequestsResponse({ type: OperationResponseDto })
    // @UseGuards(IsAdminGuard)
    @Post([
      '/clone/bucket/:bucket_name/:new_bucket_name',
    ])
    async cloneBucket(
      @Param('new_bucket_name' ) new_bucket_name: string,
      @Param('bucket_name'     ) bucket_name: string,
      @Response() res: ExpressResponse
    ) {
      if ( !new_bucket_name ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'New Bucket must specified'))
      }
      if ( !bucket_name ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Bucket must specified'))
      }
      return await this._bucketManagersService.cloneBucket(bucket_name, new_bucket_name)
        .then( (o: InternalOperationDto) => {
          if ( o.success ) {
            return res.status(HttpStatus.OK)
            .json(new OperationResponseDto(HttpStatus.OK, true, 'The clone process done successfuly.', null))
          } else {
            return Promise.reject({
              message: 'The folder exists'
            })
          }
        })
        .catch( error => {
          log(LoggingLevel.Error, error.message)
          return res.status(HttpStatus.BAD_REQUEST)
            .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, error.message, null))

        })
    }

    @ApiOperation({
      summary: 'Clone Path',
      description: '',
    })
    @ApiCreatedResponse({ type: OperationResponseDto })
    @ApiBadRequestResponse({ type: OperationResponseDto })
    @ApiUnauthorizedResponse({ type: OperationResponseDto })
    @ApiForbiddenResponse({ type: OperationResponseDto })
    @ApiUnsupportedMediaTypeResponse({ type: OperationResponseDto })
    @ApiTooManyRequestsResponse({ type: OperationResponseDto })
    // @UseGuards(IsAdminGuard)
    @Post([
      '/clone/path',
    ])
    async clonePath(
      @Body()     dto: any,
      @Response() res: ExpressResponse
    ) {
      // if ( !bucket_name ) {
      //   return res.status(HttpStatus.BAD_REQUEST)
      //     .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Bucket must specified'))
      // }
      let bucket_name = config.MINIO.main_bucket_title
      let a = await this._bucketManagersService.pathFilesList(bucket_name, dto.new)
      if ( a.data.length > 1 ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Path already exists'))
      }
      return await this._bucketManagersService.clonePath(bucket_name, dto.old, dto.new)
        .then( (o: InternalOperationDto) => {
          if ( o.success ) {
            return res.status(HttpStatus.OK)
            .json(new OperationResponseDto(HttpStatus.OK, true, 'The path clone completely.', null))
          } else {
            return Promise.reject({
              message: 'The folder exists'
            })
          }
        })
        .catch( error => {
          log(LoggingLevel.Error, error.message)
          return res.status(HttpStatus.BAD_REQUEST)
            .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, error.message, null))

        })
    }

    @ApiOperation({
      summary: 'Duplicate single file',
      description: '',
    })
    @ApiCreatedResponse({ type: OperationResponseDto })
    @ApiBadRequestResponse({ type: OperationResponseDto })
    @ApiUnauthorizedResponse({ type: OperationResponseDto })
    @ApiForbiddenResponse({ type: OperationResponseDto })
    @ApiPayloadTooLargeResponse({ type: OperationResponseDto })
    @ApiUnsupportedMediaTypeResponse({ type: OperationResponseDto })
    @ApiTooManyRequestsResponse({ type: OperationResponseDto })
    @ApiBody({ type: DuplicateFileRequestDto })
    // @UseGuards(IsUserGuard)
    @UsePipes(ValidationPipe)
    // @Post('/duplicate/:bucket_name((?:/[a-zA-Z]{0,})?)*')
    @Post('/duplicate')
    async duplicateFile(
      @Body()               dto: DuplicateFileRequestDto,
      @Response()           res: ExpressResponse,
    ): Promise<any> {
      if ( !dto ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'File is empty'))
      }
      let bucket_name = config.MINIO.main_bucket_title
      // if ( bucket_name ) {
      //   let { success } = await this._bucketManagersService.getStat(bucket_name, null)
      //   if ( !success ) {
      //     return res.status(HttpStatus.NOT_FOUND)
      //       .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'This bucket dose not exists.'))
      //   }
      // }
      if ( dto.current ) {
        let a: any = await this._fileManagerService.getFile(bucket_name, dto.current)
        if ( a.message === 'Download Failed!' ) {
          return res.status(HttpStatus.NOT_FOUND)
            .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'Such file dose not exists.', {
              file: dto.current
            }))
          }
      }
      this._fileManagerService.duplicate(bucket_name, dto.current, dto.destination)
        .then( (o: any) => {
          if ( !o ) {
            return Promise.reject('Unable to duplicate file')
          }
          return res.status(HttpStatus.OK)
            .json(new OperationResponseDto(HttpStatus.OK, true, 'The file duplicated successfully.', null))
        })
        .catch( error => {
          log( LoggingLevel.Error, error, error)
          return res.status(HttpStatus.BAD_REQUEST)
            .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'The duplication process failed. Mayby because the destination file exists!', null))
        })
    }


    @ApiOperation({
      summary: 'Remove multiple files',
      description: '',
    })
    @ApiCreatedResponse({ type: OperationResponseDto })
    @ApiBadRequestResponse({ type: OperationResponseDto })
    @ApiUnauthorizedResponse({ type: OperationResponseDto })
    @ApiForbiddenResponse({ type: OperationResponseDto })
    @ApiUnsupportedMediaTypeResponse({ type: OperationResponseDto })
    @ApiTooManyRequestsResponse({ type: OperationResponseDto })
    // @UseGuards(IsUserGuard, IsAdminGuard)
    @Delete('/all')
    async removeFiles(
      @Body()     dto: DeleteFileRequestDto,
      @Response() res: ExpressResponse
    ) {
      let bucket_name = config.MINIO.main_bucket_title
      if ( !dto ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'No file selected for cleaning'))
      }
      for ( let item of dto.files ) {
        let pattern = new RegExp(bucket_name, 'i')
        let a: any = await this._fileManagerService.getFile(bucket_name, item.replace(pattern, '') )
        if ( a.message === 'Download Failed!' ) {
          return res.status(HttpStatus.NOT_FOUND)
            .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'Such file dose not exists.', {
              file: item
            }))
        }
      }
      await this._fileManagerService.removeMultipleFiles(bucket_name, dto.files)
        .then( (o: any) => {
          return res.status(HttpStatus.OK)
            .json(new OperationResponseDto(HttpStatus.OK, true, 'Files removed correctly.', null))
        })
        .catch( error => {
          log( LoggingLevel.Error, 'Error in deleting multiple file!', error)
          return res.status(HttpStatus.BAD_REQUEST)
            .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, true, 'Files removed correctly.', null))
        })
    }

    @ApiOperation({
      summary: 'Remove file',
      description: '',
    })
    @ApiCreatedResponse({ type: OperationResponseDto })
    @ApiBadRequestResponse({ type: OperationResponseDto })
    @ApiUnauthorizedResponse({ type: OperationResponseDto })
    @ApiForbiddenResponse({ type: OperationResponseDto })
    @ApiUnsupportedMediaTypeResponse({ type: OperationResponseDto })
    @ApiTooManyRequestsResponse({ type: OperationResponseDto })
    // @UseGuards(IsUserGuard)
    @Delete('/*/:file_name')
    async removeFile(
      @Param('file_name'  ) file_name: string,
      @Response() res: ExpressResponse,
      @Request()  req: any
    ) {
      let bucket_name = config.MINIO.main_bucket_title
      if ( !file_name ) {
        return res.status(HttpStatus.BAD_REQUEST)
          .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'Select file first'))
      } 
      let filePath = req.params[0] + '/' + file_name
      let a: any = await this._fileManagerService.getFile(bucket_name, filePath)
      if ( a.message === 'Download Failed!' ) {
        return res.status(HttpStatus.NOT_FOUND)
          .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'Such file dose not exists.', {
            file: file_name
          }))
      }
      return await this._fileManagerService.removeFile(bucket_name, filePath)
        .then( (o: any) => {
          if ( o ) {
            return res.status(HttpStatus.OK)
            .json(new OperationResponseDto(HttpStatus.OK, true, null, {
              file: file_name,
              path: config.url + '/' + config.MINIO.main_bucket_title + '/' + filePath
            }))
          } else {
            return Promise.reject({
              message: 'Unable to remove this file'
            })
          }
        })
        .catch( error => {
          log(LoggingLevel.Error, error.message)
          return res.status(HttpStatus.BAD_REQUEST)
            .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, null, null))
  
        })
    }

}
