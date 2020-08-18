import {IFile} from "../files/_ifile";
import {IObject, IParseResult} from "./_iobject";
import * as xmljs from "xml-js";
import {Issue} from "../issue";
import {Version} from "../version";
import {Identifier} from "../abap/4_file_information/_identifier";
import {Identifier as IdentifierToken} from "../abap/1_lexer/tokens/identifier";
import {Position} from "../position";

export abstract class AbstractObject implements IObject {
  protected files: IFile[];
  protected dirty: boolean;
  private readonly name: string;
  protected old: readonly Issue[];

  public abstract getType(): string;
  public abstract getAllowedNaming(): {maxLength: number, allowNamespace: boolean};

  public constructor(name: string) {
    this.name = name;
    this.files = [];
    this.old = [];
    this.dirty = false;
  }

  public getParsingIssues() {
    return this.old;
  }

  public parse(_version?: Version, _globalMacros?: readonly string[]): IParseResult {
    return {updated: false, runtime: 0};
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

  public getFileByName(filename: string): IFile | undefined {
    for (const f of this.files) {
      if (f.getFilename() === filename) {
        return f;
      }
    }
    return undefined;
  }

  public containsFile(filename: string): boolean {
    for (const f of this.files) {
      if (f.getFilename() === filename) {
        return true;
      }
    }
    return false;
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

  public getIdentifier(): Identifier | undefined {
    // this method can be redefined in each object type to give a better result
    const file = this.getXMLFile();
    if (file === undefined) {
      return undefined;
    }
    return new Identifier(new IdentifierToken(new Position(0, 0), ""), file.getFilename());
  }

  public getXMLFile() {
// todo, https://github.com/abaplint/abaplint/issues/673
    const expected1 = this.getName().toLowerCase().replace(/\//g, "#") + "." + this.getType().toLowerCase() + ".xml";
    const expected2 = this.getName().toLowerCase().replace(/\//g, "%23") + "." + this.getType().toLowerCase() + ".xml";
    for (const file of this.getFiles()) {
      if (file.getFilename().endsWith(expected1) || file.getFilename().endsWith(expected2)) {
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

  protected parseRaw(): any | undefined {
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