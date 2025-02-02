export class PermissionError extends Error {
  displayMessage: string;

  constructor({ message, displayMessage = '' }: { message: string, displayMessage?: string }) {
    super(message);
    this.name = "Permission Error"
    this.displayMessage = displayMessage;
  }
}

export class UnprocessableEntityError extends Error {
  displayMessage: string;

  constructor({ message, displayMessage = '' }: { message: string, displayMessage?: string }) {
    super(message);
    this.name = "Unprocessable Entity Error"
    this.displayMessage = displayMessage;
  }
}