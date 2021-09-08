export class InternalOperationDto {

    success: boolean;
    data: any;
    message: string;

    constructor(
        success: boolean,
        data: any,
        message?: string
    ) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

}