import {MemoryFile} from "../../core/src/files/memory_file";
import {IRegistry, IRunInput} from "../../core/src/_iregistry";
import {NoChainedAssignment} from "../../core/src/rules/no_chained_assignment";
import {IFile} from "../../core/src/files/_ifile";
import {IObject} from "../../core/src/objects/_iobject";
import {Issue} from "../../core/src/issue";
import {IConfiguration} from "../../core/src/_config";
import {IDDICReferences} from "../../core/src/_iddic_references";
import {IMSAGReferences} from "../../core/src/_imsag_references";
import {IMacroReferences} from "../../core/src/_imacro_references";
import {Program} from "../../core/src/objects/program";

class DummyRegistry implements IRegistry {
  private objects: IObject[] = [];

  public parse(): IRegistry { return this; }
  public async parseAsync(_input?: IRunInput): Promise<IRegistry> { return this; }
  public clear(): void { this.objects = []; }
  public addDependencies(_files: readonly IFile[]): IRegistry { return this; }
  public addDependency(_file: IFile): IRegistry { return this; }
  public removeDependency(_obj: IObject): void {}
  public isDependency(_obj: IObject): boolean { return false; }
  public isFileDependency(_filename: string): boolean { return false; }
  public findIssues(_input?: IRunInput): readonly Issue[] { return []; }
  public findIssuesObject(_iobj: IObject): readonly Issue[] { return []; }
  public inErrorNamespace(_name: string): boolean { return true; }
  public getDDICReferences(): IDDICReferences { throw new Error("Method not implemented."); }
  public getMSAGReferences(): IMSAGReferences { throw new Error("Method not implemented."); }
  public getMacroReferences(): IMacroReferences { throw new Error("Method not implemented."); }
  public getConfig(): IConfiguration { throw new Error("Method not implemented."); }
  public setConfig(_conf: IConfiguration): IRegistry { return this; }
  public *getObjects(): Generator<IObject, void, undefined> {
    for (const obj of this.objects) {
      yield obj;
    }
  }
  public *getObjectsByType(_type: string): Generator<IObject, void, undefined> {
    for (const obj of this.objects) {
      if (obj.getType() === _type) {
        yield obj;
      }
    }
  }
  public getObjectCount(): { total: number; normal: number; dependencies: number; } {
    return {total: this.objects.length, normal: this.objects.length, dependencies: 0};
  }
  public getFirstObject(): IObject | undefined { return this.objects[0]; }
  public getObject(_type: string | undefined, _name: string | undefined): IObject | undefined {
    return this.objects.find(o => o.getType() === _type && o.getName() === _name);
  }
  public findObjectForFile(_file: IFile): IObject | undefined {
    for (const obj of this.objects) {
      for (const file of obj.getFiles()) {
        if (file.getFilename() === _file.getFilename()) {
          return obj;
        }
      }
    }
    return undefined;
  }
  public addFile(file: IFile): IRegistry {
    const name = file.getObjectName();
    const type = file.getObjectType();
    let obj = this.getObject(type, name);
    if (obj === undefined) {
      if (type === "PROG") {
        obj = new Program(name);
        this.objects.push(obj);
      } else {
        throw new Error("Only PROG objects are supported in this dummy registry");
      }
    }
    obj.addFile(file);
    return this;
  }

  public updateFile(_file: IFile): IRegistry {
    const obj = this.getObject(_file.getObjectType(), _file.getObjectName());
    obj?.updateFile(_file);
    return this;
  }
  public removeFile(_file: IFile): IRegistry {
    const obj = this.getObject(_file.getObjectType(), _file.getObjectName());
    obj?.removeFile(_file);
    return this;
  }
  public addFiles(_files: readonly IFile[]): IRegistry {
    for (const file of _files) {
      this.addFile(file);
    }
    return this;
  }
  public getFileByName(_filename: string): IFile | undefined {
    for (const obj of this.objects) {
      for (const file of obj.getFiles()) {
        if (file.getFilename() === _filename) {
          return file;
        }
      }
    }
    return undefined;
  }
  public *getFiles(): Generator<IFile, void, undefined> {
    for (const obj of this.objects) {
      for (const file of obj.getFiles()) {
        yield file;
      }
    }
  }
}

export function main(filename: string, code: string) {
  const file = new MemoryFile(filename, code);
  const reg = new DummyRegistry().addFile(file).parse();
  const issues = new NoChainedAssignment().initialize(reg).run(reg.getFirstObject()!);
  console.log("Issues: " + issues.length);
}

main("test.prog.abap", "var1 = var2 = var3.");
console.log("Done");