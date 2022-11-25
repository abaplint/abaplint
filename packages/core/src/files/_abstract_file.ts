import {IFile} from "./_ifile";

export abstract class AbstractFile implements IFile {
  private readonly filename: string;

  public constructor(filename: string) {
    this.filename = filename;
  }

  public getFilename(): string {
    return this.filename;
  }

  private baseName(): string {
    const first = this.getFilename().split("\\");
    const base1 = first[ first.length - 1 ];
    const base2 = base1.split("/");
    return base2[ base2.length - 1 ];
  }

  public getObjectType(): string | undefined {
    const split = this.baseName().split(".");
    return split[1]?.toUpperCase();
  }

  public getObjectName(): string {
    const split = this.baseName().split(".");
// handle url escaped namespace
    split[0] = split[0].replace(/%23/g, "#");
// handle additional escaping
    split[0] = split[0].replace(/%3e/g, ">");
    split[0] = split[0].replace(/%3c/g, "<");
// handle namespace
    return split[0].toUpperCase().replace(/#/g, "/");
  }

  public abstract getRaw(): string;
  public abstract getRawRows(): string[];
}
