import {IFile} from "../files";

export abstract class Object {
  protected files: Array<IFile>;
  private name: string;
  private package: string;

  public abstract getType(): string;

  public constructor(name: string, devPackage: string) {
    this.name = name;
    this.package = devPackage;
    this.files = [];
  }

  public getName(): string {
    return this.name;
  }

  public getPackage() {
    return this.package;
  }

  public addFile(file: IFile) {
    this.files.push(file);
  }

  public getFiles(): Array<IFile> {
    return this.files;
  }

}