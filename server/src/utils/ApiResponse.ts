class ApiResponse {
    statusCode: number;
    data: any;
    messsage: string;
    success: boolean;

    constructor(
        statusCode: number,
        data: any,
        message = "Success"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.messsage = message;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

export { ApiResponse };