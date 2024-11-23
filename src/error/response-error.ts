class ResponseError extends Error {
  status: number;
  details: Record<string, string[]>;

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message); // Error message
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = status; // HTTP status code
    this.details = details || {}; // Validation error details
  }
}

export { ResponseError };
