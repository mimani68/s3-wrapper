import { ApiProperty } from "@nestjs/swagger";

export class UploadNewFileRequestDto {

    @ApiProperty({ type: 'string' })
    bucket: string;

    @ApiProperty({ type: 'file', format: 'binary', isArray: false })
    attachments: any;

    @ApiProperty({ type: 'string' })
    prefix: string;
}