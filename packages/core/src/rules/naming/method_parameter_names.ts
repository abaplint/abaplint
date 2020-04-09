import {Issue} from "../../issue";
import {IRule} from "../_irule";
import {IObject} from "../../objects/_iobject";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../../objects/_abap_object";
import {NamingRuleConfig} from "../_naming_rule_config";
import {NameValidator} from "../../utils/name_validator";
import {TypedIdentifier} from "../../abap/types/_typed_identifier";
import {CurrentScope} from "../../abap/syntax/_current_scope";
import {IMethodDefinition} from "../../abap/types/_method_definition";

/** Allows you to enforce a pattern, such as a prefix, for method parameter names */
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

  public getKey(): string {
    return "method_parameter_names";
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

  public run(obj: IObject, reg: IRegistry): Issue[] {
    let ret: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const scope = CurrentScope.buildDefault(reg);

    for (const file of obj.getABAPFiles()) {
      for (const def of file.getInfo().getInterfaceDefinitions()) {
        for (const method of def.getMethodDefinitions(scope)) {
          ret = ret.concat(this.checkMethod(method));
        }
      }
      for (const def of file.getInfo().getClassDefinitions()) {
        if (this.conf.ignoreExceptions && def.isException()) {
          continue;
        }
        const definitions = def.getMethodDefinitions();
        if (definitions === undefined) {
          continue;
        }
        for (const method of definitions.getAll()) {
          if (method.isEventHandler()) {
            continue;
          }
          ret = ret.concat(this.checkMethod(method));
        }
      }
    }

    return ret;
  }

  private checkMethod(method: IMethodDefinition): Issue[] {
    let ret: Issue[] = [];

    const parameters = method.getParameters();
    for (const param of parameters.getImporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.importing));
    }
    for (const param of parameters.getExporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.exporting));
    }
    for (const param of parameters.getChanging()) {
      ret = ret.concat(this.checkParameter(param, this.conf.changing));
    }
    const returning = parameters.getReturning();
    if (returning) {
      ret = ret.concat(this.checkParameter(returning, this.conf.returning));
    }

    return ret;
  }

  private checkParameter(param: TypedIdentifier, expected: string): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = param.getName();
    if (NameValidator.violatesRule(name, regex, this.conf)) {
      const message = this.getDescription(expected, name);
      const issue = Issue.atIdentifier(param, message, this.getKey());
      ret.push(issue);
    }

    return ret;
  }

}