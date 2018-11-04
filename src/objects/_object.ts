import {IFile} from "../files/_ifile";

export abstract class Object {
  protected files: Array<IFile>;
  private name: string;

  public abstract getType(): string;

  public constructor(name: string) {
    this.name = name;
    this.files = [];
  }

  public getName(): string {
    return this.name;
  }

  public addFile(file: IFile) {
    this.files.push(file);
  }

  public getFiles(): Array<IFile> {
    return this.files;
  }
/*
  public removeFile(_file: IFile) {
    throw new Error("todo");
  }

  public updateFile(_file: IFile) {
    throw new Error("todo");
  }

  public getPackage() {
    throw new Error("todo, determine from file paths?");
  }
*/
}