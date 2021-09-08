import { Post, Get, Param, Response, Controller, HttpStatus, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse, ApiGoneResponse, ApiParam } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express'

import { AppService } from './app.service';
import { IsAdminGuard } from './shared/guard/is-admin-guard';
import { IsUserGuard } from './shared/guard/is-user-guard';
import { BucketManagersService } from './storage/services/bucket-managers.service';
import { InternalOperationDto, OperationResponseDto } from './storage/dtos';
import { log, LoggingLevel } from './utils/log';

@ApiTags('app')
@Controller()
export class AppController {

  constructor(
    private readonly _appService: AppService,
    private readonly _bucketManagersService: BucketManagersService,
    ) {}

  @ApiOperation({
    summary: 'Test the aliveness of the service',
    description: 'Test the aliveness of the service'
  })
  @ApiOkResponse({ description: 'Pong' })
  @Get('/ping')
  getPing(): string {
    return this._appService.ping();
  }

  @ApiOperation({
    summary: 'Test the readiness of minio',
    description: 'Test the readiness of minio'
  })
  @ApiOkResponse({})
  @ApiGoneResponse({ description: 'minio is not in ready state' })
  @Get('/readiness')
  async getDBStatus(
    @Response() res: ExpressResponse
  ) {
    this._appService.aliveness()
      .then( (isMinioAliveNow: boolean) => {
        if ( !isMinioAliveNow ) 
          return Promise.reject()
        let message = 'Minio instance is online'
        log( LoggingLevel.Info, message, null)
        return res.status(HttpStatus.OK)
          .json(new OperationResponseDto(HttpStatus.OK, true, message, null))
      })
      .catch( error => {
        let message = 'Minio instance is offline'
        log( LoggingLevel.Error, message, error)
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(new OperationResponseDto(HttpStatus.INTERNAL_SERVER_ERROR, false, message, error))
      })
  }

  // @ApiOperation({
  //   summary: 'Initialize system',
  //   description: '',
  // })
  // @ApiParam({ name: 'bucket_name', type: 'string' })
  // // @UseGuards(IsAdminGuard)
  // @Post('/setup/:bucket_name')
  // async init_system(
  //   @Param('bucket_name') bucket_name: string,
  //   @Response() res: ExpressResponse
  // ) {
  //   if ( !bucket_name ) {
  //     return res.status(HttpStatus.BAD_REQUEST)
  //       .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, 'No bucket selected!'))
  //   }
  //   return await this._bucketManagersService.createBucket(bucket_name)
  //     .then( (o: InternalOperationDto) => { 
  //       if ( !o.success ) return Promise.reject( o.data )
  //       log( LoggingLevel.Info, 'Setup server done.')
  //       return res.status(HttpStatus.OK)
  //         .json(new OperationResponseDto(HttpStatus.OK, true, 'System setup', o.data))
  //     })
  //     .catch( error => {
  //       log( LoggingLevel.Error, 'Setup server failed!', error)
  //       return res.status(HttpStatus.BAD_REQUEST)
  //         .json(new OperationResponseDto(HttpStatus.BAD_REQUEST, false, null, error))
  //     })
  // }
}