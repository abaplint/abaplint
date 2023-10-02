export class Message {
  private readonly number: string;
  // the actual text,
  private readonly message: string;

  public constructor(number: string, message: string) {
    this.number = number;
    if (this.number === undefined) {
      this.number = "";
    }
    this.message = message;
    if (this.message === undefined) {
      this.message = "";
    }
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