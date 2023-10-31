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
    let name = this.getFilename();
    name = name.substring(name.lastIndexOf("\\") + 1 || 0);
    return name.substring(name.lastIndexOf("/") + 1 || 0);
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
// handle abapGit namespace
    split[0] = split[0].toUpperCase().replace(/#/g, "/");
// handle AFF namespace
    split[0] = split[0].replace("(", "/");
    split[0] = split[0].replace(")", "/");
    return split[0];
  }

  public abstract getRaw(): string;
  public abstract getRawRows(): string[];
}
