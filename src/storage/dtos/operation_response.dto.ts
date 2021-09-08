import { ApiProperty } from "@nestjs/swagger";

export class OperationResponseDto {

    @ApiProperty({ type: 'string' })
    message: string;

    @ApiProperty({ type: 'number', format: 'binary', isArray: false })
    code: number;

    @ApiProperty({ type: 'boolean' })
    success: boolean;

    @ApiProperty({ type: 'object' })
    result: any;

    constructor(
        code: number, 
        success: boolean,
        message: string, 
        result?: any
    ) {
        if ( code ) {
            this.code = code;
        }
        this.success = success;
        if (result) {
            this.result = result;
        }
        if ( message ) {
            this.message = message;
        }
    }

}