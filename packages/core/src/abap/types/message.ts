export class Message {
  private readonly number: string;
  // the actual text,
  private readonly message: string;
  private readonly className: string;

  public constructor(number: string, message: string, className: string) {
    this.number = number;
    if (this.number === undefined) {
      this.number = "";
    }
    this.message = message;
    if (this.message === undefined) {
      this.message = "";
    }
    this.className = className;
    if (this.className === undefined) {
      this.className = "";
    }
  }

  public getMessageClass(): string {
    return this.className;
  }

  public getNumber(): string {
    return this.number;
  }

  public getMessage(): string {
    return this.message;
  }

  public getPlaceholderCount(): number {
    const escaped = (this.getMessage().match(/&&/g) || []).length;
    return (this.getMessage().match(/&/g) || []).length - escaped * 2;
  }
}