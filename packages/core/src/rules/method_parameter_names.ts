import {Issue} from "../issue";
import {IRule, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {NamingRuleConfig} from "./_naming_rule_config";
import {NameValidator} from "../utils/name_validator";
import {InfoMethodDefinition, MethodParameterDirection, InfoMethodParameter} from "../abap/4_file_information/_abap_file_information";
import {DDIC} from "../ddic";

export class MethodParameterNamesConf extends NamingRuleConfig {
  /** Ignore parameters in methods of exception classes */
  public ignoreExceptions: boolean = true;
  /** The pattern for importing parameters */
  public importing: string = "^I._.+$";
  /** The pattern for returning parameters */
  public returning: string = "^R._.+$";
  /** The pattern for changing parameters */
  public changing: string = "^C._.+$";
  /** The pattern for exporting parameters */
  public exporting: string = "^E._.+$";
}

export class MethodParameterNames implements IRule {

  private conf = new MethodParameterNamesConf();
  private reg: IRegistry;

  public getMetadata() {
    return {
      key: "method_parameter_names",
      title: "Method parameter naming conventions",
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for method parameter names`,
      tags: [RuleTag.Naming],
    };
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Method parameter name does not match pattern " + expected + ": " + actual :
      "Method parameter name must not match pattern " + expected + ": " + actual;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodParameterNamesConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    let ret: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const ddic = new DDIC(this.reg);

    for (const file of obj.getABAPFiles()) {
      for (const def of file.getInfo().listInterfaceDefinitions()) {
        for (const method of def.methods) {
          ret = ret.concat(this.checkMethod(method));
        }
      }
      for (const def of file.getInfo().listClassDefinitions()) {
        if (this.conf.ignoreExceptions && ddic.isException(def, obj)) {
          continue;
        }
        for (const method of def.methods) {
          if (method.isEventHandler) {
            continue;
          }
          ret = ret.concat(this.checkMethod(method));
        }
      }
    }

    return ret;
  }

  private checkMethod(method: InfoMethodDefinition): Issue[] {
    let ret: Issue[] = [];

    for (const p of method.parameters) {
      switch (p.direction) {
        case MethodParameterDirection.Importing:
          ret = ret.concat(this.checkParameter(p, this.conf.importing));
          break;
        case MethodParameterDirection.Exporting:
          ret = ret.concat(this.checkParameter(p, this.conf.exporting));
          break;
        case MethodParameterDirection.Changing:
          ret = ret.concat(this.checkParameter(p, this.conf.changing));
          break;
        case MethodParameterDirection.Returning:
          ret = ret.concat(this.checkParameter(p, this.conf.returning));
          break;
        default:
          break;
      }
    }

    return ret;
  }

  private checkParameter(param: InfoMethodParameter, expected: string): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = param.name;
    if (NameValidator.violatesRule(name, regex, this.conf)) {
      const message = this.getDescription(expected, name);
      const issue = Issue.atIdentifier(param.identifier, message, this.getMetadata().key, this.conf.severity);
      ret.push(issue);
    }

    return ret;
  }

}