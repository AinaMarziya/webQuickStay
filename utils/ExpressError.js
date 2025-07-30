class ExpressError extends Error {
    constructor( message , statusCode){
        super(message);
        this.message= message;
        this.statusCode= Number(statusCode) || 500;
    }
}
module.exports= ExpressError;