import {IObject, IParseResult} from "./objects/_iobject";
import {IFile} from "./files/_ifile";
import {Config} from "./config";
import {Issue} from "./issue";
import {ArtifactsObjects} from "./artifacts_objects";
import {ArtifactsRules} from "./artifacts_rules";
import {SkipLogic} from "./skip_logic";
import {IRegistry, IRunInput} from "./_iregistry";
import {IConfiguration} from "./_config";
import {ABAPObject} from "./objects/_abap_object";
import {FindGlobalDefinitions} from "./abap/5_syntax/global_definitions/find_global_definitions";
import {SyntaxLogic} from "./abap/5_syntax/syntax";
import {ExcludeHelper} from "./utils/excludeHelper";

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

export class Registry implements IRegistry {
  private readonly objects: { [index: string]: { [index: string]: IObject } } = {};
  /** object containing filenames of dependencies */
  private readonly dependencies: { [index: string]: boolean } = {};
  private conf: IConfiguration;
  private issues: Issue[] = [];

  public constructor(conf?: IConfiguration) {
    this.conf = conf ? conf : Config.getDefault();
  }

  public static abaplintVersion(): string {
    // magic, see build script "version.sh"
    return "{{ VERSION }}";
  }

  public* getObjects(): Generator<IObject, void, undefined> {
    for (const name in this.objects) {
      for (const type in this.objects[name]) {
        yield this.objects[name][type];
      }
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
    for (const o of this.getObjects()) {
      for (const f of o.getFiles()) {
        if (f.getFilename().toUpperCase() === filename.toUpperCase()) {
          return f;
        }
      }
    }
    return undefined;
  }

  public getObject(type: string | undefined, name: string): IObject | undefined {
    if (type === undefined) {
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
      this.removeObject(obj);
    }
    return this;
  }

  public addFiles(files: readonly IFile[]): IRegistry {
    const globalExclude = (this.conf.getGlobal().exclude ?? [])
      .map(pattern => new RegExp(pattern, "i"));

    for (const f of files) {
      const filename = f.getFilename();
      const isNotAbapgitFile = filename.split(".").length <= 2;
      if (isNotAbapgitFile || ExcludeHelper.isExcluded(filename, globalExclude)) {
        continue;
      }
      const found = this.findOrCreate(f.getObjectName(), f.getObjectType());

      found.addFile(f);
    }
    return this;
  }

  public addDependencies(files: readonly IFile[]): IRegistry {
    for (const f of files) {
      this.dependencies[f.getFilename().toUpperCase()] = true;
    }
    return this.addFiles(files);
  }

  public addDependency(file: IFile): IRegistry {
    this.dependencies[file.getFilename().toUpperCase()] = true;
    this.addFile(file);
    return this;
  }

  public isDependency(obj: IObject): boolean {
    const filename = obj.getFiles()[0].getFilename().toUpperCase();
    return this.dependencies[filename] === true;
  }

  public isFileDependency(filename: string): boolean {
    return this.dependencies[filename.toUpperCase()] === true;
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

  // todo, this will be changed to async sometime
  public findIssues(input?: IRunInput): readonly Issue[] {
    if (this.isDirty() === true) {
      this.parse();
    }
    return this.runRules(input);
  }

  // todo, this will be changed to async sometime
  public findIssuesObject(iobj: IObject): readonly Issue[] {
    if (this.isDirty() === true) {
      this.parse();
    }
    return this.runRules(undefined, iobj);
  }

  // todo, this will be changed to async sometime
  public parse() {
    if (this.isDirty() === false) {
      return this;
    }

    ParsingPerformance.clear();

    this.issues = [];
    for (const o of this.getObjects()) {
      this.parsePrivate(o);
      this.issues = this.issues.concat(o.getParsingIssues());
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

    this.issues = [];
    for (const o of this.getObjects()) {
      await input?.progress?.tick("Lexing and parsing(" + this.conf.getVersion() + ") - " + o.getType() + " " + o.getName());
      this.parsePrivate(o);
      this.issues = this.issues.concat(o.getParsingIssues());
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
    if (input instanceof ABAPObject) {
      const config = this.getConfig();
      const result = input.parse(config.getVersion(), config.getSyntaxSetttings().globalMacros);
      ParsingPerformance.push(input, result);
    }
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

  private runRules(input?: IRunInput, iobj?: IObject): readonly Issue[] {
    const rulePerformance: {[index: string]: number} = {};
    let issues = this.issues.slice(0);

    const objects = iobj ? [iobj] : this.getObjects();
    const rules = this.conf.getEnabledRules();
    const skipLogic = new SkipLogic(this);

    input?.progress?.set(iobj ? 1 : this.getObjectCount(false), "Run Syntax");
    const check: IObject[] = [];
    for (const obj of objects) {
      input?.progress?.tick("Run Syntax - " + obj.getName());
      if (skipLogic.skip(obj) || this.isDependency(obj)) {
        continue;
      }
      if (obj instanceof ABAPObject) {
        new SyntaxLogic(this, obj).run();
      }
      check.push(obj);
    }

    input?.progress?.set(rules.length, "Initialize Rules");
    for (const rule of rules) {
      input?.progress?.tick("Initialize Rules - " + rule.getMetadata().key);
      if (rule.initialize === undefined) {
        throw new Error(rule.getMetadata().key + " missing initialize method");
      }
      rule.initialize(this);
      rulePerformance[rule.getMetadata().key] = 0;
    }

    input?.progress?.set(check.length, "Finding Issues");
    for (const obj of check) {
      input?.progress?.tick("Finding Issues - " + obj.getType() + " " + obj.getName());
      for (const rule of rules) {
        const before = Date.now();
        issues = issues.concat(rule.run(obj));
        const runtime = Date.now() - before;
        rulePerformance[rule.getMetadata().key] = rulePerformance[rule.getMetadata().key] + runtime;
      }
    }

    if (input?.outputPerformance === true) {
      const perf: {name: string, time: number}[] = [];
      for (const p in rulePerformance) {
        if (rulePerformance[p] > 10) { // ignore rules if it takes less than 10ms
          perf.push({name: p, time: rulePerformance[p]});
        }
      }
      perf.sort((a, b) => {return b.time - a.time;});
      for (const p of perf) {
        process.stderr.write("\t" + p.time + "ms\t" + p.name + "\n");
      }
    }

    return this.excludeIssues(issues);
  }

  private excludeIssues(issues: Issue[]): Issue[] {

    const ret: Issue[] = issues;

    // exclude issues, as now we know both the filename and issue key
    for (const rule of ArtifactsRules.getRules()) {
      const key = rule.getMetadata().key;
      const ruleExclude: string[] = (this.conf.readByKey(key, "exclude") ?? []);
      const ruleExcludePatterns = ruleExclude.map(x => new RegExp(x, "i"));

      for (let i = ret.length - 1; i >= 0; i--) {

        if (ret[i].getKey() !== key) {
          continue;
        }

        const filename = ret[i].getFilename();

        if (ExcludeHelper.isExcluded(filename, ruleExcludePatterns)) {
          ret.splice(i, 1);
        }
      }
    }

    return ret;
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
