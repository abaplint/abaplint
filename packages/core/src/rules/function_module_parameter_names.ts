import {Issue} from "../issue";
import {IRule, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {FunctionGroup} from "../objects/function_group";
import {NamingRuleConfig} from "./_naming_rule_config";
import {NameValidator} from "../utils/name_validator";
import {FunctionModuleDefinition, FunctionModuleParameterDirection, IFunctionModuleParameter} from "../abap/types/function_module_definition";
import {Position} from "../position";
import {ABAPFile} from "../abap/abap_file";

export class FunctionModuleParameterNamesConf extends NamingRuleConfig {
  /** The pattern for importing parameters */
  public importing: string = "^I._.+$";
  /** The pattern for exporting parameters */
  public exporting: string = "^E._.+$";
  /** The pattern for changing parameters */
  public changing: string = "^C._.+$";
  /** The pattern for tables parameters */
  public tables: string = "^T._.+$";
}

export class FunctionModuleParameterNames implements IRule {

  private conf = new FunctionModuleParameterNamesConf();
  private regex = this.compile();

  public getMetadata() {
    return {
      key: "function_module_parameter_names",
      title: "Function module parameter naming conventions",
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for function module parameter names`,
      extendedInformation: `Checks the parameters of function modules in function groups,
with a separate pattern for importing, exporting, changing and tables parameters.`,
      tags: [RuleTag.Naming, RuleTag.SingleFile],
      badExample: `FUNCTION z_get_name.
*"  IMPORTING
*"     VALUE(CUSTOMER) TYPE STRING
*"  EXPORTING
*"     VALUE(NAME) TYPE STRING
ENDFUNCTION.`,
      goodExample: `FUNCTION z_get_name.
*"  IMPORTING
*"     VALUE(IV_CUSTOMER) TYPE STRING
*"  EXPORTING
*"     VALUE(EV_NAME) TYPE STRING
ENDFUNCTION.`,
    };
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Function module parameter name does not match pattern " + expected + ": " + actual :
      "Function module parameter name must not match pattern " + expected + ": " + actual;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: FunctionModuleParameterNamesConf) {
    this.conf = conf;
    this.regex = this.compile();
  }

  private compile() {
    return {
      importing: new RegExp(this.conf.importing, "i"),
      exporting: new RegExp(this.conf.exporting, "i"),
      changing: new RegExp(this.conf.changing, "i"),
      tables: new RegExp(this.conf.tables, "i"),
      ignorePatterns: NameValidator.compileIgnorePatterns(this.conf),
    };
  }

  public initialize(_reg: IRegistry) {
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }

    if (!(obj instanceof FunctionGroup)) {
      return [];
    }

    let ret: Issue[] = [];
    for (const module of obj.getModules()) {
      ret = ret.concat(this.checkModule(obj, module));
    }
    return ret;
  }

  private checkModule(obj: FunctionGroup, module: FunctionModuleDefinition): Issue[] {
    const ret: Issue[] = [];

    for (const p of module.getParameters()) {
      let expected: string;
      let regex: RegExp;
      switch (p.direction) {
        case FunctionModuleParameterDirection.importing:
          expected = this.conf.importing;
          regex = this.regex.importing;
          break;
        case FunctionModuleParameterDirection.exporting:
          expected = this.conf.exporting;
          regex = this.regex.exporting;
          break;
        case FunctionModuleParameterDirection.changing:
          expected = this.conf.changing;
          regex = this.regex.changing;
          break;
        case FunctionModuleParameterDirection.tables:
          expected = this.conf.tables;
          regex = this.regex.tables;
          break;
        default:
          continue;
      }
      const issue = this.checkParameter(obj, module, p, expected, regex);
      if (issue) {
        ret.push(issue);
      }
    }

    return ret;
  }

  private checkParameter(obj: FunctionGroup, module: FunctionModuleDefinition,
                         param: IFunctionModuleParameter, expected: string, regex: RegExp): Issue | undefined {
    if (!NameValidator.violatesRule(param.name, regex, this.conf, this.regex.ignorePatterns)) {
      return undefined;
    }

    // the parameter is only defined in the XML, so report at the start of the module file, if it exists
    const file = this.findModuleFile(obj, module) || obj.getMainABAPFile();
    if (file === undefined) {
      return undefined;
    }
    const message = this.getDescription(expected, param.name);
    return Issue.atPosition(file, new Position(1, 1), message, this.getMetadata().key, this.conf.severity);
  }

  private findModuleFile(obj: FunctionGroup, module: FunctionModuleDefinition): ABAPFile | undefined {
    const search = "." + module.getName().toLowerCase().replace(/\//g, "#") + ".abap";
    return obj.getABAPFiles().find(f => f.getFilename().toLowerCase().endsWith(search));
  }

}
