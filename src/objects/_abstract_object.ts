import {IFile} from "../files/_ifile";
import {IObject} from "./_iobject";

export abstract class AbstractObject implements IObject {
  protected files: IFile[];
  private name: string;
// todo, dirty flag?

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

  public getFiles(): IFile[] {
    return this.files;
  }

  public removeFile(file: IFile): void {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].getFilename() === file.getFilename()) {
        this.files.splice(i, 1);
        return;
      }
    }
    throw new Error("removeFile: file not found");
  }

  public updateFile(file: IFile) {
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].getFilename() === file.getFilename()) {
        this.files[i] = file;
        return;
      }
    }
    throw new Error("updateFile: file not found");
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