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
    const base1 = this.getFilename().split("\\").reverse()[0];
    const base2 = base1.split("/").reverse()[0];
    return base2;
  }

  public getObjectType(): string | undefined {
    const split = this.baseName().split(".");
    return split[1]?.toUpperCase();
  }

  public getObjectName(): string {
    const split = this.baseName().split(".");
// handle url escaped namespace
    split[0] = split[0].replace(/^%23(\w+)%23(.+)$/g, "/$1/$2");
// handle namespace
    return split[0].toUpperCase().replace(/#/g, "/");
  }

  public abstract getRaw(): string;
  public abstract getRawRows(): string[];
}
