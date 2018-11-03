import * as Objects from "./objects";
import {ABAPObject} from "./objects";
import {ABAPFile, IFile} from "./files";
import Config from "./config";
import * as ProgressBar from "progress";
import {Issue} from "./issue";
import {GenericError} from "./rules/";
import * as Rules from "./rules/";

export default class Registry {

  private macros: Array<string> = [];
  private objects: Array<Objects.Object> = [];
  private dirty = false;
  private conf: Config;
  private issues: Issue[] = [];

  constructor(conf?: Config) {
    this.conf = conf ? conf : Config.getDefault();
  }

  public getObjects(): Array<Objects.Object> {
    return this.objects;
  }

  public getABAPObjects(): Array<ABAPObject> {
    return this.objects.filter((obj) => { return obj instanceof ABAPObject; }) as Array<ABAPObject>;
  }

// todo, is this method needed?
  public getParsedFiles(): Array<ABAPFile> {
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
// todo, this does not respect the configuration
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

  public findIssues(): Array<Issue> {
    if (this.isDirty()) {
      this.parse();
    }

    let issues: Array<Issue> = [];
    issues = this.issues.slice(0);

    let objects = this.getObjects();

    let bar = new Progress(this.conf,
                           ":percent - Finding Issues - :object",
                           {total: objects.length});

    for (let obj of objects) {
      bar.tick({object: obj.getType() + " " + obj.getName()});
// todo, move somewhere else
      for (let key in Rules) {
        const rul: any = Rules;
        if (typeof rul[key] === "function") {
          let rule: Rules.IRule = new rul[key]();
          if (rule.getKey && this.conf.readByKey(rule.getKey(), "enabled") === true) {
            rule.setConfig(this.conf.readByRule(rule.getKey()));
            issues = issues.concat(rule.run(obj, this, this.conf.getVersion()));
          }
        }
      }
    }

    return issues;
  }

  public parse(): Registry {
    if (!this.isDirty()) {
      return this;
    }

    let objects = this.getABAPObjects();

    let bar = new Progress(this.conf, ":percent - Lexing and parsing - :object", {total: objects.length});
    objects.forEach((obj) => {
      bar.tick({object: obj.getType() + " " + obj.getName()});
      obj.parseFirstPass(this.conf.getVersion(), this);
    });

    bar = new Progress(this.conf, ":percent - Second pass - :object", {total: objects.length});
    objects.forEach((obj) => {
      bar.tick({object: obj.getType() + " " + obj.getName()});
      this.issues = this.issues.concat(obj.parseSecondPass(this));
    });

    return this;
  }

  private findOrCreate(name: string, type: string): Objects.Object {
    for (let obj of this.objects) { // todo, this is slow
      if (obj.getType() === type && obj.getName() === name) {
        return obj;
      }
    }

    let add = undefined;
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

}

// todo, implement this with events instead, so it works on both node and web
class Progress {
  private bar: ProgressBar = undefined;

  constructor(conf: Config, text: string, options: any) {
    if (conf.getShowProgress()) {
      this.bar = new ProgressBar(text, options);
    }
  }

  public tick(options: any) {
    if (this.bar) {
      this.bar.tick(options);
      this.bar.render();
    }
  }
}