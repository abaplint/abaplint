import {Issue} from "../issue";
import {NamingRuleConfig} from "./_naming_rule_config";
import {IRegistry} from "../_iregistry";
import {IObject} from "../objects/_iobject";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
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
  /** The regex pattern for BADI Implementation */
  public sxci?: string = "^Z";
  /** The regex pattern for Enhancement Spot */
  public enhs?: string = "^Z";
  /** The regex pattern for Enhancement Implementation */
  public enho?: string = "^Z";
  /** The regex pattern for Customer enhancement projects */
  public cmod?: string = "^Z";
  /** The regex pattern for SAPscript form */
  public form?: string = "^Z";
  /** The regex pattern for Adobe Form Definition */
  public sfpf?: string = "^Z";
  /** The regex pattern for Adobe Interface Definition */
  public sfpi?: string = "^Z";
  /** The regex pattern for ABAP Query: Query */
  public aqqu?: string = "^Z";
  /** The regex pattern for ABAP Query: Functional area */
  public aqsg?: string = "^Z";
  /** The regex pattern for ABAP Query: User group */
  public aqbg?: string = "^Z";
  /** The regex pattern for Authorization Object */
  public suso?: string = "^Z";
  /** The regex pattern for Authorization Group */
  public sucu?: string = "^Z";
  /** The regex pattern for Web Dynpro Application */
  public wdya?: string = "^Z";
  /** The regex pattern for Web Dynpro Component */
  public wdyn?: string = "^Z";
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
    if (typeof this.conf === "boolean" && this.conf === true) {
      return new ObjectNamingConf();
    }

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

    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }

    const abapType = obj.getType().toLowerCase();
    const config = this.getConfig();

    // @ts-ignore
    const pattern = config[abapType];

    if (pattern === undefined) {
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