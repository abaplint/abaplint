import {File} from "../files";

export abstract class Object {
  protected files: Array<File>;
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

  public addFile(file: File) {
    this.files.push(file);
  }

  public getFiles(): Array<File> {
    return this.files;
  }

}