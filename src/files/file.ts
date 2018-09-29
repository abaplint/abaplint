export class File {
  private raw: string;
  private filename: string;

  constructor(filename: string, raw: string) {
    this.raw = raw.replace(/\r/g, ""); // ignore all carriage returns
    this.filename = filename;
  }

  public getRaw(): string {
    return this.raw;
  }

  public getRawRows(): Array<string> {
    return this.raw.split("\n");
  }

  public getFilename(): string {
    return this.filename;
  }

  public getObjectType(): string {
    let base = this.getFilename().split("/").reverse()[0];
    let split = base.split(".");
    return split[1].toUpperCase();
  }

  public getObjectName(): string {
    let base = this.getFilename().split("/").reverse()[0];
    let split = base.split(".");
    return split[0].toUpperCase();
  }
}
