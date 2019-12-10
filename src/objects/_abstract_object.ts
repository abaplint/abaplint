import {IFile} from "../files/_ifile";
import {IObject} from "./_iobject";
import * as xmljs from "xml-js";

export abstract class AbstractObject implements IObject {
  protected files: IFile[];
  private readonly name: string;
  protected dirty: boolean;

  public abstract getType(): string;
  public abstract getAllowedNaming(): {maxLength: number, allowNamespace: boolean};

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

  public getXMLFile() {
    const name = this.getName().toLowerCase().replace(/\//g, "#");
    const expected = name + "." + this.getType().toLowerCase() + ".xml";
    for (const file of this.getFiles()) {
      if (file.getFilename().endsWith(expected)) {
        return file;
      }
    }
    return undefined;
  }

  public getXML(): string | undefined {
    const file = this.getXMLFile();
    if (file) {
      return file.getRaw();
    }
    return undefined;
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

  protected parseXML(): any | undefined {
    const xml = this.getXML();
    if (xml === undefined) {
      return undefined;
    }
    try {
      return xmljs.xml2js(xml, {compact: true});
    } catch {
      return undefined;
    }
  }

}