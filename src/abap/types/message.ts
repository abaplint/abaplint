export class Message {
  private readonly num: string;
  private readonly msg: string;

  constructor(num: string, msg: string) {
    this.num = num;
    this.msg = msg;
  }

  public getNumber(): string {
    return this.num;
  }

  public getMessage(): string {
    return this.msg;
  }

  public getPlaceholderCount(): number {
    return (this.getMessage().match(/&/g) || []).length;
  }

// todo: languages + long text
}