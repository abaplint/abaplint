import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
// import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class NoPrefixesConf extends BasicRuleConfig {
  /** DATA, CLASS-DATA, DATA BEGIN OF, CLASS-DATA BEGIN OF, FINAL(), DATA() */
  public data: string = "^[lg]._";
  public statics: string = "";
  /** FIELD-SYMBOLS and inline FIELD-SYMBOLS() */
  public fieldSymbols: string = "";
  /** CONSTANTS, CONSTANTS BEGIN OF */
  public constants: string = "";
  public types: string = "";
  public formParameters: string = "";
  public methodParameters: string = "";
  public functionModuleParameters: string = "";
  /** SELECT-OPTIONS */
  public selectOptions: string = "";
  /** PARAMETERS */
  public parameters: string = "";
  public localClass: string = "";
  public localInterface: string = "";
}

export class NoPrefixes extends ABAPRule {

  private conf = new NoPrefixesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_prefixes",
      title: "No Prefixes",
      shortDescription: `Dont use hungarian notation`,
      extendedInformation: `
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-encodings-esp-hungarian-notation-and-prefixes

https://github.com/SAP/styleguides/blob/main/clean-abap/sub-sections/AvoidEncodings.md`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoPrefixesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const ret: Issue[] = [];

    const config = this.getConfig();

    if (config.data !== undefined && config.data !== "") {
      ret.push(...this.checkData(file, config.data));
    }

    if (config.statics !== undefined && config.statics !== "") {
      ret.push(...this.checkStatics(file, config.data));
    }

    if (config.fieldSymbols !== undefined && config.fieldSymbols !== "") {
      ret.push(...this.checkFieldSymbols(file, config.data));
    }

    if (config.constants !== undefined && config.constants !== "") {
      ret.push(...this.checkConstants(file, config.data));
    }

    if (config.types !== undefined && config.types !== "") {
      ret.push(...this.checkTypes(file, config.data));
    }

    if (config.formParameters !== undefined && config.formParameters !== "") {
      ret.push(...this.checkFormParameters(file, config.data));
    }

    if (config.methodParameters !== undefined && config.methodParameters !== "") {
      ret.push(...this.checkMethodParameters(file, config.data));
    }

    if (config.functionModuleParameters !== undefined && config.functionModuleParameters !== "") {
      ret.push(...this.checkFunctionModuleParameters(file, config.data));
    }

    if (config.selectOptions !== undefined && config.selectOptions !== "") {
      ret.push(...this.checkSelectOptions(file, config.data));
    }

    if (config.parameters !== undefined && config.parameters !== "") {
      ret.push(...this.checkParameters(file, config.data));
    }

    if (config.localClass !== undefined && config.localClass !== "") {
      ret.push(...this.checkLocalClass(file, config.data));
    }
    if (config.localInterface !== undefined && config.localInterface !== "") {
      ret.push(...this.checkLocalInterface(file, config.data));
    }

    return ret;
  }

  private checkData(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkStatics(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkFieldSymbols(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkConstants(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkTypes(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkFormParameters(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkMethodParameters(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkFunctionModuleParameters(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkSelectOptions(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkParameters(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkLocalClass(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

  private checkLocalInterface(_file: ABAPFile, _regex: string): Issue[] {
// todo
    return [];
  }

}