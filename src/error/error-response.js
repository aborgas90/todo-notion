class ResponseError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
  
  module.exports = { ResponseError }; // Ensure this export is correct
  