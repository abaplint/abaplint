import {AbstractFile} from "./abstract_file";

export class MemoryFile extends AbstractFile {
  private raw: string;

  constructor(filename: string, raw: string) {
    super(filename);
    this.raw = raw.replace(/\r/g, ""); // ignore all carriage returns
  }

  public getRaw(): string {
    return this.raw;
  }

  public getRawRows(): Array<string> {
    return this.raw.split("\n");
  }
}
