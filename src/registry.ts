import {IObject} from "./objects/_iobject";
import {IFile} from "./files/_ifile";
import {Config} from "./config";
import {Issue} from "./issue";
import {ArtifactsObjects} from "./artifacts_objects";
import {ArtifactsRules} from "./artifacts_rules";
import {SkipLogic} from "./skip_logic";
import {Position} from "./position";
import {IRegistry} from "./_iregistry";
import {IProgress, NoProgress} from "./progress";
import {IConfiguration} from "./_config";
import {getABAPObjects} from "./get_abap";

export class Registry implements IRegistry {
  private dirty = false;
  private conf: IConfiguration;
  private readonly objects: IObject[] = [];
  private issues: Issue[] = [];
  private readonly dependencies: string[] = [];

  public constructor(conf?: IConfiguration) {
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

  public getObjectByType<T>(type: new (...args: any[]) => T, name: string): T | undefined {
    for (const obj of this.objects) {
// todo, this is slow
      if (obj.getName().toUpperCase() === name.toUpperCase() && obj instanceof type) {
        return obj;
      }
    }
    return undefined;
  }

  public getConfig(): IConfiguration {
    return this.conf;
  }

// assumption: Config is immutable, and can only be changed via this method
  public setConfig(conf: IConfiguration): IRegistry {
    this.setDirty();
    for (const obj of this.getObjects()) {
      obj.setDirty();
    }
    this.conf = conf;
    return this;
  }

  public inErrorNamespace(name: string): boolean {
    const reg = new RegExp(this.getConfig().getSyntaxSetttings().errorNamespace, "i");
    return reg.test(name);
  }

  public addFile(file: IFile): IRegistry {
    this.setDirty();
    return this.addFiles([file]);
  }

  public updateFile(file: IFile): IRegistry {
    this.setDirty();
    const obj = this.find(file.getObjectName(), file.getObjectType());
    obj.updateFile(file);
    return this;
  }

  public removeFile(file: IFile): IRegistry {
    this.setDirty();
    const obj = this.find(file.getObjectName(), file.getObjectType());
    obj.removeFile(file);
    if (obj.getFiles().length === 0) {
      this.removeObject(obj);
    }
    return this;
  }

  public addFiles(files: IFile[]): IRegistry {
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
  public addDependencies(files: IFile[]): IRegistry {
    this.setDirty();
    for (const f of files) {
      this.dependencies.push(f.getFilename());
    }
    return this.addFiles(files);
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

  public findIssues(progress?: IProgress): Issue[] {
    if (this.isDirty() === true) {
      this.clean();
    }
    return this.runRules(progress);
  }

  public findIssuesObject(iobj: IObject): Issue[] {
    if (this.isDirty() === true) {
      this.clean();
    }
    return this.runRules(undefined, iobj);
  }

  public parse() {
    if (this.isDirty() === false) {
      return this;
    }

    for (const obj of getABAPObjects(this)) {
      this.issues = this.issues.concat(obj.parse(this.getConfig()));
    }

    return this;
  }

  public async parseAsync(progress: IProgress) {
    if (this.isDirty() === false) {
      return this;
    }
    const objects = getABAPObjects(this);
    progress.set(objects.length, "Lexing and parsing");
    for (const obj of objects) {
      await progress.tick("Lexing and parsing(" + this.conf.getVersion() + ") - " +  obj.getType() + " " + obj.getName());
      this.issues = this.issues.concat(obj.parse(this.getConfig()));
    }

    return this;
  }

//////////////////////////////////////////

  private setDirty() {
    this.dirty = true;
    this.issues = [];
  }

  private isDirty(): boolean {
    return this.dirty;
  }

  private clean() {
    this.parse();
    this.dirty = false;
  }

  private runRules(progress?: IProgress, iobj?: IObject): Issue[] {
    progress = progress ? progress : new NoProgress();

    let issues = this.issues.slice(0);

    const objects = iobj ? [iobj] : this.getObjects();
    const rules = this.conf.getEnabledRules();
    const skipLogic = new SkipLogic(this);

    progress.set(objects.length, "Finding Issues");
    for (const obj of objects) {
      progress.tick("Finding Issues - " + obj.getType() + " " + obj.getName());

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
    for (const rule of ArtifactsRules.getRules()) {
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
      const add = ArtifactsObjects.newObject(name, type);
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
