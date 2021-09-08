import { Param, Response, Controller, HttpStatus, Get, Query } from '@nestjs/common'
import { Response as ExpressResponse } from 'express'
import {
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger'

import { LoggingLevel, log     } from 'src/utils/log'
import { config } from 'src/config/app-config'
import { BucketManagersService } from 'src/storage/services/bucket-managers.service'
import { InternalOperationDto, OperationResponseDto } from 'src/storage/dtos'

@ApiTags('bucket')
// @ApiUnauthorizedResponse({ description: 'unauthorized' })
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller('bucket')
export class BucketController {
  
  constructor(
    private readonly _bucketManagersService: BucketManagersService,
  ) {}


  @ApiOperation({
    summary: 'Get bucket statistic',
    description: '',
  })
  @ApiQuery({ name: 'exclude', type: 'string' })
  @ApiQuery({ name: 'prefix', type: 'string' })
  @ApiQuery({ name: 'showFiles', type: 'string' })
  @ApiQuery({ name: 'onlyRoot', type: 'string' })
  @Get('/stat')
  async getBucketStatistics(
    @Query('exclude')     exclude: string,
    @Query('prefix')      prefix: string,
    @Query('showFiles')   showFiles: string,
    @Query('onlyRoot')    onlyRoot: boolean,
    @Response() res: ExpressResponse
  ) {
    const bucket_name = config.MINIO.main_bucket_title
    return await this._bucketManagersService.bucketFilesList(bucket_name, prefix, { exclude, onlyRoot, showFiles: showFiles === 'true' })
      .then( (o: InternalOperationDto) => {
        if ( !o.success ) return Promise.reject( o.data )
        return res.status(HttpStatus.OK)
          .json(new OperationResponseDto(HttpStatus.OK, true, 'Bucket statistc is ready.', o.data))
      })
      .catch( error => {
        log( LoggingLevel.Error, 'Fetch file statistc failed!', error)
        return res.status(HttpStatus.NOT_FOUND)
          .json(new OperationResponseDto(HttpStatus.NOT_FOUND, false, 'Fetch file statistc failed!', error))
      })
  }

}
