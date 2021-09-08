import { ApiProperty } from "@nestjs/swagger";

export class DeleteFileRequestDto {

    @ApiProperty({ type: 'array', isArray: true })
    files: string[];
}