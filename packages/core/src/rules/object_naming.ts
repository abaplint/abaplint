import {Issue} from "../issue";
import {NamingRuleConfig} from "./_naming_rule_config";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import * as Objects from "../objects";
import {NameValidator} from "../utils/name_validator";

export class ObjectNamingConf extends NamingRuleConfig {
  /** The regex pattern for global class names */
  public clas?: string = "^ZC(L|X)";
  /** The regex pattern for global interface names */
  public intf?: string = "^ZIF";
  /** The regex pattern for program (report) names */
  public prog?: string = "^Z";
  /** The regex pattern for function group names */
  public fugr?: string = "^Z";
  /** The regex pattern for DDIC table names */
  public tabl?: string = "^Z";
  /** The regex pattern for DDIC table type names */
  public ttyp?: string = "^Z";
  /** The regex pattern for data element names */
  public dtel?: string = "^Z";
  /** The regex pattern for domain names */
  public doma?: string = "^Z";
  /** The regex pattern for message class names */
  public msag?: string = "^Z";
  /** The regex pattern for transaction names */
  public tran?: string = "^Z";
  /** The regex pattern for lock object names */
  public enqu?: string = "^EZ";
  /** The regex pattern for authorization object names */
  public auth?: string = "^Z";
  /** The regex pattern for package interface names */
  public pinf?: string = "^Z";
  /** The regex pattern for idoc names */
  public idoc?: string = "^Z";
  /** The regex pattern for transformation names */
  public xslt?: string = "^Z";
  /** The regex pattern for smartform names */
  public ssfo?: string = "^Z";
  /** The regex pattern for smartstyle names */
  public ssst?: string = "^Z";
  /** The regex pattern for search helps */
  public shlp?: string = "^Z";
}

export class ObjectNaming implements IRule {
  private conf = new ObjectNamingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "object_naming",
      title: "Object naming conventions",
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for object names`,
      tags: [RuleTag.Naming],
    };
  }

  private getDescription(expected: string, actual: string): string {
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

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    let message: string | undefined = undefined;
    let pattern: string = "";

    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }

    const defaults = new ObjectNamingConf();

    if (obj instanceof Objects.Class) {
      pattern = this.getConfig().clas || defaults.clas!;
    } else if (obj instanceof Objects.Interface) {
      pattern = this.getConfig().intf || defaults.intf!;
    } else if (obj instanceof Objects.Program) {
      pattern = this.getConfig().prog || defaults.prog!;
    } else if (obj instanceof Objects.FunctionGroup) {
      pattern = this.getConfig().fugr || defaults.fugr!;
    } else if (obj instanceof Objects.Table) {
      pattern = this.getConfig().tabl || defaults.tabl!;
    } else if (obj instanceof Objects.TableType) {
      pattern = this.getConfig().ttyp || defaults.ttyp!;
    } else if (obj instanceof Objects.DataElement) {
      pattern = this.getConfig().dtel || defaults.dtel!;
    } else if (obj instanceof Objects.Domain) {
      pattern = this.getConfig().doma || defaults.doma!;
    } else if (obj instanceof Objects.Transaction) {
      pattern = this.getConfig().tran || defaults.tran!;
    } else if (obj instanceof Objects.LockObject) {
      pattern = this.getConfig().enqu || defaults.enqu!;
    } else if (obj instanceof Objects.AuthorizationObject) {
      pattern = this.getConfig().auth || defaults.auth!;
    } else if (obj instanceof Objects.PackageInterface) {
      pattern = this.getConfig().pinf || defaults.pinf!;
    } else if (obj instanceof Objects.MessageClass) {
      pattern = this.getConfig().msag || defaults.msag!;
    } else if (obj instanceof Objects.Idoc) {
      pattern = this.getConfig().idoc || defaults.idoc!;
    } else if (obj instanceof Objects.Transformation) {
      pattern = this.getConfig().xslt || defaults.xslt!;
    } else if (obj instanceof Objects.SmartForm) {
      pattern = this.getConfig().ssfo || defaults.ssfo!;
    } else if (obj instanceof Objects.SmartStyle) {
      pattern = this.getConfig().ssst || defaults.ssst!;
    } else if (obj instanceof Objects.SearchHelp) {
      pattern = this.getConfig().shlp || defaults.shlp!;
    }

    if (pattern === "") {
      return [];
    }

    const regex = new RegExp(pattern, "i");

    if (NameValidator.violatesRule(obj.getName(), regex, this.conf)) {
      message = this.getDescription(pattern, obj.getName());
    }

    if (message) {
      return [Issue.atRow(obj.getFiles()[0], 1, message, this.getMetadata().key, this.conf.severity)];
    }

    return [];
  }
}