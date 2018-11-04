import * as Objects from "./objects";
import {ABAPObject} from "./objects/_abap_object";
import {Object} from "./objects/_object";
import {ABAPFile} from "./files";
import Config from "./config";
import {Issue} from "./issue";
import {GenericError} from "./rules/";
import {IFile} from "./files/_ifile";
import {Artifacts} from "./artifacts";

export interface IProgress {
  set(total: number, text: string): void;
  tick(info: any): void;
}

class NoProgress implements IProgress {
  public set(_total: number, _text: string): undefined {
    return undefined;
  }

  public tick(_options: any): undefined {
    return undefined;
  }
}

export class Registry {

  private macros: Array<string> = [];
  private objects: Array<Object> = [];
  private dirty = false;
  private conf: Config;
  private issues: Issue[] = [];

  constructor(conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
  }

  public getObjects(): Array<Object> {
    return this.objects;
  }

  public getConfig() {
    return this.conf;
  }

  public getABAPObjects(): Array<ABAPObject> {
    return this.objects.filter((obj) => { return obj instanceof ABAPObject; }) as Array<ABAPObject>;
  }

  public getParsedFiles(progress?: IProgress): Array<ABAPFile> {
    if (this.isDirty()) {
      this.parse(progress);
    }
    let ret: Array<ABAPFile> = [];
    this.getABAPObjects().forEach((a) => {ret = ret.concat(a.getParsed()); });
    return ret;
  }

  public addFile(file: IFile): Registry {
    return this.addFiles([file]);
  }

  public addFiles(files: Array<IFile>): Registry {
    this.setDirty();
    files.forEach((f) => {
      try {
        this.findOrCreate(f.getObjectName(), f.getObjectType()).addFile(f);
      } catch (error) {
        this.issues.push(new Issue({rule: new GenericError(error), file: f, message: 1}));
      }
    });
    return this;
  }

  public setDirty() {
    this.dirty = true;
    this.issues = [];
  }

  public isDirty(): boolean {
    return this.dirty;
  }

  public findIssues(progress?: IProgress): Array<Issue> {
    if (this.isDirty()) {
      this.parse(progress);
    }
    progress = progress ? progress : new NoProgress();

    let issues = this.issues.slice(0);
    let objects = this.getObjects();

    progress.set(objects.length, ":percent - Finding Issues - :object");
    for (let obj of objects) {
      progress.tick({object: obj.getType() + " " + obj.getName()});
      for (let rule of Artifacts.getRules()) {
        if (this.conf.readByKey(rule.getKey(), "enabled") === true) {
          rule.setConfig(this.conf.readByRule(rule.getKey()));
          issues = issues.concat(rule.run(obj, this, this.conf.getVersion()));
        }
      }
    }

    return issues;
  }

  public parse(progress?: IProgress): Registry {
    if (!this.isDirty()) {
      return this;
    }
    progress = progress ? progress : new NoProgress();

    let objects = this.getABAPObjects();

    progress.set(objects.length, ":percent - Lexing and parsing - :object");
    objects.forEach((obj) => {
      progress.tick({object: obj.getType() + " " + obj.getName()});
      obj.parseFirstPass(this.conf.getVersion(), this);
    });

    progress.set(objects.length, ":percent - Second pass - :object");
    objects.forEach((obj) => {
      progress.tick({object: obj.getType() + " " + obj.getName()});
      this.issues = this.issues.concat(obj.parseSecondPass(this));
    });

    return this;
  }

  public addMacro(name: string) {
// todo, handle scoping for macros
    if (this.isMacro(name)) {
      return;
    }
    this.macros.push(name.toUpperCase());
  }

  public isMacro(name: string): boolean {
    for (let mac of this.macros) {
      if (mac === name.toUpperCase()) {
        return true;
      }
    }
    return false;
  }

  private findOrCreate(name: string, type: string): Object {
    for (let obj of this.objects) { // todo, this is slow
      if (obj.getType() === type && obj.getName() === name) {
        return obj;
      }
    }

    let add: Object = undefined;
// todo, refactor this somewhere else
    switch (type) {
      case "CLAS":
        add = new Objects.Class(name);
        break;
      case "TYPE":
        add = new Objects.TypePool(name);
        break;
      case "DEVC":
        add = new Objects.Package(name);
        break;
      case "MSAG":
        add = new Objects.MessageClass(name);
        break;
      case "INTF":
        add = new Objects.Interface(name);
        break;
      case "DTEL":
        add = new Objects.DataElement(name);
        break;
      case "TABL":
        add = new Objects.Table(name);
        break;
      case "TTYP":
        add = new Objects.TableType(name);
        break;
      case "DOMA":
        add = new Objects.Domain(name);
        break;
      case "PROG":
        add = new Objects.Program(name);
        break;
      case "SMIM":
        add = new Objects.MIMEObject(name);
        break;
      case "FUGR":
        add = new Objects.FunctionGroup(name);
        break;
      case "TRAN":
        add = new Objects.Transaction(name);
        break;
      case "SICF":
        add = new Objects.ICFService(name);
        break;
      case "W3MI":
        add = new Objects.WebMIME(name);
        break;
      case "DCLS":
        add = new Objects.DataControl(name);
        break;
      case "DDLS":
        add = new Objects.DataDefinition(name);
        break;
      case "XSLT":
        add = new Objects.Transformation(name);
        break;
      case "ENQU":
        add = new Objects.LockObject(name);
        break;
      case "ABAP":
        throw new Error("Add type in filename, eg zclass.clas.abap or zprogram.prog.abap");
      default:
        throw new Error("Unknown object type: " + type);
    }

    this.objects.push(add);

    return add;
  }

}
