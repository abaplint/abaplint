import {Issue} from "../issue";
import {NamingRuleConfig} from "./_naming_rule_config";
import {Registry} from "../registry";
import {IObject} from "../objects/_iobject";
import {IRule} from "./_irule";
import * as Objects from "../objects";
import {Position} from "../position";
import {NameValidator} from "../utils/name_validator";

/** Allows you to enforce a pattern, such as a prefix, for object names */
export class ObjectNamingConf extends NamingRuleConfig {
  /** The pattern for global class names */
  public clas: string = "^ZC(L|X)\\_";
  /** The pattern for global interface names */
  public intf: string = "^ZIF\\_";
  /** The pattern for program (report) names */
  public prog: string = "^Z";
  /** The pattern for function group names */
  public fugr: string = "^Z";
  /** The pattern for DDIC table names */
  public tabl: string = "^Z";
  /** The pattern for DDIC table type names */
  public ttyp: string = "^Z";
  /** The pattern for data element names */
  public dtel: string = "^Z";
  /** The pattern for domain names */
  public doma: string = "^Z";
  /** The pattern for message class names */
  public msag: string = "^Z";
  /** The pattern for transaction names */
  public tran: string = "^Z";
  /** The pattern for lock object names */
  public enqu: string = "^EZ";
  /** The pattern for authorization object names */
  public auth: string = "^Z";
  /** The pattern for package interface names */
  public pinf: string = "^Z";
  /** The pattern for idoc names */
  public idoc: string = "^Z";
}

export class ObjectNaming implements IRule {
  private conf = new ObjectNamingConf();

  public getKey(): string {
    return "object_naming";
  }

  public getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Object name does not match pattern " + expected + ": " + actual :
      "Object name must not match pattern " + expected + ": " + actual;
  }

  public getConfig(): ObjectNamingConf {
    return this.conf;
  }

  public setConfig(conf: ObjectNamingConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    let message: string | undefined = undefined;
    let pattern: string = "";

    if (obj instanceof Objects.Class) {
      pattern = this.getConfig().clas;
    } else if (obj instanceof Objects.Interface) {
      pattern = this.getConfig().intf;
    } else if (obj instanceof Objects.Program) {
      pattern = this.getConfig().prog;
    } else if (obj instanceof Objects.FunctionGroup) {
      pattern = this.getConfig().fugr;
    } else if (obj instanceof Objects.Table) {
      pattern = this.getConfig().tabl;
    } else if (obj instanceof Objects.TableType) {
      pattern = this.getConfig().ttyp;
    } else if (obj instanceof Objects.DataElement) {
      pattern = this.getConfig().dtel;
    } else if (obj instanceof Objects.Domain) {
      pattern = this.getConfig().doma;
    } else if (obj instanceof Objects.Transaction) {
      pattern = this.getConfig().tran;
    } else if (obj instanceof Objects.LockObject) {
      pattern = this.getConfig().enqu;
    } else if (obj instanceof Objects.AuthorizationObject) {
      pattern = this.getConfig().auth;
    } else if (obj instanceof Objects.PackageInterface) {
      pattern = this.getConfig().pinf;
    } else if (obj instanceof Objects.MessageClass) {
      pattern = this.getConfig().msag;
    } else if (obj instanceof Objects.Idoc) {
      pattern = this.getConfig().idoc;
    }

    if (pattern === "") {
      return [];
    }

    const regex = new RegExp(pattern, "i");

    if (NameValidator.violatesRule(obj.getName(), regex, this.conf)) {
      message = this.getDescription(pattern, obj.getName());
    }

    if (message) {
      return [new Issue({
        file: obj.getFiles()[0],
        message, key: this.getKey(), start: new Position(1, 1),
      })];
    }

    return [];
  }

  public nameViolatesRule(name: string, pattern: RegExp): boolean {
    return this.conf.patternKind === "required" ?
      pattern.test(name) === false :
      pattern.test(name) === true;
  }
}