import { ApiProperty } from "@nestjs/swagger";

export class DuplicateFileRequestDto {

    @ApiProperty({ type: 'string' })
    current: string;

    @ApiProperty({ type: 'string' })
    destination: string;
}