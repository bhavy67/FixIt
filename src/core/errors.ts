export class ProcessingError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ProcessingError';
  }
}

export class InvalidInputError extends ProcessingError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export class ProcessingCancelledError extends ProcessingError {
  constructor(message = 'Processing was cancelled') {
    super(message);
    this.name = 'ProcessingCancelledError';
  }
}

export class ProcessingFailedError extends ProcessingError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ProcessingFailedError';
  }
}
