import {AbstractFile} from "./_abstract_file";

export class BinaryFile extends AbstractFile {
  private readonly raw: ArrayBuffer;

  public constructor(filename: string, raw: ArrayBuffer) {
    super(filename);
    this.raw = raw;
  }

  public getRaw(): ArrayBuffer {
    return this.raw;
  }

  public getRawRows(): any {
    throw new Error("BinaryFile do not have rows");
  }
}