import {IObject, IParseResult} from "./objects/_iobject";
import {IFile} from "./files/_ifile";
import {Config} from "./config";
import {Issue} from "./issue";
import {ArtifactsObjects} from "./artifacts_objects";
import {IRegistry, IRunInput} from "./_iregistry";
import {IConfiguration} from "./_config";
import {FindGlobalDefinitions} from "./abap/5_syntax/global_definitions/find_global_definitions";
import {ExcludeHelper} from "./utils/excludeHelper";
import {DDICReferences} from "./ddic_references";
import {IDDICReferences} from "./_iddic_references";
import {RulesRunner} from "./rules_runner";

// todo, this should really be an instance in case there are multiple Registry'ies
class ParsingPerformance {
  private static results: {runtime: number, name: string, extra: string}[];
  private static lexing: number;
  private static statements: number;
  private static structure: number;

  public static clear() {
    this.results = [];
    this.lexing = 0;
    this.statements = 0;
    this.structure = 0;
  }

  public static push(obj: IObject, result: IParseResult): void {
    if (result.runtimeExtra) {
      this.lexing += result.runtimeExtra.lexing;
      this.statements += result.runtimeExtra.statements;
      this.structure += result.runtimeExtra.structure;
    }
    if (result.runtime < 100) {
      return;
    }
    if (this.results === undefined) {
      this.results = [];
    }

    let extra = "";
    if (result.runtimeExtra) {
      extra = `\t(lexing: ${result.runtimeExtra.lexing
      }ms, statements: ${result.runtimeExtra.statements
      }ms, structure: ${result.runtimeExtra.structure}ms)`;
    }

    this.results.push({
      runtime: result.runtime,
      extra,
      name: obj.getType() + " " + obj.getName(),
    });
  }

