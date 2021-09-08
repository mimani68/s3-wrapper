import { ApiProperty } from "@nestjs/swagger";

export class ImageDeliveryDto {

    @ApiProperty({ type: 'string' })
    original_filename: string;

    @ApiProperty({ type: 'string' })
    name: string

    @ApiProperty({ type: 'string' })
    size: string

    @ApiProperty({ type: 'string' })
    file_url: string

    @ApiProperty({ type: 'string' })
    thumbnail_url: string

    @ApiProperty({ type: 'string' })
    type: string

    @ApiProperty({ type: 'string' })
    status: string
}