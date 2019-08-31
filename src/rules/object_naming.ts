import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {IObject} from "../objects/_iobject";
import {IRule} from "./_irule";
import * as Objects from "../objects";
import {Position} from "../position";

export class ObjectNamingConf extends BasicRuleConfig {
  public clas: string = "^ZC(L|X)\\_";
  public intf: string = "^ZIF\\_";
  public prog: string = "^Z";
  public fugr: string = "^Z";
  public tabl: string = "^Z";
  public ttyp: string = "^Z";
  public dtel: string = "^Z";
  public doma: string = "^Z";
  public msag: string = "^Z";
  public tran: string = "^Z";
  public enqu: string = "^EZ";
  public auth: string = "^Z";
  public pinf: string = "^Z";
  public idoc: string = "^Z";
}

export class ObjectNaming implements IRule {
  private conf = new ObjectNamingConf();

  public getKey(): string {
    return "object_naming";
  }

  public getDescription(): string {
    return "Object naming";
  }

  public getConfig() {
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

    if (pattern === "" || pattern === undefined) {
      return [];
    }

    const regex = new RegExp(pattern, "i");

    if (regex.exec(obj.getName()) === null) {
      message = "Object naming, expected " + pattern + ", got " + obj.getName();
    }

    if (message) {
      return [new Issue({file: obj.getFiles()[0],
        message, key: this.getKey(), start: new Position(1, 1)})];
    }

    return [];
  }
}