  public static output() {
    const MAX = 10;

    this.results.sort((a, b) => { return b.runtime - a.runtime; });

    for (let i = 0; i < MAX; i++) {
      const row = this.results[i];
      if (row === undefined) {
        break;
      }
      process.stderr.write(`\t${row.runtime}ms\t${row.name} ${row.extra}\n`);
    }
    process.stderr.write(`\tTotal lexing:     ${this.lexing}ms\n`);
    process.stderr.write(`\tTotal statements: ${this.statements}ms\n`);
    process.stderr.write(`\tTotal structure:  ${this.structure}ms\n`);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////

export class Registry implements IRegistry {
  private readonly objects: { [name: string]: { [type: string]: IObject } } = {};
  private readonly objectsByType: { [type: string]: { [name: string]: IObject } } = {};
  private readonly dependencies: { [type: string]: { [name: string]: boolean } } = {};
  private readonly references: IDDICReferences;
  private conf: IConfiguration;

  public constructor(conf?: IConfiguration) {
    this.conf = conf ? conf : Config.getDefault();
    this.references = new DDICReferences();
  }

  public static abaplintVersion(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  public getDDICReferences() {
    return this.references;
  }

  public* getObjects(): Generator<IObject, void, undefined> {
    for (const name in this.objects) {
      for (const type in this.objects[name]) {
        yield this.objects[name][type];
      }
    }
  }

  public* getObjectsByType(type: string): Generator<IObject, void, undefined> {
    for (const name in this.objectsByType[type] || []) {
      yield this.objectsByType[type][name];
    }
  }

  public* getFiles(): Generator<IFile, void, undefined> {
    for (const obj of this.getObjects()) {
      for (const file of obj.getFiles()) {
        yield file;
      }
    }
  }

  public getFirstObject(): IObject | undefined {
    for (const name in this.objects) {
      for (const type in this.objects[name]) {
        return this.objects[name][type];
      }
    }
    return undefined;
  }

  public getObjectCount(skipDependencies = true): number {
    let res = 0;
    for (const o of this.getObjects()) {
      if (skipDependencies === true && this.isDependency(o)) {
        continue;
      }
      res = res + 1;
    }
    return res;
  }

  public getFileByName(filename: string): IFile | undefined {
    const upper = filename.toUpperCase();
    for (const o of this.getObjects()) {
      for (const f of o.getFiles()) {
        if (f.getFilename().toUpperCase() === upper) {
          return f;
        }
      }
    }
    return undefined;
  }

  public getObject(type: string | undefined, name: string | undefined): IObject | undefined {
    if (type === undefined || name === undefined) {
      return undefined;
    }

    const searchName = name.toUpperCase();
    if (this.objects[searchName]) {
      return this.objects[searchName][type];
    }

    return undefined;
  }

  public getConfig(): IConfiguration {
    return this.conf;
  }

  // assumption: Config is immutable, and can only be changed via this method
  public setConfig(conf: IConfiguration): IRegistry {
    for (const obj of this.getObjects()) {
      obj.setDirty();
    }
    this.conf = conf;
    return this;
  }

  public inErrorNamespace(name: string): boolean {
    // todo: performance? cache regexp?
    const reg = new RegExp(this.getConfig().getSyntaxSetttings().errorNamespace, "i");
    return reg.test(name);
  }

  public addFile(file: IFile): IRegistry {
    return this.addFiles([file]);
  }

  public updateFile(file: IFile): IRegistry {
    const obj = this.find(file.getObjectName(), file.getObjectType());
    obj.updateFile(file);
    return this;
  }

  public removeFile(file: IFile): IRegistry {
    const obj = this.find(file.getObjectName(), file.getObjectType());
    obj.removeFile(file);
    if (obj.getFiles().length === 0) {
      this.references.clear(obj);
      this.removeObject(obj);
    }
    return this;
  }

  private _addFiles(files: readonly IFile[], dependency: boolean): IRegistry {
    const globalExclude = (this.conf.getGlobal().exclude ?? [])
      .map(pattern => new RegExp(pattern, "i"));

    for (const f of files) {
      const filename = f.getFilename();
      const isNotAbapgitFile = filename.split(".").length <= 2;
      if (isNotAbapgitFile || ExcludeHelper.isExcluded(filename, globalExclude)) {
        continue;
      }
      let found = this.findOrCreate(f.getObjectName(), f.getObjectType());

      if (dependency === false && found && this.isDependency(found)) {
        this.removeDependency(found);
        found = this.findOrCreate(f.getObjectName(), f.getObjectType());
      }

      found.addFile(f);
    }
    return this;
  }

  public addFiles(files: readonly IFile[]): IRegistry {
    this._addFiles(files, false);
    return this;
  }

  public addDependencies(files: readonly IFile[]): IRegistry {
    for (const f of files) {
      this.addDependency(f);
    }
    return this;
  }

  public addDependency(file: IFile): IRegistry {
    const type = file.getObjectType()?.toUpperCase();
    if (type === undefined) {
      return this;
    }
    const name = file.getObjectName().toUpperCase();

    if (this.dependencies[type] === undefined) {
      this.dependencies[type] = {};
    }
    this.dependencies[type][name] = true;
    this._addFiles([file], true);
    return this;
  }

  public removeDependency(obj: IObject) {
    delete this.dependencies[obj.getType()]?.[obj.getName()];
    this.removeObject(obj);
  }

  public isDependency(obj: IObject): boolean {
    return this.dependencies[obj.getType()]?.[obj.getName()] === true;
  }

  public isFileDependency(filename: string): boolean {
    const f = this.getFileByName(filename);
    if (f === undefined) {
      return false;
    }
    const type = f.getObjectType()?.toUpperCase();
    if (type === undefined) {
      return false;
    }
    const name = f.getObjectName().toUpperCase();
    return this.dependencies[type]?.[name] === true;
  }

  // assumption: the file is already in the registry
  public findObjectForFile(file: IFile): IObject | undefined {
    const filename = file.getFilename();
    for (const obj of this.getObjects()) {
      for (const ofile of obj.getFiles()) {
        if (ofile.getFilename() === filename) {
          return obj;
        }
      }
    }
    return undefined;
  }

  // todo, this will be changed to async sometime
  public findIssues(input?: IRunInput): readonly Issue[] {
    if (this.isDirty() === true) {
      this.parse();
    }
    return new RulesRunner(this).runRules(this.getObjects(), input);
  }

  // todo, this will be changed to async sometime
  public findIssuesObject(iobj: IObject): readonly Issue[] {
    if (this.isDirty() === true) {
      this.parse();
    }
    return new RulesRunner(this).runRules([iobj]);
  }

  // todo, this will be changed to async sometime
  public parse() {
    if (this.isDirty() === false) {
      return this;
    }

    ParsingPerformance.clear();

    for (const o of this.getObjects()) {
      this.parsePrivate(o);
    }
    new FindGlobalDefinitions(this).run();

    return this;
  }

  public async parseAsync(input?: IRunInput) {
    if (this.isDirty() === false) {
      return this;
    }

    ParsingPerformance.clear();
    input?.progress?.set(this.getObjectCount(false), "Lexing and parsing");

    for (const o of this.getObjects()) {
      await input?.progress?.tick("Lexing and parsing(" + this.conf.getVersion() + ") - " + o.getType() + " " + o.getName());
      this.parsePrivate(o);
    }
    if (input?.outputPerformance === true) {
      ParsingPerformance.output();
    }
    new FindGlobalDefinitions(this).run(input?.progress);

    return this;
  }

  //////////////////////////////////////////

  // todo, refactor, this is a mess, see where-used, a lot of the code should be in this method instead
  private parsePrivate(input: IObject) {
    const config = this.getConfig();
    const result = input.parse(config.getVersion(), config.getSyntaxSetttings().globalMacros, this);
    ParsingPerformance.push(input, result);
  }

  private isDirty(): boolean {
    for (const o of this.getObjects()) {
      const dirty = o.isDirty();
      if (dirty === true) {
        return true;
      }
    }
    return false;
  }

  private findOrCreate(name: string, type?: string): IObject {
    try {
      return this.find(name, type);
    } catch {
      const newName = name.toUpperCase();
      const newType = type ? type : "UNKNOWN";
      const add = ArtifactsObjects.newObject(newName, newType);

      if (this.objects[newName] === undefined) {
        this.objects[newName] = {};
      }
      this.objects[newName][newType] = add;

      if (this.objectsByType[newType] === undefined) {
        this.objectsByType[newType] = {};
      }
      this.objectsByType[newType][newName] = add;

      return add;
    }
  }

  private removeObject(remove: IObject | undefined): void {
    if (remove === undefined) {
      return;
    }

    if (this.objects[remove.getName()][remove.getType()] === undefined) {
      throw new Error("removeObject: object not found");
    }

    if (Object.keys(this.objects[remove.getName()]).length === 1) {
      delete this.objects[remove.getName()];
    } else {
      delete this.objects[remove.getName()][remove.getType()];
    }

    if (Object.keys(this.objectsByType[remove.getType()]).length === 1) {
      delete this.objectsByType[remove.getType()];
    } else {
      delete this.objectsByType[remove.getType()][remove.getName()];
    }
  }

  private find(name: string, type?: string): IObject {
    const searchType = type ? type : "UNKNOWN";
    const searchName = name.toUpperCase();

    if (this.objects[searchName] !== undefined
      && this.objects[searchName][searchType]) {
      return this.objects[searchName][searchType];
    }

    throw new Error("find: object not found, " + type + " " + name);
  }

}
