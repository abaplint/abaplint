import {IFile} from "../files/_ifile";
import {IObject} from "./_iobject";

export abstract class AbstractObject implements IObject {
  protected files: IFile[];
  private name: string;
  protected dirty: boolean;

  public abstract getType(): string;

  public constructor(name: string) {
    this.name = name;
    this.files = [];
    this.dirty = false;
  }

  public getName(): string {
    return this.name;
  }

  public setDirty(): void {
    this.dirty = true;
  }

  public addFile(file: IFile) {
    this.setDirty();
    this.files.push(file);
  }

  public getFiles(): IFile[] {
    return this.files;
  }

  public removeFile(file: IFile): void {
    this.setDirty();
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].getFilename() === file.getFilename()) {
        this.files.splice(i, 1);
        return;
      }
    }
    throw new Error("removeFile: file not found");
  }

  public isDirty() {
    return this.dirty;
  }

  public updateFile(file: IFile) {
    this.setDirty();
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].getFilename() === file.getFilename()) {
        this.files[i] = file;
        return;
      }
    }
    throw new Error("updateFile: file not found");
  }

}