import {IObject} from "./objects/_iobject";
import {IFile} from "./files/_ifile";
import {ABAPObject} from "./objects/_abap_object";
import {ABAPFile} from "./files";
import {Config} from "./config";
import {Issue} from "./issue";
import {Artifacts} from "./artifacts";
import {versionToText} from "./version";
import {SkipLogic} from "./skip_logic";
import {Position} from "./position";
import {IncludeGraph} from "./include_graph";

export interface IProgress {
  set(total: number, text: string): void;
  tick(info: any): void;
}

export class NoProgress implements IProgress {
  public set(_total: number, _text: string): undefined {
    return undefined;
  }

  public tick(_options: any): undefined {
    return undefined;
  }
}

export class Registry {
  private dirty = false;
  private conf: Config;
  private readonly objects: IObject[] = [];
  private issues: Issue[] = [];
  private readonly dependencies: string[] = [];
  private includeGraph: IncludeGraph | undefined;

  constructor(conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
  }

  public static abaplintVersion(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  public getObjects(): IObject[] {
    return this.objects;
  }

  public getFileByName(filename: string): IFile | undefined {
    for (const o of this.objects) {
      for (const f of o.getFiles()) {
        if (f.getFilename().toUpperCase() === filename.toUpperCase()) {
          return f;
        }
      }
    }
    return undefined;
  }

  public getObject(type: string, name: string): IObject | undefined {
    for (const obj of this.objects) {
// todo, this is slow
      if (obj.getType() === type && obj.getName().toUpperCase() === name.toUpperCase()) {
        return obj;
      }
    }
    return undefined;
  }

  public getConfig() {
    return this.conf;
  }

// assumption: Config is immutable, and can only be changed via this method
  public setConfig(conf: Config) {
    this.setDirty();
    for (const obj of this.getObjects()) {
      obj.setDirty();
    }
    this.conf = conf;
  }

  public inErrorNamespace(name: string): boolean {
    const reg = new RegExp(this.getConfig().getSyntaxSetttings().errorNamespace, "i");
    return reg.test(name);
  }

  public getABAPObjects(): ABAPObject[] {
    return this.objects.filter((obj) => { return obj instanceof ABAPObject; }) as ABAPObject[];
  }

  public getABAPFiles(progress?: IProgress): ABAPFile[] {
    if (this.isDirty()) {
      this.clean(progress);
    }
    let ret: ABAPFile[] = [];
    this.getABAPObjects().forEach((a) => {ret = ret.concat(a.getABAPFiles()); });
    return ret;
  }

  public getABAPFile(name: string): ABAPFile | undefined {
    const all = this.getABAPFiles();
    for (const file of all) {
      if (file.getFilename().toUpperCase() === name.toUpperCase()) {
        return file;
      }
    }
    return undefined;
  }

  public addFile(file: IFile): Registry {
    this.setDirty();
    return this.addFiles([file]);
  }

  public updateFile(file: IFile): Registry {
    this.setDirty();
    const obj = this.find(file.getObjectName(), file.getObjectType());
    obj.updateFile(file);
    return this;
  }

  public removeFile(file: IFile): Registry {
    this.setDirty();
    const obj = this.find(file.getObjectName(), file.getObjectType());
    obj.removeFile(file);
    if (obj.getFiles().length === 0) {
      this.removeObject(obj);
    }
    return this;
  }

  public addFiles(files: IFile[]): Registry {
    this.setDirty();
    for (const f of files) {
      try {
        this.findOrCreate(f.getObjectName(), f.getObjectType()).addFile(f);
      } catch (error) {
        this.issues.push(new Issue({
          filename: f.getFilename(),
          message: error ? error.toString() : "registry_add",
          start: new Position(1, 1),
          end: new Position(1, 1),
          key: "registry_add"}));
      }
    }
    return this;
  }

// todo: methods to add/remove deps
// todo: add unit tests
  public addDependencies(files: IFile[]): Registry {
    this.setDirty();
    for (const f of files) {
      this.dependencies.push(f.getFilename());
    }
    return this.addFiles(files);
  }

  public setDirty() {
    this.dirty = true;
    this.issues = [];
    this.includeGraph = undefined;
  }

  public isDirty(): boolean {
    return this.dirty;
  }

  // assumption: the file is already in the registry
  public findObjectForFile(file: IFile): IObject | undefined {
    for (const obj of this.getObjects()) {
      for (const ofile of obj.getFiles()) {
        if (ofile.getFilename() === file.getFilename()) {
          return obj;
        }
      }
    }
    return undefined;
  }

  public findIssues(progress?: IProgress, iobj?: IObject): Issue[] {
    if (this.isDirty() === true) {
      this.clean(progress);
    }
    return this.runRules(progress, iobj);
  }

  public getIncludeGraph(progress?: IProgress): IncludeGraph {
    if (this.isDirty() === true) {
      this.clean(progress);
    }
    if (this.includeGraph === undefined) {
      throw new Error("includeGraph unexpectedly undefined");
    }
    return this.includeGraph;
  }

  public parse(progress?: IProgress): Registry {
    if (this.isDirty() === false) {
      return this;
    }
    const pro = progress ? progress : new NoProgress();

    const objects = this.getABAPObjects();

    pro.set(objects.length, ":percent - :elapseds - Lexing and parsing(" + versionToText(this.conf.getVersion()) + ") - :object");
    for (const obj of objects) {
      pro.tick({object: obj.getType() + " " + obj.getName()});
      obj.parseFirstPass(this);
    }

    pro.set(objects.length, ":percent - :elapseds - Second pass - :object");
    for (const obj of objects) {
      pro.tick({object: obj.getType() + " " + obj.getName()});
      this.issues = this.issues.concat(obj.parseSecondPass());
    }

    return this;
  }

//////////////////////////////////////////

  private clean(progress?: IProgress) {
    this.parse(progress);
    this.includeGraph = new IncludeGraph(this);
    this.dirty = false;
  }

  private runRules(progress?: IProgress, iobj?: IObject): Issue[] {
    progress = progress ? progress : new NoProgress();

    let issues = this.issues.slice(0);

    const objects = iobj ? [iobj] : this.getObjects();
    const rules = this.conf.getEnabledRules();
    const skipLogic = new SkipLogic(this);

    progress.set(objects.length, ":percent - :elapseds - Finding Issues - :object");
    for (const obj of objects) {
      progress.tick({object: obj.getType() + " " + obj.getName()});

      if (skipLogic.skip(obj) || this.dependencies.includes(obj.getFiles()[0].getFilename())) {
        continue;
      }

      for (const rule of rules) {
        issues = issues.concat(rule.run(obj, this));
      }
    }

    return this.excludeIssues(issues);
  }

  private excludeIssues(issues: Issue[]): Issue[] {

    const ret: Issue[] = issues;

// exclude issues, as now we know both the filename and issue key
// todo, add unit tests for this feature
    for (const rule of Artifacts.getRules()) {
      const key = rule.getKey();
      const exclude = this.conf.readByKey(key, "exclude");
      if (exclude === undefined || exclude.length === 0) {
        continue;
      }
      for (let i = ret.length - 1; i >= 0; i--) {
        if (ret[i].getKey() !== key) {
          continue;
        }
        let remove = false;
        for (const excl of exclude) {
          if (new RegExp(excl).exec(ret[i].getFilename())) {
            remove = true;
            break;
          }
        }
        if (remove) {
          ret.splice(i, 1);
        }
      }
    }

    return ret;
  }

  private findOrCreate(name: string, type: string): IObject {
    try {
      return this.find(name, type);
    } catch {
      const add = Artifacts.newObject(name, type);
      this.objects.push(add);
      return add;
    }
  }

  private removeObject(remove: IObject | undefined): void {
    if (remove === undefined) {
      return;
    }

    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i] === remove) {
        this.objects.splice(i, 1);
        return;
      }
    }
    throw new Error("removeObject: object not found");
  }

  private find(name: string, type: string): IObject {
    for (const obj of this.objects) { // todo, this is slow
      if (obj.getType() === type && obj.getName() === name) {
        return obj;
      }
    }
    throw new Error("find: object not found, " + type + " " + name);
  }

}
