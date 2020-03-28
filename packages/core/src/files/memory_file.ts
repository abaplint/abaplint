import {AbstractFile} from "./_abstract_file";

export class MemoryFile extends AbstractFile {
  private readonly raw: string;

  public constructor(filename: string, raw: string) {
    super(filename);
    this.raw = raw;
  }

  public getRaw(): string {
    return this.raw;
  }

  public getRawRows(): string[] {
    return this.raw.split("\n");
  }
}
